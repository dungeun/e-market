'use client';

import React from 'react';

import ProductCard from './ProductCard'
import { Tag, Percent } from 'lucide-react'

interface SpecialOffersProps {
  config: {
    title?: string
    subtitle?: string
    minDiscount?: number
    limit?: number
    showOriginalPrice?: boolean
    showDiscountPercentage?: boolean
    highlightColor?: string
  }
  products: unknown[]
}

const SpecialOffers = React.memo(function SpecialOffers({ config = {}, products = [] }: SpecialOffersProps) {
  return (
    <section className="py-12 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Tag className="w-6 h-6" style={{ color: config?.highlightColor || '#ff0000' }} />
            {config?.title && (
              <h2 className="text-3xl font-bold text-white">
                {config?.title}
              </h2>
            )}
            <Percent className="w-6 h-6" style={{ color: config?.highlightColor || '#ff0000' }} />
          </div>
          {config?.subtitle && (
            <p className="text-gray-300">
              {config?.subtitle}
            </p>
          )}
          {config?.minDiscount && (
            <div className="mt-2 inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {config?.minDiscount}% 이상 할인!
            </div>
          )}
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {products.slice(0, config?.limit || 6).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showBadge={true}
              badgeText="특가"
            />
          ))}
        </div>

        {/* 더보기 */}
        <div className="text-center mt-8">
          <a
            href="/products/special-offers"
            className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            특가 상품 모두 보기
          </a>
        </div>
      </div>
    </section>
    )
});

export default SpecialOffers;