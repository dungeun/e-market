'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripePaymentFormProps {
  amount: number
  orderId: string
  customerEmail?: string
  customerName?: string
  onSuccess: (paymentIntent: any) => void
  onError: (error: string) => void
}

function StripePaymentForm({
  amount,
  orderId,
  customerEmail,
  customerName,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      // Create payment intent
      const response = await fetch('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          orderId,
          customerEmail,
          customerName,
          currency: 'krw',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { clientSecret } = await response.json()

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: customerName,
              email: customerEmail,
            },
          },
        }
      )

      if (error) {
        onError(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent)
        toast.success('결제가 완료되었습니다!')
      }
    } catch (error) {

      onError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>신용카드 결제</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border rounded-md">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>
          
          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full"
          >
            {isProcessing ? '결제 처리 중...' : `${amount.toLocaleString()}원 결제하기`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function StripePayment(props: StripePaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm {...props} />
    </Elements>
  )
}