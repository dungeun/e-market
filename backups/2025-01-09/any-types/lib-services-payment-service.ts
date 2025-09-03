import { query } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { Redis } from 'ioredis'
import crypto from 'crypto'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
})

export interface Payment {
  id: string
  order_id: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  transaction_id?: string
  gateway: string
  metadata?: any
  created_at: Date
  updated_at: Date
}

export enum PaymentMethod {
  CARD = 'card',
  TRANSFER = 'transfer',
  VIRTUAL_ACCOUNT = 'virtual_account',
  KAKAO_PAY = 'kakao_pay',
  TOSS_PAY = 'toss_pay',
  NAVER_PAY = 'naver_pay'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export interface TossPaymentRequest {
  orderId: string
  amount: number
  orderName: string
  customerName?: string
  customerEmail?: string
  customerMobilePhone?: string
  successUrl: string
  failUrl: string
}

export interface TossPaymentResponse {
  paymentKey: string
  orderId: string
  status: string
  totalAmount: number
  method?: string
  requestedAt: string
  approvedAt?: string
  card?: {
    company: string
    number: string
    installmentPlanMonths: number
    isInterestFree: boolean
  }
  virtualAccount?: {
    accountNumber: string
    bank: string
    dueDate: string
  }
  failure?: {
    code: string
    message: string
  }
}

export class PaymentService {
  private readonly TOSS_SECRET_KEY = process.env.TOSS_PAYMENTS_SECRET_KEY || 'test_key'
  private readonly TOSS_API_URL = 'https://api.tosspayments.com/v1'
  private readonly PAYMENT_CACHE_TTL = 300 // 5 minutes
  
  // Toss Payments 인증 헤더 생성
  private getAuthHeader(): string {
    const encodedKey = Buffer.from(`${this.TOSS_SECRET_KEY}:`).toString('base64')
    return `Basic ${encodedKey}`
  }
  
  // 결제 요청 생성
  async createPaymentRequest(
    orderId: string,
    amount: number,
    orderName: string,
    customerInfo?: {
      name?: string
      email?: string
      phone?: string
    }
  ): Promise<TossPaymentRequest> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const paymentRequest: TossPaymentRequest = {
      orderId,
      amount,
      orderName,
      customerName: customerInfo?.name,
      customerEmail: customerInfo?.email,
      customerMobilePhone: customerInfo?.phone,
      successUrl: `${baseUrl}/api/payment/success`,
      failUrl: `${baseUrl}/api/payment/fail`
    }
    
    // 결제 요청 정보 캐시
    await redis.setex(
      `payment:request:${orderId}`,
      this.PAYMENT_CACHE_TTL,
      JSON.stringify(paymentRequest)
    )
    
    return paymentRequest
  }
  
