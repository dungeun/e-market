import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface OrderConfirmationProps {
  orderId: string
}

export function OrderConfirmation({ orderId }: OrderConfirmationProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      
      <h1 className="mt-6 text-2xl font-bold">주문이 완료되었습니다!</h1>
      <p className="mt-2 text-muted-foreground">
        주문번호: <span className="font-mono font-medium">{orderId}</span>
      </p>
      
      <div className="mt-8 rounded-lg border bg-card p-6 text-left">
        <h2 className="font-semibold mb-4">주문 안내</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• 주문 확인 후 1-2일 내에 상품이 발송됩니다.</p>
          <p>• 배송 정보는 문자 메시지로 안내드립니다.</p>
          <p>• 주문 내역은 마이페이지에서 확인할 수 있습니다.</p>
          <p>• 배송 관련 문의: 고객센터 1588-1234</p>
        </div>
      </div>
      
      <div className="mt-8 flex gap-4">
        <Link href="/account/orders">
          <Button variant="outline">
            주문 내역 보기
          </Button>
        </Link>
        
        <Link href="/products">
          <Button>
            계속 쇼핑하기
          </Button>
        </Link>
      </div>
    </div>
  )
}