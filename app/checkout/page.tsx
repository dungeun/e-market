'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CreditCard, Banknote, Receipt } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import KakaoAddressModal from '@/components/KakaoAddressModal'
import { useLanguage } from '@/contexts/LanguageContext'

interface CheckoutItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

function CheckoutContent() {
  const { t } = useLanguage()
  const router = useRouter()
  const { items, clearCart } = useCartStore()
  
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  
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

  // 결제 방법 (현금만)
  const [paymentMethod, setPaymentMethod] = useState('cash')

  useEffect(() => {
    // 세션 스토리지에서 checkout 데이터 가져오기 또는 Zustand 스토어에서 직접 가져오기
    const storedData = sessionStorage.getItem('checkout-data')
    if (storedData) {
      const data = JSON.parse(storedData)
      setCheckoutItems(data.items)
    } else if (items.length > 0) {
      // 장바구니에서 직접 온 경우
      setCheckoutItems(items)
    } else {
      // 장바구니가 비어있으면 장바구니 페이지로 리다이렉트
      router.push('/cart')
      return
    }
    setLoading(false)
  }, [items, router])

  // 로그인한 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            // 사용자 정보로 폼 필드 자동 채우기
            setShippingInfo(prev => ({
              ...prev,
              name: data.user.name || '',
              phone: data.user.phone || '',
              email: data.user.email || '',
              postcode: data.user.postal_code || '',
              address: data.user.address || '',
              addressDetail: '',
            }))
          }
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error)
      }
    }

    fetchUserInfo()
  }, [])

  const handleAddressSearch = () => {
    setIsAddressModalOpen(true)
  }

  const handleAddressComplete = (addressData: { zonecode: string; address: string }) => {
    setShippingInfo(prev => ({
      ...prev,
      postcode: addressData.zonecode,
      address: addressData.address,
    }))
  }

  const handlePayment = async () => {
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      alert(t('checkout.validation_required', '배송 정보를 모두 입력해주세요.'))
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
          items: checkoutItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingInfo,
          paymentMethod,
          totalAmount: finalPrice,
        }),
      })

      const paymentData = await paymentResponse.json()

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || t('checkout.payment_error', '결제 처리 중 오류가 발생했습니다.'))
      }

      if (paymentData.success) {
        // 결제 성공시 장바구니 비우기 및 세션 스토리지 정리
        clearCart()
        sessionStorage.removeItem('checkout-data')
        
        // 현금 결제는 주문 완료 페이지로 직접 이동
        if (paymentMethod === 'cash' || paymentMethod === 'CASH') {
          router.push(`/order/success?orderId=${paymentData.data.orderId}&orderNumber=${paymentData.data.orderNumber}`)
        } else {
          // 다른 결제 방법일 경우 (추후 구현)
          router.push(`/payment/confirm?paymentKey=${paymentData.paymentKey}&orderId=${paymentData.data.orderId}&amount=${finalPrice}`)
        }
      }
      
    } catch (error) {

      alert(t('checkout.payment_error', '결제 처리 중 오류가 발생했습니다.'))
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotal = () => {
    return checkoutItems.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
  }

  const totalPrice = calculateTotal()
  const shippingFee = totalPrice >= 50000 ? 0 : 3000
  const finalPrice = totalPrice + shippingFee

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('checkout.title', '주문/결제')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 주문 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 배송 정보 */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('checkout.shipping_info', '배송 정보')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.recipient', '받는 분 *')}
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.name}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.phone', '연락처 *')}
                  </label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder={t('checkout.phone_placeholder', '010-0000-0000')}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.email', '이메일')}
                  </label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    {t('checkout.address', '주소 *')}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={shippingInfo.postcode}
                      readOnly
                      placeholder={t('checkout.postcode', '우편번호')}
                      className="w-32 px-3 py-2 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-500 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={handleAddressSearch}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      {t('checkout.address_search', '주소 검색')}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    readOnly
                    placeholder={t('checkout.address_basic', '기본 주소')}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-500 rounded-md mb-2"
                  />
                  <input
                    type="text"
                    value={shippingInfo.addressDetail}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, addressDetail: e.target.value }))}
                    placeholder={t('checkout.address_detail', '상세 주소')}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    {t('checkout.delivery_message', '배송 메시지')}
                  </label>
                  <textarea
                    value={shippingInfo.message}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder={t('checkout.delivery_request', '배송 시 요청사항을 입력해주세요')}
                  />
                </div>
              </div>
            </div>

            {/* 결제 방법 */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('checkout.payment_method', '결제 방법')}</h2>
              
              <div className="space-y-3">
                <div className="flex items-center p-3 border border-indigo-500 bg-white rounded-lg">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={true}
                    readOnly
                    className="mr-3 text-red-600 focus:ring-red-500"
                  />
                  <Banknote className="w-5 h-5 text-red-400 mr-2" />
                  <div>
                    <div className="font-medium text-gray-900">{t('checkout.cash_payment', '현금결제')}</div>
                    <div className="text-sm text-gray-600">{t('checkout.cash_description', '현장에서 현금으로 결제')}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <Receipt className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-600">{t('checkout.cash_only', '현재 현금결제만 지원됩니다')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('checkout.order_summary', '주문 요약')}</h2>
              
              <div className="space-y-4 mb-6">
                {checkoutItems.map((item) => {
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-white rounded-md overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            {t('common.no_image', 'No Image')}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-400">{t('checkout.quantity', '수량:')} {item.quantity}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            ₩{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">{t('cart.subtotal', '상품 금액')}</span>
                  <span className="text-gray-900">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">{t('cart.shipping', '배송비')}</span>
                  <span className="text-gray-900">
                    {shippingFee === 0 ? (
                      <span className="text-green-400">{t('cart.free_shipping', '무료')}</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                {totalPrice < 50000 && (
                  <div className="text-xs text-gray-500">
                    {formatPrice(50000 - totalPrice)} {t('checkout.free_shipping_notice', '추가 주문 시 무료배송')}
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-lg">
                  <span className="text-gray-900">{t('cart.total', '총 결제금액')}</span>
                  <span className="text-indigo-600">{formatPrice(finalPrice)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isLoading || checkoutItems.length === 0}
                className="w-full mt-6 bg-indigo-600 text-white py-3 px-6 rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('checkout.processing', '처리 중...') : `${formatPrice(finalPrice)} ${t('checkout.pay_button', '결제하기')}`}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                {t('checkout.cash_notice', '주문 확인 후 현장에서 현금으로 결제해주세요')}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Kakao Address Modal */}
      <KakaoAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onComplete={handleAddressComplete}
      />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}