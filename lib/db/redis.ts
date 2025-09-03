import Redis from 'ioredis';
import logger from '@/lib/utils/logger';

// Redis 클라이언트 인스턴스
let redis: Redis | null = null;

// Redis URL 파싱 또는 개별 설정 사용
function getRedisConfig() {
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl) {
    // Redis URL이 있으면 URL 사용 (Redis Cloud/Upstash)
    // Upstash requires special handling for serverless
    const isUpstash = redisUrl.includes('upstash.io');
    
    if (isUpstash) {
      // Upstash specific configuration
      return {
        ...Redis.parseURL(redisUrl),
        family: 4,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
        connectTimeout: 10000,
        keepAlive: 0,
      };
    }
    
    // Standard Redis URL (Redis Cloud, etc.)
    return redisUrl;
  }
  
  // 개별 환경 변수 사용 (로컬 개발)
  return {
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
}

const REDIS_CONFIG = getRedisConfig();

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
        
        // Don't throw error in production - Redis is optional for caching
        if (process.env.NODE_ENV === 'production') {
          logger.warn('Redis connection failed in production - continuing without cache');
        }
      });

      redis.on('close', () => {
        logger.info('Redis client connection closed');
      });

      redis.on('reconnecting', () => {
        logger.info('Redis client reconnecting...');
      });

      redis.on('ready', () => {
        logger.info('Redis client ready for commands');
      });

    } catch (error) {
      logger.error('Failed to initialize Redis client:', error);
      
      // In production, allow the app to continue without Redis
      if (process.env.NODE_ENV === 'production') {
        logger.warn('Continuing without Redis in production mode');
        return null as any;
      }
      
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