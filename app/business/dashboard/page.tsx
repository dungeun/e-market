'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  Campaign,
  BarChart3,
  Plus,
  Eye
} from 'lucide-react'

export default function BusinessDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalInfluencers: 0,
    totalRevenue: 0,
    monthlyGrowth: 0
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (user && user.type !== 'BUSINESS') {
      router.push('/mypage')
      return
    }

    // 더미 데이터 로드
    setStats({
      totalCampaigns: 24,
      activeCampaigns: 8,
      totalInfluencers: 156,
      totalRevenue: 12500000,
      monthlyGrowth: 15.3
    })
  }, [isAuthenticated, user, router])

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

  if (user.type !== 'BUSINESS') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-4">비즈니스 계정만 이용할 수 있습니다.</p>
          <button 
            onClick={() => router.push('/mypage')}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            마이페이지로 이동
          </button>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">비즈니스 대시보드</h1>
            <p className="text-gray-600 mt-2">캠페인과 인플루언서 관리, 성과 분석을 한눈에 확인하세요.</p>
          </div>

          {/* 통계 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">전체 캠페인</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Campaign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">진행 중 캠페인</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">협력 인플루언서</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalInfluencers}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 매출</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-sm text-green-600">
                    ↗ {stats.monthlyGrowth}% 전월 대비
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* 빠른 액션 버튼들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>새 캠페인 만들기</span>
            </button>
            
            <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>인플루언서 찾기</span>
            </button>
            
            <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>성과 분석</span>
            </button>
            
            <button className="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
              <ShoppingBag className="w-5 h-5" />
              <span>제품 관리</span>
            </button>
          </div>

          {/* 최근 캠페인과 성과 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 최근 캠페인 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">최근 캠페인</h3>
              <div className="space-y-4">
                {[
                  { name: '여름 신제품 런칭 캠페인', status: '진행중', participants: 12 },
                  { name: '브랜드 인지도 향상 캠페인', status: '모집중', participants: 8 },
                  { name: '할인 이벤트 홍보', status: '완료', participants: 25 }
                ].map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{campaign.name}</h4>
                      <p className="text-sm text-gray-600">참여자: {campaign.participants}명</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.status === '진행중' ? 'bg-green-100 text-green-800' :
                      campaign.status === '모집중' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 성과 요약 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">이번 달 성과</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">총 노출 수</span>
                  <span className="font-semibold">2,450,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">클릭 수</span>
                  <span className="font-semibold">124,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">전환 수</span>
                  <span className="font-semibold">3,250</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">CTR</span>
                  <span className="font-semibold text-green-600">5.08%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">CVR</span>
                  <span className="font-semibold text-green-600">2.61%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}