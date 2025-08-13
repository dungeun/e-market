'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CheckoutForm } from '@/components/checkout/checkout-form'
import { CheckoutSummary } from '@/components/checkout/checkout-summary'
import { OrderConfirmation } from '@/components/checkout/order-confirmation'
import { useCartStore } from '@/lib/stores/cart-store'
import { redirect } from 'next/navigation'

export default function CheckoutPage() {
  const { items } = useCartStore()
  const [step, setStep] = useState<'form' | 'confirmation'>('form')
  const [orderId, setOrderId] = useState<string | null>(null)

  // Redirect if cart is empty
  if (items.length === 0) {
    redirect('/cart')
  }

  const handleOrderComplete = (orderNumber: string) => {
    setOrderId(orderNumber)
    setStep('confirmation')
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          {step === 'form' ? (
            <>
              <h1 className="text-3xl font-bold mb-8">주문/결제</h1>
              
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <CheckoutForm onOrderComplete={handleOrderComplete} />
                </div>
                
                <div className="lg:col-span-1">
                  <CheckoutSummary />
                </div>
              </div>
            </>
          ) : (
            <OrderConfirmation orderId={orderId!} />
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}