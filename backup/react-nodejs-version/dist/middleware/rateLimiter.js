"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartAdaptiveRateLimiter = exports.whitelistMiddleware = exports.getRateLimitStatus = exports.updateUserTier = exports.resetRateLimit = exports.getRateLimitMetrics = exports.blacklistCheck = exports.logRequestBehavior = exports.adaptiveRateLimiter = exports.trackFailedRequest = exports.rateLimiter = exports.dynamicRateLimiter = exports.USER_TIERS = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const ioredis_1 = __importDefault(require("ioredis"));
const error_1 = require("./error");
const logger_1 = require("../utils/logger");
// import { SecurityUtils } from '../utils/security' // Commented to fix unused import
const config_1 = require("../config/config");
// Redis client for rate limiting
const redisClient = config_1.config.redis.enabled
    ? new ioredis_1.default({
        host: config_1.config.redis.host,
        port: config_1.config.redis.port,
        password: config_1.config.redis.password,
        db: config_1.config.redis.db,
        maxRetriesPerRequest: config_1.config.redis.maxRetriesPerRequest,
    })
    : null;
// User tier definitions
exports.USER_TIERS = {
    basic: {
        name: 'basic',
        points: config_1.config.rateLimit.userTiers.basic.points,
        duration: config_1.config.rateLimit.userTiers.basic.duration,
        description: 'Basic user with standard rate limits',
    },
    premium: {
        name: 'premium',
        points: config_1.config.rateLimit.userTiers.premium.points,
        duration: config_1.config.rateLimit.userTiers.premium.duration,
        description: 'Premium user with increased rate limits',
    },
    enterprise: {
        name: 'enterprise',
        points: config_1.config.rateLimit.userTiers.enterprise.points,
        duration: config_1.config.rateLimit.userTiers.enterprise.duration,
        description: 'Enterprise user with high rate limits',
    },
};
// Metrics tracking
const rateLimitMetrics = {
    totalRequests: 0,
    blockedRequests: 0,
    activeUsers: 0,
    topAbusers: [],
};
// Rate limiter configurations
const rateLimiters = {
    // General API rate limit
    api: redisClient
        ? new rate_limiter_flexible_1.RateLimiterRedis({
            storeClient: redisClient,
            keyPrefix: 'rl:api',
            points: 100, // Number of requests
            duration: 60, // Per minute
            blockDuration: 60, // Block for 1 minute
        })
        : new rate_limiter_flexible_1.RateLimiterMemory({
            keyPrefix: 'rl:api',
            points: 100,
            duration: 60,
            blockDuration: 60,
        }),
    // Strict limit for auth endpoints
    auth: redisClient
        ? new rate_limiter_flexible_1.RateLimiterRedis({
            storeClient: redisClient,
            keyPrefix: 'rl:auth',
            points: 5,
            duration: 300, // Per 5 minutes
            blockDuration: 900, // Block for 15 minutes
        })
        : new rate_limiter_flexible_1.RateLimiterMemory({
            keyPrefix: 'rl:auth',
            points: 5,
            duration: 300,
            blockDuration: 900,
        }),
    // Payment endpoints rate limit
    payment: redisClient
        ? new rate_limiter_flexible_1.RateLimiterRedis({
            storeClient: redisClient,
            keyPrefix: 'rl:payment',
            points: 10,
            duration: 300, // Per 5 minutes
            blockDuration: 1800, // Block for 30 minutes
        })
        : new rate_limiter_flexible_1.RateLimiterMemory({
            keyPrefix: 'rl:payment',
            points: 10,
            duration: 300,
            blockDuration: 1800,
        }),
    // Search endpoints rate limit
    search: redisClient
        ? new rate_limiter_flexible_1.RateLimiterRedis({
            storeClient: redisClient,
            keyPrefix: 'rl:search',
            points: 30,
            duration: 60, // Per minute
            blockDuration: 60,
        })
        : new rate_limiter_flexible_1.RateLimiterMemory({
            keyPrefix: 'rl:search',
            points: 30,
            duration: 60,
            blockDuration: 60,
        }),
};
// DDoS protection - consecutive failed requests
const consecutiveFailLimiter = redisClient
    ? new rate_limiter_flexible_1.RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: 'rl:fail',
        points: 10,
        duration: 600, // 10 minutes
        blockDuration: 3600, // Block for 1 hour
    })
    : new rate_limiter_flexible_1.RateLimiterMemory({
        keyPrefix: 'rl:fail',
        points: 10,
        duration: 600,
        blockDuration: 3600,
    });
