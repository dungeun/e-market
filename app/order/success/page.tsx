'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Home, ShoppingCart } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCartStore } from '@/stores/cart-store'

function OrderSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clearCart = useCartStore((state) => state.clearCart)
  const [orderInfo, setOrderInfo] = useState({
    orderId: '',
    orderNumber: ''
  })

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    const orderNumber = searchParams.get('orderNumber')
    
    if (orderId && orderNumber) {
      setOrderInfo({
        orderId,
        orderNumber
      })
      // 주문 성공 시 장바구니 비우기
      clearCart()
      
      // 3초 후 자동으로 마이페이지 주문 내역으로 이동
      setTimeout(() => {
        router.push('/mypage/orders')
      }, 3000)
    } else {
      // 파라미터가 없으면 홈으로 리다이렉트
      router.push('/')
    }
  }, [searchParams, router, clearCart])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* 성공 아이콘 */}
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>

          {/* 성공 메시지 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            주문이 완료되었습니다!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            주문번호: <span className="font-semibold text-gray-900">{orderInfo.orderNumber}</span>
          </p>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-700">
              현금결제 주문이 접수되었습니다.
            </p>
            <p className="text-sm text-blue-700 mt-1">
              상품 수령 시 현금으로 결제해 주세요.
            </p>
            <p className="text-sm text-green-600 mt-2 font-medium">
              3초 후 자동으로 주문 내역 페이지로 이동합니다...
            </p>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/mypage/orders"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              <Package className="w-5 h-5 mr-2" />
              주문 내역 보기
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              홈으로 돌아가기
            </Link>
          </div>

          {/* 추가 쇼핑 안내 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/products"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              계속 쇼핑하기
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  )
}