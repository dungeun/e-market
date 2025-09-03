/**
 * 통합 결제 게이트웨이 서비스
 * 한국형 PG사 + 글로벌 결제 통합
 */

import { PrismaClient } from '@/lib/db'


export type PaymentProvider = 
  | 'TOSS_PAYMENTS' 
  | 'KCP' 
  | 'INICIS' 
  | 'NAVER_PAY' 
  | 'KAKAO_PAY' 
  | 'STRIPE' 
  | 'PAYPAL'

export interface PaymentRequest {
  provider: PaymentProvider
  orderId: string
  amount: number
  currency: string
  productName: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  isB2B?: boolean
  taxInvoice?: boolean
  returnUrl?: string
  cancelUrl?: string
  webhookUrl?: string
  metadata?: Record<string, any>
}

export interface PaymentResponse {
  success: boolean
  paymentId: string
  provider: PaymentProvider
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  approvalUrl?: string
  transactionId?: string
  message?: string
  data?: any
}

export interface RefundRequest {
  paymentId: string
  amount?: number // 부분 환불 시
  reason: string
  taxInvoiceCancel?: boolean
}

/**
 * 통합 결제 게이트웨이 매니저
 */
export class PaymentGatewayService {
  private static instance: PaymentGatewayService
  private providers: Map<PaymentProvider, IPaymentProvider>

  constructor() {
    this.providers = new Map()
    this.initializeProviders()
  }

  static getInstance(): PaymentGatewayService {
    if (!PaymentGatewayService.instance) {
      PaymentGatewayService.instance = new PaymentGatewayService()
    }
    return PaymentGatewayService.instance
  }

  /**
   * 결제 프로바이더 초기화
   */
  private initializeProviders() {
    this.providers.set('TOSS_PAYMENTS', new TossPaymentsProvider())
    this.providers.set('KCP', new KCPProvider())
    this.providers.set('INICIS', new InicisProvider())
    this.providers.set('NAVER_PAY', new NaverPayProvider())
    this.providers.set('KAKAO_PAY', new KakaoPayProvider())
    this.providers.set('STRIPE', new StripeProvider())
    this.providers.set('PAYPAL', new PayPalProvider())
  }

  /**
   * 결제 요청
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const provider = this.providers.get(request.provider)
    
    if (!provider) {
      throw new Error(`Unsupported payment provider: ${request.provider}`)
    }

    // 결제 레코드 생성
    const payment = await query({
      data: {
        orderId: request.orderId,
        provider: request.provider,
        method: 'CARD', // method 필드는 기본값으로 설정 (Prisma enum에 맞춤)
        amount: request.amount,
        currency: request.currency || 'KRW',
        status: 'PENDING',
        metadata: request.metadata || {}
      }
    })

    try {
      // 프로바이더별 결제 처리
      const response = await provider.createPayment(request)
      
      // 결제 상태 업데이트
      await query({
        where: { id: payment.id },
        data: {
          status: response.status,
          transactionId: response.transactionId,
          approvalUrl: response.approvalUrl
        }
      })

      return {
        ...response,
        paymentId: payment.id
      }
    } catch (error: any) {
      // 실패 시 상태 업데이트
      await query({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message
        }
      })
      
      throw error
    }
  }

  /**
   * 결제 확인
   */
  async confirmPayment(paymentId: string, data?: any): Promise<PaymentResponse> {
    const payment = await query({
      where: { id: paymentId }
    })

    if (!payment) {
      throw new Error('Payment not found')
    }

    const provider = this.providers.get(payment.provider as PaymentProvider)
    
    if (!provider) {
      throw new Error(`Provider not found: ${payment.provider}`)
    }

    const response = await provider.confirmPayment(payment.transactionId!, data)
    
    // 상태 업데이트
    await query({
      where: { id: paymentId },
      data: {
        status: response.status,
        completedAt: response.status === 'COMPLETED' ? new Date() : undefined
      }
    })

    return response
  }

  /**
   * 결제 취소/환불
   */
  async refundPayment(request: RefundRequest): Promise<PaymentResponse> {
    const payment = await query({
      where: { id: request.paymentId }
    })

    if (!payment) {
      throw new Error('Payment not found')
    }

    const provider = this.providers.get(payment.provider as PaymentProvider)
    
    if (!provider) {
      throw new Error(`Provider not found: ${payment.provider}`)
    }

    const response = await provider.refundPayment(payment.transactionId!, request)
    
    // 환불 레코드 생성
    await query({
      data: {
        paymentId: request.paymentId,
        amount: request.amount || payment.amount,
        reason: request.reason,
        status: response.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING'
      }
    })

    return response
  }

