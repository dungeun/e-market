import type { AppError } from '@/lib/types/common';
// TODO: Refactor to use createApiHandler from @/lib/api/handler
/**
 * 결제 웹훅 처리 API
 * 각 PG사의 웹훅을 통합 처리
 */

import { NextRequest, NextResponse } from 'next/server'
import { paymentGateway, PaymentProvider } from '@/lib/services/payment/payment-gateway'
// import { prisma } from '@/lib/db'
import crypto from 'crypto'

// 웹훅 서명 검증
function verifyWebhookSignature(
  provider: PaymentProvider,
  payload: string,
  signature: string
): boolean {
  switch (provider) {
    case 'TOSS_PAYMENTS':
      // 토스페이먼츠 서명 검증
      const secret = process.env.TOSS_PAYMENTS_WEBHOOK_SECRET!
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('base64')
      return signature === expectedSignature

    case 'STRIPE':
      // Stripe 서명 검증
      // stripe.webhooks.constructEvent() 사용
      return true // 실제 구현 시 Stripe SDK 사용

    case 'KAKAO_PAY':
      // 카카오페이 서명 검증
      return true // 실제 구현 시 카카오페이 검증 로직

    default:
      // 다른 PG사들의 서명 검증
      return true
  }
}

export async function POST(request: NextRequest) {
  try {
    const provider = request.headers.get('x-payment-provider') as PaymentProvider
    const signature = request.headers.get('x-webhook-signature') || ''
    
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider header missing' },
        { status: 400 }
      )
    }

    const payload = await request.text()
    
    // 서명 검증
    if (!verifyWebhookSignature(provider, payload, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const data = JSON.parse(payload)

    // 중복 처리 방지
    const webhookId = data.webhookId || data.eventId || `${provider}_${Date.now()}`
    const existingWebhook = await query({
      where: { webhookId }
    })

    if (existingWebhook) {
      return NextResponse.json({
        success: true,
        message: 'Webhook already processed'
      })
    }

    // 웹훅 로그 저장
    await query({
      data: {
        webhookId,
        provider,
        payload: data,
        processedAt: new Date()
      }
    })

    // 프로바이더별 웹훅 처리
    await handleProviderWebhook(provider, data)

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully'
    })
  } catch (error: Error | unknown) {

    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

/**
 * 프로바이더별 웹훅 처리
 */
async function handleProviderWebhook(provider: PaymentProvider, data: unknown) {
  switch (provider) {
    case 'TOSS_PAYMENTS':
      await handleTossPaymentsWebhook(data)
      break
    
    case 'KCP':
      await handleKCPWebhook(data)
      break
    
    case 'INICIS':
      await handleInicisWebhook(data)
      break
    
    case 'NAVER_PAY':
      await handleNaverPayWebhook(data)
      break
    
    case 'KAKAO_PAY':
      await handleKakaoPayWebhook(data)
      break
    
    case 'STRIPE':
      await handleStripeWebhook(data)
      break
    
    case 'PAYPAL':
      await handlePayPalWebhook(data)
      break
    
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

/**
 * 토스페이먼츠 웹훅 처리
 */
async function handleTossPaymentsWebhook(data: unknown) {
  const { eventType, data: eventData } = data

  switch (eventType) {
    case 'PAYMENT_STATUS_CHANGED':
      const payment = await query({
        where: { transactionId: eventData.paymentKey }
      })

      if (payment) {
        await query({
          where: { id: payment.id },
          data: {
            status: mapTossStatus(eventData.status),
            metadata: {
              ...(payment.metadata as unknown || {}),
              tossData: eventData
            }
          }
        })

        // 주문 상태 업데이트
        if (eventData.status === 'DONE') {
          await query({
            where: { id: payment.orderId },
            data: { status: 'PAYMENT_COMPLETED' }
          })
        } else if (eventData.status === 'CANCELED') {
          await query({
            where: { id: payment.orderId },
            data: { status: 'CANCELLED' }
          })
        }
      }
      break
  }
}

/**
 * KCP 웹훅 처리
 */
async function handleKCPWebhook(data: unknown) {
  // KCP 웹훅 처리 로직

}

/**
 * 이니시스 웹훅 처리
 */
async function handleInicisWebhook(data: unknown) {
  // 이니시스 웹훅 처리 로직

}

/**
 * 네이버페이 웹훅 처리
 */
async function handleNaverPayWebhook(data: unknown) {
  // 네이버페이 웹훅 처리 로직

}

/**
 * 카카오페이 웹훅 처리
 */
async function handleKakaoPayWebhook(data: unknown) {
  // 카카오페이 웹훅 처리 로직

}

/**
 * Stripe 웹훅 처리
 */
async function handleStripeWebhook(data: unknown) {
  const { type, data: { object } } = data

  switch (type) {
    case 'payment_intent.succeeded':
      const payment = await query({
        where: { transactionId: object.id }
      })

      if (payment) {
        await query({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date()
          }
        })

        await query({
          where: { id: payment.orderId },
          data: { status: 'PAYMENT_COMPLETED' }
        })
      }
      break

    case 'payment_intent.payment_failed':
      const failedPayment = await query({
        where: { transactionId: object.id }
      })

      if (failedPayment) {
        await query({
          where: { id: failedPayment.id },
          data: {
            status: 'FAILED',
            errorMessage: object.last_payment_error?.message
          }
        })

        await query({
          where: { id: failedPayment.orderId },
          data: { status: 'PAYMENT_FAILED' }
        })
      }
      break
  }
}

/**
 * PayPal 웹훅 처리
 */
async function handlePayPalWebhook(data: unknown) {
  // PayPal 웹훅 처리 로직

}

/**
 * 토스페이먼츠 상태 매핑
 */
function mapTossStatus(status: string): 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PARTIAL_REFUND' {
  const statusMap: Record<string, 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PARTIAL_REFUND'> = {
    'READY': 'PENDING',
    'IN_PROGRESS': 'PENDING',
    'WAITING_FOR_DEPOSIT': 'PENDING',
    'DONE': 'COMPLETED',
    'CANCELED': 'CANCELLED',
    'PARTIAL_CANCELED': 'PARTIAL_REFUND',
    'ABORTED': 'FAILED',
    'EXPIRED': 'FAILED'
  }
  
  return statusMap[status] || 'PENDING'
}