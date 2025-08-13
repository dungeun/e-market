'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart-store'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  compareAtPrice?: number
  images: Array<{ id: string; url: string; alt?: string }>
  category?: { id: string; name: string }
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  
  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0]?.url,
    })
    toast.success('장바구니에 추가되었습니다.')
  }
  
  const discountPercentage = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <div className="group relative rounded-lg border bg-card hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              width={400}
              height={400}
              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        {product.category && (
          <p className="text-xs text-muted-foreground mb-1">
            {product.category.name}
          </p>
        )}
        
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <>
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
              <span className="text-sm font-medium text-red-500">
                {discountPercentage}% 할인
              </span>
            </>
          )}
        </div>
        
        <Button
          onClick={handleAddToCart}
          size="sm"
          className="mt-4 w-full"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          장바구니 추가
        </Button>
      </div>
    </div>
  )
}