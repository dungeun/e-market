'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/hooks/useLanguage'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Post {
  id: string
  title: string
  summary?: string
  author: string
  authorImage?: string
  viewCount: number
  likeCount: number
  commentCount: number
  isPinned: boolean
  isFeatured: boolean
  tags?: string[]
  publishedAt: string
  createdAt: string
}

interface Board {
  id: string
  code: string
  name: string
  description: string
  type: string
}

export default function CommunityPage() {
  const { t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>([])
  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    fetchPosts()
  }, [page, sortBy, searchTerm, activeTab])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sort: sortBy
      })

      if (searchTerm) {
        params.set('search', searchTerm)
      }
      
      if (activeTab && activeTab !== 'all') {
        params.set('category', activeTab)
      }

      const response = await fetch(`/api/boards/community/posts?${params}`)
      const data = await response.json()

      if (data.success) {
        setPosts(data.posts)
        setBoard(data.board)
        setTotalPages(data.pagination.totalPages)
      } else {
        setError(data.error || '게시글을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('게시글 조회 오류:', error)
      setError('게시글을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPosts()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours}시간 전`
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}일 전`
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  if (loading && posts.length === 0) {
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
              커뮤니티
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              자유롭게 소통하고 정보를 공유하는 공간입니다
            </p>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  💬 자유게시판
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  📢 정보공유
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  🤝 소통
                </span>
              </div>
            </div>
          </div>

          {/* 한국형 검색 및 필터 바 */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            {/* 상단 카테고리 탭 */}
            <div className="border-b border-gray-200">
              <div className="flex overflow-x-auto">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'all' 
                      ? 'text-blue-600 border-blue-600 bg-blue-50' 
                      : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                  }`}
                >
                  전체
                </button>
                <button 
                  onClick={() => setActiveTab('free')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'free' 
                      ? 'text-blue-600 border-blue-600 bg-blue-50' 
                      : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                  }`}
                >
                  🗣️ 자유게시판
                </button>
                <button 
                  onClick={() => setActiveTab('info')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'info' 
                      ? 'text-blue-600 border-blue-600 bg-blue-50' 
                      : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                  }`}
                >
                  💡 정보공유
                </button>
                <button 
                  onClick={() => setActiveTab('qna')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'qna' 
                      ? 'text-blue-600 border-blue-600 bg-blue-50' 
                      : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                  }`}
                >
                  ❓ 질문답변
                </button>
                <button 
                  onClick={() => setActiveTab('review')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'review' 
                      ? 'text-blue-600 border-blue-600 bg-blue-50' 
                      : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                  }`}
                >
                  ⭐ 후기
                </button>
                <button 
                  onClick={() => setActiveTab('notice')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'notice' 
                      ? 'text-blue-600 border-blue-600 bg-blue-50' 
                      : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                  }`}
                >
                  📢 공지사항
                </button>
                <button 
                  onClick={() => setActiveTab('tips')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'tips' 
                      ? 'text-blue-600 border-blue-600 bg-blue-50' 
                      : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                  }`}
                >
                  🎯 꿀팁
                </button>
                <button 
                  onClick={() => setActiveTab('event')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'event' 
                      ? 'text-blue-600 border-blue-600 bg-blue-50' 
                      : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                  }`}
                >
                  🎉 이벤트
                </button>
                <button 
                  onClick={() => setActiveTab('market')}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === 'market' 
                      ? 'text-blue-600 border-blue-600 bg-blue-50' 
                      : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                  }`}
                >
                  🏪 장터
                </button>
              </div>
            </div>

            {/* 검색 및 도구 바 */}
            <div className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* 검색 */}
                <form onSubmit={handleSearch} className="flex-1 max-w-lg">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="제목, 내용, 작성자로 검색하세요"
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

                <div className="flex items-center gap-3">
                  {/* 정렬 */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="recent">최신순</option>
                    <option value="popular">인기순</option>
                    <option value="views">조회순</option>
                    <option value="comments">댓글순</option>
                  </select>

                  {/* 글쓰기 버튼 */}
                  <Link
                    href="/community/write"
                    className="inline-flex items-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    글쓰기
                  </Link>
                </div>
              </div>
            </div>
          </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

          {/* 한국형 게시글 목록 */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* 목록 헤더 */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-medium text-gray-700">
                <div className="col-span-1 text-center">번호</div>
                <div className="col-span-6">제목</div>
                <div className="col-span-2 text-center">작성자</div>
                <div className="col-span-1 text-center">조회</div>
                <div className="col-span-1 text-center">좋아요</div>
                <div className="col-span-1 text-center">날짜</div>
              </div>
            </div>

            {posts.length === 0 && !loading ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">등록된 게시글이 없습니다.</p>
                <p className="text-gray-400 text-sm mt-2">첫 번째 글을 작성해 보세요!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {posts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/community/${post.id}`}
                    className="block hover:bg-blue-50 transition-colors"
                  >
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                      {/* 번호 */}
                      <div className="col-span-1 text-center">
                        {post.isPinned ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full text-sm font-bold">
                            📌
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            {(page - 1) * 20 + index + 1}
                          </span>
                        )}
                      </div>

                      {/* 제목 */}
                      <div className="col-span-6">
                        <div className="flex items-center gap-2 mb-1">
                          {post.isFeatured && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                              추천
                            </span>
                          )}
                          {post.tags && post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-gray-900 font-medium hover:text-blue-600 line-clamp-1">
                          {post.title}
                          {post.commentCount > 0 && (
                            <span className="ml-2 text-blue-600 text-sm">
                              [{post.commentCount}]
                            </span>
                          )}
                        </h3>
                        {post.summary && (
                          <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                            {post.summary}
                          </p>
                        )}
                      </div>

                      {/* 작성자 */}
                      <div className="col-span-2 text-center">
                        <div className="flex items-center justify-center">
                          {post.authorImage ? (
                            <img
                              src={post.authorImage}
                              alt={post.author}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                              <span className="text-xs text-gray-600">
                                {post.author.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-gray-700 truncate max-w-16">
                            {post.author}
                          </span>
                        </div>
                      </div>

                      {/* 조회수 */}
                      <div className="col-span-1 text-center">
                        <span className="text-sm text-gray-500">
                          {post.viewCount.toLocaleString()}
                        </span>
                      </div>

                      {/* 좋아요 */}
                      <div className="col-span-1 text-center">
                        <span className="text-sm text-gray-500">
                          {post.likeCount > 0 ? post.likeCount.toLocaleString() : '-'}
                        </span>
                      </div>

                      {/* 날짜 */}
                      <div className="col-span-1 text-center">
                        <span className="text-sm text-gray-500">
                          {formatDate(post.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('boards.pagination.prev') || '이전'}
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages, page - 2 + i))
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      page === pageNum
                        ? 'text-blue-600 bg-blue-50 border border-blue-300'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('boards.pagination.next') || '다음'}
              </button>
            </nav>
          </div>
        )}
        </div>
      </div>
      <Footer />
    </>
  )
}