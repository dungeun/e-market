import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
export interface UserTier {
    name: string;
    points: number;
    duration: number;
    description: string;
}
export interface RateLimitMetrics {
    totalRequests: number;
    blockedRequests: number;
    activeUsers: number;
    topAbusers: Array<{
        key: string;
        requests: number;
    }>;
}
export declare const USER_TIERS: Record<string, UserTier>;
declare const rateLimiters: {
    api: RateLimiterRedis | RateLimiterMemory;
    auth: RateLimiterRedis | RateLimiterMemory;
    payment: RateLimiterRedis | RateLimiterMemory;
    search: RateLimiterRedis | RateLimiterMemory;
};
/**
 * Dynamic rate limiting based on user tier
 */
export declare const dynamicRateLimiter: (limiterType?: keyof typeof rateLimiters) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Legacy rate limiting middleware (for backwards compatibility)
 */
export declare const rateLimiter: (limiterType?: keyof typeof rateLimiters) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Track failed requests for DDoS protection
 */
export declare const trackFailedRequest: (req: Request) => Promise<void>;
/**
 * Adaptive rate limiting based on user behavior
 */
export declare const adaptiveRateLimiter: () => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Log request for behavior analysis
 */
export declare const logRequestBehavior: (req: Request) => Promise<void>;
/**
 * Blacklist check middleware
 */
export declare const blacklistCheck: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Get rate limiting metrics for monitoring
 */
export declare const getRateLimitMetrics: () => Promise<RateLimitMetrics>;
/**
 * Reset rate limits for a specific key
 */
export declare const resetRateLimit: (key: string) => Promise<void>;
/**
 * Update user tier for rate limiting
 */
export declare const updateUserTier: (userId: string, tier: keyof typeof USER_TIERS) => Promise<void>;
/**
 * Get rate limit status for a key
 */
export declare const getRateLimitStatus: (key: string) => Promise<any>;
/**
 * Whitelist middleware - bypass rate limits for trusted sources
 */
export declare const whitelistMiddleware: (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Enhanced adaptive rate limiting with machine learning-like behavior pattern detection
 */
export declare const smartAdaptiveRateLimiter: () => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=rateLimiter.d.ts.map