/**
 * Dynamic rate limiting based on user tier
 */
const dynamicRateLimiter = (limiterType = 'api') => {
    return async (req, res, next) => {
        try {
            rateLimitMetrics.totalRequests++;
            const userTier = getUserTier(req);
            const key = getKey(req);
            // Create dynamic limiter based on user tier
            const tierConfig = exports.USER_TIERS[userTier];
            const dynamicLimiter = redisClient
                ? new rate_limiter_flexible_1.RateLimiterRedis({
                    storeClient: redisClient,
                    keyPrefix: `rl:${limiterType}:${userTier}`,
                    points: tierConfig.points,
                    duration: tierConfig.duration,
                    blockDuration: tierConfig.duration,
                })
                : new rate_limiter_flexible_1.RateLimiterMemory({
                    keyPrefix: `rl:${limiterType}:${userTier}`,
                    points: tierConfig.points,
                    duration: tierConfig.duration,
                    blockDuration: tierConfig.duration,
                });
            // Consume 1 point
            const rateLimiterRes = await dynamicLimiter.consume(key);
            // Set rate limit headers with tier information
            res.set({
                'X-RateLimit-Limit': tierConfig.points.toString(),
                'X-RateLimit-Remaining': rateLimiterRes.remainingPoints.toString(),
                'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString(),
                'X-RateLimit-Tier': userTier,
                'X-RateLimit-Type': limiterType,
            });
            // Track successful request
            await trackRequestMetrics(key, false);
            next();
        }
        catch (rateLimiterRes) {
            rateLimitMetrics.blockedRequests++;
            // Log rate limit violation with enhanced details
            logger_1.logger.warn('Rate limit exceeded', {
                ip: req.ip,
                endpoint: req.originalUrl,
                limiterType,
                userTier: getUserTier(req),
                userAgent: req.headers['user-agent'],
                remainingPoints: rateLimiterRes.remainingPoints,
                msBeforeNext: rateLimiterRes.msBeforeNext,
            });
            // Track blocked request
            await trackRequestMetrics(getKey(req), true);
            // Enhanced rate limit headers
            const userTier = getUserTier(req);
            const tierConfig = exports.USER_TIERS[userTier];
            res.set({
                'X-RateLimit-Limit': tierConfig.points.toString(),
                'X-RateLimit-Remaining': rateLimiterRes.remainingPoints?.toString() || '0',
                'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString(),
                'X-RateLimit-Tier': userTier,
                'X-RateLimit-Type': limiterType,
                'Retry-After': Math.round(rateLimiterRes.msBeforeNext / 1000).toString(),
            });
            throw new error_1.AppError(`Rate limit exceeded for ${userTier} tier`, 429, true);
        }
    };
};
exports.dynamicRateLimiter = dynamicRateLimiter;
/**
 * Legacy rate limiting middleware (for backwards compatibility)
 */
const rateLimiter = (limiterType = 'api') => {
    return (0, exports.dynamicRateLimiter)(limiterType);
};
exports.rateLimiter = rateLimiter;
/**
 * Track failed requests for DDoS protection
 */
const trackFailedRequest = async (req) => {
    try {
        const key = getKey(req);
        await consecutiveFailLimiter.consume(key);
    }
    catch (error) {
        logger_1.logger.error('User blocked due to too many failed requests', {
            ip: req.ip,
            endpoint: req.originalUrl,
        });
        // Add to blacklist
        await addToBlacklist(req.ip || 'unknown');
    }
};
exports.trackFailedRequest = trackFailedRequest;
/**
 * Adaptive rate limiting based on user behavior
 */
