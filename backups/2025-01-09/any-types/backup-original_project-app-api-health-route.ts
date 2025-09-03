/**
 * 헬스 체크 API - 시스템 상태 모니터링용
 */

import { NextRequest, NextResponse } from 'next/server'
import { systemMonitor } from '@/lib/monitoring/system-monitor'
import { PerformanceMiddleware } from '@/lib/middleware/performance-middleware'
import { prisma } from "@/lib/db"
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // 기본 헬스 체크
    const healthPromises = [
      checkDatabase(),
      checkRedis(),
      checkSystem(),
      PerformanceMiddleware.getHealthMetrics()
    ]

    const [db, redisHealth, system, performance] = await Promise.allSettled(healthPromises)

    // 각 서비스 상태 확인
    const services = {
      database: getServiceStatus(db),
      redis: getServiceStatus(redisHealth),
      system: getServiceStatus(system),
      performance: performance.status === 'fulfilled' ? performance.value : { status: 'unhealthy', error: 'Failed to get metrics' }
    }

    // 전체 상태 결정
    const overallStatus = determineOverallStatus(services)
    
    // 응답 시간 계산
    const responseTime = Date.now() - startTime

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime,
      services,
      version: process.env.APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }

    // 상태에 따라 HTTP 상태 코드 설정
    const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503

    return NextResponse.json(healthData, { status: httpStatus })

  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      error: error.message,
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }, { status: 503 })
  }
}

// 상세 헬스 체크 (관리자용)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { detailed = false } = body

    if (!detailed) {
      // 간단한 헬스 체크로 리다이렉트
      return GET(request)
    }

    const startTime = Date.now()

    // 상세 헬스 체크 실행
    const [
      systemMetrics,
      databaseDetails,
      redisDetails,
      performanceMetrics,
      scalingStatus
    ] = await Promise.allSettled([
      systemMonitor.collectMetrics(),
      getDetailedDatabaseHealth(),
      getDetailedRedisHealth(),
      PerformanceMiddleware.getRealTimeMetrics(),
      checkScalingHealth()
    ])

    const detailedHealth = {
      status: 'healthy', // 기본값, 아래에서 재평가
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      system: getServiceData(systemMetrics),
      database: getServiceData(databaseDetails),
      redis: getServiceData(redisDetails),
      performance: getServiceData(performanceMetrics),
      scaling: getServiceData(scalingStatus),
      version: process.env.APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }

    // 전체 상태 재평가
    const services = {
      system: detailedHealth.system,
      database: detailedHealth.database,
      redis: detailedHealth.redis,
      performance: detailedHealth.performance,
      scaling: detailedHealth.scaling
    }

    detailedHealth.status = determineOverallStatus(services)

    const httpStatus = detailedHealth.status === 'healthy' ? 200 : 
                      detailedHealth.status === 'degraded' ? 200 : 503

    return NextResponse.json(detailedHealth, { status: httpStatus })

  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }, { status: 503 })
  }
}

/**
 * 데이터베이스 헬스 체크
 */
async function checkDatabase(): Promise<any> {
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const responseTime = Date.now() - start

    return {
      status: 'healthy',
      responseTime,
      connection: 'active'
    }
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message,
      connection: 'failed'
    }
  }
}

/**
 * Redis 헬스 체크
 */
async function checkRedis(): Promise<any> {
  try {
    const start = Date.now()
    await redis.ping()
    const responseTime = Date.now() - start

    return {
      status: 'healthy',
      responseTime,
      connection: 'active'
    }
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message,
      connection: 'failed'
    }
  }
}

/**
 * 시스템 헬스 체크
 */
async function checkSystem(): Promise<any> {
  try {
    const status = await systemMonitor.getSystemStatus()
    
    return {
      status: status === 'healthy' ? 'healthy' : 
             status === 'warning' ? 'degraded' : 'unhealthy',
      systemStatus: status
    }
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message
    }
  }
}

