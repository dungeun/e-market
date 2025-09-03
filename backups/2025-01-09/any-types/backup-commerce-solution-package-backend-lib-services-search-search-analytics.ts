/**
 * 검색 분석 서비스
 */

import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export interface SearchAnalytics {
  popularQueries: Array<{ query: string; count: number; trend: 'up' | 'down' | 'stable' }>
  zeroResultQueries: Array<{ query: string; count: number }>
  avgSearchTime: number
  totalSearches: number
  conversionRate: number
  categoryPerformance: Array<{ category: string; searches: number; conversions: number }>
}

export class SearchAnalyticsService {
  /**
   * 검색 분석 대시보드 데이터
   */
  async getDashboardAnalytics(period = '7d'): Promise<SearchAnalytics> {
    const days = this.parsePeriod(period)
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    // 인기 검색어
    const popularQueries = await this.getPopularQueries(days)
    
    // 검색 결과 없는 쿼리
    const zeroResultQueries = await this.getZeroResultQueries(days)
    
    // 평균 검색 시간
    const avgSearchTime = await this.getAverageSearchTime(days)
    
    // 총 검색 수
    const totalSearches = await this.getTotalSearches(days)
    
    // 전환율
    const conversionRate = await this.getConversionRate(days)
    
    // 카테고리별 성과
    const categoryPerformance = await this.getCategoryPerformance(days)

    return {
      popularQueries,
      zeroResultQueries,
      avgSearchTime,
      totalSearches,
      conversionRate,
      categoryPerformance
    }
  }

  /**
   * 검색어 트렌드 분석
   */
  async getQueryTrends(query: string, days = 30) {
    const trends: any[] = []
    const now = new Date()
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateKey = date.toISOString().split('T')[0]
      
      const count = await redis.hget(`search_stats:${dateKey}`, `query:${query}`) || '0'
      
      trends.push({
        date: dateKey,
        count: parseInt(count)
      })
    }

