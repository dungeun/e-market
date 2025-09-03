'use client'

import ProductCard from '@/components/sections/ProductCard'

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  images: { url: string }[]
  rating: number
  reviewCount: number
}

interface RelatedProductsProps {
  products: Product[]
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <div className="mt-16 border-t pt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">관련 상품</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              description: product.description,
              images: product.images,
              prices: [{
                amount: product.price
              }],
              rating: product.rating
            }} 
          />
        ))}
      </div>
    </div>
  )
}