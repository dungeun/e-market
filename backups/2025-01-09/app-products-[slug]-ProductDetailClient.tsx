'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Heart, Share2, Star, Minus, Plus } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { formatPrice } from '@/lib/utils'
import RelatedProducts from '@/components/RelatedProducts'

interface RelatedProduct {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  images: { url: string }[]
  rating: number
  reviewCount: number
}

interface ProductDetailClientProps {
  product: {
    id: string
    name: string
    slug: string
    description: string
    price: number
    original_price?: number
    stock: number
    images: Array<{
      id: string
      url?: string
      imageUrl?: string
      alt?: string
      altText?: string
      orderIndex?: number
      order_index?: number
    }>
    category?: {
      id: string
      name: string
      slug: string
    }
    rating?: number
    review_count?: number
    featured?: boolean
    new?: boolean
    reviews: any[]
  }
  relatedProducts: RelatedProduct[]
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)

  const finalPrice = product.price
  const originalPrice = product.original_price
  const hasDiscount = originalPrice && originalPrice > finalPrice
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0

  const addToCart = async () => {
    if (product.stock <= 0) {
      alert('재고가 부족합니다.')
      return
    }
    
    if (quantity > product.stock) {
      alert(`재고가 부족합니다. 최대 ${product.stock}개까지 주문 가능합니다.`)
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        }),
      })

      if (response.ok) {
        alert('장바구니에 추가되었습니다!')
      } else {
        const data = await response.json()
        alert(data.error || '장바구니 추가에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('장바구니 추가 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* 뒤로가기 */}
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            상품 목록으로 돌아가기
          </Link>

          <div className="bg-gray-900 rounded-xl shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-6">
              {/* 상품 이미지 */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden relative">
                  {hasDiscount && (
                    <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded text-sm font-bold">
                      -{discountPercentage}%
                    </div>
                  )}
                  {product.new && (
                    <div className="absolute top-4 right-4 z-10 bg-blue-500 text-white px-3 py-1 rounded text-sm font-bold">
                      NEW
                    </div>
                  )}
                  {product.images.length > 0 ? (
                    (() => {
                      const imageUrl = product.images[selectedImageIndex]?.url || 
                                      product.images[selectedImageIndex]?.imageUrl || 
                                      '/placeholder.jpg';
                      return imageUrl && imageUrl !== "" ? (
                        <Image
                          src={imageUrl}
                          alt={product.images[selectedImageIndex]?.alt || product.images[selectedImageIndex]?.altText || product.name}
                          width={500}
                          height={500}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          이미지 없음
                        </div>
                      );
                    })()
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      이미지 없음
                    </div>
                  )}
                </div>
                
                {/* 썸네일 이미지들 */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {product.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImageIndex === index ? 'border-red-500' : 'border-gray-600'
                        }`}
                      >
                        {(() => {
                          const thumbUrl = image.url || image.imageUrl || '/placeholder.jpg';
                          return thumbUrl && thumbUrl !== "" ? (
                            <Image
                              src={thumbUrl}
                              alt={image.alt || image.altText || product.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                              <span className="text-xs text-gray-500">No</span>
                            </div>
                          );
                        })()}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 상품 정보 */}
              <div className="space-y-6">
                {/* 카테고리 */}
                {product.category && (
                  <Link 
                    href={`/products?category=${product.category.slug}`}
                    className="inline-block text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    {product.category.name}
                  </Link>
                )}

                {/* 상품명 */}
                <h1 className="text-3xl font-bold text-white">
                  {product.name}
                </h1>

                {/* 평점 */}
                {product.rating && product.rating > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.rating!) ? 'fill-current' : 'fill-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-300">({product.rating})</span>
                    {product.review_count && product.review_count > 0 && (
                      <span className="text-sm text-gray-500">
                        {product.review_count}개 리뷰
                      </span>
                    )}
                  </div>
                )}

                {/* 가격 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-white">
                      {formatPrice(finalPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>
                  {hasDiscount && (
                    <div className="text-red-400 font-medium">
                      {discountPercentage}% 할인
                    </div>
                  )}
                </div>

                {/* 재고 상태 */}
                <div className="flex items-center space-x-2 text-sm">
                  {product.stock <= 0 ? (
                    <span className="bg-red-500 text-white px-3 py-1 rounded">품절</span>
                  ) : product.stock < 5 ? (
                    <>
                      <span className="bg-orange-500 text-white px-3 py-1 rounded">재고부족</span>
                      <span className="text-gray-400">남은 수량: {product.stock}개</span>
                    </>
                  ) : (
                    <span className="text-green-400">재고 충분</span>
                  )}
                  {product.featured && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded">인기</span>
                  )}
                </div>

                {/* 상품 설명 */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-white">상품 설명</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* 수량 선택 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-white">수량:</span>
                    <div className="flex items-center border border-gray-700 bg-gray-800 rounded-lg">
                      <button 
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        disabled={quantity <= 1}
                        className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 min-w-[60px] text-center text-white">
                        {quantity}
                      </span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      (최대 {product.stock}개)
                    </span>
                  </div>

                  {/* 총 가격 */}
                  <div className="text-xl font-bold text-white">
                    총 {formatPrice(finalPrice * quantity)}
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="space-y-3">
                  <button 
                    onClick={addToCart}
                    disabled={loading || product.stock <= 0}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShoppingCart size={20} />
                    {loading ? '추가 중...' : product.stock <= 0 ? '품절' : '장바구니 담기'}
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                      <Heart size={18} />
                      찜하기
                    </button>
                    <button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: product.name,
                            text: product.description,
                            url: window.location.href,
                          })
                        } else {
                          navigator.clipboard.writeText(window.location.href)
                          alert('링크가 복사되었습니다!')
                        }
                      }}
                      className="flex items-center justify-center gap-2 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <Share2 size={18} />
                      공유하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 연관 상품 */}
          <div className="mt-12">
            <RelatedProducts products={relatedProducts} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}