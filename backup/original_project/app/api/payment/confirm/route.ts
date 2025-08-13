/**
 * 결제 확인 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { paymentGateway } from '@/lib/services/payment/payment-gateway'
import { b2bService } from '@/lib/services/business/b2b-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    const { paymentId, orderId, ...confirmData } = body

    if (!paymentId || !orderId) {
      return NextResponse.json(
        { error: 'Payment ID and Order ID are required' },
        { status: 400 }
      )
    }

    // 결제 확인
    const response = await paymentGateway.confirmPayment(paymentId, {
      orderId,
      ...confirmData
    })

    if (response.status === 'COMPLETED') {
      // 주문 상태 업데이트
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'PAYMENT_COMPLETED'
        }
      })

      // B2B 주문인 경우 세금계산서 발행 (필요시 추가 구현)
      /* 
      if (order.businessAccountId) {
        try {
          await b2bService.issueTaxInvoice({
            businessAccountId: order.businessAccountId,
            orderId: order.id,
            type: 'TAX_INVOICE'
          })
        } catch (error) {
          console.error('Tax invoice creation failed:', error)
          // 세금계산서 발행 실패는 결제 성공에 영향을 주지 않음
        }
      }
      */

      // 재고 예약 확정
      const reservations = await prisma.inventoryReservation.findMany({
        where: { orderId }
      })

      for (const reservation of reservations) {
        await prisma.inventoryReservation.update({
          where: { id: reservation.id },
          data: { status: 'CONFIRMED' }
        })
      }
    } else if (response.status === 'FAILED' || response.status === 'CANCELLED') {
      // 결제 실패 시 주문 취소
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAYMENT_FAILED' }
      })

      // 재고 예약 취소
      await prisma.inventoryReservation.updateMany({
        where: { orderId },
        data: { status: 'CANCELLED' }
      })
    }

    return NextResponse.json({
      success: response.success,
      data: response
    })
  } catch (error: any) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}