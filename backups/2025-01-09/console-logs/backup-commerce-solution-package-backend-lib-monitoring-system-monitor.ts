/**
 * 시스템 모니터링 서비스 - 실시간 성능 추적
 */

import Redis from 'ioredis'
import os from 'os'
import { performance } from 'perf_hooks'

const redis = new Redis(process.env.REDIS_URL!)

export interface SystemMetrics {
  timestamp: number
  server: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    uptime: number
    loadAverage: number[]
  }
  database: {
    connectionCount: number
    queryTime: number
    slowQueries: number
    errorRate: number
  }
  redis: {
    memoryUsage: number
    connectionCount: number
    hitRate: number
    keyspaceHits: number
    keyspaceMisses: number
  }
  application: {
    activeUsers: number
    requestsPerSecond: number
    errorRate: number
    responseTime: number
  }
  business: {
    ordersPerMinute: number
    inventoryAlerts: number
    paymentErrors: number
    searchQps: number
  }
}

export interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info'
  component: string
  message: string
  value: number
  threshold: number
  timestamp: number
  resolved?: boolean
}

export class SystemMonitorService {
  private readonly thresholds = {
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 80, critical: 95 },
    disk: { warning: 85, critical: 95 },
    responseTime: { warning: 1000, critical: 3000 },
    errorRate: { warning: 1, critical: 5 },
    dbQueryTime: { warning: 500, critical: 2000 }
  }

  /**
   * 시스템 메트릭 수집
   */
  async collectMetrics(): Promise<SystemMetrics> {
    const timestamp = Date.now()

    // 서버 메트릭
    const server = await this.getServerMetrics()
    
    // 데이터베이스 메트릭
    const database = await this.getDatabaseMetrics()
    
    // Redis 메트릭
    const redisMetrics = await this.getRedisMetrics()
    
    // 애플리케이션 메트릭
    const application = await this.getApplicationMetrics()
    
    // 비즈니스 메트릭
    const business = await this.getBusinessMetrics()

    const metrics: SystemMetrics = {
      timestamp,
      server,
      database,
      redis: redisMetrics,
      application,
      business
    }

    // 메트릭을 Redis에 저장 (시계열 데이터)
    await this.storeMetrics(metrics)
    
    // 알림 체크
    await this.checkAlerts(metrics)

    return metrics
  }

  /**
   * 서버 메트릭 수집
   */
  private async getServerMetrics() {
    const cpus = os.cpus()
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    
    return {
      cpuUsage: await this.getCpuUsage(),
      memoryUsage: ((totalMemory - freeMemory) / totalMemory) * 100,
      diskUsage: await this.getDiskUsage(),
      uptime: os.uptime(),
      loadAverage: os.loadavg()
    }
  }

  /**
   * 데이터베이스 메트릭 수집
   */
  private async getDatabaseMetrics() {
    const start = performance.now()
    
    try {
      // 간단한 쿼리로 응답 시간 측정
      await prisma.$queryRaw`SELECT 1`
      const queryTime = performance.now() - start

      // 활성 연결 수 (PostgreSQL)
      const connectionResult = await prisma.$queryRaw<[{count: number}]>`
        SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'
      `
      const connectionCount = connectionResult[0]?.count || 0

      // 느린 쿼리 수 (최근 1시간)
      const slowQueryCount = parseInt(await redis.get('db_slow_queries:1h') || '0')
      
      // 에러율 (최근 1시간)
      const totalQueries = parseInt(await redis.get('db_total_queries:1h') || '1')
      const errorQueries = parseInt(await redis.get('db_error_queries:1h') || '0')
      const errorRate = (errorQueries / totalQueries) * 100

      return {
        connectionCount,
        queryTime: Math.round(queryTime),
        slowQueries: slowQueryCount,
        errorRate: Math.round(errorRate * 100) / 100
      }
    } catch (error) {
      return {
        connectionCount: 0,
        queryTime: -1,
        slowQueries: 0,
        errorRate: 100
      }
    }
  }

  /**
   * Redis 메트릭 수집
   */
  private async getRedisMetrics() {
    try {
      const info = await redis.info('memory')
      const stats = await redis.info('stats')
      
      const memoryMatch = info.match(/used_memory:(\d+)/)
      const memoryUsage = memoryMatch ? parseInt(memoryMatch[1]) : 0
      
      const hitsMatch = stats.match(/keyspace_hits:(\d+)/)
      const missesMatch = stats.match(/keyspace_misses:(\d+)/)
      
      const hits = hitsMatch ? parseInt(hitsMatch[1]) : 0
      const misses = missesMatch ? parseInt(missesMatch[1]) : 0
      const hitRate = (hits + misses) > 0 ? (hits / (hits + misses)) * 100 : 0
      
      const connectionsMatch = info.match(/connected_clients:(\d+)/)
      const connections = connectionsMatch ? parseInt(connectionsMatch[1]) : 0

      return {
        memoryUsage: Math.round(memoryUsage / 1024 / 1024), // MB
        connectionCount: connections,
        hitRate: Math.round(hitRate * 100) / 100,
        keyspaceHits: hits,
        keyspaceMisses: misses
      }
    } catch (error) {
      return {
        memoryUsage: 0,
        connectionCount: 0,
        hitRate: 0,
        keyspaceHits: 0,
        keyspaceMisses: 0
      }
    }
  }

  /**
   * 애플리케이션 메트릭 수집
   */
  private async getApplicationMetrics() {
    const now = new Date()
    const minute = now.getMinutes()
    
    const activeUsers = await redis.scard(`active_users:${Math.floor(now.getTime() / 60000)}`)
    const requestsPerSecond = parseInt(await redis.get(`requests_per_second:${minute}`) || '0')
    const errorRate = parseFloat(await redis.get(`app_error_rate:${minute}`) || '0')
    const responseTime = parseFloat(await redis.get(`avg_response_time:${minute}`) || '0')

    return {
      activeUsers,
      requestsPerSecond,
      errorRate,
      responseTime: Math.round(responseTime)
    }
  }

  /**
   * 비즈니스 메트릭 수집
   */
  private async getBusinessMetrics() {
    const now = new Date()
    const minute = Math.floor(now.getTime() / 60000)
    
    const ordersPerMinute = parseInt(await redis.get(`orders:${minute}`) || '0')
    const inventoryAlerts = parseInt(await redis.get('inventory_alerts_count') || '0')
    const paymentErrors = parseInt(await redis.get(`payment_errors:${minute}`) || '0')
    const searchQps = parseFloat(await redis.get(`search_qps:${minute}`) || '0')

    return {
      ordersPerMinute,
      inventoryAlerts,
      paymentErrors,
      searchQps: Math.round(searchQps * 100) / 100
    }
  }

  /**
   * CPU 사용률 계산
   */
  private async getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startMeasure = os.cpus()
      
      setTimeout(() => {
        const endMeasure = os.cpus()
        
        let totalIdle = 0
        let totalTick = 0
        
        for (let i = 0; i < startMeasure.length; i++) {
          const startCpu = startMeasure[i]
          const endCpu = endMeasure[i]
          
          const startTotal = Object.values(startCpu.times).reduce((a, b) => a + b)
          const endTotal = Object.values(endCpu.times).reduce((a, b) => a + b)
          
          const totalDiff = endTotal - startTotal
          const idleDiff = endCpu.times.idle - startCpu.times.idle
          
          totalTick += totalDiff
          totalIdle += idleDiff
        }
        
        const cpuUsage = 100 - (totalIdle / totalTick * 100)
        resolve(Math.round(cpuUsage * 100) / 100)
      }, 100)
    })
  }

  /**
   * 디스크 사용률 계산 (간단한 구현)
   */
  private async getDiskUsage(): Promise<number> {
    try {
      // 실제 구현에서는 statvfs나 df 명령어를 사용
      return 45 // 임시값
    } catch (error) {
      return 0
    }
  }

  /**
   * 메트릭을 시계열 데이터로 저장
   */
  private async storeMetrics(metrics: SystemMetrics) {
    const key = `metrics:${Math.floor(metrics.timestamp / 60000)}` // 분 단위
    
    await redis.hset(key, {
      'server.cpu': metrics.server.cpuUsage,
      'server.memory': metrics.server.memoryUsage,
      'server.disk': metrics.server.diskUsage,
      'db.queryTime': metrics.database.queryTime,
      'db.errorRate': metrics.database.errorRate,
      'redis.hitRate': metrics.redis.hitRate,
      'app.activeUsers': metrics.application.activeUsers,
      'app.responseTime': metrics.application.responseTime,
      'business.ordersPerMinute': metrics.business.ordersPerMinute
    })

    // TTL 설정 (7일)
    await redis.expire(key, 7 * 24 * 60 * 60)
  }

  /**
   * 알림 체크 및 발송
   */
  private async checkAlerts(metrics: SystemMetrics) {
    const alerts: Alert[] = []

    // CPU 알림
    if (metrics.server.cpuUsage >= this.thresholds.cpu.critical) {
      alerts.push(this.createAlert('critical', 'server', 'High CPU Usage', 
        metrics.server.cpuUsage, this.thresholds.cpu.critical))
    } else if (metrics.server.cpuUsage >= this.thresholds.cpu.warning) {
      alerts.push(this.createAlert('warning', 'server', 'Elevated CPU Usage', 
        metrics.server.cpuUsage, this.thresholds.cpu.warning))
    }

    // 메모리 알림
    if (metrics.server.memoryUsage >= this.thresholds.memory.critical) {
      alerts.push(this.createAlert('critical', 'server', 'High Memory Usage', 
        metrics.server.memoryUsage, this.thresholds.memory.critical))
    }

    // 응답시간 알림
    if (metrics.application.responseTime >= this.thresholds.responseTime.critical) {
      alerts.push(this.createAlert('critical', 'application', 'Slow Response Time', 
        metrics.application.responseTime, this.thresholds.responseTime.critical))
    }

    // 데이터베이스 쿼리시간 알림
    if (metrics.database.queryTime >= this.thresholds.dbQueryTime.critical) {
      alerts.push(this.createAlert('critical', 'database', 'Slow Database Queries', 
        metrics.database.queryTime, this.thresholds.dbQueryTime.critical))
    }

    // 에러율 알림
    if (metrics.application.errorRate >= this.thresholds.errorRate.critical) {
      alerts.push(this.createAlert('critical', 'application', 'High Error Rate', 
        metrics.application.errorRate, this.thresholds.errorRate.critical))
    }

    // 알림 저장 및 발송
    for (const alert of alerts) {
      await this.storeAlert(alert)
      await this.sendAlert(alert)
    }
  }

  private createAlert(type: Alert['type'], component: string, message: string, 
                     value: number, threshold: number): Alert {
    return {
      id: `${component}_${Date.now()}_${Math.random()}`,
      type,
      component,
      message,
      value,
      threshold,
      timestamp: Date.now()
    }
  }

  private async storeAlert(alert: Alert) {
    await redis.lpush('system_alerts', JSON.stringify(alert))
    await redis.ltrim('system_alerts', 0, 999) // 최근 1000개만 유지
  }

  private async sendAlert(alert: Alert) {
    // 실제 구현에서는 이메일, 슬랙, 웹훅 등으로 알림 발송
    console.log(`[${alert.type.toUpperCase()}] ${alert.component}: ${alert.message} (${alert.value}/${alert.threshold})`)
    
    // 크리티컬 알림은 즉시 알림
    if (alert.type === 'critical') {
      await this.sendImmediateNotification(alert)
    }
  }

  private async sendImmediateNotification(alert: Alert) {
    // 관리자에게 즉시 알림 발송 (이메일/SMS/슬랙 등)
    // 현재는 로그만 출력
    console.error(`🚨 CRITICAL ALERT: ${alert.message}`)
  }

  /**
   * 메트릭 히스토리 조회
   */
  async getMetricsHistory(hours = 24) {
    const now = Math.floor(Date.now() / 60000)
    const history: any[] = []

    for (let i = hours * 60; i >= 0; i -= 5) { // 5분 간격
      const key = `metrics:${now - i}`
      const metrics = await redis.hgetall(key)
      
      if (Object.keys(metrics).length > 0) {
        history.push({
          timestamp: (now - i) * 60000,
          ...metrics
        })
      }
    }

    return history
  }

  /**
   * 시스템 상태 요약
   */
  async getSystemStatus(): Promise<'healthy' | 'warning' | 'critical'> {
    const metrics = await this.collectMetrics()
    
    // 크리티컬 조건 체크
    if (
      metrics.server.cpuUsage >= this.thresholds.cpu.critical ||
      metrics.server.memoryUsage >= this.thresholds.memory.critical ||
      metrics.application.errorRate >= this.thresholds.errorRate.critical ||
      metrics.application.responseTime >= this.thresholds.responseTime.critical ||
      metrics.database.queryTime >= this.thresholds.dbQueryTime.critical
    ) {
      return 'critical'
    }

    // 경고 조건 체크
    if (
      metrics.server.cpuUsage >= this.thresholds.cpu.warning ||
      metrics.server.memoryUsage >= this.thresholds.memory.warning ||
      metrics.application.errorRate >= this.thresholds.errorRate.warning ||
      metrics.application.responseTime >= this.thresholds.responseTime.warning ||
      metrics.database.queryTime >= this.thresholds.dbQueryTime.warning
    ) {
      return 'warning'
    }

    return 'healthy'
  }
}

export const systemMonitor = new SystemMonitorService()