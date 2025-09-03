import React from 'react';
'use client'

import ProductCard from './ProductCard'
import { Snowflake, Sun, Leaf, Flower } from 'lucide-react'
import Image from 'next/image'

interface SeasonalCollectionProps {
  config: {
    title?: string
    subtitle?: string
    collectionId?: string | null
    backgroundImage?: string
    layout?: string
    limit?: number
  }
  products: any[]
}

const SeasonalCollection = React.memo(function SeasonalCollection({ config, products }: SeasonalCollectionProps) {
  const getSeasonIcon = () => {
    const title = config.title?.toLowerCase() || ''
    if (title.includes('겨울') || title.includes('winter')) return <Snowflake className="w-8 h-8 text-blue-400" />
    if (title.includes('여름') || title.includes('summer')) return <Sun className="w-8 h-8 text-yellow-400" />
    if (title.includes('가을') || title.includes('fall')) return <Leaf className="w-8 h-8 text-orange-400" />
    return <Flower className="w-8 h-8 text-pink-400" />
  }

  return (
    <section className="py-12 px-4 relative">
      {/* 배경 이미지 */}
      {config.backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={config.backgroundImage || '/placeholder.svg'}
            alt="Seasonal background"
            fill
            className="object-cover opacity-10"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            {getSeasonIcon()}
            {config.title && (
              <h2 className="text-3xl font-bold text-gray-900">
                {config.title}
              </h2>
            )}
            {getSeasonIcon()}
          </div>
          {config.subtitle && (
            <p className="text-gray-600">
              {config.subtitle}
            </p>
          )}
        </div>

        {/* 상품 그리드 */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${
          config.layout === 'masonry' ? 'auto-rows-auto' : ''
        }`}>
          {products.slice(0, config.limit || 12).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showBadge={true}
              badgeText="시즌"
            />
          ))}
        </div>

        {/* 더보기 */}
        <div className="text-center mt-8">
          <a
            href="/collections/seasonal"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            시즌 컬렉션 전체보기
          </a>
        </div>
      </div>
    </section>
  )
})
export default SeasonalCollection;