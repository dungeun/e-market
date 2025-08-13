'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: { url: string; alt: string }[]
}

interface FeaturedProductsProps {
  config?: any
  products?: Product[]
  data?: Product[]
}

export default function FeaturedProducts({ config, products, data }: FeaturedProductsProps) {
  const items = products || data || []
  const title = config?.title || '추천 상품'
  const subtitle = config?.subtitle || '엄선된 상품을 만나보세요'
  const columns = config?.columns || 4

  if (items.length === 0) {
    return null
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        {/* 섹션 헤더 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-600">
              {subtitle}
            </p>
          )}
        </div>

        {/* 상품 그리드 */}
        <div className={`grid grid-cols-2 md:grid-cols-${columns} gap-6`}>
          {items.slice(0, config?.limit || 8).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group"
            >
              <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={product.images?.[0]?.url || '/placeholder.png'}
                  alt={product.images?.[0]?.alt || product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </p>
            </Link>
          ))}
        </div>

        {/* View All 버튼 */}
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
          >
            모든 상품 보기
          </Link>
        </div>
      </div>
    </section>
  )
}