import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
})

export interface PaymentIntentData {
  amount: number
  currency: string
  orderId: string
  customerEmail?: string
  customerName?: string
}

export async function createPaymentIntent(data: PaymentIntentData) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount), // Stripe expects amount in smallest currency unit
      currency: data.currency.toLowerCase(),
      metadata: {
        orderId: data.orderId,
      },
      receipt_email: data.customerEmail,
      description: `Order #${data.orderId}`,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error('Error creating Stripe payment intent:', error)
    throw new Error('Failed to create payment intent')
  }
}

export async function confirmPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error('Error confirming Stripe payment:', error)
    throw new Error('Failed to confirm payment')
  }
}

export async function createCustomer(data: { email: string; name: string }) {
  try {
    const customer = await stripe.customers.create({
      email: data.email,
      name: data.name,
    })
    return customer
  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    throw new Error('Failed to create customer')
  }
}

export async function refundPayment(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount) : undefined,
    })
    return refund
  } catch (error) {
    console.error('Error processing Stripe refund:', error)
    throw new Error('Failed to process refund')
  }
}