import axios from 'axios'

const TOSS_API_URL = 'https://api.tosspayments.com/v1/payments'
const SECRET_KEY = process.env.TOSS_SECRET_KEY!

// Secret Key를 Base64로 인코딩
const encodeSecretKey = Buffer.from(`${SECRET_KEY}:`).toString('base64')

interface PaymentRequest {
  amount: number
  orderId: string
  orderName: string
  customerName?: string
  customerEmail?: string
  customerMobilePhone?: string
  successUrl?: string
  failUrl?: string
}

interface PaymentConfirmRequest {
  paymentKey: string
  orderId: string
  amount: number
}

export class TossPaymentService {
  private headers = {
    Authorization: `Basic ${encodeSecretKey}`,
    'Content-Type': 'application/json',
  }

  // 결제 승인
  async confirmPayment(data: PaymentConfirmRequest) {
    try {
      const response = await axios.post(
        `${TOSS_API_URL}/confirm`,
        data,
        { headers: this.headers }
      )
      return response.data
    } catch (error: any) {
      console.error('Toss payment confirmation error:', error.response?.data)
      throw new Error(
        error.response?.data?.message || '결제 승인 중 오류가 발생했습니다.'
      )
    }
  }

  // 결제 취소
  async cancelPayment(paymentKey: string, cancelReason: string, cancelAmount?: number) {
    try {
      const response = await axios.post(
        `${TOSS_API_URL}/${paymentKey}/cancel`,
        {
          cancelReason,
          cancelAmount,
        },
        { headers: this.headers }
      )
      return response.data
    } catch (error: any) {
      console.error('Toss payment cancellation error:', error.response?.data)
      throw new Error(
        error.response?.data?.message || '결제 취소 중 오류가 발생했습니다.'
      )
    }
  }

  // 결제 조회
  async getPayment(paymentKey: string) {
    try {
      const response = await axios.get(
        `${TOSS_API_URL}/${paymentKey}`,
        { headers: this.headers }
      )
      return response.data
    } catch (error: any) {
      console.error('Toss payment inquiry error:', error.response?.data)
      throw new Error(
        error.response?.data?.message || '결제 조회 중 오류가 발생했습니다.'
      )
    }
  }

  // 빌링키 발급 (정기결제용)
  async issueBillingKey(data: {
    customerKey: string
    cardNumber: string
    cardExpirationYear: string
    cardExpirationMonth: string
    cardPassword: string
    customerIdentityNumber: string
  }) {
    try {
      const response = await axios.post(
        'https://api.tosspayments.com/v1/billing/authorizations/card',
        data,
        { headers: this.headers }
      )
      return response.data
    } catch (error: any) {
      console.error('Toss billing key issue error:', error.response?.data)
      throw new Error(
        error.response?.data?.message || '빌링키 발급 중 오류가 발생했습니다.'
      )
    }
  }

  // 빌링 결제 실행
  async executeBillingPayment(data: {
    billingKey: string
    customerKey: string
    amount: number
    orderId: string
    orderName: string
    customerEmail?: string
    customerName?: string
  }) {
    try {
      const response = await axios.post(
        `https://api.tosspayments.com/v1/billing/${data.billingKey}`,
        {
          customerKey: data.customerKey,
          amount: data.amount,
          orderId: data.orderId,
          orderName: data.orderName,
          customerEmail: data.customerEmail,
          customerName: data.customerName,
        },
        { headers: this.headers }
      )
      return response.data
    } catch (error: any) {
      console.error('Toss billing payment error:', error.response?.data)
      throw new Error(
        error.response?.data?.message || '빌링 결제 중 오류가 발생했습니다.'
      )
    }
  }
}

export const tossPayment = new TossPaymentService()