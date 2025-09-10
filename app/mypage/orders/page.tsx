'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Package, Truck, CheckCircle, Clock, ChevronRight, Home } from 'lucide-react'

interface Order {
  id: number
  order_number: string
  total_amount: number
  status: string
  payment_status: string
  payment_method: string
  created_at: string
  customer_name: string
  shipping_address: string
  items: Array<{
    product_name: string
    quantity: number
    price: number
  }>
}

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: '주문 접수', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PROCESSING: { label: '처리 중', color: 'bg-blue-100 text-blue-800', icon: Package },
  SHIPPED: { label: '배송 중', color: 'bg-purple-100 text-purple-800', icon: Truck },
  DELIVERED: { label: '배송 완료', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: '취소됨', color: 'bg-red-100 text-red-800', icon: null }
}

export default function MyOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthAndFetchOrders()
  }, [])

  const checkAuthAndFetchOrders = async () => {
    try {
      // 인증 확인
      const authResponse = await fetch('/api/auth/me')
      if (!authResponse.ok) {
        router.push('/auth/login?redirect=/mypage/orders')
        return
      }
      
      setIsAuthenticated(true)
      const authData = await authResponse.json()
      
      // 주문 내역 가져오기
      const ordersResponse = await fetch('/api/user/orders')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(ordersData.orders || [])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 브레드크럼 */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600">
                <Home className="w-4 h-4 mr-2" />
                홈
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link href="/mypage" className="ml-1 text-sm font-medium text-gray-700 hover:text-indigo-600 md:ml-2">
                  마이페이지
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">주문 내역</span>
              </div>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">주문 내역</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-4">주문 내역이 없습니다.</p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              쇼핑 시작하기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = statusMap[order.status] || statusMap.PENDING
              const StatusIcon = statusInfo.icon
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          주문번호: {order.order_number}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {StatusIcon && <StatusIcon className="w-5 h-5 mr-2" />}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* 주문 상품 목록 */}
                    <div className="border-t border-b border-gray-200 py-4 my-4">
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.product_name} x {item.quantity}
                              </span>
                              <span className="text-gray-900 font-medium">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">상품 정보 없음</p>
                      )}
                    </div>

                    {/* 배송 정보 */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">배송지:</span> {order.shipping_address}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">받는 분:</span> {order.customer_name}
                      </p>
                    </div>

                    {/* 결제 정보 */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">결제 방법:</span>{' '}
                        {order.payment_method === 'cash' ? '현금 결제' : order.payment_method}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        총 {formatPrice(order.total_amount)}
                      </div>
                    </div>

                    {/* 상세보기 버튼 */}
                    <div className="mt-4 flex justify-end">
                      <Link
                        href={`/mypage/orders/${order.id}`}
                        className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                      >
                        주문 상세보기 →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}