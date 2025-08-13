import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <ShoppingCart className="h-10 w-10 text-muted-foreground" />
      </div>
      
      <h2 className="mt-6 text-xl font-semibold">장바구니가 비어있습니다</h2>
      <p className="mt-2 text-muted-foreground">
        원하는 상품을 장바구니에 담아보세요.
      </p>
      
      <Link href="/products" className="mt-6">
        <Button size="lg">
          쇼핑 시작하기
        </Button>
      </Link>
    </div>
  )
}