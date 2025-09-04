import type { AppError } from '@/lib/types/common';
// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/auth/jwt'
// import { prisma } from '@/lib/db' // Prisma removed for Supabase

// GET /api/admin/analytics - 통계 데이터 조회
export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authHeader = request.headers.get('authorization')
    let token: string | null | undefined = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get('auth-token')?.value
    }

    if (!token) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const payload = await verifyJWT(token)
    if (payload.type !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 날짜 범위 파라미터
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30days'
    
    let startDate = new Date()
    switch (range) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30days':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90days':
        startDate.setDate(startDate.getDate() - 90)
        break
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }

    // 개요 통계
    // Temporarily return mock data - replace with Supabase queries
    const totalUsers = 100
    const newUsers = 10
    const userGrowth = totalUsers > 0 ? Math.round((newUsers / totalUsers) * 100) : 0

    const totalCampaigns = 5

    const totalRevenue = { _sum: { amount: 1000000 } }

    const previousRevenue = { _sum: { amount: 900000 } }

    const revenueGrowth = (previousRevenue._sum.amount || 0) > 0 
      ? Math.round(((totalRevenue._sum.amount || 0) - (previousRevenue._sum.amount || 0)) / (previousRevenue._sum.amount || 1) * 100)
      : 0

    const totalSettlements = { _sum: { totalAmount: 500000 } }

    // 사용자 통계
    const usersByType = [
      { type: 'INFLUENCER', _count: { id: 50 } },
      { type: 'BUSINESS', _count: { id: 30 } },
      { type: 'ADMIN', _count: { id: 20 } }
    ]

    // 월별 사용자 증가 (최근 6개월)
    const usersByMonth: unknown[] = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)

      const influencers = Math.floor(Math.random() * 10) + 5
      const businesses = Math.floor(Math.random() * 10) + 3

      usersByMonth.push({
        month: monthStart.toLocaleDateString('ko-KR', { month: 'short' }),
        influencers,
        businesses
      })
    }

    // 캠페인 통계
    const campaignsByStatus = [
      { status: 'ACTIVE', _count: { id: 10 } },
      { status: 'COMPLETED', _count: { id: 5 } },
      { status: 'PENDING', _count: { id: 3 } }
    ]

    const categoryCount: Record<string, number> = {
      '패션': 5,
      '뷰티': 3,
      '푸드': 7,
      '기타': 2
    }

    // 월별 캠페인 및 매출 (최근 6개월)
    const campaignsByMonth: unknown[] = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)

      const count = Math.floor(Math.random() * 10) + 5
      const revenue = { _sum: { amount: Math.floor(Math.random() * 1000000) + 500000 } }

      campaignsByMonth.push({
        month: monthStart.toLocaleDateString('ko-KR', { month: 'short' }),
        count,
        revenue: revenue._sum.amount || 0
      })
    }

    // 매출 통계
    const revenueByMonth: unknown[] = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)

      const revenue = { _sum: { amount: Math.floor(Math.random() * 1000000) + 500000 } }
      const settlements = { _sum: { totalAmount: Math.floor(Math.random() * 500000) + 250000 } }

      revenueByMonth.push({
        month: monthStart.toLocaleDateString('ko-KR', { month: 'short' }),
        revenue: revenue._sum.amount || 0,
        settlements: settlements._sum.totalAmount || 0,
        profit: (revenue._sum.amount || 0) - (settlements._sum.totalAmount || 0)
      })
    }

    // 결제 방법별 매출
    const paymentMethods = [
      { paymentMethod: 'CARD', _sum: { amount: 500000 } },
      { paymentMethod: 'BANK_TRANSFER', _sum: { amount: 300000 } },
      { paymentMethod: 'CASH', _sum: { amount: 200000 } }
    ]

    const paymentMethodMap: Record<string, string> = {
      'CARD': '신용카드',
      'BANK_TRANSFER': '계좌이체',
      'CASH': '현금',
      'VIRTUAL_ACCOUNT': '가상계좌',
      'PHONE': '휴대폰'
    }

    // TOP 인플루언서
    const formattedInfluencers = [
      { id: '1', name: 'Influencer A', email: 'a@example.com', campaigns: 10, earnings: 1000000 },
      { id: '2', name: 'Influencer B', email: 'b@example.com', campaigns: 8, earnings: 800000 },
      { id: '3', name: 'Influencer C', email: 'c@example.com', campaigns: 6, earnings: 600000 },
      { id: '4', name: 'Influencer D', email: 'd@example.com', campaigns: 5, earnings: 500000 },
      { id: '5', name: 'Influencer E', email: 'e@example.com', campaigns: 4, earnings: 400000 }
    ]

    // TOP 캠페인
    const formattedCampaigns = [
      { id: '1', title: 'Campaign A', business: 'Business A', revenue: 2000000, applications: 20 },
      { id: '2', title: 'Campaign B', business: 'Business B', revenue: 1500000, applications: 15 },
      { id: '3', title: 'Campaign C', business: 'Business C', revenue: 1000000, applications: 10 },
      { id: '4', title: 'Campaign D', business: 'Business D', revenue: 800000, applications: 8 },
      { id: '5', title: 'Campaign E', business: 'Business E', revenue: 600000, applications: 6 }
    ]

    return NextResponse.json({
      overview: {
        totalUsers,
        totalCampaigns,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalSettlements: totalSettlements._sum.totalAmount || 0,
        userGrowth,
        revenueGrowth
      },
      userStats: {
        byType: usersByType.map(item => ({
          type: item.type === 'INFLUENCER' ? '인플루언서' : item.type === 'BUSINESS' ? '비즈니스' : '관리자',
          count: item._count.id
        })),
        byMonth: usersByMonth
      },
      campaignStats: {
        byStatus: campaignsByStatus.map(item => ({
          status: item.status,
          count: item._count.id
        })),
        byCategory: Object.entries(categoryCount).map(([category, count]) => ({
          category,
          count
        })),
        byMonth: campaignsByMonth
      },
      revenueStats: {
        byMonth: revenueByMonth,
        byPaymentMethod: paymentMethods.map(item => ({
          method: paymentMethodMap[item.paymentMethod] || item.paymentMethod,
          amount: item._sum.amount || 0
        }))
      },
      topInfluencers: formattedInfluencers,
      topCampaigns: formattedCampaigns
    })
  } catch (error) {

    return NextResponse.json(
      { error: '통계 데이터 조회에 실패했습니다.' },
      { status: 500 }
    )
  }
}