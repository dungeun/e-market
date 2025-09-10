import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/config/env';
import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL
const redis = redisUrl
  ? new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      connectionName: 'rate-limiter'
    })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      connectionName: 'rate-limiter'
    })

redis.on('error', (err) => {
  console.warn('Redis connection error (rate-limiter):', err.message)
})

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  message?: string
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  message: 'Too many requests, please try again later.',
}

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  async check(req: NextRequest): Promise<NextResponse | null> {
    const identifier = this.getIdentifier(req)
    const key = `rate_limit:${identifier}`
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    try {
      // Remove old entries
      await redis.zremrangebyscore(key, '-inf', windowStart)

      // Count requests in current window
      const requestCount = await redis.zcard(key)

      if (requestCount >= this.config.maxRequests) {
        return NextResponse.json(
          { error: this.config.message },
          { 
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil(this.config.windowMs / 1000)),
              'X-RateLimit-Limit': String(this.config.maxRequests),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(new Date(now + this.config.windowMs).toISOString()),
            }
          }
        )
      }

      // Add current request
      await redis.zadd(key, now, `${now}-${Math.random()}`)
      await redis.expire(key, Math.ceil(this.config.windowMs / 1000))

      return null // Request allowed
    } catch (error) {

      // Allow request on error to avoid blocking legitimate traffic
      return null
    }
  }

  private getIdentifier(req: NextRequest): string {
    // Try to get user ID from JWT token
    const authHeader = req.headers.get('authorization')
    if (authHeader) {
      // Extract user ID from token if possible
      return `auth:${authHeader.substring(0, 20)}`
    }

    // Fallback to IP address
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown'
    return `ip:${ip}`
  }
}

// Pre-configured rate limiters for different endpoints
export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
})

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
})

export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10, // 10 uploads per minute
  message: 'Upload limit exceeded, please wait.',
})

// Middleware helper
export async function withRateLimit(
  req: NextRequest,
  handler: () => Promise<NextResponse>,
  limiter: RateLimiter = apiRateLimiter
): Promise<NextResponse> {
  const rateLimitResponse = await limiter.check(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  return handler()
}