import React from 'react';
'use client'

import ProductCard from './ProductCard'
import { TrendingUp, Flame } from 'lucide-react'

interface TrendingProductsProps {
  config: {
    title?: string
    subtitle?: string
    algorithm?: string
    timeWindow?: number
    limit?: number
    showTrendingScore?: boolean
    updateInterval?: number
  }
  products: any[]
}

const TrendingProducts = React.memo(function TrendingProducts({ config, products }: TrendingProductsProps) {
  return (
    <section className="py-12 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="w-6 h-6 text-red-500" />
            {config.title && (
              <h2 className="text-3xl font-bold text-white">
                {config.title}
              </h2>
            )}
            <TrendingUp className="w-6 h-6 text-red-500" />
          </div>
          {config.subtitle && (
            <p className="text-gray-300">
              {config.subtitle}
            </p>
          )}
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products && Array.isArray(products) && products.slice(0, config.limit || 8).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              showBadge={true}
              badgeText={`HOT #${index + 1}`}
              showViewCount={config.showTrendingScore}
            />
          ))}
        </div>

        {/* 더보기 */}
        <div className="text-center mt-8">
          <a
            href="/products/trending"
            className="inline-block px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
          >
            트렌딩 상품 더보기
          </a>
        </div>
      </div>
    </section>
  )
})
export default TrendingProducts;