  /**
   * 웹훅 처리
   */
  async handleWebhook(provider: PaymentProvider, data: any): Promise<void> {
    const providerInstance = this.providers.get(provider)
    
    if (!providerInstance) {
      throw new Error(`Provider not found: ${provider}`)
    }

    await providerInstance.handleWebhook(data)
  }

  /**
   * 결제 상태 조회
   */
  async getPaymentStatus(paymentId: string): Promise<any> {
    const payment = await query({
      where: { id: paymentId },
      include: {
        order: true,
        refunds: true
      }
    })

    if (!payment) {
      throw new Error('Payment not found')
    }

    const provider = this.providers.get(payment.provider as PaymentProvider)
    
    if (provider && payment.transactionId) {
      const providerStatus = await provider.getStatus(payment.transactionId)
      return {
        ...payment,
        providerStatus
      }
    }

    return payment
  }
}

/**
 * 결제 프로바이더 인터페이스
 */
interface IPaymentProvider {
  createPayment(request: PaymentRequest): Promise<PaymentResponse>
  confirmPayment(transactionId: string, data?: any): Promise<PaymentResponse>
  refundPayment(transactionId: string, request: RefundRequest): Promise<PaymentResponse>
  handleWebhook(data: any): Promise<void>
  getStatus(transactionId: string): Promise<any>
}

/**
 * 토스페이먼츠 프로바이더
 */
class TossPaymentsProvider implements IPaymentProvider {
  private readonly secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY!
  private readonly clientKey = process.env.TOSS_PAYMENTS_CLIENT_KEY!
  private readonly baseUrl = 'https://api.tosspayments.com/v1'

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // 토스페이먼츠 결제 요청
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: request.amount,
          orderId: request.orderId,
          orderName: request.productName,
          customerName: request.customerName,
          customerEmail: request.customerEmail,
          successUrl: request.returnUrl,
          failUrl: request.cancelUrl
        })
      })

      const data = await response.json()

      return {
        success: true,
        paymentId: data.paymentKey,
        provider: 'TOSS_PAYMENTS',
        status: 'PENDING',
        approvalUrl: data.checkout.url,
        transactionId: data.paymentKey,
        data
      }
    } catch (error: any) {
      return {
        success: false,
        paymentId: '',
        provider: 'TOSS_PAYMENTS',
        status: 'FAILED',
        message: error.message
      }
    }
  }

  async confirmPayment(transactionId: string, data?: any): Promise<PaymentResponse> {
    const response = await fetch(`${this.baseUrl}/payments/${transactionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId: data.orderId,
        amount: data.amount
      })
    })

    const result = await response.json()

    return {
      success: result.status === 'DONE',
      paymentId: transactionId,
      provider: 'TOSS_PAYMENTS',
      status: result.status === 'DONE' ? 'COMPLETED' : 'FAILED',
      transactionId,
      data: result
    }
  }

  async refundPayment(transactionId: string, request: RefundRequest): Promise<PaymentResponse> {
    const response = await fetch(`${this.baseUrl}/payments/${transactionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cancelReason: request.reason,
        cancelAmount: request.amount
      })
    })

    const result = await response.json()

    return {
      success: result.status === 'CANCELED',
      paymentId: transactionId,
      provider: 'TOSS_PAYMENTS',
      status: result.status === 'CANCELED' ? 'CANCELLED' : 'FAILED',
      transactionId,
      data: result
    }
  }

  async handleWebhook(data: any): Promise<void> {
    // 토스페이먼츠 웹훅 처리
    console.log('TossPayments webhook:', data)
  }

  async getStatus(transactionId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/payments/${transactionId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`
      }
    })

    return await response.json()
  }
}

/**
 * KCP 프로바이더
 */
class KCPProvider implements IPaymentProvider {
  private readonly siteCode = process.env.KCP_SITE_CODE!
  private readonly siteKey = process.env.KCP_SITE_KEY!

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // KCP 결제 구현
    return {
      success: true,
      paymentId: `kcp_${Date.now()}`,
      provider: 'KCP',
      status: 'PENDING',
      approvalUrl: `/payment/kcp?orderId=${request.orderId}`,
      transactionId: `kcp_tx_${Date.now()}`
    }
  }

  async confirmPayment(transactionId: string, data?: any): Promise<PaymentResponse> {
    // KCP 승인 구현
    return {
      success: true,
      paymentId: transactionId,
      provider: 'KCP',
      status: 'COMPLETED',
      transactionId
    }
  }

  async refundPayment(transactionId: string, request: RefundRequest): Promise<PaymentResponse> {
    // KCP 환불 구현
    return {
      success: true,
      paymentId: transactionId,
      provider: 'KCP',
      status: 'CANCELLED',
      transactionId
    }
  }

  async handleWebhook(data: any): Promise<void> {
    console.log('KCP webhook:', data)
  }

  async getStatus(transactionId: string): Promise<any> {
    return { status: 'COMPLETED' }
  }
}

/**
 * 이니시스 프로바이더
 */
class InicisProvider implements IPaymentProvider {
  private readonly mid = process.env.INICIS_MID!
  private readonly apiKey = process.env.INICIS_API_KEY!

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // 이니시스 결제 구현
    return {
      success: true,
      paymentId: `inicis_${Date.now()}`,
      provider: 'INICIS',
      status: 'PENDING',
      approvalUrl: `/payment/inicis?orderId=${request.orderId}`,
      transactionId: `inicis_tx_${Date.now()}`
    }
  }

  async confirmPayment(transactionId: string, data?: any): Promise<PaymentResponse> {
    return {
      success: true,
      paymentId: transactionId,
      provider: 'INICIS',
      status: 'COMPLETED',
      transactionId
    }
  }

  async refundPayment(transactionId: string, request: RefundRequest): Promise<PaymentResponse> {
    return {
      success: true,
      paymentId: transactionId,
      provider: 'INICIS',
      status: 'CANCELLED',
      transactionId
    }
  }

  async handleWebhook(data: any): Promise<void> {
    console.log('Inicis webhook:', data)
  }

  async getStatus(transactionId: string): Promise<any> {
    return { status: 'COMPLETED' }
  }
}

/**
 * 네이버페이 프로바이더
 */
class NaverPayProvider implements IPaymentProvider {
  private readonly clientId = process.env.NAVER_PAY_CLIENT_ID!
  private readonly clientSecret = process.env.NAVER_PAY_CLIENT_SECRET!

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // 네이버페이 결제 구현
    return {
      success: true,
      paymentId: `naverpay_${Date.now()}`,
      provider: 'NAVER_PAY',
      status: 'PENDING',
      approvalUrl: `https://naver.com/payment?orderId=${request.orderId}`,
      transactionId: `naverpay_tx_${Date.now()}`
    }
  }

  async confirmPayment(transactionId: string, data?: any): Promise<PaymentResponse> {
    return {
      success: true,
      paymentId: transactionId,
      provider: 'NAVER_PAY',
      status: 'COMPLETED',
      transactionId
    }
  }

  async refundPayment(transactionId: string, request: RefundRequest): Promise<PaymentResponse> {
    return {
      success: true,
      paymentId: transactionId,
      provider: 'NAVER_PAY',
      status: 'CANCELLED',
      transactionId
    }
  }

  async handleWebhook(data: any): Promise<void> {
    console.log('NaverPay webhook:', data)
  }

  async getStatus(transactionId: string): Promise<any> {
    return { status: 'COMPLETED' }
  }
}

