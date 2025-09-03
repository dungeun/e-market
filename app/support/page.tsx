'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ChevronRight, Phone, Mail, Clock, MessageCircle, HelpCircle, FileText, Users, Shield } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useLanguage } from '@/hooks/useLanguage'

interface FAQItem {
  id: string
  category: string
  question: string
  answer: string
  helpful: number
  tags: string[]
}

interface ContactMethod {
  type: string
  title: string
  description: string
  contact: string
  hours: string
  icon: React.ReactNode
  available: boolean
}

export default function SupportPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  // Mock FAQ data
  const mockFAQs: FAQItem[] = [
    {
      id: '1',
      category: '주문/결제',
      question: '주문을 취소하고 싶어요',
      answer: '주문 취소는 상품 발송 전까지만 가능합니다. 마이페이지 > 주문내역에서 해당 주문의 "취소" 버튼을 클릭하시거나 고객센터로 연락 주시면 도와드리겠습니다.',
      helpful: 245,
      tags: ['주문', '취소', '결제']
    },
    {
      id: '2',
      category: '배송',
      question: '배송비는 얼마인가요?',
      answer: '기본 배송비는 3,000원이며, 5만원 이상 구매 시 무료배송입니다. 제주도 및 도서산간지역은 추가 배송비가 발생할 수 있습니다.',
      helpful: 189,
      tags: ['배송비', '무료배송', '제주도']
    },
    {
      id: '3',
      category: '회원/계정',
      question: '비밀번호를 잊어버렸어요',
      answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하신 후, 가입 시 등록한 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.',
      helpful: 156,
      tags: ['비밀번호', '찾기', '재설정']
    },
    {
      id: '4',
      category: '교환/환불',
      question: '상품을 교환하고 싶어요',
      answer: '상품 수령 후 7일 이내에 교환 신청이 가능합니다. 단, 상품의 포장이 훼손되지 않고 사용하지 않은 상태여야 합니다. 마이페이지에서 교환 신청을 해주세요.',
      helpful: 198,
      tags: ['교환', '반품', '7일']
    }
  ]

  const contactMethods: ContactMethod[] = [
    {
      type: 'phone',
      title: '전화 문의',
      description: '상담원과 직접 통화',
      contact: '1588-1234',
      hours: '평일 09:00-18:00',
      icon: <Phone className="w-6 h-6" />,
      available: true
    },
    {
      type: 'chat',
      title: '실시간 채팅',
      description: '빠른 답변을 원하실 때',
      contact: '채팅 시작하기',
      hours: '평일 09:00-22:00',
      icon: <MessageCircle className="w-6 h-6" />,
      available: true
    },
    {
      type: 'email',
      title: '이메일 문의',
      description: '자세한 내용과 함께',
      contact: 'support@example.com',
      hours: '24시간 접수',
      icon: <Mail className="w-6 h-6" />,
      available: true
    },
    {
      type: 'visit',
      title: '방문 상담',
      description: '직접 방문해서 상담',
      contact: '서울시 강남구 테헤란로 123',
      hours: '평일 10:00-17:00 (예약제)',
      icon: <Users className="w-6 h-6" />,
      available: false
    }
  ]

  const serviceCategories = [
    {
      title: '자주 묻는 질문',
      description: '고객님들이 가장 많이 하시는 질문들',
      icon: <HelpCircle className="w-8 h-8" />,
      href: '#faq'
    },
    {
      title: '이용약관',
      description: '서비스 이용약관 및 개인정보처리방침',
      icon: <FileText className="w-8 h-8" />,
      href: '/terms'
    },
    {
      title: '신뢰와 안전',
      description: '안전한 거래를 위한 보안 정책',
      icon: <Shield className="w-8 h-8" />,
      href: '/safety'
    }
  ]

  useEffect(() => {
    setFaqs(mockFAQs)
  }, [])

  const categories = Array.from(new Set(faqs.map(faq => faq.category)))
  
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = !selectedCategory || faq.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is already handled by filteredFAQs
  }

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">고객센터</h1>
            <p className="text-xl opacity-90 mb-8">무엇을 도와드릴까요?</p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="궁금한 내용을 검색해보세요"
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Service Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">빠른 서비스</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {serviceCategories.map((category, index) => (
              <Link
                key={index}
                href={category.href}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-blue-600 mr-4 group-hover:text-blue-700 transition-colors">
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Contact Methods */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">연락처</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-sm p-6 ${
                  method.available ? 'hover:shadow-md transition-shadow cursor-pointer' : 'opacity-60'
                }`}
              >
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                    method.available ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {method.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                  <p className={`font-medium mb-2 ${
                    method.available ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {method.contact}
                  </p>
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {method.hours}
                  </div>
                  {!method.available && (
                    <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      일시 중단
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">자주 묻는 질문</h2>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-start">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mr-3 mt-0.5">
                          {faq.category}
                        </span>
                        <span className="text-gray-900 font-medium">{faq.question}</span>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedFAQ === faq.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </button>
                  
                  {expandedFAQ === faq.id && (
                    <div className="px-6 pb-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 leading-relaxed mb-4">{faq.answer}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {faq.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-white text-gray-600 text-xs rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>도움됨 {faq.helpful}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                <p className="text-gray-500">다른 검색어나 카테고리를 시도해보세요.</p>
              </div>
            )}
          </div>
        </section>

        {/* Still Need Help */}
        <section className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">원하는 답변을 찾지 못하셨나요?</h3>
          <p className="text-gray-600 mb-6">고객센터로 직접 문의해주시면 친절하게 도와드리겠습니다.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              1:1 문의하기
            </button>
            <button className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
              전화 문의
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}