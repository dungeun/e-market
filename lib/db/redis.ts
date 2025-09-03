import Redis from 'ioredis';
import logger from '@/lib/utils/logger';

// Redis 클라이언트 인스턴스
let redis: Redis | null = null;

// Redis 설정
const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
};

/**
 * Redis 클라이언트 초기화
 */
export function initRedis(): Redis {
  if (!redis) {
    try {
      redis = new Redis(REDIS_CONFIG);

      redis.on('connect', () => {
        logger.info('Redis client connected');
      });

      redis.on('error', (error) => {
        logger.error('Redis client error:', error);
      });

      redis.on('close', () => {
        logger.info('Redis client connection closed');
      });

      redis.on('reconnecting', () => {
        logger.info('Redis client reconnecting...');
      });

    } catch (error) {
      logger.error('Failed to initialize Redis client:', error);
      throw error;
    }
  }

  return redis;
}

/**
 * Redis 클라이언트 가져오기
 */
export function getRedis(): Redis {
  if (!redis) {
    return initRedis();
  }
  return redis;
}

/**
 * Redis 연결 닫기
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    logger.info('Redis connection closed');
  }
}

// 기본 내보내기
export default getRedis();