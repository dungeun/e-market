/**
 * 결제 취소/환불 API
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
    const { paymentId, amount, reason, taxInvoiceCancel = false } = body

    if (!paymentId || !reason) {
      return NextResponse.json(
        { error: 'Payment ID and reason are required' },
        { status: 400 }
      )
    }

    // 결제 정보 조회
    const payment = await query({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            user: true
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // 권한 확인 (본인 또는 관리자) - 이메일로 유저 찾기
    const user = await query({
      where: { email: session.user.email! }
    })
    
    if ((!user || payment.order.userId !== user.id) && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // 이미 환불된 결제인지 확인
    const existingRefund = await query({
      where: {
        paymentId,
        status: 'COMPLETED'
      }
    })

    if (existingRefund) {
      return NextResponse.json(
        { error: 'Payment already refunded' },
        { status: 409 }
      )
    }

    // 환불 가능 금액 확인
    const previousRefunds = await prisma.refund.aggregate({
      where: {
        paymentId,
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      }
    })

    const refundedAmount = previousRefunds._sum.amount || 0
    const refundableAmount = payment.amount - refundedAmount
    const refundAmount = amount || refundableAmount

    if (refundAmount > refundableAmount) {
      return NextResponse.json(
        { error: `Maximum refundable amount is ${refundableAmount}` },
        { status: 400 }
      )
    }

    // 환불 처리
    const response = await paymentGateway.refundPayment({
      paymentId,
      amount: refundAmount,
      reason,
      taxInvoiceCancel
    })

    if (response.status === 'CANCELLED' || response.status === 'COMPLETED') {
      // 주문 상태 업데이트
      const isPartialRefund = refundAmount < payment.amount
      
      await query({
        where: { id: payment.orderId },
        data: {
          status: isPartialRefund ? 'PARTIAL_REFUND' : 'REFUNDED'
        }
      })

      // 전체 환불인 경우 재고 복구
      if (!isPartialRefund) {
        const reservations = await query({
          where: { orderId: payment.orderId }
        })

        for (const reservation of reservations) {
          // 재고 복구
          await query({
            where: { 
              productId_locationId: {
                productId: reservation.productId,
                locationId: 'default'
              }
            },
            data: {
              quantity: {
                increment: reservation.quantity
              }
            }
          })

          // 예약 취소
          await query({
            where: { id: reservation.id },
            data: { status: 'CANCELLED' }
          })
        }
      }

      // B2B 주문인 경우 세금계산서 취소 (추후 구현)
      /*
      if (taxInvoiceCancel) {
        const taxInvoice = await query({
          where: {
            orderId: payment.orderId,
            status: 'ISSUED'
          }
        })

        if (taxInvoice) {
          await query({
            where: { id: taxInvoice.id },
            data: {
              status: 'CANCELLED',
              cancelledAt: new Date()
            }
          })
        }
      }
      */
    }

    return NextResponse.json({
      success: response.success,
      data: response
    })
  } catch (error: any) {

    return NextResponse.json(
      { error: error.message || 'Failed to process refund' },
      { status: 500 }
    )
  }
}