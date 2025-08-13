'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MyPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로그인 확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">마이페이지</h1>
          
          {/* 사용자 정보 섹션 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">프로필 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                <p className="text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">사용자 타입</label>
                <p className="text-gray-900">
                  {user.type === 'INFLUENCER' && '인플루언서'}
                  {user.type === 'USER' && '일반 사용자'}
                  {user.type === 'BUSINESS' && '비즈니스'}
                  {user.type === 'ADMIN' && '관리자'}
                </p>
              </div>
            </div>
          </div>

          {/* 인플루언서 전용 메뉴 */}
          {(user.type === 'INFLUENCER' || user.type === 'USER') && (
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
    </div>
  )
}