'use client'

import ProductCard from './ProductCard'
import { Trophy, TrendingUp } from 'lucide-react'

interface BestSellersProps {
  config: {
    title?: string
    subtitle?: string
    period?: 'day' | 'week' | 'month' | 'all'
    limit?: number
    showRanking?: boolean
    showSalesCount?: boolean
    categoryFilter?: string | null
  }
  products: any[]
}

export default function BestSellers({ config, products }: BestSellersProps) {
  const getPeriodText = () => {
    switch (config.period) {
      case 'day': return '오늘'
      case 'week': return '이번 주'
      case 'month': return '이번 달'
      default: return '전체'
    }
  }

  return (
    <section className="py-12 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-red-500" />
            <div>
              {config.title && (
                <h2 className="text-3xl font-bold text-white">
                  {config.title}
                </h2>
              )}
              {config.subtitle && (
                <p className="text-gray-300">
                  {config.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* 기간 선택 */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-300">
              {getPeriodText()} 베스트
            </span>
          </div>
        </div>

        {/* 상품 리스트 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {products.slice(0, config.limit || 10).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              showRanking={config.showRanking ? index + 1 : undefined}
              showSalesCount={config.showSalesCount}
            />
          ))}
        </div>

        {/* 더보기 */}
        <div className="text-center mt-8">
          <a
            href={`/best-sellers?period=${config.period}`}
            className="inline-block px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
          >
            베스트셀러 전체보기
          </a>
        </div>
      </div>
    </section>
  )
}