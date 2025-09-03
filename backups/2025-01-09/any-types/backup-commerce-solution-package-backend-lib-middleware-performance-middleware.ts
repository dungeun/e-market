/**
 * 성능 추적 미들웨어 - 모든 API 요청의 성능을 자동으로 추적
 */

import { NextRequest, NextResponse } from 'next/server'
import { performanceTracker } from '../monitoring/performance-tracker'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

interface RequestContext {
  startTime: number
  metricId: string
  endpoint: string
  method: string
  userId?: string
  sessionId?: string
}

// 요청별 컨텍스트 저장
const requestContexts = new Map<string, RequestContext>()

/**
 * 성능 추적 미들웨어
 */
export class PerformanceMiddleware {
  
  /**
   * 요청 시작 시 호출
   */
  static async onRequestStart(request: NextRequest): Promise<string> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const endpoint = this.normalizeEndpoint(request.nextUrl.pathname)
    const method = request.method
    
    // 성능 메트릭 시작
    const metricId = performanceTracker.startMetric(`api_${endpoint}_${method.toLowerCase()}`, {
      endpoint,
      method,
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    // 컨텍스트 저장
    const context: RequestContext = {
      startTime: Date.now(),
      metricId,
      endpoint,
      method
    }

    // 사용자 정보 추가 (가능한 경우)
    const userId = request.headers.get('x-user-id')
    const sessionId = request.cookies.get('next-auth.session-token')?.value || 
                     request.headers.get('x-session-id')
    
    if (userId) context.userId = userId
    if (sessionId) context.sessionId = sessionId

    requestContexts.set(requestId, context)

    // 동시 요청 수 증가
    await this.trackConcurrentRequest(endpoint, 'start')
    
    // 활성 사용자 추적
    if (userId || sessionId) {
      const identifier = userId || sessionId || ''
      if (identifier && identifier !== '') {
        const minute = Math.floor(Date.now() / 60000)
        await redis.sadd(`active_users:${minute}`, identifier)
        await redis.expire(`active_users:${minute}`, 300) // 5분
      }
    }

    return requestId
  }

  /**
   * 요청 완료 시 호출
   */
  static async onRequestEnd(requestId: string, response: NextResponse, error?: Error): Promise<void> {
    const context = requestContexts.get(requestId)
    if (!context) return

    requestContexts.delete(requestId)

    const duration = Date.now() - context.startTime
    const statusCode = response?.status || (error ? 500 : 200)
    const success = statusCode < 400 && !error

    // 성능 메트릭 종료
    await performanceTracker.endMetric(context.metricId, {
      endpoint: context.endpoint,
      method: context.method,
      status: statusCode.toString(),
      success: success.toString()
    }, {
      success,
      statusCode,
      duration,
      error: error?.message
    })

    // 추가 메트릭 수집
    await Promise.all([
      this.trackConcurrentRequest(context.endpoint, 'end'),
      this.updateResponseTimeStats(context.endpoint, duration),
      this.updateErrorStats(context.endpoint, success),
      this.updateThroughputStats(context.endpoint)
    ])

    // 느린 요청 추적
    if (duration > 2000) {
      await this.trackSlowRequest(context, duration, error?.message)
    }

    // 에러 추적
    if (error) {
      await this.trackError(context, error, statusCode)
    }
  }

  /**
   * 엔드포인트 정규화
   */
  private static normalizeEndpoint(pathname: string): string {
    // 동적 경로를 정규화 (예: /api/products/123 -> /api/products/[id])
    return pathname
      .replace(/\/\d+/g, '/[id]')
      .replace(/\/[a-f0-9-]{36}/g, '/[uuid]')
      .replace(/\/[a-f0-9]{24}/g, '/[objectid]')
      .replace(/\?.*$/, '') // 쿼리 파라미터 제거
      .toLowerCase()
  }

  /**
   * 동시 요청 수 추적
   */
  private static async trackConcurrentRequest(endpoint: string, action: 'start' | 'end'): Promise<void> {
    const key = `concurrent_requests:${endpoint}`
    
    if (action === 'start') {
      await redis.incr(key)
      await redis.expire(key, 300) // 5분
    } else {
      await redis.decr(key)
    }
  }

  /**
   * 응답 시간 통계 업데이트
   */
  private static async updateResponseTimeStats(endpoint: string, duration: number): Promise<void> {
    const minute = Math.floor(Date.now() / 60000)
    const key = `response_time:${endpoint}:${minute}`
    
    await Promise.all([
      redis.lpush(`${key}:durations`, duration),
      redis.ltrim(`${key}:durations`, 0, 999), // 최근 1000개만 유지
      redis.hincrbyfloat(`${key}:stats`, 'total', duration),
      redis.hincrby(`${key}:stats`, 'count', 1),
      redis.expire(`${key}:durations`, 3600), // 1시간
      redis.expire(`${key}:stats`, 3600)
    ])

    // 전역 통계도 업데이트
    await redis.hincrbyfloat(`avg_response_time:${minute}`, 'total', duration)
    await redis.hincrby(`avg_response_time:${minute}`, 'count', 1)
    await redis.expire(`avg_response_time:${minute}`, 3600)
  }

  /**
   * 에러 통계 업데이트
   */
  private static async updateErrorStats(endpoint: string, success: boolean): Promise<void> {
    const minute = Math.floor(Date.now() / 60000)
    
    // 엔드포인트별 통계
    await redis.hincrby(`error_stats:${endpoint}:${minute}`, 'total', 1)
    if (!success) {
      await redis.hincrby(`error_stats:${endpoint}:${minute}`, 'errors', 1)
    }
    await redis.expire(`error_stats:${endpoint}:${minute}`, 3600)

    // 전역 통계
    await redis.hincrby(`app_error_rate:${minute}`, 'total', 1)
    if (!success) {
      await redis.hincrby(`app_error_rate:${minute}`, 'errors', 1)
    }
    await redis.expire(`app_error_rate:${minute}`, 3600)
  }

  /**
   * 처리량 통계 업데이트
   */
  private static async updateThroughputStats(endpoint: string): Promise<void> {
    const second = Math.floor(Date.now() / 1000)
    const minute = Math.floor(Date.now() / 60000)
    
    // 초당 요청 수
    await redis.incr(`requests_per_second:${second}`)
    await redis.expire(`requests_per_second:${second}`, 120)
    
    // 분당 요청 수
    await redis.incr(`requests_per_minute:${minute}`)
    await redis.expire(`requests_per_minute:${minute}`, 3600)
    
    // 엔드포인트별 처리량
    await redis.incr(`throughput:${endpoint}:${minute}`)
    await redis.expire(`throughput:${endpoint}:${minute}`, 3600)
  }

  /**
   * 느린 요청 추적
   */
  private static async trackSlowRequest(context: RequestContext, duration: number, error?: string): Promise<void> {
    const slowRequest = {
      endpoint: context.endpoint,
      method: context.method,
      duration,
      timestamp: Date.now(),
      userId: context.userId,
      sessionId: context.sessionId,
      error
    }

    // 느린 쿼리 목록에 추가
    await redis.zadd('slow_requests', duration, JSON.stringify(slowRequest))
    
    // 최근 1000개만 유지
    await redis.zremrangebyrank('slow_requests', 0, -1001)

  }

  /**
   * 에러 추적
   */
  private static async trackError(context: RequestContext, error: Error, statusCode: number): Promise<void> {
    const errorData = {
      endpoint: context.endpoint,
      method: context.method,
      error: error.message,
      stack: error.stack,
      statusCode,
      timestamp: Date.now(),
      userId: context.userId,
      sessionId: context.sessionId
    }

    // 에러 로그에 추가
    await redis.lpush('api_errors', JSON.stringify(errorData))
    await redis.ltrim('api_errors', 0, 999) // 최근 1000개만 유지

    // 에러 타입별 카운트
    const errorType = error.name || 'UnknownError'
    await redis.zincrby('error_types', 1, errorType)

  }

  /**
   * 실시간 메트릭 스냅샷
   */
  static async getRealTimeMetrics(): Promise<any> {
    const now = Math.floor(Date.now() / 1000)
    const minute = Math.floor(Date.now() / 60000)

    const [
      currentRps,
      activeEndpoints,
      errorRate,
      topSlowRequests,
      recentErrors
    ] = await Promise.all([
      redis.get(`requests_per_second:${now}`),
      redis.keys('concurrent_requests:*'),
      this.calculateCurrentErrorRate(),
      redis.zrevrange('slow_requests', 0, 4, 'WITHSCORES'),
      redis.lrange('api_errors', 0, 4)
    ])

    // 활성 엔드포인트별 동시 요청 수
    const endpointConcurrency: Record<string, number> = {}
    for (const key of activeEndpoints) {
      const endpoint = key.replace('concurrent_requests:', '')
      const count = await redis.get(key) || '0'
      if (parseInt(count) > 0) {
        endpointConcurrency[endpoint] = parseInt(count)
      }
    }

    return {
      requests_per_second: parseInt(currentRps || '0'),
      endpoint_concurrency: endpointConcurrency,
      error_rate: errorRate,
      slow_requests: this.parseSlowRequests(topSlowRequests),
      recent_errors: recentErrors.map(error => JSON.parse(error)),
      timestamp: Date.now()
    }
  }

  /**
   * 현재 에러율 계산
   */
  private static async calculateCurrentErrorRate(): Promise<number> {
    const minute = Math.floor(Date.now() / 60000)
    const stats = await redis.hmget(`app_error_rate:${minute}`, 'total', 'errors')
    
    const total = parseInt(stats[0] || '0')
    const errors = parseInt(stats[1] || '0')
    
    return total > 0 ? (errors / total) * 100 : 0
  }

  /**
   * 느린 요청 데이터 파싱
   */
  private static parseSlowRequests(data: string[]): any[] {
    const requests: any[] = []
    for (let i = 0; i < data.length; i += 2) {
      try {
        const request = JSON.parse(data[i])
        const score = data[i + 1]
        requests.push({ ...request, score: parseFloat(score) })
      } catch (error) {
        // 파싱 에러 무시
      }
    }
    return requests
  }

  /**
   * 헬스 체크 엔드포인트용 간단 메트릭
   */
  static async getHealthMetrics(): Promise<any> {
    const minute = Math.floor(Date.now() / 60000)
    
    const [rpmData, errorData] = await Promise.all([
      redis.get(`requests_per_minute:${minute}`),
      redis.hmget(`app_error_rate:${minute}`, 'total', 'errors')
    ])

    const rpm = parseInt(rpmData || '0')
    const total = parseInt(errorData[0] || '0')
    const errors = parseInt(errorData[1] || '0')
    const errorRate = total > 0 ? (errors / total) * 100 : 0

    // 간단한 건강 상태 판정
    let status = 'healthy'
    if (errorRate > 10 || rpm > 10000) {
      status = 'degraded'
    }
    if (errorRate > 25 || rpm > 20000) {
      status = 'unhealthy'
    }

    return {
      status,
      requests_per_minute: rpm,
      error_rate: Math.round(errorRate * 100) / 100,
      timestamp: Date.now()
    }
  }
}

/**
 * Next.js 미들웨어에서 사용할 래퍼
 */
export function withPerformanceTracking(handler: Function) {
  return async (request: NextRequest) => {
    const requestId = await PerformanceMiddleware.onRequestStart(request)
    let response: NextResponse
    let error: Error | undefined

    try {
      response = await handler(request)
    } catch (err) {
      error = err as Error
      response = NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      )
    }

    await PerformanceMiddleware.onRequestEnd(requestId, response, error)
    
    return response
  }
}