    return trends
  }

  /**
   * 검색 성과 분석
   */
  async analyzeSearchPerformance(query: string) {
    // 검색 빈도
    const frequencyScore = await redis.zscore('search_frequency', query.toLowerCase())
    const frequency = frequencyScore ? parseFloat(frequencyScore) : 0
    
    // 검색 결과 수 통계
    const resultCounts = await redis.lrange(`search_results:${query}`, 0, -1)
    const avgResults = resultCounts.length > 0
      ? resultCounts.reduce((sum, count) => sum + parseInt(count), 0) / resultCounts.length
      : 0
    
    // 클릭률 (CTR) 계산
    const clicks = await redis.get(`search_clicks:${query}`) || '0'
    const ctr = frequency > 0 ? (parseInt(clicks) / frequency) * 100 : 0
    
    // 전환율 계산
    const conversions = await redis.get(`search_conversions:${query}`) || '0'
    const conversionRate = frequency > 0 ? (parseInt(conversions) / frequency) * 100 : 0

    return {
      query,
      frequency: Math.round(frequency),
      avgResults: Math.round(avgResults),
      ctr: Math.round(ctr * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      performance: this.getPerformanceRating(ctr, conversionRate)
    }
  }

  /**
   * 검색 개선 제안
   */
  async getSearchImprovementSuggestions() {
    const suggestions: any[] = []

    // 결과 없는 검색어 분석
    const zeroResults = await this.getZeroResultQueries(7)
    if (zeroResults.length > 0) {
      suggestions.push({
        type: 'zero_results',
        priority: 'high',
        message: `${zeroResults.length}개의 검색어에서 결과가 없습니다`,
        queries: zeroResults.slice(0, 5).map(q => q.query),
        action: '새 상품 추가 또는 검색 알고리즘 개선 필요'
      })
    }

    // 저성과 검색어
    const lowPerformanceQueries = await this.getLowPerformanceQueries()
    if (lowPerformanceQueries.length > 0) {
      suggestions.push({
        type: 'low_performance',
        priority: 'medium',
        message: `${lowPerformanceQueries.length}개의 검색어가 낮은 성과를 보입니다`,
        queries: lowPerformanceQueries.slice(0, 5),
        action: '검색 결과 관련성 개선 또는 상품 배치 조정 필요'
      })
    }

    // 느린 검색어
    const slowQueries = await this.getSlowQueries()
    if (slowQueries.length > 0) {
      suggestions.push({
        type: 'slow_queries',
        priority: 'medium',
        message: `${slowQueries.length}개의 검색어가 느린 응답시간을 보입니다`,
        queries: slowQueries.slice(0, 5),
        action: '검색 인덱스 최적화 또는 캐싱 전략 개선 필요'
      })
    }

    return suggestions
  }

  /**
   * 실시간 검색 통계
   */
  async getRealTimeStats() {
    const now = new Date()
    const hour = now.getHours()
    const minute = Math.floor(now.getMinutes() / 5) * 5 // 5분 단위

    const timeKey = `${hour}:${minute.toString().padStart(2, '0')}`
    
    return {
      currentSearches: await redis.get(`realtime_searches:${timeKey}`) || '0',
      currentUsers: await redis.scard(`active_searchers:${hour}`),
      topQueries: await redis.zrevrange(`realtime_queries:${hour}`, 0, 4, 'WITHSCORES'),
      avgResponseTime: await redis.get(`avg_response:${timeKey}`) || '0'
    }
  }

  private async getPopularQueries(days: number) {
    const queries = await redis.zrevrange('search_frequency', 0, 19, 'WITHSCORES')
    const result: any[] = []
    
    for (let i = 0; i < queries.length; i += 2) {
      const query = queries[i]
      const count = parseInt(queries[i + 1])
      
      // 트렌드 계산 (간단한 버전)
      const yesterdayCount = await redis.get(`search_trend:${query}:yesterday`) || '0'
      const trend: 'up' | 'down' | 'stable' = count > parseInt(yesterdayCount) ? 'up' : 
                   count < parseInt(yesterdayCount) ? 'down' : 'stable'
      
      result.push({ query, count, trend })
    }

    return result
  }

  private async getZeroResultQueries(days: number) {
    const queries = await redis.zrevrange('zero_result_queries', 0, 9, 'WITHSCORES')
    const result: any[] = []
    
    for (let i = 0; i < queries.length; i += 2) {
      result.push({
        query: queries[i],
        count: parseInt(queries[i + 1])
      })
    }

    return result
  }

  private async getAverageSearchTime(days: number) {
    const totalDuration = await redis.get('search_total_duration') || '0'
    const totalSearches = await redis.get('search_total_count') || '0'
    
    return parseInt(totalSearches) > 0 
      ? Math.round(parseFloat(totalDuration) / parseInt(totalSearches))
      : 0
  }

  private async getTotalSearches(days: number) {
    return parseInt(await redis.get('search_total_count') || '0')
  }

  private async getConversionRate(days: number) {
    const totalSearches = await this.getTotalSearches(days)
    const totalConversions = parseInt(await redis.get('search_total_conversions') || '0')
    
    return totalSearches > 0 ? (totalConversions / totalSearches) * 100 : 0
  }

  private async getCategoryPerformance(days: number) {
    // 카테고리별 검색 성과 분석
    const categories = await query({
      select: { id: true, name: true }
    })

    const performance: any[] = []
    for (const category of categories) {
      const searches = parseInt(await redis.get(`category_searches:${category.id}`) || '0')
      const conversions = parseInt(await redis.get(`category_conversions:${category.id}`) || '0')
      
      performance.push({
        category: category.name,
        searches,
        conversions
      })
    }

    return performance.sort((a, b) => b.searches - a.searches).slice(0, 10)
  }

  private async getLowPerformanceQueries() {
    const queries = await redis.zrevrange('search_frequency', 0, 99, 'WITHSCORES')
    const lowPerformance: string[] = []
    
    for (let i = 0; i < queries.length; i += 2) {
      const query = queries[i]
      const count = parseInt(queries[i + 1])
      
      if (count > 10) { // 최소 10회 이상 검색된 쿼리만
        const analysis = await this.analyzeSearchPerformance(query)
        if (analysis.ctr < 5 || analysis.conversionRate < 1) {
          lowPerformance.push(query)
        }
      }
    }

    return lowPerformance
  }

  private async getSlowQueries() {
    // 응답 시간이 느린 쿼리 찾기
    return await redis.zrevrange('slow_queries', 0, 9)
  }

  private getPerformanceRating(ctr: number, conversionRate: number): 'excellent' | 'good' | 'average' | 'poor' {
    const score = (ctr * 0.6) + (conversionRate * 0.4)
    
    if (score >= 8) return 'excellent'
    if (score >= 5) return 'good'
    if (score >= 2) return 'average'
    return 'poor'
  }

  private parsePeriod(period: string): number {
    switch (period) {
      case '1d': return 1
      case '7d': return 7
      case '30d': return 30
      case '90d': return 90
      default: return 7
    }
  }
}

export const searchAnalyticsService = new SearchAnalyticsService()