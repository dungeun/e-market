import type { User, RequestContext } from '@/lib/types/common';
/**
 * 성능 추적 서비스 - 동시접속 1만명 지원을 위한 성능 모니터링
 */

import Redis from 'ioredis'
import { performance } from 'perf_hooks'

const redis = new Redis(process.env.REDIS_URL!)

export interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
  tags?: Record<string, string>
  metadata?: any
}

export interface LoadTestResult {
  concurrentUsers: number
  duration: number
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  requestsPerSecond: number
  errors: Array<{
    type: string
    count: number
    percentage: number
  }>
}

export class PerformanceTracker {
  private activeRequests = new Map<string, number>()

  /**
   * 성능 메트릭 시작
   */
  startMetric(name: string, tags?: Record<string, string>): string {
    const id = `${name}_${Date.now()}_${Math.random()}`
    this.activeRequests.set(id, performance.now())
    
    // 동시 요청 수 추적
    redis.incr(`concurrent_requests:${name}`)
    redis.expire(`concurrent_requests:${name}`, 300) // 5분
    
    return id
  }

  /**
   * 성능 메트릭 종료 및 기록
   */
  async endMetric(id: string, tags?: Record<string, string>, metadata?: unknown): Promise<PerformanceMetric | null> {
    const startTime = this.activeRequests.get(id)
    if (!startTime) return null

    const duration = performance.now() - startTime
    this.activeRequests.delete(id)

    const [name] = id.split('_')
    const metric: PerformanceMetric = {
      name,
      duration: Math.round(duration * 100) / 100,
      timestamp: Date.now(),
      tags,
      metadata
    }

    // 메트릭 저장
    await this.storeMetric(metric)
    
    // 동시 요청 수 감소
    redis.decr(`concurrent_requests:${name}`)

    return metric
  }

  /**
   * 간편한 성능 측정 데코레이터
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const id = this.startMetric(name, tags)
    try {
      const result = await fn()
      await this.endMetric(id, tags, { success: true })
      return result
    } catch (error) {
      await this.endMetric(id, tags, { success: false, error: error instanceof Error ? error.message : String(error) })
      throw error
    }
  }

  /**
   * 부하 테스트 시뮬레이션
   */
  async simulateLoad(config: {
    endpoint: string
    concurrentUsers: number
    duration: number // 초
    rampUpTime?: number // 점진적 증가 시간
  }): Promise<LoadTestResult> {
    const results: number[] = []
    const errors: Array<{ type: string; timestamp: number }> = []
    const startTime = Date.now()

    // 동시 요청 실행
    const promises: unknown[] = []
    for (let i = 0; i < config.concurrentUsers; i++) {
      const promise = this.runLoadTestWorker({
        endpoint: config.endpoint,
        duration: config.duration,
        workerId: i,
        delay: config.rampUpTime ? (config.rampUpTime * 1000 * i) / config.concurrentUsers : 0
      })
      promises.push(promise)
    }

    const workerResults = await Promise.all(promises)

    // 결과 집계
    let totalRequests = 0
    let successfulRequests = 0
    let failedRequests = 0
    const allResponseTimes: number[] = []

    workerResults.forEach(result => {
      totalRequests += result.requests
      successfulRequests += result.successful
      failedRequests += result.failed
      allResponseTimes.push(...result.responseTimes)
      errors.push(...result.errors)
    })

    // 통계 계산
    allResponseTimes.sort((a, b) => a - b)
    const averageResponseTime = allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length
    const p95Index = Math.floor(allResponseTimes.length * 0.95)
    const p99Index = Math.floor(allResponseTimes.length * 0.99)
    const p95ResponseTime = allResponseTimes[p95Index] || 0
    const p99ResponseTime = allResponseTimes[p99Index] || 0

    const actualDuration = (Date.now() - startTime) / 1000
    const requestsPerSecond = totalRequests / actualDuration

    // 에러 집계
    const errorSummary = errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const errorArray = Object.entries(errorSummary).map(([type, count]) => ({
      type,
      count,
      percentage: (count / totalRequests) * 100
    }))

    const result: LoadTestResult = {
      concurrentUsers: config.concurrentUsers,
      duration: Math.round(actualDuration * 100) / 100,
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      p95ResponseTime: Math.round(p95ResponseTime * 100) / 100,
      p99ResponseTime: Math.round(p99ResponseTime * 100) / 100,
      requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
      errors: errorArray
    }

    // 부하 테스트 결과 저장
    await this.storeLoadTestResult(result)

    return result
  }

