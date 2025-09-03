'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useCartStore } from '@/lib/stores/cart-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import toast from 'react-hot-toast'

const CheckoutSchema = z.object({
  customerInfo: z.object({
    name: z.string().min(2, '이름을 입력해주세요'),
    email: z.string().email('올바른 이메일을 입력해주세요'),
    phone: z.string().min(10, '연락처를 입력해주세요'),
  }),
  shippingAddress: z.object({
    recipient: z.string().min(2, '받는 분 이름을 입력해주세요'),
    phone: z.string().min(10, '연락처를 입력해주세요'),
    address: z.string().min(5, '주소를 입력해주세요'),
    addressDetail: z.string().optional(),
    zipCode: z.string().min(5, '우편번호를 입력해주세요'),
  }),
  paymentMethod: z.enum(['card', 'bank', 'kakao', 'naver']),
  orderNotes: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof CheckoutSchema>

interface CheckoutFormProps {
  onOrderComplete: (orderId: string) => void
}

export function CheckoutForm({ onOrderComplete }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { items, clearCart } = useCartStore()
  const { user } = useAuthStore()
  
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutSchema),
    defaultValues: {
      customerInfo: {
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
      },
      shippingAddress: {
        recipient: user?.name || '',
        phone: '',
        address: '',
        addressDetail: '',
        zipCode: '',
      },
      paymentMethod: 'card',
      orderNotes: '',
    },
  })

  const onSubmit = async (data: CheckoutFormData) => {
    setIsLoading(true)
    
    try {
      const orderData = {
        ...data,
        items,
        totalAmount: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }
      
      // API call to create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })
      
      if (!response.ok) {
        throw new Error('주문 처리 중 오류가 발생했습니다')
      }
      
      const order = await response.json()
      
      // Clear cart and redirect to confirmation
      clearCart()
      onOrderComplete(order.orderNumber)
      toast.success('주문이 완료되었습니다!')
      
    } catch (error) {

      toast.error('주문 처리 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Customer Information */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">주문자 정보</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              {...form.register('customerInfo.name')}
              placeholder="홍길동"
            />
            {form.formState.errors.customerInfo?.name && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.customerInfo.name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              {...form.register('customerInfo.email')}
              placeholder="hong@example.com"
            />
            {form.formState.errors.customerInfo?.email && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.customerInfo.email.message}
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="phone">연락처</Label>
            <Input
              id="phone"
              {...form.register('customerInfo.phone')}
              placeholder="010-1234-5678"
            />
            {form.formState.errors.customerInfo?.phone && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.customerInfo.phone.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">배송지 정보</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="recipient">받는 분</Label>
            <Input
              id="recipient"
              {...form.register('shippingAddress.recipient')}
              placeholder="홍길동"
            />
          </div>
          <div>
            <Label htmlFor="recipientPhone">연락처</Label>
            <Input
              id="recipientPhone"
              {...form.register('shippingAddress.phone')}
              placeholder="010-1234-5678"
            />
          </div>
          <div>
            <Label htmlFor="zipCode">우편번호</Label>
            <Input
              id="zipCode"
              {...form.register('shippingAddress.zipCode')}
              placeholder="12345"
            />
          </div>
          <div>
            <Button type="button" variant="outline">
              주소 검색
            </Button>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">주소</Label>
            <Input
              id="address"
              {...form.register('shippingAddress.address')}
              placeholder="서울시 강남구 테헤란로 123"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="addressDetail">상세주소</Label>
            <Input
              id="addressDetail"
              {...form.register('shippingAddress.addressDetail')}
              placeholder="101동 1001호"
            />
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">결제 방법</h2>
        <RadioGroup
          value={form.watch('paymentMethod')}
          onValueChange={(value) => form.setValue('paymentMethod', value as unknown)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card">신용카드</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bank" id="bank" />
            <Label htmlFor="bank">무통장입금</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="kakao" id="kakao" />
            <Label htmlFor="kakao">카카오페이</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="naver" id="naver" />
            <Label htmlFor="naver">네이버페이</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Order Notes */}
      <div className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">주문 메모</h2>
        <Textarea
          {...form.register('orderNotes')}
          placeholder="배송 요청사항을 입력해주세요"
          rows={3}
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? '처리 중...' : '결제하기'}
      </Button>
    </form>
  )
}