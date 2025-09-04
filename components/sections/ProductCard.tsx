'use client';

import React from 'react';

import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, Heart, Eye } from 'lucide-react'
import { useState } from 'react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    description?: string
    price: number
    original_price?: number
    stock: number
    images: { url: string; alt?: string; order?: number }[]
    rating?: number
    review_count?: number
    category?: { id: string; name: string; slug: string }
    featured?: boolean
    new?: boolean
  }
  showBadge?: boolean
  badgeText?: string
  showRanking?: number
}

const ProductCard = React.memo(function ProductCard({ 
  product, 
  showBadge, 
  badgeText,
  showRanking
}: ProductCardProps) {
  const [loading, setLoading] = useState(false)
  const image = product.images?.[0]?.url || '/placeholder.jpg'
  const finalPrice = product.price
  const originalPrice = product.original_price
  const discountPercentage = originalPrice && originalPrice > finalPrice 
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (product.stock <= 0) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1
        }),
      })

      if (response.ok) {
        alert('장바구니에 추가되었습니다!')
      } else {
        alert('장바구니 추가에 실패했습니다.')
      }
    } catch (error) {
      console.error('Cart error:', error)
      alert('장바구니 추가 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const addToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id
        }),
      })

      if (response.ok) {
        alert('위시리스트에 추가되었습니다!')
      } else {
        alert('위시리스트 추가에 실패했습니다.')
      }
    } catch (error) {
      console.error('Wishlist error:', error)
      alert('위시리스트 추가 중 오류가 발생했습니다.')
    }
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:border-red-600 transition-all duration-300">
        {/* 랭킹 뱃지 */}
        {showRanking && (
          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
            {showRanking}
          </div>
        )}

        {/* 커스텀 뱃지 */}
        {showBadge && badgeText && (
          <div className="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
            {badgeText}
          </div>
        )}

        {/* 할인율 뱃지 */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
            -{discountPercentage}%
          </div>
        )}

        {/* 인기/NEW 뱃지 - 이미지 위에 배치 */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
          {product.new && (
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">NEW</span>
          )}
          {product.featured && (
            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">인기</span>
          )}
        </div>

        {/* 이미지 */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={image || '/placeholder.svg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* 호버 오버레이 */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
          
          {/* 빠른 액션 버튼 */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={addToCart}
              disabled={loading || product.stock <= 0}
              className="bg-black hover:bg-gray-800 disabled:bg-gray-500 rounded-full p-2 shadow-lg transition-colors"
            >
              <ShoppingCart className="w-4 h-4 text-white" />
            </button>
            <button 
              onClick={addToWishlist}
              className="bg-black hover:bg-gray-800 rounded-full p-2 shadow-lg transition-colors"
            >
              <Heart className="w-4 h-4 text-white" />
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.location.href = `/products/${product.slug}`
              }}
              className="bg-black hover:bg-gray-800 rounded-full p-2 shadow-lg transition-colors"
            >
              <Eye className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-1 truncate group-hover:text-red-600 transition-colors" title={product.name}>
            {product.name}
          </h3>
          
          {/* 평점 */}
          {product.rating && product.rating > 0 && (
            <div className="flex items-center mb-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating!) ? 'fill-current' : 'fill-gray-200'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-1">({product.rating})</span>
              {product.review_count && product.review_count > 0 && (
                <span className="text-xs text-gray-500 ml-1">{product.review_count}개 리뷰</span>
              )}
            </div>
          )}

          {/* 가격 */}
          <div className="flex items-end gap-2">
            {discountPercentage > 0 && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(finalPrice)}
            </span>
          </div>

          {/* 품절 상태만 하단에 표시 */}
          {product.stock <= 0 && (
            <div className="mt-2">
              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">품절</span>
            </div>
          )}
        </div>
      </div>
    </Link>
    )
});

export default ProductCard;