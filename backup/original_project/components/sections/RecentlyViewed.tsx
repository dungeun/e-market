'use client'

import ProductCard from './ProductCard'
import { Clock, Eye } from 'lucide-react'

interface RecentlyViewedProps {
  config: {
    title?: string
    limit?: number
    showViewedTime?: boolean
    layout?: string
    cookieBased?: boolean
  }
  products: any[]
}

export default function RecentlyViewed({ config, products }: RecentlyViewedProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-gray-600" />
            {config.title && (
              <h2 className="text-2xl font-bold text-gray-900">
                {config.title}
              </h2>
            )}
          </div>
          <a
            href="/mypage/recently-viewed"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            전체보기
          </a>
        </div>

        {/* 상품 스크롤 */}
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4">
            {Array.isArray(products) && products.slice(0, config.limit || 6).map((product) => (
              <div key={product.id} className="flex-shrink-0 w-48">
                <ProductCard
                  product={product}
                  showViewCount={config.showViewedTime}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}