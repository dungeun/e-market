"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheSearch = exports.cacheCategoryTree = exports.cacheCategory = exports.cacheProductList = exports.cacheProduct = exports.invalidateCache = exports.cache = void 0;
const cacheService_1 = require("../services/cacheService");
const logger_1 = require("../utils/logger");
const crypto_1 = __importDefault(require("crypto"));
/**
 * Cache middleware for GET requests
 */
function cache(options = {}) {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }
        // Check condition if provided
        if (options.condition && !options.condition(req)) {
            return next();
        }
        // Generate cache key
        const cacheKey = options.keyGenerator
            ? options.keyGenerator(req)
            : generateDefaultCacheKey(req, options.varyBy);
        try {
            // Try to get from cache
            const cached = await cacheService_1.cacheService.get(cacheKey);
            if (cached) {
                logger_1.logger.debug(`Cache hit for key: ${cacheKey}`);
                // Set cached headers
                res.set(cached.headers);
                res.set('X-Cache', 'HIT');
                res.set('X-Cache-Key', cacheKey);
                return res.status(cached.statusCode).json(cached.data);
            }
            logger_1.logger.debug(`Cache miss for key: ${cacheKey}`);
            // Store original send method
            const originalSend = res.json.bind(res);
            // Override json method to cache the response
            res.json = function (data) {
                // Only cache successful responses
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    const cachedResponse = {
                        statusCode: res.statusCode,
                        headers: getRelevantHeaders(res),
                        data: data,
                        timestamp: new Date().toISOString(),
                    };
                    // Cache asynchronously
                    cacheService_1.cacheService.set(cacheKey, cachedResponse, options)
                        .catch(err => logger_1.logger.error('Failed to cache response:', err));
                }
                res.set('X-Cache', 'MISS');
                res.set('X-Cache-Key', cacheKey);
                return originalSend(data);
            };
            next();
        }
        catch (error) {
            logger_1.logger.error('Cache middleware error:', error);
            next();
        }
    };
}
exports.cache = cache;
/**
 * Cache invalidation middleware
 */
function invalidateCache(tags) {
    return async (req, _res, next) => {
        try {
            const tagsToInvalidate = typeof tags === 'function' ? tags(req) : tags;
            if (tagsToInvalidate.length > 0) {
                await cacheService_1.cacheService.invalidateByTags(tagsToInvalidate);
                logger_1.logger.info(`Invalidated cache tags: ${tagsToInvalidate.join(', ')}`);
            }
        }
        catch (error) {
            logger_1.logger.error('Cache invalidation error:', error);
        }
        next();
    };
}
exports.invalidateCache = invalidateCache;
/**
 * Specific cache middleware for product endpoints
 */
exports.cacheProduct = cache({
    ttl: cacheService_1.CacheService.ttl.medium,
    tags: [cacheService_1.CacheService.tags.products],
    keyGenerator: (req) => cacheService_1.CacheService.keys.product(req.params.id),
});
/**
 * Specific cache middleware for product list endpoints
 */
exports.cacheProductList = cache({
    ttl: cacheService_1.CacheService.ttl.short,
    tags: [cacheService_1.CacheService.tags.products],
    keyGenerator: (req) => cacheService_1.CacheService.keys.productList(req.query),
});
/**
 * Specific cache middleware for category endpoints
 */
exports.cacheCategory = cache({
    ttl: cacheService_1.CacheService.ttl.long,
    tags: [cacheService_1.CacheService.tags.categories],
    keyGenerator: (req) => cacheService_1.CacheService.keys.category(req.params.id),
});
/**
 * Specific cache middleware for category tree
 */
exports.cacheCategoryTree = cache({
    ttl: cacheService_1.CacheService.ttl.long,
    tags: [cacheService_1.CacheService.tags.categories],
    keyGenerator: () => cacheService_1.CacheService.keys.categoryTree(),
});
/**
 * Specific cache middleware for search endpoints
 */
exports.cacheSearch = cache({
    ttl: cacheService_1.CacheService.ttl.short,
    tags: [cacheService_1.CacheService.tags.search],
    keyGenerator: (req) => cacheService_1.CacheService.keys.search(req.query.q || '', req.query),
});
/**
 * Helper function to generate default cache key
 */
function generateDefaultCacheKey(req, varyBy) {
    const parts = [
        req.method,
        req.originalUrl || req.url,
    ];
    // Add vary headers
    if (varyBy && varyBy.length > 0) {
        const varyValues = varyBy.map(header => `${header}:${req.headers[header.toLowerCase()] || ''}`);
        parts.push(...varyValues);
    }
    // Generate hash for consistent key length
    const hash = crypto_1.default
        .createHash('md5')
        .update(parts.join('|'))
        .digest('hex');
    return `cache:${hash}`;
}
/**
 * Helper function to get relevant headers for caching
 */
function getRelevantHeaders(res) {
    const headers = {};
    const relevantHeaders = [
        'content-type',
        'cache-control',
        'etag',
        'last-modified',
    ];
    relevantHeaders.forEach(header => {
        const value = res.get(header);
        if (value) {
            headers[header] = value;
        }
    });
    return headers;
}
//# sourceMappingURL=cache.js.map