const adaptiveRateLimiter = () => {
    return async (req, _res, next) => {
        try {
            const key = getKey(req);
            const userBehavior = await analyzeUserBehavior(key);
            // Adjust rate limit based on behavior
            let points = 100;
            if (userBehavior.suspiciousScore > 50) {
                points = 50;
            }
            else if (userBehavior.suspiciousScore > 80) {
                points = 20;
            }
            const adaptiveLimiter = redisClient
                ? new rate_limiter_flexible_1.RateLimiterRedis({
                    storeClient: redisClient,
                    keyPrefix: 'rl:adaptive',
                    points,
                    duration: 60,
                })
                : new rate_limiter_flexible_1.RateLimiterMemory({
                    keyPrefix: 'rl:adaptive',
                    points,
                    duration: 60,
                });
            await adaptiveLimiter.consume(key);
            next();
        }
        catch (error) {
            throw new error_1.AppError('Rate limit exceeded', 429);
        }
    };
};
exports.adaptiveRateLimiter = adaptiveRateLimiter;
/**
 * Analyze user behavior for suspicious patterns
 */
async function analyzeUserBehavior(key) {
    const patterns = [];
    let suspiciousScore = 0;
    try {
        // Check request patterns in Redis
        if (redisClient) {
            const recentRequests = await redisClient.lrange(`behavior:${key}`, 0, 100);
            // Analyze patterns
            const endpoints = recentRequests.map(r => JSON.parse(r).endpoint);
            const uniqueEndpoints = new Set(endpoints);
            // Suspicious if hitting many different endpoints rapidly
            if (uniqueEndpoints.size > 20) {
                suspiciousScore += 30;
                patterns.push('endpoint_scanning');
            }
            // Check for parameter tampering
            const params = recentRequests.map(r => JSON.parse(r).params);
            const suspiciousParams = params.filter(p => p.includes('script') ||
                p.includes('DROP') ||
                p.includes('SELECT'));
            if (suspiciousParams.length > 0) {
                suspiciousScore += 50;
                patterns.push('sql_injection_attempt');
            }
        }
        return { suspiciousScore, patterns };
    }
    catch (error) {
        logger_1.logger.error('Failed to analyze user behavior', error);
        return { suspiciousScore: 0, patterns: [] };
    }
}
/**
 * Log request for behavior analysis
 */
const logRequestBehavior = async (req) => {
    try {
        if (redisClient) {
            const key = getKey(req);
            const behavior = {
                endpoint: req.path,
                method: req.method,
                params: JSON.stringify(req.query),
                timestamp: Date.now(),
            };
            await redisClient.lpush(`behavior:${key}`, JSON.stringify(behavior));
            await redisClient.ltrim(`behavior:${key}`, 0, 1000); // Keep last 1000 requests
            await redisClient.expire(`behavior:${key}`, 3600); // Expire after 1 hour
        }
    }
    catch (error) {
        logger_1.logger.error('Failed to log request behavior', error);
    }
};
exports.logRequestBehavior = logRequestBehavior;
/**
 * Add IP to blacklist
 */
