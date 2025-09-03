'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CreditCard, Banknote, Receipt } from 'lucide-react'

interface CartItem {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    slug: string
    price: number
    original_price?: number
    stock: number
    images: { url: string; alt?: string }[]
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  
  // 배송 정보
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    email: '',
    postcode: '',
    address: '',
    addressDetail: '',
    message: '',
  })

  // 결제 방법
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'virtual'>('card')

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cart')
      const data = await response.json()
      
      if (response.ok && data.items && data.items.length > 0) {
        setCartItems(data.items)
      } else {
        router.push('/cart')
      }
    } catch (error) {

      router.push('/cart')
    } finally {
      setLoading(false)
    }
  }

  const handleAddressSearch = () => {
    // Daum 우편번호 API
    if (typeof window !== 'undefined' && (window as any).daum) {
      new (window as any).daum.Postcode({
        oncomplete: function(data: any) {
          setShippingInfo(prev => ({
            ...prev,
            postcode: data.zonecode,
            address: data.address,
          }))
        }
      }).open()
    }
  }

  const handlePayment = async () => {
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      alert('배송 정보를 모두 입력해주세요.')
      return
    }

    try {
      setIsLoading(true)
      
      // 결제 생성 API 호출
      const paymentResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
          shippingInfo,
          paymentMethod,
          totalAmount: finalPrice,
        }),
      })

      const paymentData = await paymentResponse.json()

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || '결제 생성 실패')
      }

      if (paymentData.success) {
        // 토스 페이먼츠 결제 위젯으로 리다이렉트 또는 결제 완료 페이지로 이동
        router.push(`/payment/confirm?paymentKey=${paymentData.paymentKey}&orderId=${paymentData.orderId}&amount=${finalPrice}`)
      }
      
    } catch (error) {

      alert('결제 처리 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity)
    }, 0)
  }

  const totalPrice = calculateTotal()
  const shippingFee = totalPrice >= 50000 ? 0 : 3000
  const finalPrice = totalPrice + shippingFee

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">주문/결제</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 주문 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 배송 정보 */}
            <div className="bg-gray-900 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-white mb-4">배송 정보</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    받는 분 *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.name}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    연락처 *
                  </label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="010-0000-0000"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    주소 *
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={shippingInfo.postcode}
                      readOnly
                      placeholder="우편번호"
                      className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleAddressSearch}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      주소 검색
                    </button>
                  </div>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    readOnly
                    placeholder="기본 주소"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-500 rounded-md mb-2"
                  />
                  <input
                    type="text"
                    value={shippingInfo.addressDetail}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, addressDetail: e.target.value }))}
                    placeholder="상세 주소"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    배송 메시지
                  </label>
                  <textarea
                    value={shippingInfo.message}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="배송 시 요청사항을 입력해주세요"
                  />
                </div>
              </div>
            </div>

            {/* 결제 방법 */}
            <div className="bg-gray-900 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-white mb-4">결제 방법</h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mr-3 text-red-600 focus:ring-red-500"
                  />
                  <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
                  <div>
                    <div className="font-medium text-white">신용/체크카드</div>
                    <div className="text-sm text-gray-400">토스페이 간편결제</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mr-3 text-red-600 focus:ring-red-500"
                  />
                  <Banknote className="w-5 h-5 text-gray-400 mr-2" />
                  <div>
                    <div className="font-medium text-white">계좌이체</div>
                    <div className="text-sm text-gray-400">토스페이 계좌이체</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="virtual"
                    checked={paymentMethod === 'virtual'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mr-3 text-red-600 focus:ring-red-500"
                  />
                  <Receipt className="w-5 h-5 text-gray-400 mr-2" />
                  <div>
                    <div className="font-medium text-white">가상계좌</div>
                    <div className="text-sm text-gray-400">입금 확인 후 배송</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-white mb-4">주문 요약</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => {
                  const image = item.product.images[0]?.url || '/placeholder.jpg'
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={image}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-white">{item.product.name}</h3>
                        <p className="text-sm text-gray-400">수량: {item.quantity}</p>
                        <div className="flex items-center space-x-2">
                          {item.product.original_price && item.product.original_price > item.product.price && (
                            <span className="text-xs text-gray-500 line-through">
                              {formatPrice(item.product.original_price * item.quantity)}
                            </span>
                          )}
                          <span className="text-sm font-medium text-white">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-gray-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">상품 금액</span>
                  <span className="text-white">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">배송비</span>
                  <span className="text-white">
                    {shippingFee === 0 ? (
                      <span className="text-green-400">무료</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                {totalPrice < 50000 && (
                  <div className="text-xs text-gray-500">
                    {formatPrice(50000 - totalPrice)} 추가 주문 시 무료배송
                  </div>
                )}
                <div className="border-t border-gray-800 pt-2 flex justify-between font-semibold text-lg">
                  <span className="text-white">총 결제금액</span>
                  <span className="text-red-400">{formatPrice(finalPrice)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isLoading || cartItems.length === 0}
                className="w-full mt-6 bg-red-600 text-white py-3 px-6 rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '처리 중...' : `${formatPrice(finalPrice)} 결제하기`}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                토스페이먼츠로 안전하게 결제됩니다
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Daum 우편번호 스크립트 */}
      <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" async></script>
    </div>
  )
}