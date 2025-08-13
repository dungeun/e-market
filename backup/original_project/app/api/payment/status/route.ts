/**
 * 결제 상태 조회 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { paymentGateway } from '@/lib/services/payment/payment-gateway'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    const orderId = searchParams.get('orderId')

    if (!paymentId && !orderId) {
      return NextResponse.json(
        { error: 'Payment ID or Order ID is required' },
        { status: 400 }
      )
    }

    let payment

    if (paymentId) {
      // 결제 ID로 조회
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: {
            include: {
              user: true,
              items: {
                include: {
                  product: true
                }
              }
            }
          },
          refunds: true
        }
      })
    } else if (orderId) {
      // 주문 ID로 최신 결제 조회
      payment = await prisma.payment.findFirst({
        where: { orderId },
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            include: {
              user: true,
              items: {
                include: {
                  product: true
                }
              }
            }
          },
          refunds: true
        }
      })
    }

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // 권한 확인 (본인 또는 관리자) - 이메일로 유저 찾기
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })
    
    if ((!user || payment.order.userId !== user.id) && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // PG사에서 실시간 상태 조회
    let providerStatus = null
    if (payment.transactionId) {
      try {
        providerStatus = await paymentGateway.getPaymentStatus(payment.id)
      } catch (error) {
        console.error('Failed to get provider status:', error)
      }
    }

    // 세금계산서 정보 조회 (B2B) - 추후 구현
    let taxInvoice = null
    /*
    if (payment.order.businessAccountId) {
      taxInvoice = await prisma.taxInvoice.findFirst({
        where: { orderId: payment.orderId }
      })
    }
    */

    return NextResponse.json({
      success: true,
      data: {
        payment,
        providerStatus,
        taxInvoice,
        summary: {
          totalAmount: payment.amount,
          refundedAmount: payment.refunds.reduce((sum, r) => sum + r.amount, 0),
          remainingAmount: payment.amount - payment.refunds.reduce((sum, r) => sum + r.amount, 0),
          canRefund: payment.status === 'COMPLETED',
          isB2B: false
        }
      }
    })
  } catch (error: any) {
    console.error('Payment status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get payment status' },
      { status: 500 }
    )
  }
}