  // 결제 승인
  async confirmPayment(
    paymentKey: string,
    orderId: string,
    amount: number
  ): Promise<Payment> {
    try {
      // Toss API 호출
      const response = await fetch(`${this.TOSS_API_URL}/payments/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount
        })
      })
      
      const data: TossPaymentResponse = await response.json()
      
      if (!response.ok) {
        throw new Error(data.failure?.message || 'Payment confirmation failed')
      }
      
      // DB에 결제 정보 저장
      const paymentId = uuidv4()
      const payment = await this.savePayment({
        id: paymentId,
        order_id: orderId,
        amount: data.totalAmount,
        currency: 'KRW',
        method: this.mapPaymentMethod(data.method || 'card'),
        status: this.mapPaymentStatus(data.status),
        transaction_id: paymentKey,
        gateway: 'toss',
        metadata: {
          toss_payment_key: paymentKey,
          toss_order_id: data.orderId,
          approved_at: data.approvedAt,
          card: data.card,
          virtual_account: data.virtualAccount
        },
        created_at: new Date(),
        updated_at: new Date()
      })
      
      // 캐시 업데이트
      await redis.setex(
        `payment:${paymentId}`,
        this.PAYMENT_CACHE_TTL,
        JSON.stringify(payment)
      )
      
      return payment
    } catch (error) {

      throw error
    }
  }
  
  // 결제 취소
  async cancelPayment(
    paymentKey: string,
    cancelReason: string,
    cancelAmount?: number
  ): Promise<Payment> {
    try {
      const response = await fetch(
        `${this.TOSS_API_URL}/payments/${paymentKey}/cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cancelReason,
            cancelAmount
          })
        }
      )
      
      const data: TossPaymentResponse = await response.json()
      
      if (!response.ok) {
        throw new Error(data.failure?.message || 'Payment cancellation failed')
      }
      
      // DB 업데이트
      const payment = await this.updatePaymentStatus(
        paymentKey,
        PaymentStatus.CANCELLED,
        {
          cancel_reason: cancelReason,
          cancel_amount: cancelAmount,
          cancelled_at: new Date()
        }
      )
      
      return payment
    } catch (error) {

      throw error
    }
  }
  
  // 결제 정보 조회
  async getPayment(paymentKeyOrOrderId: string): Promise<Payment | null> {
    // 캐시 확인
    const cached = await redis.get(`payment:${paymentKeyOrOrderId}`)
    if (cached) {
      return JSON.parse(cached)
    }
    
    // DB 조회
    const result = await query(`
      SELECT * FROM payments
      WHERE id = $1 OR order_id = $1 OR transaction_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [paymentKeyOrOrderId])
    
    if (result.rows.length === 0) {
      return null
    }
    
    const payment = result.rows[0]
    
    // 캐시 업데이트
    await redis.setex(
      `payment:${payment.id}`,
      this.PAYMENT_CACHE_TTL,
      JSON.stringify(payment)
    )
    
    return payment
  }
  
  // 결제 방법 매핑
  private mapPaymentMethod(method: string): PaymentMethod {
    const methodMap: { [key: string]: PaymentMethod } = {
      '카드': PaymentMethod.CARD,
      'card': PaymentMethod.CARD,
      '계좌이체': PaymentMethod.TRANSFER,
      'transfer': PaymentMethod.TRANSFER,
      '가상계좌': PaymentMethod.VIRTUAL_ACCOUNT,
      'virtualAccount': PaymentMethod.VIRTUAL_ACCOUNT,
      '카카오페이': PaymentMethod.KAKAO_PAY,
      'kakaopay': PaymentMethod.KAKAO_PAY,
      '토스페이': PaymentMethod.TOSS_PAY,
      'tosspay': PaymentMethod.TOSS_PAY,
      '네이버페이': PaymentMethod.NAVER_PAY,
      'naverpay': PaymentMethod.NAVER_PAY
    }
    
    return methodMap[method] || PaymentMethod.CARD
  }
  
  // 결제 상태 매핑
  private mapPaymentStatus(status: string): PaymentStatus {
    const statusMap: { [key: string]: PaymentStatus } = {
      'READY': PaymentStatus.PENDING,
      'IN_PROGRESS': PaymentStatus.PROCESSING,
      'WAITING_FOR_DEPOSIT': PaymentStatus.PENDING,
      'DONE': PaymentStatus.COMPLETED,
      'CANCELED': PaymentStatus.CANCELLED,
      'PARTIAL_CANCELED': PaymentStatus.REFUNDED,
      'ABORTED': PaymentStatus.FAILED,
      'EXPIRED': PaymentStatus.FAILED
    }
    
    return statusMap[status] || PaymentStatus.PENDING
  }
  
  // DB에 결제 정보 저장
  private async savePayment(payment: Payment): Promise<Payment> {
    const result = await query(`
      INSERT INTO payments (
        id, order_id, amount, currency, method,
        status, transaction_id, gateway, metadata,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `, [
      payment.id,
      payment.order_id,
      payment.amount,
      payment.currency,
      payment.method,
      payment.status,
      payment.transaction_id,
      payment.gateway,
      JSON.stringify(payment.metadata)
    ])
    
    return result.rows[0]
  }
  
  // 결제 상태 업데이트
  private async updatePaymentStatus(
    paymentKey: string,
    status: PaymentStatus,
    metadata?: any
  ): Promise<Payment> {
    const result = await query(`
      UPDATE payments
      SET status = $2,
          metadata = COALESCE(metadata, '{}'::jsonb) || $3::jsonb,
          updated_at = NOW()
      WHERE transaction_id = $1
      RETURNING *
    `, [paymentKey, status, JSON.stringify(metadata || {})])
    
    if (result.rows.length === 0) {
      throw new Error('Payment not found')
    }
    
    const payment = result.rows[0]
    
    // 캐시 업데이트
    await redis.setex(
      `payment:${payment.id}`,
      this.PAYMENT_CACHE_TTL,
      JSON.stringify(payment)
    )
    
    return payment
  }
  
  // 웹훅 처리
  async handleWebhook(event: any): Promise<void> {
    const { type, data } = event
    
    switch (type) {
      case 'PAYMENT.DONE':
        await this.updatePaymentStatus(
          data.paymentKey,
          PaymentStatus.COMPLETED,
          { webhook_received_at: new Date() }
        )
        break
        
      case 'PAYMENT.CANCELED':
        await this.updatePaymentStatus(
          data.paymentKey,
          PaymentStatus.CANCELLED,
          {
            cancel_reason: data.cancelReason,
            cancelled_at: new Date()
          }
        )
        break
        
      case 'PAYMENT.FAILED':
        await this.updatePaymentStatus(
          data.paymentKey,
          PaymentStatus.FAILED,
          {
            failure_code: data.failureCode,
            failure_message: data.failureMessage,
            failed_at: new Date()
          }
        )
        break
        
      default:

    }
  }
  
  // Legacy 메서드 (호환성 유지)
  async processPayment(orderId: string, method: string, userId: string): Promise<Payment> {
    // 주문 정보 조회
    const orderResult = await query(`
      SELECT * FROM orders WHERE id = $1
    `, [orderId])
    
    if (orderResult.rows.length === 0) {
      throw new Error('Order not found')
    }
    
    const order = orderResult.rows[0]
    
    // 결제 요청 생성
    const paymentRequest = await this.createPaymentRequest(
      orderId,
      order.total_amount,
      `주문 #${orderId.slice(0, 8)}`,
      {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone
      }
    )
    
    // 임시 결제 정보 생성 (실제 결제는 프론트엔드에서 진행)
    const paymentId = uuidv4()
    const payment = await this.savePayment({
      id: paymentId,
      order_id: orderId,
      amount: paymentRequest.amount,
      currency: 'KRW',
      method: this.mapPaymentMethod(method),
      status: PaymentStatus.PENDING,
      gateway: 'toss',
      metadata: { payment_request: paymentRequest },
      created_at: new Date(),
      updated_at: new Date()
    })
    
    return payment
  }
  
  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<Payment> {
    const payment = await this.getPayment(paymentId)
    
    if (!payment) {
      throw new Error('Payment not found')
    }
    
    if (!payment.transaction_id) {
      throw new Error('No transaction ID for refund')
    }
    
    // 부분 환불 또는 전체 환불
    const refundAmount = amount || payment.amount
    const refundReason = reason || '고객 요청'
    
    // Toss API 호출
    return await this.cancelPayment(
      payment.transaction_id,
      refundReason,
      refundAmount
    )
  }
  
  async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    return await this.getPayment(orderId)
  }
  
  // 결제 내역 조회
  async getPaymentHistory(
    userId?: string,
    status?: PaymentStatus,
    limit: number = 10
  ): Promise<Payment[]> {
    let whereConditions: string[] = []
    let params: any[] = []
    let paramIndex = 1
    
    if (userId) {
      whereConditions.push(`
        EXISTS (
          SELECT 1 FROM orders o
          WHERE o.id = p.order_id AND o.customer_id = $${paramIndex++}
        )
      `)
      params.push(userId)
    }
    
    if (status) {
      whereConditions.push(`p.status = $${paramIndex++}`)
      params.push(status)
    }
    
    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : ''
    
    params.push(limit)
    
    const result = await query(`
      SELECT p.*, o.customer_name, o.customer_email
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex}
    `, params)
    
    return result.rows
  }
  
  // 결제 통계
  async getPaymentStats(startDate?: Date, endDate?: Date): Promise<any> {
    const dateFilter = startDate && endDate
      ? `WHERE created_at BETWEEN $1 AND $2`
      : ''
    
    const params = startDate && endDate ? [startDate, endDate] : []
    
    const result = await query(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END) as total_refunded,
        AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as avg_transaction_value,
        COUNT(CASE WHEN status = 'completed' THEN 1 ELSE NULL END) as successful_transactions,
        COUNT(CASE WHEN status = 'failed' THEN 1 ELSE NULL END) as failed_transactions
      FROM payments
      ${dateFilter}
    `, params)
    
    return result.rows[0]
  }
}

export const paymentService = new PaymentService()