import { NextRequest, NextResponse } from 'next/server'
import { createPaymentIntent } from '@/lib/payments/stripe'
import { z } from 'zod'

const CreateIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('krw'),
  orderId: z.string(),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateIntentSchema.parse(body)

    const paymentIntent = await createPaymentIntent(validatedData)

    return NextResponse.json(paymentIntent)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}