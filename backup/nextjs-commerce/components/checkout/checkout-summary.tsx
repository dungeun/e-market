'use client'

import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/stores/cart-store'
import Image from 'next/image'

export function CheckoutSummary() {
  const { items, getTotalPrice } = useCartStore()
  
  const totalPrice = getTotalPrice()
  const shippingFee = totalPrice >= 50000 ? 0 : 3000
  const finalTotal = totalPrice + shippingFee

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">주문 상품</h2>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="aspect-square w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-xs text-muted-foreground">No image</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium line-clamp-2">{item.name}</h3>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  수량: {item.quantity}
                </span>
                <span className="text-sm font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <hr className="my-4" />
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>상품금액</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>배송비</span>
          <span>{shippingFee === 0 ? '무료' : formatPrice(shippingFee)}</span>
        </div>
        
        <hr />
        
        <div className="flex justify-between font-semibold">
          <span>총 결제금액</span>
          <span className="text-lg text-primary">{formatPrice(finalTotal)}</span>
        </div>
      </div>
      
      <div className="mt-4 rounded-md bg-muted p-3">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• 주문 확인 후 1-2일 내 발송됩니다.</p>
          <p>• 5만원 이상 구매 시 무료배송</p>
          <p>• 적립금 {Math.floor(totalPrice * 0.01).toLocaleString()}원 적립 예정</p>
        </div>
      </div>
    </div>
  )
}