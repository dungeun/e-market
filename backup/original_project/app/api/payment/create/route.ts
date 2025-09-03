import type { User, RequestContext } from '@/lib/types/common';
import type { AppError } from '@/lib/types/common';
/**
 * 결제 생성 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { paymentGateway } from '@/lib/services/payment/payment-gateway'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      orderId,
      provider,
      amount,
      currency = 'KRW',
      productName,
      isB2B = false,
      taxInvoice = false
    } = body

    // 필수 필드 확인
    if (!orderId || !provider || !amount || !productName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 주문 확인
    const order = await query({
      where: { id: orderId },
      include: {
        user: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // 주문자 확인 - 이메일로 유저 찾기
    const user = await query({
      where: { email: session.user.email! }
    })
    
    if (!user || order.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // 이미 결제된 주문인지 확인
    const existingPayment = await query({
      where: {
        orderId,
        status: 'COMPLETED'
      }
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Order already paid' },
        { status: 409 }
      )
    }

    // B2B 주문인 경우 사업자 계정 확인 (추후 구현)
    /*
    if (isB2B && !order.businessAccountId) {
      return NextResponse.json(
        { error: 'Business account required for B2B payment' },
        { status: 400 }
      )
    }
    */

    // 결제 요청 생성
    const paymentRequest = {
      provider,
      orderId,
      amount,
      currency,
      productName,
      customerName: order.user?.name || 'Customer',
      customerEmail: order.user?.email || '',
      customerPhone: undefined,
      isB2B,
      taxInvoice,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      metadata: {
        userId: user?.id || session.user.email!
      }
    }

    // 결제 생성
    const response = await paymentGateway.createPayment(paymentRequest)

    if (!response.success) {
      return NextResponse.json(
        { error: response.message || 'Payment creation failed' },
        { status: 500 }
      )
    }

    // 주문 상태 업데이트
    await query({
      where: { id: orderId },
      data: { status: 'PAYMENT_PENDING' }
    })

    return NextResponse.json({
      success: true,
      data: response
    })
  } catch (error: Error | unknown) {

    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    )
  }
}