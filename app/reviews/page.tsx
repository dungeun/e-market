'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ThumbsUp, MessageCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useLanguage } from '@/hooks/useLanguage'

interface Review {
  id: string
  productId: string
  productName: string
  productImage: string
  userName: string
  userAvatar: string
  rating: number
  title: string
  content: string
  images: string[]
  createdAt: string
  helpful: number
  comments: number
  verified: boolean
  category: string
}

export default function ReviewsPage() {
  const { t } = useLanguage()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedRating, setSelectedRating] = useState(0)
  const [sortBy, setSortBy] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const reviewsPerPage = 10

  // Mock data
  const mockReviews: Review[] = [
    {
      id: '1',
      productId: '1',
      productName: '프리미엄 무선 이어폰',
      productImage: '/api/placeholder/80/80',
      userName: '김**',
      userAvatar: '/api/placeholder/48/48',
      rating: 5,
      title: '정말 만족스러운 구매입니다!',
      content: '음질이 정말 깔끔하고 노이즈 캔슬링 기능도 훌륭해요. 배송도 빠르고 포장도 깔끔했습니다. 다음에도 이 브랜드 제품을 구매할 의향이 있어요.',
      images: ['/api/placeholder/200/200', '/api/placeholder/200/200'],
      createdAt: '2024-01-15',
      helpful: 24,
      comments: 3,
      verified: true,
      category: '전자제품'
    },
    {
      id: '2',
      productId: '2',
      productName: '스마트워치 프로',
      productImage: '/api/placeholder/80/80',
      userName: '박**',
      userAvatar: '/api/placeholder/48/48',
      rating: 4,
      title: '기능은 좋지만 배터리가 아쉬워요',
      content: '건강 관리 기능들이 정말 다양하고 정확해서 만족합니다. 다만 배터리 지속시간이 생각보다 짧아서 자주 충전해야 하는 점이 아쉬워요.',
      images: ['/api/placeholder/200/200'],
      createdAt: '2024-01-14',
      helpful: 18,
      comments: 5,
      verified: true,
      category: '전자제품'
    },
    {
      id: '3',
      productId: '3',
      productName: '휴대용 블루투스 스피커',
      productImage: '/api/placeholder/80/80',
      userName: '이**',
      userAvatar: '/api/placeholder/48/48',
      rating: 5,
      title: '가성비 최고의 스피커',
      content: '이 가격에 이 정도 음질이면 정말 만족스럽습니다. 휴대하기도 편하고 방수 기능도 있어서 야외 활동할 때 유용해요.',
      images: [],
      createdAt: '2024-01-13',
      helpful: 32,
      comments: 8,
      verified: true,
      category: '전자제품'
    }
  ]

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setReviews(mockReviews)
      setLoading(false)
    }, 500)
  }, [])

  const categories = Array.from(new Set(reviews.map(review => review.category)))
  
  const filteredReviews = reviews.filter(review => {
    if (selectedCategory && review.category !== selectedCategory) return false
    if (selectedRating && review.rating !== selectedRating) return false
    return true
  })

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'rating_high':
        return b.rating - a.rating
      case 'rating_low':
        return a.rating - b.rating
      case 'helpful':
        return b.helpful - a.helpful
      default:
        return 0
    }
  })

  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage)
  const currentReviews = sortedReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-900">{rating}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">리뷰를 불러오는 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">고객 리뷰</h1>
            <p className="text-lg text-gray-600">실제 구매 고객들의 솔직한 후기를 만나보세요</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">카테고리</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === ''}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">전체</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">평점</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rating"
                      value={0}
                      checked={selectedRating === 0}
                      onChange={() => {
                        setSelectedRating(0)
                        setCurrentPage(1)
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">전체</span>
                  </label>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={selectedRating === rating}
                        onChange={() => {
                          setSelectedRating(rating)
                          setCurrentPage(1)
                        }}
                        className="mr-2"
                      />
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-sm text-gray-700">이상</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">정렬</h3>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="latest">최신순</option>
                  <option value="oldest">오래된순</option>
                  <option value="rating_high">평점 높은순</option>
                  <option value="rating_low">평점 낮은순</option>
                  <option value="helpful">도움순</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="flex-1">
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                총 <span className="font-medium text-gray-900">{sortedReviews.length}개</span>의 리뷰
              </p>
            </div>

            <div className="space-y-6">
              {currentReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                  {/* Product Info */}
                  <div className="flex items-center mb-4 pb-4 border-b border-gray-100">
                    <Image
                      src={review.productImage}
                      alt={review.productName}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                    <div className="ml-3">
                      <Link 
                        href={`/products/${review.productId}`}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {review.productName}
                      </Link>
                      <p className="text-sm text-gray-500">{review.category}</p>
                    </div>
                  </div>

                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Image
                        src={review.userAvatar}
                        alt={review.userName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{review.userName}</span>
                          {review.verified && (
                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              구매 인증
                            </span>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          {renderStars(review.rating)}
                          <span className="ml-2 text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">{review.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{review.content}</p>
                  </div>

                  {/* Review Images */}
                  {review.images.length > 0 && (
                    <div className="mb-4">
                      <div className="flex gap-2 overflow-x-auto">
                        {review.images.map((image, index) => (
                          <div key={index} className="flex-shrink-0">
                            <Image
                              src={image}
                              alt={`리뷰 이미지 ${index + 1}`}
                              width={100}
                              height={100}
                              className="rounded-lg object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        도움돼요 {review.helpful}
                      </button>
                      <button className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        댓글 {review.comments}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    이전
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 border rounded-md ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {sortedReviews.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">리뷰가 없습니다</h3>
                <p className="text-gray-500">선택한 조건에 맞는 리뷰가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}