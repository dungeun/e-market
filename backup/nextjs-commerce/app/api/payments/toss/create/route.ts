import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/config/env';
import { tossPayments } from '@/lib/payments/toss'
import { z } from 'zod'

const CreateTossPaymentSchema = z.object({
  amount: z.number().positive(),
  orderId: z.string(),
  orderName: z.string(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateTossPaymentSchema.parse(body)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || env.appUrl

    const payment = await tossPayments.createPayment({
      ...validatedData,
      successUrl: `${baseUrl}/payment/success`,
      failUrl: `${baseUrl}/payment/fail`,
    })

    return NextResponse.json(payment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create Toss payment' },
      { status: 500 }
    )
  }
}