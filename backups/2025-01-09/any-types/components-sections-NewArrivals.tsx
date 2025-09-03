import React from 'react';
'use client'

import ProductCard from './ProductCard'
import { Sparkles } from 'lucide-react'

interface NewArrivalsProps {
  config: {
    title?: string
    subtitle?: string
    daysLimit?: number
    limit?: number
    sortBy?: string
    layout?: 'carousel' | 'grid'
    showArrivalDate?: boolean
  }
  products: any[]
}

const NewArrivals = React.memo(function NewArrivals({ config, products }: NewArrivalsProps) {
  return (
    <section className="py-12 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-red-500" />
            {config.title && (
              <h2 className="text-3xl font-bold text-white">
                {config.title}
              </h2>
            )}
            <Sparkles className="w-6 h-6 text-red-500" />
          </div>
          {config.subtitle && (
            <p className="text-gray-300">
              {config.subtitle}
            </p>
          )}
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {products.slice(0, config.limit || 12).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showBadge={true}
              badgeText="NEW"
            />
          ))}
        </div>

        {/* 더보기 */}
        <div className="text-center mt-8">
          <a
            href="/products?sort=newest"
            className="inline-block px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
          >
            신상품 더보기
          </a>
        </div>
      </div>
    </section>
  )
})
export default NewArrivals;