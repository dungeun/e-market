'use client'

import { Star, Quote } from 'lucide-react'
import Image from 'next/image'

interface TestimonialsProps {
  config: {
    title?: string
    subtitle?: string
    limit?: number
    minRating?: number
    showProductImage?: boolean
    layout?: string
    autoplay?: boolean
  }
  reviews?: unknown[]
}

export default function Testimonials({ config, reviews = [] }: TestimonialsProps) {
  // 임시 리뷰 데이터
  const defaultReviews = [
    {
      id: 1,
      rating: 5,
      comment: '정말 만족스러운 쇼핑이었습니다. 품질도 좋고 배송도 빨라요!',
      userName: '김**',
      productName: '프리미엄 상품',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      rating: 5,
      comment: '다시 구매하고 싶은 제품입니다. 강력 추천!',
      userName: '이**',
      productName: '베스트 상품',
      createdAt: '2024-01-14'
    },
    {
      id: 3,
      rating: 4,
      comment: '가격 대비 품질이 훌륭합니다.',
      userName: '박**',
      productName: '인기 상품',
      createdAt: '2024-01-13'
    }
  ]

  const displayReviews = reviews.length > 0 ? reviews : defaultReviews

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          {config.title && (
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {config.title}
            </h2>
          )}
          {config.subtitle && (
            <p className="text-gray-600">
              {config.subtitle}
            </p>
          )}
        </div>

        {/* 리뷰 그리드 */}
        <div className={`grid gap-6 ${
          config.layout === 'carousel' 
            ? 'grid-cols-1 md:grid-cols-3' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {displayReviews
            .filter(review => review.rating >= (config.minRating || 4))
            .slice(0, config.limit || 6)
            .map((review) => (
              <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                {/* 별점 */}
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* 인용 아이콘 */}
                <Quote className="w-8 h-8 text-gray-200 mb-3" />

                {/* 리뷰 내용 */}
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {review.comment}
                </p>

                {/* 상품 정보 */}
                {config.showProductImage && review.productName && (
                  <div className="text-sm text-gray-500 mb-3">
                    상품: {review.productName}
                  </div>
                )}

                {/* 작성자 정보 */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {review.userName?.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">
                      {review.userName}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {review.createdAt}
                  </span>
                </div>
              </div>
            ))}
        </div>

        {/* 더보기 */}
        <div className="text-center mt-8">
          <a
            href="/reviews"
            className="inline-block px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            더 많은 후기 보기
          </a>
        </div>
      </div>
    </section>
  )
}