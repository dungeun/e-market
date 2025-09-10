import Redis from 'ioredis'

// Redis 클라이언트 생성 - REDIS_URL을 우선 사용
const redisUrl = process.env.REDIS_URL
export const redis = redisUrl 
  ? new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      connectionName: 'main-redis-client'
    })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      connectionName: 'main-redis-client'
    })

redis.on('error', (err) => {
  console.warn('Redis connection error:', err.message)
})

redis.on('connect', () => {
  console.log('Redis connected successfully')
})

// 헬스 체크
export async function checkRedisConnection(): Promise<boolean> {
  try {
    await redis.ping()
    return true
  } catch (error) {
    console.warn('Redis health check failed:', error)
    return false
  }
}