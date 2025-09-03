'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useLanguage } from '@/hooks/useLanguage'

interface PlugStoryPost {
  id: string
  title: string
  excerpt: string
  content: string
  imageUrl: string
  author: {
    name: string
    avatar: string
    role: string
  }
  publishedAt: string
  readingTime: number
  category: string
  tags: string[]
  likes: number
  views: number
}

export default function PlugStoryPage() {
  const { t } = useLanguage()
  const [posts, setPosts] = useState<PlugStoryPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 12

  // Mock data - in real app this would come from API
  const mockPosts: PlugStoryPost[] = [
    {
      id: '1',
      title: '최신 마케팅 트렌드: 2024년 주목해야 할 5가지',
      excerpt: '빠르게 변화하는 디지털 마케팅 환경에서 성공하기 위해 알아야 할 최신 트렌드들을 소개합니다.',
      content: '...',
      imageUrl: '/api/placeholder/600/400',
      author: {
        name: '김마케터',
        avatar: '/api/placeholder/48/48',
        role: '마케팅 전략가'
      },
      publishedAt: '2024-01-15',
      readingTime: 8,
      category: '마케팅 트렌드',
      tags: ['마케팅', '트렌드', '2024', '디지털'],
      likes: 124,
      views: 2340
    },
    {
      id: '2',
      title: '인플루언서 마케팅 성공 사례 분석',
      excerpt: '실제 브랜드들이 인플루언서와 협업하여 이룬 성공 사례들을 자세히 분석해보겠습니다.',
      content: '...',
      imageUrl: '/api/placeholder/600/400',
      author: {
        name: '박브랜더',
        avatar: '/api/placeholder/48/48',
        role: '브랜드 매니저'
      },
      publishedAt: '2024-01-12',
      readingTime: 12,
      category: '인플루언서',
      tags: ['인플루언서', '마케팅', '브랜드', '협업'],
      likes: 89,
      views: 1560
    },
    {
      id: '3',
      title: '소셜미디어 콘텐츠 제작 가이드',
      excerpt: '각 플랫폼별 특성을 고려한 효과적인 콘텐츠 제작 방법과 팁을 공유합니다.',
      content: '...',
      imageUrl: '/api/placeholder/600/400',
      author: {
        name: '이콘텐츠',
        avatar: '/api/placeholder/48/48',
        role: '콘텐츠 크리에이터'
      },
      publishedAt: '2024-01-10',
      readingTime: 6,
      category: '콘텐츠 제작',
      tags: ['소셜미디어', '콘텐츠', '제작', '가이드'],
      likes: 67,
      views: 1234
    }
  ]

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      setPosts(mockPosts)
      setLoading(false)
    }, 500)
  }, [])

  const categories = Array.from(new Set(posts.map(post => post.category)))
  const filteredPosts = selectedCategory 
    ? posts.filter(post => post.category === selectedCategory)
    : posts

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">콘텐츠를 불러오는 중...</p>
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">플러그스토리</h1>
            <p className="text-xl opacity-90">마케팅 인사이트와 성공 스토리를 만나보세요</p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedCategory('')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              전체
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  setCurrentPage(1)
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {currentPosts.map(post => (
            <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <Link href={`/plugstory/${post.id}`}>
                <div className="aspect-video relative">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-sm text-gray-500">{formatDate(post.publishedAt)}</span>
                </div>
                
                <Link href={`/plugstory/${post.id}`}>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                </Link>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={32}
                      height={32}
                      className="rounded-full mr-3"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                      <p className="text-xs text-gray-500">{post.author.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <span>{post.readingTime}분 읽기</span>
                    <span>👀 {post.views}</span>
                    <span>❤️ {post.likes}</span>
                  </div>
                </div>
              </div>
            </article>
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
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">게시글이 없습니다</h3>
            <p className="text-gray-500">선택한 카테고리에 게시글이 없습니다.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}