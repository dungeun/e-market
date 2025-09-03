// TODO: Refactor to use createApiHandler from @/lib/api/handler
/**
 * 검색 분석 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { searchAnalyticsService } from '@/lib/services/search/search-analytics'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 검색 분석 대시보드
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const period = searchParams.get('period') || '7d'

    switch (action) {
      case 'dashboard':
        const dashboard = await searchAnalyticsService.getDashboardAnalytics(period)
        return NextResponse.json({
          success: true,
          data: dashboard
        })

      case 'realtime':
        const realtime = await searchAnalyticsService.getRealTimeStats()
        return NextResponse.json({
          success: true,
          data: realtime
        })

      case 'suggestions':
        const suggestions = await searchAnalyticsService.getSearchImprovementSuggestions()
        return NextResponse.json({
          success: true,
          data: suggestions
        })

      case 'trends':
        const query = searchParams.get('query')
        const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : 30
        
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter is required for trends' },
            { status: 400 }
          )
        }

        const trends = await searchAnalyticsService.getQueryTrends(query, days)
        return NextResponse.json({
          success: true,
          data: trends
        })

      case 'performance':
        const performanceQuery = searchParams.get('query')
        
        if (!performanceQuery) {
          return NextResponse.json(
            { error: 'Query parameter is required for performance analysis' },
            { status: 400 }
          )
        }

        const performance = await searchAnalyticsService.analyzeSearchPerformance(performanceQuery)
        return NextResponse.json({
          success: true,
          data: performance
        })

      default:
        // 기본적으로 대시보드 데이터 반환
        const defaultData = await searchAnalyticsService.getDashboardAnalytics(period)
        return NextResponse.json({
          success: true,
          data: defaultData
        })
    }
  } catch (error: any) {
    console.error('Search analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch search analytics' },
      { status: 500 }
    )
  }
}