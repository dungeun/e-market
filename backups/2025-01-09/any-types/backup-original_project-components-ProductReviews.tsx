'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Review {
  id: string
  rating: number
  content: string | null
  createdAt: Date
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface ProductReviewsProps {
  productId: string
  reviews: Review[]
}

export default function ProductReviews({ productId, reviews }: ProductReviewsProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent')
  
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'rating':
        return b.rating - a.rating
      default:
        return 0
    }
  })

  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
      : 0
  }))

  return (
    <div className="mt-16 border-t pt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">상품 리뷰</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 평점 요약 */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
              <div className="flex justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-6 h-6 ${i < Math.floor(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {reviews.length}개의 리뷰
              </div>
            </div>

            {/* 평점 분포 */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-4">{rating}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-yellow-400 h-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 리뷰 목록 */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              리뷰 {reviews.length}개
            </h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="recent">최신순</option>
              <option value="rating">평점순</option>
              <option value="helpful">유용한순</option>
            </select>
          </div>

          {sortedReviews.length > 0 ? (
            <div className="space-y-6">
              {sortedReviews.map((review) => (
                <div key={review.id} className="border-b pb-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {review.user.image ? (
                        <Image
                          src={review.user.image || '/placeholder.svg'}
                          alt={review.user.name || 'User'}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {review.user.name || '익명'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      
                      <p className="text-gray-700">{review.content || ''}</p>
                      
                      <div className="flex gap-4 mt-4">
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          도움이 됐어요 (0)
                        </button>
                        <button className="text-sm text-gray-500 hover:text-gray-700">
                          신고
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">아직 리뷰가 없습니다.</p>
              <p className="text-sm text-gray-400 mt-2">첫 번째 리뷰를 작성해보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}