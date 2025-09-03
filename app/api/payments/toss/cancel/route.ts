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
    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { paymentKey, cancelReason, cancelAmount } = await request.json()

    // 결제 정보 조회
    const payment = await query({
      where: { paymentKey },
      include: {
        order: {
          include: {
            user: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: '결제 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인 (본인 또는 관리자) - 이메일로 유저 찾기
    const user = await query({
      where: { email: session.user.email! }
    })
    
    if (
      (!user || payment.order.userId !== user.id) &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: '취소 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 토스페이먼츠 결제 취소
    const cancelResult = await tossPayment.cancelPayment(
      paymentKey,
      cancelReason,
      cancelAmount
    )

    // 결제 상태 업데이트
    const isFull = cancelAmount === undefined || cancelAmount === payment.amount
    await query({
      where: { id: payment.id },
      data: {
        status: isFull ? 'CANCELLED' : 'PARTIAL_REFUND',
        cancelledAt: new Date(),
        cancelReason,
      },
    })

    // 주문 상태 업데이트
    if (isFull) {
      await query({
        where: { id: payment.orderId },
        data: { status: 'CANCELLED' },
      })

      // 재고 복구
      for (const item of payment.order.items) {
        await query({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        })
      }
    }

    // 알림톡 발송
    if (payment.order.user?.phone) {
      await query({
        data: {
          userId: payment.order.userId!,
          type: 'ORDER_CANCELLED',
          title: '주문이 취소되었습니다',
          content: `주문번호 ${payment.order.orderNumber}이(가) 취소되었습니다.`,
          data: {
            orderId: payment.order.id,
            cancelAmount: cancelAmount || payment.amount,
            cancelReason,
          },
        },
      })

      // 카카오 알림톡 템플릿이 준비되면 발송
      // await kakaoAlimtalk.send({
      //   to: payment.order.user.phone,
      //   templateCode: 'ORDER_CANCEL_001',
      //   variables: {
      //     orderNumber: payment.order.orderNumber,
      //     cancelAmount: (cancelAmount || payment.amount).toLocaleString() + '원',
      //     cancelReason,
      //   },
      // })
    }

    return NextResponse.json({
      success: true,
      cancelAmount: cancelAmount || payment.amount,
      status: cancelResult.status,
    })
  } catch (error: Error | unknown) {

    return NextResponse.json(
      { error: error.message || '결제 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}