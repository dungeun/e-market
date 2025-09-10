'use client';

import React from 'react';

import ProductCard from './ProductCard'
import { Award, Star } from 'lucide-react'
import Image from 'next/image'

interface BrandSpotlightProps {
  config: {
    title?: string
    brandId?: string | null
    showBrandStory?: boolean
    productLimit?: number
    layout?: 'showcase' | 'grid' | 'carousel'
    backgroundColor?: string
  }
  products: unknown[]
}

const BrandSpotlight = React.memo(function BrandSpotlight({ config = {}, products = [] }: BrandSpotlightProps) {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 브랜드 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award className="w-8 h-8 text-red-500" />
            {config?.title && (
              <h2 className="text-3xl font-bold text-gray-900">
                {config?.title}
              </h2>
            )}
            <Star className="w-8 h-8 text-red-500" />
          </div>
          
          {/* 브랜드 스토리 */}
          {config?.showBrandStory && (
            <div className="max-w-3xl mx-auto mt-6 p-6 bg-gray-900 border border-gray-800 rounded-lg shadow-sm">
              <p className="text-gray-600 leading-relaxed">
                엄선된 브랜드의 특별한 이야기와 제품을 만나보세요. 
                최고의 품질과 디자인을 자랑하는 브랜드의 베스트 컬렉션입니다.
              </p>
            </div>
          )}
        </div>

        {/* 브랜드 배너 */}
        <div className="mb-8 relative h-64 rounded-xl overflow-hidden bg-gradient-to-r from-black to-gray-800">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-900">
              <h3 className="text-4xl font-bold mb-2">Premium Brand</h3>
              <p className="text-lg opacity-90">Quality & Excellence</p>
            </div>
          </div>
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {products && Array.isArray(products) && products.slice(0, config?.productLimit || 6).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showBadge={true}
              badgeText="브랜드"
            />
          ))}
        </div>

        {/* 브랜드 페이지 링크 */}
        <div className="text-center mt-8">
          <a
            href="/brands"
            className="inline-block px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-gray-900 transition-colors"
          >
            브랜드 스토어 방문하기
          </a>
        </div>
      </div>
    </section>
    )
});

export default BrandSpotlight;