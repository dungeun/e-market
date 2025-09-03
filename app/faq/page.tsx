'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/hooks/useLanguage'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  isExpanded?: boolean
  viewCount: number
  likeCount: number
  createdAt: string
}

interface FAQCategory {
  id: string
  name: string
  count: number
}

export default function FAQPage() {
  const { t } = useLanguage()
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [categories, setCategories] = useState<FAQCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  useEffect(() => {
    fetchFAQs()
  }, [selectedCategory, searchTerm])

  const fetchFAQs = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        category: selectedCategory !== '전체' ? selectedCategory : '',
      })

      if (searchTerm) {
        params.set('search', searchTerm)
      }

      const response = await fetch(`/api/boards/faq/posts?${params}`)
      const data = await response.json()

      if (data.success) {
        setFaqs(data.posts || [])
        setCategories([
          { id: 'all', name: '전체', count: data.totalCount || 0 },
          { id: 'general', name: '일반', count: 15 },
          { id: 'account', name: '계정', count: 8 },
          { id: 'payment', name: '결제', count: 12 },
          { id: 'shipping', name: '배송', count: 7 },
          { id: 'return', name: '반품/교환', count: 6 },
          { id: 'etc', name: '기타', count: 4 },
        ])
      } else {
        setError(data.error || 'FAQ를 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('FAQ 조회 오류:', error)
      setError('FAQ를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchFAQs()
  }

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  // 샘플 FAQ 데이터
  const sampleFAQs: FAQItem[] = [
    {
      id: '1',
      question: '회원가입은 어떻게 하나요?',
      answer: '홈페이지 우측 상단의 "회원가입" 버튼을 클릭하여 필요한 정보를 입력하시면 됩니다. 이메일 인증 후 회원가입이 완료됩니다.',
      category: '계정',
      viewCount: 1250,
      likeCount: 45,
      createdAt: '2024-01-15T09:00:00Z'
    },
    {
      id: '2',
      question: '비밀번호를 잊어버렸어요. 어떻게 해야 하나요?',
      answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하시고, 가입 시 사용한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.',
      category: '계정',
      viewCount: 980,
      likeCount: 32,
      createdAt: '2024-01-14T14:30:00Z'
    },
    {
      id: '3',
      question: '결제 방법은 어떤 것들이 있나요?',
      answer: '신용카드, 체크카드, 계좌이체, 무통장입금, 카카오페이, 토스페이, 페이코 등 다양한 결제 방법을 지원합니다.',
      category: '결제',
      viewCount: 1500,
      likeCount: 68,
      createdAt: '2024-01-13T16:45:00Z'
    },
    {
      id: '4',
      question: '배송기간은 얼마나 걸리나요?',
      answer: '일반적으로 주문 확인 후 2-3일 내에 배송됩니다. 도서산간 지역은 1-2일 추가 소요될 수 있습니다.',
      category: '배송',
      viewCount: 2100,
      likeCount: 89,
      createdAt: '2024-01-12T11:20:00Z'
    },
    {
      id: '5',
      question: '반품/교환은 어떻게 하나요?',
      answer: '상품 수령 후 7일 이내에 마이페이지에서 반품/교환 신청을 하실 수 있습니다. 단순변심의 경우 배송비가 부과될 수 있습니다.',
      category: '반품/교환',
      viewCount: 1800,
      likeCount: 76,
      createdAt: '2024-01-11T13:15:00Z'
    }
  ]

  const displayFAQs = faqs.length > 0 ? faqs : sampleFAQs
  const filteredFAQs = displayFAQs.filter(faq => {
    const matchesCategory = selectedCategory === '전체' || faq.category === selectedCategory
    const matchesSearch = !searchTerm || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading && faqs.length === 0) {
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
              자주 묻는 질문
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              궁금한 점을 빠르게 해결하세요
            </p>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  ❓ FAQ
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  💡 도움말
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  📞 고객지원
                </span>
              </div>
            </div>
          </div>

          {/* 한국형 검색 및 카테고리 바 */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            {/* 카테고리 탭 */}
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
                      selectedCategory === category.name
                        ? 'text-blue-600 border-blue-600 bg-blue-50'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    {category.name}
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {category.name === '전체' ? filteredFAQs.length : category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 검색 바 */}
            <div className="p-4">
              <form onSubmit={handleSearch} className="max-w-lg mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="궁금한 내용을 검색해보세요"
                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* FAQ 아코디언 리스트 */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
                <p className="text-gray-400 text-sm mt-2">다른 키워드로 검색해보세요.</p>
              </div>
            ) : (
              filteredFAQs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-lg shadow-sm border">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            Q
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                            {faq.category}
                          </span>
                        </div>
                        <h3 className="text-gray-900 font-medium text-lg">
                          {faq.question}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>조회 {faq.viewCount.toLocaleString()}</span>
                          <span>좋아요 {faq.likeCount}</span>
                          <span>{new Date(faq.createdAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <svg 
                          className={`w-6 h-6 text-gray-400 transition-transform ${
                            expandedFAQ === faq.id ? 'transform rotate-180' : ''
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                  
                  {expandedFAQ === faq.id && (
                    <div className="px-6 pb-5 border-t border-gray-100">
                      <div className="pt-4">
                        <div className="flex items-start gap-3">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 mt-1">
                            A
                          </span>
                          <div className="flex-1">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                              {faq.answer}
                            </p>
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                              <button className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                도움이 되었나요?
                              </button>
                              <button className="text-sm text-gray-500 hover:text-blue-600">
                                추가 문의하기
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 추가 도움말 섹션 */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              원하는 답변을 찾지 못하셨나요?
            </h3>
            <p className="text-gray-600 mb-6">
              1:1 문의를 통해 더 자세한 도움을 받아보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/inquiry"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.962 8.962 0 01-4.31-1.098l-3.69 1.023 1.023-3.69A8.962 8.962 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
                1:1 문의하기
              </Link>
              <a
                href="tel:1588-1234"
                className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                전화 문의 (1588-1234)
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}