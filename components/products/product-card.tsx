'use client';

import React from 'react';

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { toast } from 'react-hot-toast'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    compareAt?: number | null
    images: { url: string; alt?: string | null }[]
    description?: string | null
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem)
  const toggleWishlist = useWishlistStore((state) => state.toggleItem)
  const isInWishlist = useWishlistStore((state) => 
    state.items.some(item => item.id === product.id)
  )

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || '/placeholder.png',
      quantity: 1,
    })
    toast.success('장바구니에 추가되었습니다')
  }

  const handleToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || '/placeholder.png',
    })
    toast.success(
      isInWishlist ? '위시리스트에서 제거되었습니다' : '위시리스트에 추가되었습니다'
    )
  }

  const discountPercentage = product.compareAt
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
    : 0

  return (
    <div className="group relative">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={product.images[0]?.url || '/placeholder.png'}
            alt={product.images[0]?.alt || product.name}
            width={300}
            height={300}
            className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
          />
        </Link>
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
            -{discountPercentage}%
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Button
            size="icon"
            variant={isInWishlist ? "default" : "secondary"}
            onClick={handleToggleWishlist}
            className="h-8 w-8"
          >
            <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
      <div className="mt-4 flex justify-between">
        <div className="flex-1">
          <h3 className="text-sm text-gray-700">
            <Link href={`/products/${product.slug}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </Link>
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900">
              {formatPrice(product.price)}
            </p>
            {product.compareAt && (
              <p className="text-sm text-gray-500 line-through">
                {formatPrice(product.compareAt)}
              </p>
            )}
          </div>
        </div>
        <Button
          size="icon"
          variant="outline"
          onClick={handleAddToCart}
          className="h-8 w-8 relative z-10"
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}