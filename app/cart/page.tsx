'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Trash2, Plus, Minus } from 'lucide-react'

interface CartItem {
  id: string
  product_id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    slug: string
    stock: number
    images: { url: string; alt?: string }[]
  }
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart')
      const data = await response.json()
      setCartItems(data.items || [])
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product.stock) return
    
    setUpdating(item.id)
    try {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.product_id,
          quantity: newQuantity
        })
      })

      if (response.ok) {
        setCartItems(items =>
          items.map(i =>
            i.id === item.id ? { ...i, quantity: newQuantity } : i
          )
        )
      }
    } catch (error) {

    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (item: CartItem) => {
    setUpdating(item.id)
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.product_id
        })
      })

      if (response.ok) {
        setCartItems(items => items.filter(i => i.id !== item.id))
      }
    } catch (error) {

    } finally {
      setUpdating(null)
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity)
    }, 0)
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }

    // 주문 생성
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: '서울시 강남구', // 실제로는 사용자 입력받아야 함
          paymentMethod: 'card',
          items: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
          }))
        })
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/checkout?orderId=${data.order.id}`)
      } else {
        alert(data.error || '주문 생성에 실패했습니다.')
      }
    } catch (error) {

      alert('주문 처리 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">장바구니</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 mb-4">장바구니가 비어있습니다.</p>
            <button
              onClick={() => router.push('/products')}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              쇼핑 계속하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 장바구니 아이템 목록 */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex gap-4">
                    {/* 상품 이미지 */}
                    <div className="w-24 h-24 flex-shrink-0">
                      {item.product.images && item.product.images[0] ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* 상품 정보 */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-gray-600 mt-1">
                        ₩{item.product.price.toLocaleString()}
                      </p>
                      
                      {/* 수량 조절 */}
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => updateQuantity(item, item.quantity - 1)}
                          disabled={updating === item.id || item.quantity <= 1}
                          className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item, item.quantity + 1)}
                          disabled={updating === item.id || item.quantity >= item.product.stock}
                          className="p-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-500 ml-2">
                          (재고: {item.product.stock}개)
                        </span>
                      </div>
                    </div>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => removeItem(item)}
                      disabled={updating === item.id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-semibold mb-4">주문 요약</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>상품 수</span>
                    <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}개</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>상품 금액</span>
                    <span>₩{calculateTotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>배송비</span>
                    <span>무료</span>
                  </div>
                </div>
                
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-semibold">
                    <span>총 결제금액</span>
                    <span className="text-indigo-600">
                      ₩{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  주문하기
                </button>
                
                <button
                  onClick={() => router.push('/products')}
                  className="w-full mt-3 border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 transition-colors"
                >
                  쇼핑 계속하기
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