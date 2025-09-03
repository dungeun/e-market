'use client';

import React from 'react';

import ProductCard from './ProductCard'
import { Sparkles, Brain } from 'lucide-react'

interface RecommendedProductsProps {
  config: {
    title?: string
    subtitle?: string
    algorithm?: string
    limit?: number
    personalized?: boolean
    fallbackToPopular?: boolean
  }
  products: unknown[]
}

const RecommendedProducts = React.memo(function RecommendedProducts({ config = {}, products = [] }: RecommendedProductsProps) {
  return (
    <section className="py-12 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="w-6 h-6 text-red-500" />
            {config?.title && (
              <h2 className="text-3xl font-bold text-white">
                {config?.title}
              </h2>
            )}
            <Sparkles className="w-6 h-6 text-red-500" />
          </div>
          {config?.subtitle && (
            <p className="text-gray-300">
              {config?.subtitle}
            </p>
          )}
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products && Array.isArray(products) && products.slice(0, config?.limit || 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showBadge={true}
              badgeText="AI 추천"
            />
          ))}
        </div>

        {/* 더보기 */}
        <div className="text-center mt-8">
          <a
            href="/products/recommended"
            className="inline-block px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
          >
            추천 상품 더보기
          </a>
        </div>
      </div>
    </section>
    )
});

export default RecommendedProducts;