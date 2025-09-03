'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/hooks/useLanguage'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Inquiry {
  id: string
  title: string
  category: string
  status: 'pending' | 'answered' | 'closed'
  createdAt: string
  updatedAt: string
  isSecret: boolean
  hasAttachment: boolean
}

interface InquiryCategory {
  id: string
  name: string
  count: number
}

export default function InquiryPage() {
  const { t } = useLanguage()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [categories, setCategories] = useState<InquiryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [selectedStatus, setSelectedStatus] = useState('전체')
  const [showWriteForm, setShowWriteForm] = useState(false)

  // 폼 상태
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    isSecret: false,
    email: '',
    phone: ''
  })

  useEffect(() => {
    fetchInquiries()
  }, [selectedCategory, selectedStatus])

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        category: selectedCategory !== '전체' ? selectedCategory : '',
        status: selectedStatus !== '전체' ? selectedStatus : ''
      })

      const response = await fetch(`/api/boards/inquiry/posts?${params}`)
      const data = await response.json()

      if (data.success) {
        setInquiries(data.posts || [])
        setCategories([
          { id: 'all', name: '전체', count: data.totalCount || 0 },
          { id: 'general', name: '일반문의', count: 12 },
          { id: 'product', name: '상품문의', count: 18 },
          { id: 'order', name: '주문문의', count: 15 },
          { id: 'payment', name: '결제문의', count: 8 },
          { id: 'shipping', name: '배송문의', count: 22 },
          { id: 'return', name: '반품/교환', count: 10 },
          { id: 'technical', name: '기술지원', count: 6 },
        ])
      } else {
        setError(data.error || '1:1 문의를 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('1:1 문의 조회 오류:', error)
      setError('1:1 문의를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category || !formData.title || !formData.content) {
      alert('필수 항목을 모두 입력해주세요.')
      return
    }

    try {
      const response = await fetch('/api/boards/inquiry/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        alert('문의가 성공적으로 등록되었습니다.')
        setShowWriteForm(false)
        setFormData({
          category: '',
          title: '',
          content: '',
          isSecret: false,
          email: '',
          phone: ''
        })
        fetchInquiries()
      } else {
        alert(data.error || '문의 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('문의 등록 오류:', error)
      alert('문의 등록에 실패했습니다.')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700 답변대기',
      answered: 'bg-green-100 text-green-700 답변완료',
      closed: 'bg-gray-100 text-gray-700 처리완료'
    }
    const [className, text] = badges[status as keyof typeof badges]?.split(' ') || ['bg-gray-100 text-gray-700', '알수없음']
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${className}`}>
        {text}
      </span>
    )
  }

  // 샘플 데이터
  const sampleInquiries: Inquiry[] = [
    {
      id: '1',
      title: '주문한 상품이 아직 배송되지 않았습니다.',
      category: '배송문의',
      status: 'answered',
      createdAt: '2024-01-15T14:30:00Z',
      updatedAt: '2024-01-16T09:15:00Z',
      isSecret: false,
      hasAttachment: false
    },
    {
      id: '2',
      title: '결제가 완료되었는데 주문이 취소되었어요.',
      category: '결제문의',
      status: 'pending',
      createdAt: '2024-01-14T16:20:00Z',
      updatedAt: '2024-01-14T16:20:00Z',
      isSecret: true,
      hasAttachment: true
    },
    {
      id: '3',
      title: '교환 신청 후 처리 현황을 알고 싶습니다.',
      category: '반품/교환',
      status: 'answered',
      createdAt: '2024-01-13T11:45:00Z',
      updatedAt: '2024-01-14T10:30:00Z',
      isSecret: false,
      hasAttachment: false
    },
    {
      id: '4',
      title: '상품 정보에 대해 더 자세히 알고 싶어요.',
      category: '상품문의',
      status: 'closed',
      createdAt: '2024-01-12T09:15:00Z',
      updatedAt: '2024-01-12T15:20:00Z',
      isSecret: false,
      hasAttachment: false
    }
  ]

  const displayInquiries = inquiries.length > 0 ? inquiries : sampleInquiries
  const filteredInquiries = displayInquiries.filter(inquiry => {
    const matchesCategory = selectedCategory === '전체' || inquiry.category === selectedCategory
    const matchesStatus = selectedStatus === '전체' || inquiry.status === selectedStatus
    return matchesCategory && matchesStatus
  })

  if (loading && inquiries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-white rounded-lg shadow"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* 페이지 헤더 - 한국형 스타일 */}
          <div className="mb-8 text-center border-b border-gray-200 pb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              1:1 문의
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              궁금한 점이나 도움이 필요한 사항을 문의해 주세요
            </p>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  💬 1:1 문의
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  🔒 개인정보보호
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  ⚡ 빠른답변
                </span>
              </div>
            </div>
          </div>

          {/* 한국형 필터 및 도구 바 */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            {/* 카테고리 및 상태 탭 */}
            <div className="border-b border-gray-200">
              <div className="flex flex-wrap">
                <div className="flex overflow-x-auto min-w-0 flex-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                        selectedCategory === category.name
                          ? 'text-blue-600 border-blue-600 bg-blue-50'
                          : 'text-gray-500 border-transparent hover:text-gray-700'
                      }`}
                    >
                      {category.name}
                      <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {category.name === '전체' ? filteredInquiries.length : category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 도구 바 */}
            <div className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="전체">전체 상태</option>
                    <option value="pending">답변대기</option>
                    <option value="answered">답변완료</option>
                    <option value="closed">처리완료</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowWriteForm(true)}
                  className="inline-flex items-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  문의하기
                </button>
              </div>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* 문의 작성 폼 */}
          {showWriteForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">1:1 문의 작성</h3>
                    <button
                      onClick={() => setShowWriteForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        문의 유형 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">문의 유형을 선택해주세요</option>
                        <option value="일반문의">일반문의</option>
                        <option value="상품문의">상품문의</option>
                        <option value="주문문의">주문문의</option>
                        <option value="결제문의">결제문의</option>
                        <option value="배송문의">배송문의</option>
                        <option value="반품/교환">반품/교환</option>
                        <option value="기술지원">기술지원</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        제목 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="문의 제목을 입력해주세요"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        문의 내용 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="문의 내용을 자세히 입력해주세요"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          이메일
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="답변받을 이메일 주소"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          연락처
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="연락받을 전화번호"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isSecret}
                          onChange={(e) => setFormData({...formData, isSecret: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">비밀글로 작성</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      type="button"
                      onClick={() => setShowWriteForm(false)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      문의 등록
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 1:1 문의 리스트 */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* 목록 헤더 */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium text-gray-700">
                <div className="col-span-1 text-center">번호</div>
                <div className="col-span-5">제목</div>
                <div className="col-span-2 text-center">문의유형</div>
                <div className="col-span-2 text-center">상태</div>
                <div className="col-span-2 text-center">등록일</div>
              </div>
            </div>

            {filteredInquiries.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.962 8.962 0 01-4.31-1.098l-3.69 1.023 1.023-3.69A8.962 8.962 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">등록된 문의가 없습니다.</p>
                <p className="text-gray-400 text-sm mt-2">궁금한 점을 문의해 보세요!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredInquiries.map((inquiry, index) => (
                  <Link
                    key={inquiry.id}
                    href={`/inquiry/${inquiry.id}`}
                    className="block hover:bg-blue-50 transition-colors"
                  >
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                      {/* 번호 */}
                      <div className="col-span-1 text-center">
                        <span className="text-gray-500 text-sm">
                          {index + 1}
                        </span>
                      </div>

                      {/* 제목 */}
                      <div className="col-span-5">
                        <div className="flex items-center gap-2 mb-1">
                          {inquiry.isSecret && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                              🔒 비밀글
                            </span>
                          )}
                          {inquiry.hasAttachment && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              📎 첨부
                            </span>
                          )}
                        </div>
                        <h3 className="text-gray-900 font-medium hover:text-blue-600 line-clamp-1">
                          {inquiry.title}
                        </h3>
                      </div>

                      {/* 문의유형 */}
                      <div className="col-span-2 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          {inquiry.category}
                        </span>
                      </div>

                      {/* 상태 */}
                      <div className="col-span-2 text-center">
                        {getStatusBadge(inquiry.status)}
                      </div>

                      {/* 등록일 */}
                      <div className="col-span-2 text-center">
                        <span className="text-sm text-gray-500">
                          {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 안내 섹션 */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">빠른 답변</h3>
                <p className="text-sm text-gray-600">평균 2시간 내 답변드립니다</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-lg mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">개인정보보호</h3>
                <p className="text-sm text-gray-600">안전하게 보호됩니다</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-lg mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">전문 상담</h3>
                <p className="text-sm text-gray-600">전문 상담원이 도와드립니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}