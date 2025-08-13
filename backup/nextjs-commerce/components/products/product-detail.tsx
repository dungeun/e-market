'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/stores/cart-store'
import { Star, Heart, Share2, ShoppingCart, Minus, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  compareAtPrice?: number
  quantity: number
  images: Array<{ id: string; url: string; alt?: string }>
  category?: { id: string; name: string }
  reviews?: Array<{
    id: string
    rating: number
    comment: string
    user: {
      id: string
      name: string
      image?: string
    }
  }>
}

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const addItem = useCartStore((state) => state.addItem)
  
  const discountPercentage = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0
    
  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images[0]?.url,
    })
    toast.success('장바구니에 추가되었습니다!')
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= product.quantity) {
      setQuantity(newQuantity)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          {product.images[selectedImage] ? (
            <Image
              src={product.images[selectedImage].url}
              alt={product.images[selectedImage].alt || product.name}
              width={600}
              height={600}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </div>
        
        {product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square overflow-hidden rounded-md bg-gray-100 ${
                  selectedImage === index ? 'ring-2 ring-primary' : ''
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.alt || product.name}
                  width={150}
                  height={150}
                  className="h-full w-full object-cover object-center"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          {product.category && (
            <Badge variant="secondary" className="mb-2">
              {product.category.name}
            </Badge>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>
          
          {product.reviews && product.reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.reviews.length}개 리뷰)
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <Badge variant="destructive">
                  {discountPercentage}% 할인
                </Badge>
              </>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            {product.quantity > 0 ? `재고 ${product.quantity}개` : '품절'}
          </p>
        </div>

        {product.description && (
          <div>
            <h3 className="font-semibold mb-2">상품 설명</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="font-medium">수량:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.quantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              장바구니 담기
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite ? 'text-red-500 fill-current' : ''
                }`}
              />
            </Button>
            
            <Button variant="outline" size="lg">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <div className="space-y-2 text-sm">
            <p>• 무료 배송 (5만원 이상 주문 시)</p>
            <p>• 7일 내 무료 반품/교환</p>
            <p>• 1-2일 내 발송</p>
            <p>• 구매 시 적립금 {Math.floor(product.price * quantity * 0.01).toLocaleString()}원 적립</p>
          </div>
        </div>
      </div>
    </div>
  )
}