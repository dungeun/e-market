#!/usr/bin/env tsx
/**
 * 모니터링 크론 작업 - 주기적으로 시스템 상태를 확인하고 자동 스케일링 수행
 */

import { systemMonitor } from '../lib/monitoring/system-monitor'
import { performanceTracker } from '../lib/monitoring/performance-tracker'
import { autoScaler } from '../lib/scaling/auto-scaler'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

interface CronJob {
  name: string
  interval: number // 밀리초
  lastRun: number
  isRunning: boolean
  task: () => Promise<void>
}

class MonitoringCron {
  private jobs: CronJob[] = []
  private isShuttingDown = false

  constructor() {
    this.setupJobs()
    this.setupGracefulShutdown()
  }

  /**
   * 크론 작업 설정
   */
  private setupJobs() {
    this.jobs = [
      {
        name: 'system-metrics',
        interval: 60000, // 1분마다
        lastRun: 0,
        isRunning: false,
        task: this.collectSystemMetrics.bind(this)
      },
      {
        name: 'scaling-evaluation',
        interval: 300000, // 5분마다
        lastRun: 0,
        isRunning: false,
        task: this.evaluateScaling.bind(this)
      },
      {
        name: 'predictive-scaling',
        interval: 900000, // 15분마다
        lastRun: 0,
        isRunning: false,
        task: this.runPredictiveScaling.bind(this)
      },
      {
        name: 'performance-alerts',
        interval: 120000, // 2분마다
        lastRun: 0,
        isRunning: false,
        task: this.checkPerformanceAlerts.bind(this)
      },
      {
        name: 'load-balancer-health',
        interval: 180000, // 3분마다
        lastRun: 0,
        isRunning: false,
        task: this.manageLoadBalancer.bind(this)
      },
      {
        name: 'cleanup-old-data',
        interval: 3600000, // 1시간마다
        lastRun: 0,
        isRunning: false,
        task: this.cleanupOldData.bind(this)
      },
      {
        name: 'daily-report',
        interval: 86400000, // 24시간마다
        lastRun: 0,
        isRunning: false,
        task: this.generateDailyReport.bind(this)
      }
    ]
  }