  /**
   * 부하 테스트 워커
   */
  private async runLoadTestWorker(config: {
    endpoint: string
    duration: number
    workerId: number
    delay: number
  }) {
    // 점진적 증가를 위한 지연
    if (config.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, config.delay))
    }

    const results = {
      requests: 0,
      successful: 0,
      failed: 0,
      responseTimes: [] as number[],
      errors: [] as Array<{ type: string; timestamp: number }>
    }

    const endTime = Date.now() + (config.duration * 1000)

    while (Date.now() < endTime) {
      const requestStart = performance.now()
      
      try {
        // 실제 HTTP 요청 대신 Redis 작업으로 시뮬레이션
        await this.simulateRequest(config.endpoint, config.workerId)
        
        const responseTime = performance.now() - requestStart
        results.responseTimes.push(responseTime)
        results.successful++
      } catch (error) {
        const responseTime = performance.now() - requestStart
        results.responseTimes.push(responseTime)
        results.failed++
        results.errors.push({
          type: error instanceof Error ? error.message : 'Unknown Error',
          timestamp: Date.now()
        })
      }

      results.requests++

      // 적절한 간격으로 요청 (너무 빠르지 않게)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
    }

    return results
  }

  /**
   * 요청 시뮬레이션
   */
  private async simulateRequest(endpoint: string, workerId: number) {
    // 실제 애플리케이션 로직을 시뮬레이션
    const operations: unknown[] = []

    // Redis 작업
    operations.push(redis.get(`user:${workerId}`))
    operations.push(redis.hget('session', `session_${workerId}`))
    
    // 상품 검색 시뮬레이션
    if (endpoint.includes('/search')) {
      operations.push(redis.zrevrange('products', 0, 19))
      operations.push(redis.incr('search_count'))
    }

    // 주문 시뮬레이션
    if (endpoint.includes('/order')) {
      operations.push(redis.hincrby('order_stats', 'total', 1))
      operations.push(redis.setex(`order:${workerId}:${Date.now()}`, 3600, JSON.stringify({
        userId: workerId,
        amount: Math.floor(Math.random() * 100000),
        items: Math.floor(Math.random() * 5) + 1
      })))
    }

    await Promise.all(operations)

    // 랜덤 지연 (실제 처리 시간 시뮬레이션)
    const processingTime = Math.random() * 200 + 50 // 50-250ms
    await new Promise(resolve => setTimeout(resolve, processingTime))

    // 5% 확률로 에러 발생
    if (Math.random() < 0.05) {
      throw new Error('Simulated Error')
    }
  }

  /**
   * 메트릭 저장
   */
  private async storeMetric(metric: PerformanceMetric) {
    const key = `metrics:${metric.name}`
    const timestamp = Math.floor(metric.timestamp / 60000) // 분 단위

    // 시계열 데이터로 저장
    await redis.zadd(`${key}:timeline`, metric.timestamp, JSON.stringify({
      duration: metric.duration,
      tags: metric.tags,
      metadata: metric.metadata
    }))

    // 최근 1시간 데이터만 유지
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    await redis.zremrangebyscore(`${key}:timeline`, 0, oneHourAgo)

    // 통계 업데이트
    await redis.lpush(`${key}:durations`, metric.duration)
    await redis.ltrim(`${key}:durations`, 0, 999) // 최근 1000개만 유지

    // 분 단위 집계
    const minuteKey = `${key}:minute:${timestamp}`
    await redis.hincrby(minuteKey, 'count', 1)
    await redis.hincrbyfloat(minuteKey, 'total_duration', metric.duration)
    await redis.expire(minuteKey, 24 * 60 * 60) // 24시간 보관
  }

  /**
   * 부하 테스트 결과 저장
   */
  private async storeLoadTestResult(result: LoadTestResult) {
    const key = `load_test:${Date.now()}`
    await redis.hset(key, {
      'concurrent_users': result.concurrentUsers,
      'duration': result.duration,
      'total_requests': result.totalRequests,
      'successful_requests': result.successfulRequests,
      'failed_requests': result.failedRequests,
      'avg_response_time': result.averageResponseTime,
      'p95_response_time': result.p95ResponseTime,
      'p99_response_time': result.p99ResponseTime,
      'requests_per_second': result.requestsPerSecond,
      'errors': JSON.stringify(result.errors)
    })

    await redis.expire(key, 30 * 24 * 60 * 60) // 30일 보관
  }

  /**
   * 성능 통계 조회
   */
  async getPerformanceStats(metricName: string, period = '1h') {
    const key = `metrics:${metricName}`
    const durations = await redis.lrange(`${key}:durations`, 0, -1)
    
    if (durations.length === 0) {
      return null
    }

    const times = durations.map(d => parseFloat(d)).sort((a, b) => a - b)
    const avg = times.reduce((a, b) => a + b, 0) / times.length
    const min = times[0]
    const max = times[times.length - 1]
    const p50 = times[Math.floor(times.length * 0.5)]
    const p95 = times[Math.floor(times.length * 0.95)]
    const p99 = times[Math.floor(times.length * 0.99)]

    return {
      count: times.length,
      avg: Math.round(avg * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      p50: Math.round(p50 * 100) / 100,
      p95: Math.round(p95 * 100) / 100,
      p99: Math.round(p99 * 100) / 100
    }
  }

  /**
   * 동시 접속자 수 추적
   */
  async trackConcurrentUsers() {
    const now = Math.floor(Date.now() / 1000)
    const activeUsers = await redis.scard(`active_users:${now}`)
    
    // 1분 단위로 추적
    const minuteKey = Math.floor(now / 60)
    await redis.hset(`concurrent_users:${minuteKey}`, 'count', activeUsers)
    await redis.expire(`concurrent_users:${minuteKey}`, 24 * 60 * 60)

    return activeUsers
  }

  /**
   * 성능 경고 체크
   */
  async checkPerformanceAlerts() {
    const alerts: unknown[] = []

    // 응답시간 체크
    const responseTimeStats = await this.getPerformanceStats('api_response_time')
    if (responseTimeStats && responseTimeStats.p95 > 2000) {
      alerts.push({
        type: 'performance',
        severity: responseTimeStats.p95 > 5000 ? 'critical' : 'warning',
        message: `API 응답시간이 느립니다. P95: ${responseTimeStats.p95}ms`,
        metric: 'response_time',
        value: responseTimeStats.p95
      })
    }

    // 동시 접속자 수 체크
    const concurrentUsers = await this.trackConcurrentUsers()
    if (concurrentUsers > 8000) {
      alerts.push({
        type: 'capacity',
        severity: concurrentUsers > 9500 ? 'critical' : 'warning',
        message: `높은 동시 접속자 수: ${concurrentUsers}명`,
        metric: 'concurrent_users',
        value: concurrentUsers
      })
    }

    return alerts
  }

  /**
   * 성능 대시보드 데이터
   */
  async getDashboardData() {
    const [
      apiStats,
      searchStats,
      orderStats,
      concurrentUsers
    ] = await Promise.all([
      this.getPerformanceStats('api_response_time'),
      this.getPerformanceStats('search_query'),
      this.getPerformanceStats('order_processing'),
      this.trackConcurrentUsers()
    ])

    return {
      api: apiStats,
      search: searchStats,
      orders: orderStats,
      concurrent_users: concurrentUsers,
      last_updated: new Date().toISOString()
    }
  }
}

export const performanceTracker = new PerformanceTracker()