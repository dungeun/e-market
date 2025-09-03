import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/payments/stripe'
import { prisma } from "@/lib/db"

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        const orderId = paymentIntent.metadata?.orderId

        if (orderId) {
          await query({
            where: { orderNumber: orderId },
            data: {
              status: 'PAID',
              paymentId: paymentIntent.id,
              paidAt: new Date(),
            },
          })

          console.log(`Order ${orderId} payment succeeded`)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        const orderId = paymentIntent.metadata?.orderId

        if (orderId) {
          await query({
            where: { orderNumber: orderId },
            data: {
              status: 'PAYMENT_FAILED',
              paymentFailureReason: paymentIntent.last_payment_error?.message,
            },
          })

          console.log(`Order ${orderId} payment failed`)
        }
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object
        // Handle dispute created
        console.log('Dispute created:', dispute.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}