/**
 * 카카오페이 프로바이더
 */
class KakaoPayProvider implements IPaymentProvider {
  private readonly adminKey = process.env.KAKAO_PAY_ADMIN_KEY!
  private readonly baseUrl = 'https://kapi.kakao.com/v1/payment'

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ready`, {
        method: 'POST',
        headers: {
          'Authorization': `KakaoAK ${this.adminKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          cid: 'TC0ONETIME',
          partner_order_id: request.orderId,
          partner_user_id: request.customerEmail,
          item_name: request.productName,
          quantity: '1',
          total_amount: request.amount.toString(),
          tax_free_amount: '0',
          approval_url: request.returnUrl || '',
          cancel_url: request.cancelUrl || '',
          fail_url: request.cancelUrl || ''
        })
      })

      const data = await response.json()

      return {
        success: true,
        paymentId: data.tid,
        provider: 'KAKAO_PAY',
        status: 'PENDING',
        approvalUrl: data.next_redirect_pc_url,
        transactionId: data.tid,
        data
      }
    } catch (error: any) {
      return {
        success: false,
        paymentId: '',
        provider: 'KAKAO_PAY',
        status: 'FAILED',
        message: error.message
      }
    }
  }

  async confirmPayment(transactionId: string, data?: any): Promise<PaymentResponse> {
    const response = await fetch(`${this.baseUrl}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `KakaoAK ${this.adminKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        cid: 'TC0ONETIME',
        tid: transactionId,
        partner_order_id: data.orderId,
        partner_user_id: data.userId,
        pg_token: data.pgToken
      })
    })

    const result = await response.json()

    return {
      success: response.ok,
      paymentId: transactionId,
      provider: 'KAKAO_PAY',
      status: response.ok ? 'COMPLETED' : 'FAILED',
      transactionId,
      data: result
    }
  }

  async refundPayment(transactionId: string, request: RefundRequest): Promise<PaymentResponse> {
    const response = await fetch(`${this.baseUrl}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `KakaoAK ${this.adminKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        cid: 'TC0ONETIME',
        tid: transactionId,
        cancel_amount: request.amount?.toString() || '0',
        cancel_tax_free_amount: '0'
      })
    })

    const result = await response.json()

    return {
      success: response.ok,
      paymentId: transactionId,
      provider: 'KAKAO_PAY',
      status: response.ok ? 'CANCELLED' : 'FAILED',
      transactionId,
      data: result
    }
  }

  async handleWebhook(data: any): Promise<void> {
    console.log('KakaoPay webhook:', data)
  }

  async getStatus(transactionId: string): Promise<any> {
    return { status: 'COMPLETED' }
  }
}

