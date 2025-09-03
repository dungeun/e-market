'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/stores/cart-store'
import Image from 'next/image'

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
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
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items, router])

  const handleAddressSearch = () => {
    // Daum 우편번호 API
    if (typeof window !== 'undefined' && (window as unknown).daum) {
      new (window as unknown).daum.Postcode({
        oncomplete: function(data: unknown) {
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
      
      // 주문 생성
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingInfo,
          totalAmount: getTotalPrice(),
        }),
      })

      if (!orderResponse.ok) {
        throw new Error('주문 생성 실패')
      }

      const order = await orderResponse.json()

      // 결제 페이지로 이동 (실제로는 토스 결제 위젯이나 API를 사용해야 함)
      // 현재는 간단히 주문 완료 페이지로 이동
      clearCart()
      router.push(`/orders/${order.id}/complete`)
      
    } catch (error) {

      alert('결제 처리 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const totalPrice = getTotalPrice()
  const shippingFee = totalPrice >= 30000 ? 0 : 3000
  const finalPrice = totalPrice + shippingFee

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">주문/결제</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 주문 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 배송 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">배송 정보</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    받는 분 *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.name}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    연락처 *
                  </label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="010-0000-0000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주소 *
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={shippingInfo.postcode}
                      readOnly
                      placeholder="우편번호"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={handleAddressSearch}
                      className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                    >
                      주소 검색
                    </button>
                  </div>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    readOnly
                    placeholder="기본 주소"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 mb-2"
                  />
                  <input
                    type="text"
                    value={shippingInfo.addressDetail}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, addressDetail: e.target.value }))}
                    placeholder="상세 주소"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    배송 메시지
                  </label>
                  <textarea
                    value={shippingInfo.message}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="배송 시 요청사항을 입력해주세요"
                  />
                </div>
              </div>
            </div>

            {/* 결제 방법 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">결제 방법</h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value as unknown)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">신용/체크카드</div>
                    <div className="text-sm text-gray-500">토스페이 간편결제</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value as unknown)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">계좌이체</div>
                    <div className="text-sm text-gray-500">토스페이 계좌이체</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="virtual"
                    checked={paymentMethod === 'virtual'}
                    onChange={(e) => setPaymentMethod(e.target.value as unknown)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">가상계좌</div>
                    <div className="text-sm text-gray-500">입금 확인 후 배송</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">주문 요약</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {item.image && (
                        <Image
                          src={item.image || '/placeholder.svg'}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">수량: {item.quantity}</p>
                      <p className="text-sm font-medium">₩{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">상품 금액</span>
                  <span>₩{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">배송비</span>
                  <span>{shippingFee === 0 ? '무료' : `₩${shippingFee.toLocaleString()}`}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>총 결제금액</span>
                  <span className="text-indigo-600">₩{finalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isLoading || items.length === 0}
                className="w-full mt-6 bg-indigo-600 text-white py-3 px-6 rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '처리 중...' : `₩${finalPrice.toLocaleString()} 결제하기`}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                토스페이먼츠로 안전하게 결제됩니다
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Daum 우편번호 스크립트 */}
      <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" async></script>
    </div>
  )
}