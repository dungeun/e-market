'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface TossPaymentProps {
  amount: number
  orderId: string
  orderName: string
  customerEmail?: string
  customerName?: string
  onSuccess: (payment: any) => void
  onError: (error: string) => void
}

export function TossPayment({
  amount,
  orderId,
  orderName,
  customerEmail,
  customerName,
  onSuccess,
  onError,
}: TossPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      // Load Toss Payments SDK
      const { loadTossPayments } = await import('@tosspayments/payment-sdk')
      const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!)

      // Request payment
      await tossPayments.requestPayment('카드', {
        amount,
        orderId,
        orderName,
        customerName,
        customerEmail,
        successUrl: `${window.location.origin}/payment/toss/success`,
        failUrl: `${window.location.origin}/payment/toss/fail`,
      })
    } catch (error) {

      onError(error instanceof Error ? error.message : 'Payment failed')
      toast.error('결제 중 오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBankTransfer = async () => {
    setIsProcessing(true)

    try {
      const { loadTossPayments } = await import('@tosspayments/payment-sdk')
      const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!)

      await tossPayments.requestPayment('계좌이체', {
        amount,
        orderId,
        orderName,
        customerName,
        customerEmail,
        successUrl: `${window.location.origin}/payment/toss/success`,
        failUrl: `${window.location.origin}/payment/toss/fail`,
      })
    } catch (error) {

      onError(error instanceof Error ? error.message : 'Payment failed')
      toast.error('결제 중 오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKakaoPay = async () => {
    setIsProcessing(true)

    try {
      const { loadTossPayments } = await import('@tosspayments/payment-sdk')
      const tossPayments = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!)

      await tossPayments.requestPayment('카카오페이', {
        amount,
        orderId,
        orderName,
        customerName,
        customerEmail,
        successUrl: `${window.location.origin}/payment/toss/success`,
        failUrl: `${window.location.origin}/payment/toss/fail`,
      })
    } catch (error) {

      onError(error instanceof Error ? error.message : 'Payment failed')
      toast.error('결제 중 오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>토스페이먼츠</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full"
          variant="outline"
        >
          {isProcessing ? '처리 중...' : '카드 결제'}
        </Button>
        
        <Button
          onClick={handleBankTransfer}
          disabled={isProcessing}
          className="w-full"
          variant="outline"
        >
          {isProcessing ? '처리 중...' : '계좌이체'}
        </Button>
        
        <Button
          onClick={handleKakaoPay}
          disabled={isProcessing}
          className="w-full"
          variant="outline"
        >
          {isProcessing ? '처리 중...' : '카카오페이'}
        </Button>
      </CardContent>
    </Card>
  )
}