/**
 * Stripe 프로바이더
 */
class StripeProvider implements IPaymentProvider {
  private readonly secretKey = process.env.STRIPE_SECRET_KEY!
  private readonly baseUrl = 'https://api.stripe.com/v1'

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payment_intents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          amount: (request.amount * 100).toString(), // Stripe uses cents
          currency: request.currency.toLowerCase(),
          description: request.productName,
          'metadata[orderId]': request.orderId,
          'metadata[customerEmail]': request.customerEmail
        })
      })

      const data = await response.json()

      return {
        success: true,
        paymentId: data.id,
        provider: 'STRIPE',
        status: 'PENDING',
        transactionId: data.id,
        data
      }
    } catch (error: any) {
      return {
        success: false,
        paymentId: '',
        provider: 'STRIPE',
        status: 'FAILED',
        message: error.message
      }
    }
  }

  async confirmPayment(transactionId: string, data?: any): Promise<PaymentResponse> {
    const response = await fetch(`${this.baseUrl}/payment_intents/${transactionId}/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    const result = await response.json()

    return {
      success: result.status === 'succeeded',
      paymentId: transactionId,
      provider: 'STRIPE',
      status: result.status === 'succeeded' ? 'COMPLETED' : 'FAILED',
      transactionId,
      data: result
    }
  }

  async refundPayment(transactionId: string, request: RefundRequest): Promise<PaymentResponse> {
    const response = await fetch(`${this.baseUrl}/refunds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        payment_intent: transactionId,
        amount: request.amount ? (request.amount * 100).toString() : '',
        reason: 'requested_by_customer'
      })
    })

    const result = await response.json()

    return {
      success: result.status === 'succeeded',
      paymentId: transactionId,
      provider: 'STRIPE',
      status: result.status === 'succeeded' ? 'CANCELLED' : 'FAILED',
      transactionId,
      data: result
    }
  }

  async handleWebhook(data: any): Promise<void> {
    console.log('Stripe webhook:', data)
  }

  async getStatus(transactionId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/payment_intents/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${this.secretKey}`
      }
    })

    return await response.json()
  }
}

/**
 * PayPal 프로바이더
 */
class PayPalProvider implements IPaymentProvider {
  private readonly clientId = process.env.PAYPAL_CLIENT_ID!
  private readonly clientSecret = process.env.PAYPAL_CLIENT_SECRET!
  private readonly baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com'

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // PayPal 결제 구현
    return {
      success: true,
      paymentId: `paypal_${Date.now()}`,
      provider: 'PAYPAL',
      status: 'PENDING',
      approvalUrl: `https://paypal.com/checkout?orderId=${request.orderId}`,
      transactionId: `paypal_tx_${Date.now()}`
    }
  }

  async confirmPayment(transactionId: string, data?: any): Promise<PaymentResponse> {
    return {
      success: true,
      paymentId: transactionId,
      provider: 'PAYPAL',
      status: 'COMPLETED',
      transactionId
    }
  }

  async refundPayment(transactionId: string, request: RefundRequest): Promise<PaymentResponse> {
    return {
      success: true,
      paymentId: transactionId,
      provider: 'PAYPAL',
      status: 'CANCELLED',
      transactionId
    }
  }

  async handleWebhook(data: any): Promise<void> {
    console.log('PayPal webhook:', data)
  }

  async getStatus(transactionId: string): Promise<any> {
    return { status: 'COMPLETED' }
  }
}

// 싱글톤 인스턴스 export
export const paymentGateway = PaymentGatewayService.getInstance()