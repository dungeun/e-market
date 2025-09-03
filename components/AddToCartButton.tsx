'use client';

import React from 'react';

import { useState } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { useRouter } from 'next/navigation'

interface AddToCartButtonProps {
  productId: string
  disabled?: boolean
  variant?: any
  className?: string
}

const AddToCartButton = React.memo(function AddToCartButton({ 
  productId, 
  disabled = false,
  variant,
  className = ''
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const addItem = useCartStore(state => state.addItem)
  const router = useRouter()

  const handleAddToCart = async () => {
    try {
      setIsLoading(true)
      
      // API 호출
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
          variant,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to cart')
      }

      // 로컬 상태 업데이트
      const product = await fetch(`/api/products/${productId}`).then(res => res.json())
      addItem({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.images[0]?.url || '',
        quantity,
        variant,
      })

      // 성공 알림 (토스트 메시지 등)
      alert('장바구니에 추가되었습니다!')
      
    } catch (error) {

      alert('장바구니 추가에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    router.push('/checkout')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
          수량:
        </label>
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1 hover:bg-gray-100"
            disabled={disabled || isLoading}
          >
            -
          </button>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 text-center border-x border-gray-300 py-1"
            min="1"
            disabled={disabled || isLoading}
          />
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-1 hover:bg-gray-100"
            disabled={disabled || isLoading}
          >
            +
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleAddToCart}
          disabled={disabled || isLoading}
          className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '추가 중...' : '장바구니 담기'}
        </button>
        
        <button
          onClick={handleBuyNow}
          disabled={disabled || isLoading}
          className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          바로 구매
        </button>
      </div>
    </div>
    )
});

export default AddToCartButton;