'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, Gift, Percent, Star } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useLanguage } from '@/hooks/useLanguage'

interface Event {
  id: string
  title: string
  description: string
  imageUrl: string
  type: 'discount' | 'coupon' | 'event' | 'benefit'
  startDate: string
  endDate: string
  discountRate?: number
  originalPrice?: number
  discountedPrice?: number
  couponCode?: string
  isActive: boolean
  isHot: boolean
  participantCount: number
  maxParticipants?: number
  category: string
}

export default function EventsPage() {
  const { t } = useLanguage()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const eventsPerPage = 12

  // Mock data
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '신규 회원 첫 구매 50% 할인',
      description: '새로 가입한 회원님들을 위한 특별한 혜택! 첫 구매 시 50% 할인을 받아보세요.',
      imageUrl: '/api/placeholder/400/300',
      type: 'discount',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      discountRate: 50,
      isActive: true,
      isHot: true,
      participantCount: 1523,
      category: '신규회원'
    },
    {
      id: '2',
      title: '무료배송 쿠폰 증정 이벤트',
      description: '5만원 이상 구매 시 무료배송! 쿠폰을 받고 배송비 걱정 없이 쇼핑하세요.',
      imageUrl: '/api/placeholder/400/300',
      type: 'coupon',
      startDate: '2024-01-15',
      endDate: '2024-01-31',
      couponCode: 'FREESHIP2024',
      isActive: true,
      isHot: false,
      participantCount: 856,
      maxParticipants: 1000,
      category: '배송혜택'
    },
    {
      id: '3',
      title: '겨울 시즌 대할인 축제',
      description: '겨울 상품들을 특가로 만나보세요! 최대 70% 할인된 가격으로 제공합니다.',
      imageUrl: '/api/placeholder/400/300',
      type: 'event',
      startDate: '2024-01-10',
      endDate: '2024-01-25',
      discountRate: 70,
      isActive: true,
      isHot: true,
      participantCount: 2341,
      category: '시즌할인'
    },
    {
      id: '4',
      title: '포인트 5배 적립 이벤트',
      description: '구매 금액의 5%를 포인트로 돌려드려요! 다음 구매 시 현금처럼 사용 가능합니다.',
      imageUrl: '/api/placeholder/400/300',
      type: 'benefit',
      startDate: '2024-01-01',
      endDate: '2024-01-30',
      isActive: true,
      isHot: false,
      participantCount: 678,
      category: '포인트'
    }
  ]

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setEvents(mockEvents)
      setLoading(false)
    }, 500)
  }, [])

  const types = [
    { value: 'discount', label: '할인' },
    { value: 'coupon', label: '쿠폰' },
    { value: 'event', label: '이벤트' },
    { value: 'benefit', label: '혜택' }
  ]

  const categories = Array.from(new Set(events.map(event => event.category)))
  
  const filteredEvents = events.filter(event => {
    if (selectedType && event.type !== selectedType) return false
    if (selectedCategory && event.category !== selectedCategory) return false
    return true
  })

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage)
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return <Percent className="w-5 h-5" />
      case 'coupon':
        return <Gift className="w-5 h-5" />
      case 'event':
        return <Star className="w-5 h-5" />
      case 'benefit':
        return <Gift className="w-5 h-5" />
      default:
        return <Gift className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'discount':
        return 'bg-red-100 text-red-800'
      case 'coupon':
        return 'bg-blue-100 text-blue-800'
      case 'event':
        return 'bg-purple-100 text-purple-800'
      case 'benefit':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    const typeObj = types.find(t => t.value === type)
    return typeObj?.label || type
  }

  const isEventActive = (event: Event) => {
    const now = new Date()
    const start = new Date(event.startDate)
    const end = new Date(event.endDate)
    return now >= start && now <= end && event.isActive
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">이벤트를 불러오는 중...</p>
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">이벤트/혜택</h1>
            <p className="text-xl opacity-90">다양한 할인과 특별한 혜택을 만나보세요</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {/* Type Filter */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">이벤트 유형</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value=""
                      checked={selectedType === ''}
                      onChange={(e) => {
                        setSelectedType(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">전체</span>
                  </label>
                  {types.map((type) => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={selectedType === type.value}
                        onChange={(e) => {
                          setSelectedType(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="mr-2"
                      />
                      <div className="flex items-center">
                        <div className={`p-1 rounded-full mr-2 ${getTypeColor(type.value)}`}>
                          {getTypeIcon(type.value)}
                        </div>
                        <span className="text-sm text-gray-700">{type.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

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
            </div>
          </div>

          {/* Events Grid */}
          <div className="flex-1">
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                총 <span className="font-medium text-gray-900">{filteredEvents.length}개</span>의 이벤트
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {/* Event Image */}
                  <div className="relative">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {event.isHot && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                          HOT
                        </span>
                      )}
                      {!isEventActive(event) && (
                        <span className="px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">
                          종료
                        </span>
                      )}
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-3 right-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
                        <div className="flex items-center">
                          <div className="mr-1">
                            {getTypeIcon(event.type)}
                          </div>
                          {getTypeLabel(event.type)}
                        </div>
                      </div>
                    </div>

                    {/* Discount Rate */}
                    {event.discountRate && (
                      <div className="absolute bottom-3 right-3">
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          {event.discountRate}% OFF
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {event.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {event.description}
                    </p>

                    {/* Event Period */}
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(event.startDate)} ~ {formatDate(event.endDate)}
                    </div>

                    {/* Participants */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-500">
                        참여자 {event.participantCount.toLocaleString()}명
                        {event.maxParticipants && (
                          <span> / {event.maxParticipants.toLocaleString()}</span>
                        )}
                      </div>
                      {event.maxParticipants && (
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full"
                            style={{ 
                              width: `${Math.min((event.participantCount / event.maxParticipants) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                      )}
                    </div>

                    {/* Coupon Code */}
                    {event.couponCode && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">쿠폰 코드</span>
                          <code className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm font-mono">
                            {event.couponCode}
                          </code>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Link
                      href={`/events/${event.id}`}
                      className={`block w-full text-center py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                        isEventActive(event)
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isEventActive(event) ? '참여하기' : '종료됨'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
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
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">이벤트가 없습니다</h3>
                <p className="text-gray-500">선택한 조건에 맞는 이벤트가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}