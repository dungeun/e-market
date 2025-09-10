'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { useLanguage } from '@/contexts/LanguageContext'

export default function CartPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore()

  const handleCheckout = () => {
    if (items.length === 0) {
      alert(t('cart.empty_message', '장바구니가 비어있습니다.'))
      return
    }

    // 결제 데이터를 세션 스토리지에 저장하고 결제 페이지로 이동
    const checkoutData = {
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      total: getTotalPrice()
    }
    
    sessionStorage.setItem('checkout-data', JSON.stringify(checkoutData))
    router.push('/checkout')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('cart.title', '장바구니')}</h1>

        {items.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center transition-colors">
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t('cart.empty_message', '장바구니가 비어있습니다.')}</p>
            <button
              onClick={() => router.push('/products')}
              className="text-indigo-600 dark:text-red-400 hover:text-indigo-500 dark:hover:text-red-300 font-medium"
            >
              {t('cart.continue_shopping', '쇼핑 계속하기')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 장바구니 아이템 목록 */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors">
                  <div className="flex gap-4">
                    {/* 상품 이미지 */}
                    <div className="w-24 h-24 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                          <span className="text-gray-400 dark:text-gray-500">{t('common.no_image', 'No Image')}</span>
                        </div>
                      )}
                    </div>

                    {/* 상품 정보 */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        ₩{item.price.toLocaleString()}
                      </p>
                      
                      {/* 수량 조절 */}
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <span className="w-12 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-4 transition-colors">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('cart.order_summary', '주문 요약')}</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('cart.item_count', '상품 수')}</span>
                    <span className="text-gray-900 dark:text-white">{items.reduce((sum, item) => sum + item.quantity, 0)}개</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('cart.subtotal', '상품 금액')}</span>
                    <span className="text-gray-900 dark:text-white">₩{getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('cart.shipping', '배송비')}</span>
                    <span className="text-gray-900 dark:text-white">{t('cart.free_shipping', '무료')}</span>
                  </div>
                </div>
                
                <div className="border-t dark:border-gray-700 pt-4 mb-6">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900 dark:text-white">{t('cart.total', '총 결제금액')}</span>
                    <span className="text-indigo-600 dark:text-red-400">
                      ₩{getTotalPrice().toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-indigo-600 dark:bg-red-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 dark:hover:bg-red-700 transition-colors"
                >
                  {t('cart.checkout', '주문하기')}
                </button>
                
                <button
                  onClick={() => router.push('/products')}
                  className="w-full mt-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('cart.continue_shopping', '쇼핑 계속하기')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}