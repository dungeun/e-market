import Redis from 'ioredis'
import { env } from '@/lib/config/env';

// Redis 클라이언트 생성
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000,
})

redis.on('error', (err) => {

})

redis.on('connect', () => {

})

// 헬스 체크
export async function checkRedisConnection(): Promise<boolean> {
  try {
    await redis.ping()
    return true
  } catch (error) {

    return false
  }
}