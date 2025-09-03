import type { User, RequestContext } from '@/lib/types/common';
import type { AppError } from '@/lib/types/common';
// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { tossPayment } from '@/lib/toss-payment'
import { prisma } from '@/lib/db'
import { kakaoAlimtalk } from '@/lib/kakao-alimtalk'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { paymentKey, orderId, amount } = await request.json()

    // 주문 정보 확인
    const order = await query({
      where: { orderNumber: orderId },
      include: { 
        user: true,
        items: {
          include: {
            product: true
          }
        }
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 금액 검증
    if (order.total !== amount) {
      return NextResponse.json(
        { error: '결제 금액이 일치하지 않습니다.' },
        { status: 400 }
      )
    }

    // 토스페이먼츠 결제 승인
    const paymentResult = await tossPayment.confirmPayment({
      paymentKey,
      orderId,
      amount,
    })

    // 결제 정보 저장
    await query({
      data: {
        orderId: order.id,
        provider: 'TOSS_PAYMENTS',
        method: paymentResult.method as unknown,
        status: 'COMPLETED',
        amount: paymentResult.totalAmount,
        paymentKey: paymentResult.paymentKey,
        transactionId: paymentResult.transactionKey,
        responseData: paymentResult,
        paidAt: new Date(paymentResult.approvedAt),
      },
    })

    // 주문 상태 업데이트
    await query({
      where: { id: order.id },
      data: { status: 'PAYMENT_COMPLETED' },
    })

    // 재고 차감
    for (const item of order.items) {
      await query({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    // 알림톡 발송
    if (order.user?.phone) {
      const productNames = order.items.map(item => item.name).join(', ')
      await kakaoAlimtalk.sendPaymentComplete(
        order.user.phone,
        order.orderNumber,
        order.total,
        paymentResult.method
      )

      await kakaoAlimtalk.sendOrderConfirmation(
        order.user.phone,
        order.orderNumber,
        productNames,
        order.total
      )

      // 알림 저장
      await query({
        data: {
          userId: order.userId!,
          type: 'PAYMENT_SUCCESS',
          title: '결제가 완료되었습니다',
          content: `주문번호 ${order.orderNumber}의 결제가 완료되었습니다.`,
          data: { orderId: order.id, amount: order.total },
          alimtalkSent: true,
          alimtalkSentAt: new Date(),
        },
      })
    }

    // 장바구니 비우기
    if (session?.user?.id) {
      const cart = await query({
        where: { userId: session.user.id },
      })
      
      if (cart) {
        await queryMany({
          where: { cartId: cart.id },
        })
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderNumber,
      paymentKey,
    })
  } catch (error: Error | unknown) {

    return NextResponse.json(
      { error: error.message || '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}