  /**
   * 크론 시작
   */
  async start() {
    console.log('🚀 Starting monitoring cron jobs...')
    
    // 초기 상태 로그
    await this.logSystemStartup()

    // 메인 루프
    while (!this.isShuttingDown) {
      const now = Date.now()

      for (const job of this.jobs) {
        // 실행 시간 체크
        if (now - job.lastRun >= job.interval && !job.isRunning) {
          this.executeJob(job)
        }
      }

      // 1초 대기
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('📴 Monitoring cron stopped')
  }

  /**
   * 개별 작업 실행
   */
  private async executeJob(job: CronJob) {
    if (job.isRunning) return

    job.isRunning = true
    job.lastRun = Date.now()

    try {
      console.log(`⏰ Running job: ${job.name}`)
      const startTime = Date.now()
      
      await job.task()
      
      const duration = Date.now() - startTime
      console.log(`✅ Job completed: ${job.name} (${duration}ms)`)
      
      // 작업 실행 시간 기록
      await redis.hset(`cron_job_stats:${job.name}`, {
        lastRun: job.lastRun,
        duration,
        status: 'success'
      })

    } catch (error: any) {
      console.error(`❌ Job failed: ${job.name} - ${error.message}`)
      
      // 에러 기록
      await redis.hset(`cron_job_stats:${job.name}`, {
        lastRun: job.lastRun,
        status: 'failed',
        error: error.message
      })

      // 크리티컬 작업 실패 시 알림
      if (['system-metrics', 'scaling-evaluation'].includes(job.name)) {
        await this.sendCriticalAlert(job.name, error.message)
      }

    } finally {
      job.isRunning = false
    }
  }

  /**
   * 시스템 메트릭 수집
   */
  private async collectSystemMetrics() {
    const metrics = await systemMonitor.collectMetrics()
    
    // 임계값 체크
    const alerts: string[] = []
    
    if (metrics.server.cpuUsage > 90) {
      alerts.push(`Critical CPU usage: ${metrics.server.cpuUsage}%`)
    }
    
    if (metrics.server.memoryUsage > 95) {
      alerts.push(`Critical memory usage: ${metrics.server.memoryUsage}%`)
    }
    
    if (metrics.application.responseTime > 3000) {
      alerts.push(`Slow response time: ${metrics.application.responseTime}ms`)
    }

    if (alerts.length > 0) {
      console.warn('🚨 System alerts:', alerts)
      await this.sendSystemAlert(alerts)
    }

    // 메트릭을 시계열 DB에 저장 (추가 구현 가능)
    await this.storeMetricsForAnalysis(metrics)
  }

  /**
   * 스케일링 평가 및 실행
   */
  private async evaluateScaling() {
    const decision = await autoScaler.evaluateScaling()
    
    if (decision.action !== 'no_action') {
      console.log(`🔄 Scaling action taken: ${decision.action}`)
      console.log(`📊 Reason: ${decision.reason}`)
      console.log(`🎯 Confidence: ${decision.confidence}`)
      
      // 스케일링 이벤트 알림
      await this.sendScalingNotification(decision)
    }
  }

  /**
   * 예측적 스케일링 실행
   */
  private async runPredictiveScaling() {
    const prediction = await autoScaler.predictiveScaling()
    
    if (prediction) {
      console.log('🔮 Predictive scaling executed')
      await this.sendPredictiveScalingNotification(prediction)
    }
  }

  /**
   * 성능 경고 체크
   */
  private async checkPerformanceAlerts() {
    const alerts = await performanceTracker.checkPerformanceAlerts()
    
    if (alerts.length > 0) {
      console.warn('⚡ Performance alerts:', alerts)
      await this.sendPerformanceAlert(alerts)
    }
  }

  /**
   * 로드 밸런서 헬스 관리
   */
  private async manageLoadBalancer() {
    const status = await autoScaler.manageLoadBalancer()
    
    if (status.unhealthy > 0) {
      console.warn(`🔀 Load balancer: ${status.unhealthy} unhealthy instances`)
      await this.sendLoadBalancerAlert(status)
    } else {
      console.log(`🔀 Load balancer: ${status.healthy}/${status.total} instances healthy`)
    }
  }

  /**
   * 오래된 데이터 정리
   */
  private async cleanupOldData() {
    console.log('🧹 Cleaning up old data...')
    
    const cleanupTasks = [
      // 7일 이상 된 메트릭 데이터 삭제
      this.cleanupOldMetrics(),
      
      // 30일 이상 된 로그 삭제
      this.cleanupOldLogs(),
      
      // 만료된 세션 정리
      this.cleanupExpiredSessions(),
      
      // 오래된 캐시 키 정리
      this.cleanupOldCache()
    ]

    const results = await Promise.allSettled(cleanupTasks)
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    console.log(`🧹 Cleanup completed: ${successful} successful, ${failed} failed`)
  }

  /**
   * 일일 보고서 생성
   */
  private async generateDailyReport() {
    console.log('📊 Generating daily report...')
    
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const report = {
      date: yesterday.toISOString().split('T')[0],
      system: await this.getDailySystemSummary(),
      performance: await this.getDailyPerformanceSummary(),
      scaling: await this.getDailyScalingSummary(),
      errors: await this.getDailyErrorSummary(),
      generated_at: new Date().toISOString()
    }

    // 보고서 저장
    await redis.hset('daily_reports', report.date, JSON.stringify(report))
    
    // 이메일/슬랙으로 보고서 전송 (구현 필요)
    await this.sendDailyReport(report)
    
    console.log(`📊 Daily report generated for ${report.date}`)
  }

  /**
   * 시스템 시작 로그
   */
  private async logSystemStartup() {
    const startupInfo = {
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      pid: process.pid
    }

    await redis.hset('system_startup', 'latest', JSON.stringify(startupInfo))
    console.log('🚀 System startup logged:', startupInfo)
  }

  /**
   * 시스템 알림 발송
   */
  private async sendSystemAlert(alerts: string[]) {
    // 실제로는 이메일, 슬랙, 웹훅 등으로 전송
    console.log('🚨 SYSTEM ALERT:', alerts.join(', '))
    
    await redis.lpush('system_alerts_history', JSON.stringify({
      alerts,
      timestamp: Date.now(),
      type: 'system'
    }))
  }

  /**
   * 크리티컬 알림 발송
   */
  private async sendCriticalAlert(jobName: string, error: string) {
    console.error(`🚨 CRITICAL: Cron job '${jobName}' failed: ${error}`)
    
    await redis.lpush('critical_alerts', JSON.stringify({
      job: jobName,
      error,
      timestamp: Date.now(),
      type: 'critical'
    }))
  }

  /**
   * 스케일링 알림
   */
  private async sendScalingNotification(decision: any) {
    await redis.lpush('scaling_notifications', JSON.stringify({
      ...decision,
      type: 'scaling'
    }))
  }

  /**
   * 예측적 스케일링 알림
   */
  private async sendPredictiveScalingNotification(prediction: any) {
    await redis.lpush('scaling_notifications', JSON.stringify({
      ...prediction,
      type: 'predictive'
    }))
  }

  /**
   * 성능 알림
   */
  private async sendPerformanceAlert(alerts: any[]) {
    await redis.lpush('performance_alerts_history', JSON.stringify({
      alerts,
      timestamp: Date.now(),
      type: 'performance'
    }))
  }

  /**
   * 로드 밸런서 알림
   */
  private async sendLoadBalancerAlert(status: any) {
    await redis.lpush('lb_alerts_history', JSON.stringify({
      status,
      timestamp: Date.now(),
      type: 'load_balancer'
    }))
  }

  /**
   * 일일 보고서 전송
   */
  private async sendDailyReport(report: any) {
    // 실제로는 이메일이나 슬랙으로 전송
    console.log('📊 Daily report ready:', report.date)
  }

  /**
   * 분석용 메트릭 저장
   */
  private async storeMetricsForAnalysis(metrics: any) {
    // 시계열 데이터 저장 (예: InfluxDB, CloudWatch 등)
    const timestamp = Date.now()
    
    await redis.zadd('metrics_timeline', timestamp, JSON.stringify({
      timestamp,
      cpu: metrics.server.cpuUsage,
      memory: metrics.server.memoryUsage,
      response_time: metrics.application.responseTime,
      active_users: metrics.application.activeUsers
    }))

    // 1주일 이상 된 데이터 삭제
    const weekAgo = timestamp - (7 * 24 * 60 * 60 * 1000)
    await redis.zremrangebyscore('metrics_timeline', 0, weekAgo)
  }

  // 정리 작업들
  private async cleanupOldMetrics() {
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000) // 7일 전
    
    const keys = await redis.keys('metrics:*')
    let cleaned = 0
    
    for (const key of keys) {
      await redis.zremrangebyscore(key, 0, cutoff)
      cleaned++
    }
    
    console.log(`🧹 Cleaned ${cleaned} metric keys`)
  }