async function addToBlacklist(ip) {
    try {
        const prisma = await getPrisma();
        await prisma.blacklist.create({
            data: {
                type: 'IP',
                value: ip,
                reason: 'Too many failed requests',
                isActive: true,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to add IP to blacklist', error);
    }
}
/**
 * Get user tier based on request
 */
function getUserTier(req) {
    // Check if user has a specific tier
    if (req.user?.tier) {
        return req.user.tier;
    }
    // Check if API client has a tier
    if (req.apiClient?.tier) {
        return req.apiClient.tier;
    }
    // Default to basic tier
    return 'basic';
}
/**
 * Track request metrics
 */
async function trackRequestMetrics(key, isBlocked) {
    try {
        if (!redisClient)
            return;
        const metricsKey = `metrics:${key}`;
        const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
        await redisClient.multi()
            .hincrby(metricsKey, 'total', 1)
            .hincrby(metricsKey, isBlocked ? 'blocked' : 'success', 1)
            .hincrby(metricsKey, `hour_${currentHour}`, 1)
            .expire(metricsKey, 24 * 60 * 60) // 24 hours
            .exec();
    }
    catch (error) {
        logger_1.logger.error('Failed to track request metrics', error);
    }
}
/**
 * Get rate limit key based on request
 */
function getKey(req) {
    // Use authenticated user ID if available
    if (req.user?.id) {
        return `user:${req.user.id}`;
    }
    // Use API key if available
    if (req.apiClient?.id) {
        return `api:${req.apiClient.id}`;
    }
    // Fall back to IP address
    return `ip:${req.ip}`;
}
/**
 * Blacklist check middleware
 */
const blacklistCheck = async (req, _res, next) => {
    try {
        const prisma = await getPrisma();
        const blacklisted = await prisma.blacklist.findFirst({
            where: {
                AND: [
                    {
                        OR: [
                            { type: 'IP', value: req.ip },
                            { type: 'USER_AGENT', value: req.headers['user-agent'] || '' },
                        ],
                    },
                    { isActive: true },
                    {
                        OR: [
                            { expiresAt: null },
                            { expiresAt: { gt: new Date() } },
                        ],
                    },
                ],
            },
        });
        if (blacklisted) {
            logger_1.logger.warn('Blacklisted request blocked', {
                type: blacklisted.type,
                value: blacklisted.value,
                reason: blacklisted.reason,
            });
            throw new error_1.AppError('Access denied', 403);
        }
        next();
    }
    catch (error) {
        if (error instanceof error_1.AppError) {
            next(error);
        }
        else {
            // Don't block on blacklist check errors
            logger_1.logger.error('Blacklist check failed', error);
            next();
        }
    }
};
exports.blacklistCheck = blacklistCheck;
/**
 * Get rate limiting metrics for monitoring
 */
const getRateLimitMetrics = async () => {
    try {
        if (!redisClient) {
            return rateLimitMetrics;
        }
        // Get active users count
        const activeUsers = await redisClient.keys('rl:*').then(keys => new Set(keys.map(key => key.split(':')[2])).size);
        // Get top abusers
        const metricsKeys = await redisClient.keys('metrics:*');
        const topAbusers = [];
        for (const key of metricsKeys.slice(0, 100)) { // Limit to avoid performance issues
            const metrics = await redisClient.hgetall(key);
            const blocked = parseInt(metrics.blocked || '0');
            const total = parseInt(metrics.total || '0');
            if (blocked > 10 || (total > 100 && blocked / total > 0.1)) {
                topAbusers.push({
                    key: key.replace('metrics:', ''),
                    requests: total,
                    blocked,
                    ratio: blocked / total,
                });
            }
        }
        return {
            ...rateLimitMetrics,
            activeUsers,
            topAbusers: topAbusers
                .sort((a, b) => b.blocked - a.blocked)
                .slice(0, 10)
                .map(({ key, requests }) => ({ key, requests })),
        };
    }
    catch (error) {
        logger_1.logger.error('Failed to get rate limit metrics', error);
        return rateLimitMetrics;
    }
};
exports.getRateLimitMetrics = getRateLimitMetrics;
/**
 * Reset rate limits for a specific key
 */
const resetRateLimit = async (key) => {
    try {
        if (!redisClient)
            return;
        const patterns = [
            `rl:*:${key}`,
            `rl:fail:${key}`,
            `rl:adaptive:${key}`,
            `behavior:${key}`,
            `metrics:${key}`,
        ];
        for (const pattern of patterns) {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(...keys);
            }
        }
        logger_1.logger.info(`Rate limits reset for key: ${key}`);
    }
    catch (error) {
        logger_1.logger.error('Failed to reset rate limit', error);
        throw error;
    }
};
exports.resetRateLimit = resetRateLimit;
/**
 * Update user tier for rate limiting
 */
const updateUserTier = async (userId, tier) => {
    try {
        if (!exports.USER_TIERS[tier]) {
            throw new Error(`Invalid tier: ${tier}`);
        }
        // Reset current rate limits for user
        await (0, exports.resetRateLimit)(`user:${userId}`);
        logger_1.logger.info('User tier updated', { userId, tier });
    }
    catch (error) {
        logger_1.logger.error('Failed to update user tier', error);
        throw error;
    }
};
exports.updateUserTier = updateUserTier;
/**
 * Get rate limit status for a key
 */
const getRateLimitStatus = async (key) => {
    try {
        if (!redisClient)
            return null;
        const status = {};
        // Check all rate limiter types
        for (const [type, limiter] of Object.entries(rateLimiters)) {
            try {
                const res = await limiter.get(key);
                status[type] = {
                    totalHits: res ? (res.remainingPoints ? (res.points || 100) - res.remainingPoints : 0) : 0,
                    remainingPoints: res?.remainingPoints,
                    msBeforeNext: res?.msBeforeNext,
                    isBlocked: !res || res.remainingPoints === 0,
                };
            }
            catch (error) {
                status[type] = { error: 'Failed to get status' };
            }
        }
        return status;
    }
    catch (error) {
        logger_1.logger.error('Failed to get rate limit status', error);
        return null;
    }
};
exports.getRateLimitStatus = getRateLimitStatus;
/**
 * Whitelist middleware - bypass rate limits for trusted sources
 */
const whitelistMiddleware = (req, _res, next) => {
    const trustedIPs = [
        '127.0.0.1',
        '::1',
        // Add more trusted IPs from config
    ];
    const trustedUserAgents = [
        'health-check',
        'monitoring',
        // Add more trusted user agents
    ];
    const userAgent = req.headers['user-agent'] || '';
    if (trustedIPs.includes(req.ip || '') || trustedUserAgents.some(ua => userAgent.includes(ua))) {
        req.skipRateLimit = true;
        logger_1.logger.debug('Request whitelisted, skipping rate limit', {
            ip: req.ip,
            userAgent,
            endpoint: req.originalUrl,
        });
    }
    next();
};
exports.whitelistMiddleware = whitelistMiddleware;
/**
 * Enhanced adaptive rate limiting with machine learning-like behavior pattern detection
 */
const smartAdaptiveRateLimiter = () => {
    return async (req, res, next) => {
        try {
            // Skip if whitelisted
            if (req.skipRateLimit) {
                return next();
            }
            const key = getKey(req);
            const userBehavior = await analyzeUserBehavior(key);
            const userTier = getUserTier(req);
            // Calculate dynamic points based on multiple factors
            const basePoints = exports.USER_TIERS[userTier].points;
            let adjustmentFactor = 1;
            // Adjust based on suspicious behavior
            if (userBehavior.suspiciousScore > 80) {
                adjustmentFactor = 0.1; // Severe restriction
            }
            else if (userBehavior.suspiciousScore > 50) {
                adjustmentFactor = 0.3; // Moderate restriction
            }
            else if (userBehavior.suspiciousScore > 20) {
                adjustmentFactor = 0.7; // Light restriction
            }
            // Consider time of day and load
            const currentHour = new Date().getHours();
            const isPeakHour = currentHour >= 9 && currentHour <= 17; // 9 AM to 5 PM
            if (isPeakHour) {
                adjustmentFactor *= 0.8; // Reduce limits during peak hours
            }
            const adjustedPoints = Math.max(1, Math.floor(basePoints * adjustmentFactor));
            const adaptiveLimiter = redisClient
                ? new rate_limiter_flexible_1.RateLimiterRedis({
                    storeClient: redisClient,
                    keyPrefix: 'rl:smart',
                    points: adjustedPoints,
                    duration: 60,
                    blockDuration: userBehavior.suspiciousScore > 50 ? 300 : 60,
                })
                : new rate_limiter_flexible_1.RateLimiterMemory({
                    keyPrefix: 'rl:smart',
                    points: adjustedPoints,
                    duration: 60,
                    blockDuration: userBehavior.suspiciousScore > 50 ? 300 : 60,
                });
            await adaptiveLimiter.consume(key);
            // Set informative headers
            res.set({
                'X-RateLimit-Smart-Points': adjustedPoints.toString(),
                'X-RateLimit-Smart-Adjustment': adjustmentFactor.toString(),
                'X-RateLimit-Smart-Suspicious-Score': userBehavior.suspiciousScore.toString(),
                'X-RateLimit-Smart-Patterns': userBehavior.patterns.join(','),
            });
            next();
        }
        catch (error) {
            logger_1.logger.warn('Smart adaptive rate limit exceeded', {
                ip: req.ip,
                endpoint: req.originalUrl,
                userAgent: req.headers['user-agent'],
            });
            throw new error_1.AppError('Smart rate limit exceeded - suspicious behavior detected', 429);
        }
    };
};
exports.smartAdaptiveRateLimiter = smartAdaptiveRateLimiter;
// Import prisma dynamically to avoid circular dependency
const getPrisma = async () => {
    const { prisma } = await Promise.resolve().then(() => __importStar(require('../utils/database')));
    return prisma;
};
//# sourceMappingURL=rateLimiter.js.map