import { NextRequest, NextResponse } from 'next/server'
import { tossPayments } from '@/lib/payments/toss'
import { prisma } from "@/lib/db"
import { z } from 'zod'

const ConfirmTossPaymentSchema = z.object({
  paymentKey: z.string(),
  orderId: z.string(),
  amount: z.number(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ConfirmTossPaymentSchema.parse(body)

    const payment = await tossPayments.confirmPayment(
      validatedData.paymentKey,
      validatedData.orderId,
      validatedData.amount
    )

    // Update order status in database
    await query({
      where: { orderNumber: validatedData.orderId },
      data: {
        status: 'PAID',
        paymentId: payment.paymentKey,
        paidAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      payment,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    // If payment confirmation fails, update order status
    try {
      await query({
        where: { orderNumber: body.orderId },
        data: {
          status: 'PAYMENT_FAILED',
          paymentFailureReason: error instanceof Error ? error.message : 'Unknown error',
        },
      })
    } catch (dbError) {

    }

    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}