'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface User {
  id: string
  email: string
  name: string
  type?: string
  phone?: string
  address?: string
  postal_code?: string
}

interface Order {
  id: string
  order_number: string
  total_amount: number
  status: string
  payment_method: string
  created_at: string
  item_count: number
  product_names: string
}

interface StatusCounts {
  pending: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
}

interface Inquiry {
  id: string
  product_id: string
  product_name: string
  title: string
  content: string
  status: string
  created_at: string
  answer?: string
  answered_at?: string
}

interface Review {
  id: string
  product_id: string
  product_name: string
  order_id: string
  rating: number
  content: string
  images?: string[]
  created_at: string
  is_verified: boolean
}

export default function MyPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [orders, setOrders] = useState<Order[]>([])
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  })
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [showProfileEditModal, setShowProfileEditModal] = useState(false)
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false)
  const [profileForm, setProfileForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '', 
    postal_code: '' 
  })
  const [passwordForm, setPasswordForm] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  })
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false)
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false)
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [inquiriesLoading, setInquiriesLoading] = useState(false)
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [inquiryForm, setInquiryForm] = useState({ title: '', content: '', product_id: '', product_name: '' })
  const [userProducts, setUserProducts] = useState<Array<{id: string, name: string}>>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [showDateRangeModal, setShowDateRangeModal] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewForm, setReviewForm] = useState({ 
    product_id: '', 
    order_id: '', 
    rating: 5, 
    content: '' 
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      fetchOrders()
    }
    if (activeTab === 'inquiries' && user) {
      fetchInquiries()
    }
    if (activeTab === 'reviews' && user) {
      fetchReviews()
    }
  }, [activeTab, user])

  useEffect(() => {
    if (user) {
      setProfileForm({ 
        name: user.name, 
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        postal_code: user.postal_code || ''
      })
    }
  }, [user])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user || data)
      } else {
        router.push('/auth/login?redirect=/mypage')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth/login?redirect=/mypage')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      const response = await fetch('/api/mypage/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setStatusCounts(data.statusCounts)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  const fetchInquiries = async () => {
    setInquiriesLoading(true)
    try {
      const response = await fetch('/api/mypage/inquiries')
      if (response.ok) {
        const data = await response.json()
        setInquiries(data.inquiries)
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error)
    } finally {
      setInquiriesLoading(false)
    }
  }

  const fetchReviews = async () => {
    setReviewsLoading(true)
    try {
      const response = await fetch('/api/mypage/reviews')
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/mypage/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewForm),
      })
      
      if (response.ok) {
        alert('후기가 등록되었습니다.')
        setShowReviewModal(false)
        setReviewForm({ product_id: '', order_id: '', rating: 5, content: '' })
        fetchReviews()
      } else {
        const error = await response.json()
        alert(error.message || '후기 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('Review submit error:', error)
      alert('후기 등록 중 오류가 발생했습니다.')
    }
  }

  const handleOrderCancel = async (orderId: string) => {
    if (!confirm('정말로 주문을 취소하시겠습니까?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/mypage/orders/${orderId}/cancel`, {
        method: 'PUT',
      })
      
      if (response.ok) {
        alert('주문이 취소되었습니다.')
        fetchOrders() // 주문 목록 새로고침
        setShowCancelModal(false)
        setCancellingOrderId(null)
      } else {
        const error = await response.json()
        alert(error.message || '주문 취소에 실패했습니다.')
      }
    } catch (error) {
      console.error('Order cancel error:', error)
      alert('주문 취소 중 오류가 발생했습니다.')
    }
  }

  const fetchUserProducts = async () => {
    setLoadingProducts(true)
    try {
      const response = await fetch('/api/mypage/purchased-products')
      if (response.ok) {
        const data = await response.json()
        setUserProducts(data.products)
      }
    } catch (error) {
      console.error('Failed to fetch user products:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inquiryForm.product_id) {
      alert('문의할 상품을 선택해주세요.')
      return
    }
    
    try {
      const response = await fetch('/api/mypage/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: inquiryForm.title,
          content: inquiryForm.content,
          product_id: inquiryForm.product_id
        }),
      })
      
      if (response.ok) {
        alert('문의가 등록되었습니다.')
        setShowInquiryModal(false)
        setInquiryForm({ title: '', content: '', product_id: '', product_name: '' })
        fetchInquiries()
      } else {
        const error = await response.json()
        alert(error.message || '문의 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('Inquiry submit error:', error)
      alert('문의 등록 중 오류가 발생했습니다.')
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '주문 확인중',
      processing: '배송 준비중',
      shipped: '배송중',
      delivered: '배송 완료',
      cancelled: '주문 취소'
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBorderColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'border-yellow-300',
      processing: 'border-blue-300',
      shipped: 'border-indigo-300',
      delivered: 'border-green-300',
      cancelled: 'border-red-300'
    }
    return colors[status] || 'border-gray-300'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileUpdateLoading(true)
    
    try {
      const response = await fetch('/api/mypage/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser({ ...user!, ...profileForm })
        setShowProfileEditModal(false)
        alert('프로필이 업데이트되었습니다.')
      } else {
        const error = await response.json()
        alert(error.message || '프로필 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      alert('프로필 업데이트 중 오류가 발생했습니다.')
    } finally {
      setProfileUpdateLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.')
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }
    
    setPasswordChangeLoading(true)
    
    try {
      const response = await fetch('/api/mypage/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      
      if (response.ok) {
        setShowPasswordChangeModal(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        alert('비밀번호가 변경되었습니다.')
      } else {
        const error = await response.json()
        alert(error.message || '비밀번호 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('Password change error:', error)
      alert('비밀번호 변경 중 오류가 발생했습니다.')
    } finally {
      setPasswordChangeLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const tabs = [
    { id: 'profile', label: '프로필 정보', icon: '👤' },
    { id: 'orders', label: '주문 내역', icon: '📦' },
    { id: 'reviews', label: '상품 후기', icon: '⭐' },
    { id: 'inquiries', label: '상품 문의', icon: '💬' },
    { id: 'cart', label: '장바구니', icon: '🛒' },
    { id: 'wishlist', label: '찜 목록', icon: '❤️' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* 서브히어로 섹션 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">마이페이지</h1>
            <p className="text-indigo-100 text-lg">안녕하세요, {user.name}님!</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 탭 네비게이션 */}
          <div className="bg-white shadow-sm rounded-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="overflow-x-auto scrollbar-hide" aria-label="Tabs">
                <div className="flex min-w-max px-2 md:px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex-shrink-0 py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                        ${activeTab === tab.id
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </nav>
            </div>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            {/* 프로필 정보 탭 */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">프로필 정보</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                    <p className="text-gray-900 text-lg">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                    <p className="text-gray-900 text-lg">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">사용자 타입</label>
                    <p className="text-gray-900 text-lg">
                      {user.type === 'BUSINESS' && '비즈니스'}
                      {user.type === 'INFLUENCER' && '인플루언서'}
                      {user.type === 'ADMIN' && '관리자'}
                      {!user.type && '일반 사용자'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">가입일</label>
                    <p className="text-gray-900 text-lg">2024년 1월 1일</p>
                  </div>
                </div>
                <div className="mt-8 flex space-x-4">
                  <button 
                    onClick={() => setShowProfileEditModal(true)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    회원정보 수정
                  </button>
                  <button 
                    onClick={() => setShowPasswordChangeModal(true)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    비밀번호 변경
                  </button>
                </div>
              </div>
            )}

            {/* 주문 내역 탭 */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold mb-2 sm:mb-0">주문 내역</h2>
                  
                  {/* Desktop date range */}
                  <div className="hidden sm:flex items-center space-x-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="px-2 md:px-3 py-1 text-xs md:text-sm border rounded"
                    />
                    <span className="text-gray-500">~</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="px-2 md:px-3 py-1 text-xs md:text-sm border rounded"
                    />
                    <button
                      onClick={() => fetchOrders()}
                      className="px-3 md:px-4 py-1 text-xs md:text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      조회
                    </button>
                  </div>
                  
                  {/* Mobile date range button */}
                  <button
                    onClick={() => setShowDateRangeModal(true)}
                    className="sm:hidden px-3 py-1.5 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                  >
                    📅 날짜 선택
                  </button>
                </div>
                
                {/* 배송 상태별 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">배송 준비중</p>
                        <p className="text-2xl font-bold text-blue-900">{statusCounts.processing}</p>
                      </div>
                      <div className="text-3xl">📦</div>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-indigo-600 font-medium">배송중</p>
                        <p className="text-2xl font-bold text-indigo-900">{statusCounts.shipped}</p>
                      </div>
                      <div className="text-3xl">🚚</div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">배송 완료</p>
                        <p className="text-2xl font-bold text-green-900">{statusCounts.delivered}</p>
                      </div>
                      <div className="text-3xl">✅</div>
                    </div>
                  </div>
                </div>

                {/* 최근 주문 리스트 */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">최근 1개월 주문 내역</h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <span className="text-gray-500">~</span>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => {
                          // 날짜 필터링 적용
                          fetchOrders()
                        }}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                      >
                        조회
                      </button>
                    </div>
                  </div>
                  
                  {ordersLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">주문 내역을 불러오는 중...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">최근 1개월 내 주문 내역이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className={`bg-white border-2 ${getStatusBorderColor(order.status)} rounded-lg p-4 hover:shadow-md transition-shadow`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm text-gray-500">주문번호: {order.order_number}</p>
                              <p className="font-medium text-gray-900 mt-1">{order.product_names}</p>
                              <p className="text-sm text-gray-600">총 {order.item_count}개 상품</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                            <div>
                              <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                              <p className="font-semibold text-indigo-600">
                                {order.total_amount.toLocaleString()}원
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              {order.status === 'pending' && (
                                <button 
                                  onClick={() => handleOrderCancel(order.id)}
                                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                                >
                                  주문취소
                                </button>
                              )}
                              <button 
                                onClick={() => router.push(`/mypage/orders/${order.id}`)}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                              >
                                상세보기 →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <button 
                    onClick={() => router.push('/mypage/orders')}
                    className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    전체 주문 내역 보기
                  </button>
                </div>
              </div>
            )}

            {/* 상품 문의 탭 */}
            {activeTab === 'inquiries' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">상품 문의</h2>
                
                <div className="mb-6">
                  <button
                    onClick={() => {
                      setShowInquiryModal(true)
                      fetchUserProducts()
                    }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    새 문의 작성
                  </button>
                </div>
                
                {inquiriesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">문의 내역을 불러오는 중...</p>
                  </div>
                ) : inquiries.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">문의 내역이 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                      <div key={inquiry.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{inquiry.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{inquiry.product_name}</p>
                            <p className="text-gray-700 mt-2">{inquiry.content}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            inquiry.status === 'answered' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {inquiry.status === 'answered' ? '답변완료' : '답변대기'}
                          </span>
                        </div>
                        
                        {inquiry.answer && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-700 mb-1">답변</p>
                            <p className="text-gray-600">{inquiry.answer}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatDate(inquiry.answered_at || '')}
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-3 text-xs text-gray-500">
                          문의일: {formatDate(inquiry.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 상품 후기 탭 */}
            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">상품 후기</h2>
                
                <div className="mb-6">
                  <button
                    onClick={() => {
                      setShowReviewModal(true)
                      fetchUserProducts()
                    }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    새 후기 작성
                  </button>
                </div>
                
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">후기를 불러오는 중...</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">작성한 후기가 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.product_name}</h4>
                            <div className="flex items-center mt-1">
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
                              <span className="ml-2 text-sm text-gray-600">({review.rating}점)</span>
                            </div>
                            <p className="text-gray-700 mt-2">{review.content}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-500">
                          작성일: {formatDate(review.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 장바구니 탭 */}
            {activeTab === 'cart' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">장바구니</h2>
                <p className="text-gray-600 mb-6">장바구니에 담긴 상품을 확인하고 구매하세요.</p>
                <button 
                  onClick={() => router.push('/cart')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  장바구니로 이동
                </button>
              </div>
            )}

            {/* 찜 목록 탭 */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">찜 목록</h2>
                <p className="text-gray-600 mb-6">관심 상품을 확인하고 구매하세요.</p>
                <button 
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  찜 목록 보기
                </button>
              </div>
            )}

          </div>

          {/* 인플루언서 전용 메뉴 */}
          {user.type === 'INFLUENCER' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-2">캠페인 관리</h3>
                <p className="text-gray-600 mb-4">참여 중인 캠페인과 신청 내역을 확인하세요.</p>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  캠페인 보기
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-2">프로필 설정</h3>
                <p className="text-gray-600 mb-4">프로필 정보와 SNS 계정을 관리하세요.</p>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  설정하기
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-2">수익 현황</h3>
                <p className="text-gray-600 mb-4">캠페인 수익과 정산 내역을 확인하세요.</p>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                  수익 보기
                </button>
              </div>
            </div>
          )}

          {/* 관리자는 관리자 페이지로 리다이렉트 안내 */}
          {user.type === 'ADMIN' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">관리자 계정</h3>
              <p className="text-blue-700 mb-4">관리자 기능은 관리자 페이지에서 이용하실 수 있습니다.</p>
              <button 
                onClick={() => router.push('/admin')}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                관리자 페이지로 이동
              </button>
            </div>
          )}

          {/* 비즈니스는 비즈니스 대시보드로 리다이렉트 안내 */}
          {user.type === 'BUSINESS' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">비즈니스 계정</h3>
              <p className="text-green-700 mb-4">비즈니스 기능은 비즈니스 대시보드에서 이용하실 수 있습니다.</p>
              <button 
                onClick={() => router.push('/business/dashboard')}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                비즈니스 대시보드로 이동
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* 회원정보 수정 모달 */}
      {showProfileEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">회원정보 수정</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      연락처
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="010-0000-0000"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      우편번호
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={profileForm.postal_code}
                        onChange={(e) => setProfileForm({ ...profileForm, postal_code: e.target.value })}
                        placeholder="00000"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        maxLength={5}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          // 주소 검색 모달 열기
                          alert('주소 검색 기능은 카카오 주소 API와 연동 예정입니다.')
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        주소 검색
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      주소
                    </label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      placeholder="상세 주소를 입력하세요"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileEditModal(false)
                      setProfileForm({ 
                        name: user?.name || '', 
                        email: user?.email || '',
                        phone: user?.phone || '',
                        address: user?.address || '',
                        postal_code: user?.postal_code || ''
                      })
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={profileUpdateLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {profileUpdateLoading ? '저장 중...' : '저장'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 모달 */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">비밀번호 변경</h2>
              <form onSubmit={handlePasswordChange}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    현재 비밀번호
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="최소 6자 이상"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    새 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordChangeModal(false)
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={passwordChangeLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordChangeLoading ? '변경 중...' : '변경'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 날짜 선택 모달 (모바일) */}
      {showDateRangeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">날짜 선택</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    시작 날짜
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    종료 날짜
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDateRangeModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    fetchOrders()
                    setShowDateRangeModal(false)
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  조회
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 문의 작성 모달 */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">상품 문의</h2>
              <form onSubmit={handleInquirySubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    상품 선택 <span className="text-red-500">*</span>
                  </label>
                  {loadingProducts ? (
                    <div className="text-center py-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                  ) : (
                    <select
                      value={inquiryForm.product_id}
                      onChange={(e) => {
                        const selectedProduct = userProducts.find(p => p.id === e.target.value)
                        setInquiryForm({ 
                          ...inquiryForm, 
                          product_id: e.target.value,
                          product_name: selectedProduct?.name || ''
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">구매한 상품을 선택하세요</option>
                      {userProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    문의 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={inquiryForm.title}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    문의 내용
                  </label>
                  <textarea
                    value={inquiryForm.content}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, content: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInquiryModal(false)
                      setInquiryForm({ title: '', content: '', product_id: '', product_name: '' })
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    문의 등록
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  )
}