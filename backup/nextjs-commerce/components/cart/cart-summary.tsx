'use client'

import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/stores/cart-store'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

export function CartSummary() {
  const { items, getTotalPrice, getTotalItems } = useCartStore()
  
  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()
  const shippingFee = totalPrice >= 50000 ? 0 : 3000
  const finalTotal = totalPrice + shippingFee

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">주문 요약</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>상품 {totalItems}개</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>배송비</span>
          <span className="text-muted-foreground">
            {shippingFee === 0 ? '무료' : formatPrice(shippingFee)}
          </span>
        </div>
        
        {shippingFee > 0 && (
          <div className="text-xs text-muted-foreground">
            {formatPrice(50000 - totalPrice)} 더 구매하면 배송비 무료
          </div>
        )}
        
        <hr />
        
        <div className="flex justify-between font-semibold">
          <span>총 결제금액</span>
          <span className="text-lg">{formatPrice(finalTotal)}</span>
        </div>
      </div>
      
      <div className="mt-6 space-y-3">
        <Link href="/checkout" className="block">
          <Button className="w-full" size="lg">
            <ShoppingCart className="mr-2 h-4 w-4" />
            주문하기
          </Button>
        </Link>
        
        <Link href="/products" className="block">
          <Button variant="outline" className="w-full">
            계속 쇼핑하기
          </Button>
        </Link>
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>• 주문 시 적립금 {Math.floor(totalPrice * 0.01).toLocaleString()}원 적립</p>
        <p>• 무료 배송 조건: 5만원 이상 구매</p>
        <p>• 결제 완료 후 1-2일 내 발송</p>
      </div>
    </div>
  )
}