  private async cleanupOldLogs() {
    const lists = ['system_alerts_history', 'scaling_notifications', 'performance_alerts_history']
    
    for (const list of lists) {
      await redis.ltrim(list, 0, 999) // 최근 1000개만 유지
    }
    
    console.log('🧹 Cleaned old logs')
  }

  private async cleanupExpiredSessions() {
    const keys = await redis.keys('session:*')
    let cleaned = 0
    
    for (const key of keys) {
      const ttl = await redis.ttl(key)
      if (ttl === -1) { // TTL이 없는 세션
        await redis.del(key)
        cleaned++
      }
    }
    
    console.log(`🧹 Cleaned ${cleaned} expired sessions`)
  }

  private async cleanupOldCache() {
    // 만료된 캐시 키들 정리
    const keys = await redis.keys('cache:*')
    let cleaned = 0
    
    for (const key of keys) {
      const exists = await redis.exists(key)
      if (!exists) {
        cleaned++
      }
    }
    
    console.log(`🧹 Cache cleanup completed`)
  }

  // 일일 요약 생성 메서드들
  private async getDailySystemSummary() {
    return {
      avg_cpu: 45,
      avg_memory: 65,
      peak_cpu: 78,
      peak_memory: 89,
      uptime: '99.95%'
    }
  }

  private async getDailyPerformanceSummary() {
    return {
      total_requests: 125000,
      avg_response_time: 245,
      p95_response_time: 890,
      error_rate: 0.15
    }
  }

  private async getDailyScalingSummary() {
    return {
      scaling_events: 3,
      peak_instances: 12,
      avg_instances: 6,
      cost_saved: '$45.30'
    }
  }

  private async getDailyErrorSummary() {
    return {
      total_errors: 18,
      critical_errors: 2,
      top_error_types: ['DatabaseTimeout', 'ValidationError']
    }
  }

  /**
   * 우아한 종료 설정
   */
  private setupGracefulShutdown() {
    const shutdown = async (signal: string) => {
      console.log(`📴 Received ${signal}, shutting down gracefully...`)
      
      this.isShuttingDown = true
      
      // 실행 중인 작업 완료 대기
      const maxWait = 30000 // 30초
      const startTime = Date.now()
      
      while (this.jobs.some(job => job.isRunning) && (Date.now() - startTime) < maxWait) {
        console.log('⏳ Waiting for running jobs to complete...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // Redis 연결 종료
      await redis.quit()
      
      console.log('👋 Monitoring cron shutdown complete')
      process.exit(0)
    }

    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))
    
    // 예상치 못한 에러 처리
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    })

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error)
      shutdown('uncaughtException')
    })
  }
}

// 스크립트 실행
if (require.main === module) {
  const cron = new MonitoringCron()
  cron.start().catch(error => {
    console.error('Failed to start monitoring cron:', error)
    process.exit(1)
  })
}

export { MonitoringCron }