/**
 * 상세 데이터베이스 헬스 체크
 */
async function getDetailedDatabaseHealth(): Promise<any> {
  try {
    const start = Date.now()
    
    // 기본 연결 테스트
    await prisma.$queryRaw`SELECT 1`
    const basicResponseTime = Date.now() - start

    // 추가 메트릭
    const [connectionResult, versionResult] = await Promise.all([
      prisma.$queryRaw<[{count: number}]>`
        SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'
      `,
      prisma.$queryRaw<[{version: string}]>`SELECT version()`
    ])

    const activeConnections = connectionResult[0]?.count || 0
    const version = versionResult[0]?.version || 'unknown'

    // 테이블 카운트 (샘플)
    const userCount = await query()
    const productCount = await query()

    return {
      status: 'healthy',
      responseTime: basicResponseTime,
      activeConnections,
      version: version.split(' ')[0], // PostgreSQL 버전만 추출
      tables: {
        users: userCount,
        products: productCount
      },
      connection: 'active'
    }
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message,
      connection: 'failed'
    }
  }
}

/**
 * 상세 Redis 헬스 체크
 */
async function getDetailedRedisHealth(): Promise<any> {
  try {
    const start = Date.now()
    
    // 기본 ping 테스트
    await redis.ping()
    const responseTime = Date.now() - start

    // Redis 정보 수집
    const info = await redis.info()
    const memoryInfo = await redis.info('memory')
    
    // 메모리 사용량 파싱
    const usedMemoryMatch = memoryInfo.match(/used_memory:(\d+)/)
    const usedMemory = usedMemoryMatch ? parseInt(usedMemoryMatch[1]) : 0

    // 연결된 클라이언트 수
    const clientsMatch = info.match(/connected_clients:(\d+)/)
    const connectedClients = clientsMatch ? parseInt(clientsMatch[1]) : 0

    // Redis 버전
    const versionMatch = info.match(/redis_version:([^\r\n]+)/)
    const version = versionMatch ? versionMatch[1] : 'unknown'

    return {
      status: 'healthy',
      responseTime,
      memoryUsed: Math.round(usedMemory / 1024 / 1024), // MB
      connectedClients,
      version,
      connection: 'active'
    }
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message,
      connection: 'failed'
    }
  }
}

/**
 * 스케일링 헬스 체크
 */
async function checkScalingHealth(): Promise<any> {
  try {
    // 현재 인스턴스 수 확인
    const activeInstances = await redis.scard('lb_active_instances')
    const maxInstances = 50 // config에서 가져와야 함
    const minInstances = 2

    let status = 'healthy'
    if (activeInstances <= minInstances) {
      status = 'degraded'
    }
    if (activeInstances === 0) {
      status = 'unhealthy'
    }

    return {
      status,
      activeInstances,
      minInstances,
      maxInstances,
      utilizationPercentage: Math.round((activeInstances / maxInstances) * 100)
    }
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message
    }
  }
}

/**
 * Promise.allSettled 결과에서 서비스 상태 추출
 */
function getServiceStatus(result: PromiseSettledResult<any>): any {
  if (result.status === 'fulfilled') {
    return result.value
  } else {
    return {
      status: 'unhealthy',
      error: result.reason?.message || 'Unknown error'
    }
  }
}

/**
 * Promise.allSettled 결과에서 서비스 데이터 추출
 */
function getServiceData(result: PromiseSettledResult<any>): any {
  return getServiceStatus(result)
}

/**
 * 전체 시스템 상태 결정
 */
function determineOverallStatus(services: Record<string, any>): 'healthy' | 'degraded' | 'unhealthy' {
  const statuses = Object.values(services).map(service => service.status)
  
  if (statuses.includes('unhealthy')) {
    return 'unhealthy'
  }
  
  if (statuses.includes('degraded')) {
    return 'degraded'
  }
  
  return 'healthy'
}