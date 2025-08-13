"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = void 0;
const redis_1 = require("redis");
const config_1 = require("../config/config");
const logger_1 = require("../utils/logger");
class CacheService {
    constructor() {
        this.connected = false;
        this.defaultTTL = 3600; // 1 hour default
        this.client = (0, redis_1.createClient)({
            url: config_1.config.redis.url || `redis://${config_1.config.redis.host}:${config_1.config.redis.port}`,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        logger_1.logger.error('Redis reconnection failed after 10 attempts');
                        return new Error('Too many retries');
                    }
                    return Math.min(retries * 100, 3000);
                },
            },
        });
        this.client.on('error', (err) => {
            logger_1.logger.error('Redis Client Error:', err);
            this.connected = false;
        });
        this.client.on('connect', () => {
            logger_1.logger.info('Redis Client Connected');
            this.connected = true;
        });
        this.client.on('disconnect', () => {
            logger_1.logger.warn('Redis Client Disconnected');
            this.connected = false;
        });
    }
    async connect() {
        if (!this.connected) {
            await this.client.connect();
        }
    }
    async disconnect() {
        if (this.connected) {
            await this.client.quit();
        }
    }
    isConnected() {
        return this.connected;
    }
    /**
     * Get a value from cache
     */
    async get(key) {
        try {
            if (!this.connected) {
                logger_1.logger.warn('Cache not connected, skipping get operation');
                return null;
            }
            const value = await this.client.get(key);
            if (!value)
                return null;
            return JSON.parse(value);
        }
        catch (error) {
            logger_1.logger.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }
    /**
     * Set a value in cache
     */
    async set(key, value, options) {
        try {
            if (!this.connected) {
                logger_1.logger.warn('Cache not connected, skipping set operation');
                return false;
            }
            const ttl = options?.ttl || this.defaultTTL;
            const serialized = JSON.stringify(value);
            await this.client.setEx(key, ttl, serialized);
            // Handle tags for cache invalidation
            if (options?.tags && options.tags.length > 0) {
                for (const tag of options.tags) {
                    await this.client.sAdd(`tag:${tag}`, key);
                    await this.client.expire(`tag:${tag}`, ttl);
                }
            }
            return true;
        }
        catch (error) {
            logger_1.logger.error(`Cache set error for key ${key}:`, error);
            return false;
        }
    }
    /**
     * Delete a value from cache
     */
    async delete(key) {
        try {
            if (!this.connected)
                return false;
            const result = await this.client.del(key);
            return result > 0;
        }
        catch (error) {
            logger_1.logger.error(`Cache delete error for key ${key}:`, error);
            return false;
        }
    }
    /**
     * Delete multiple values from cache
     */
    async deleteMany(keys) {
        try {
            if (!this.connected || keys.length === 0)
                return 0;
            return await this.client.del(keys);
        }
        catch (error) {
            logger_1.logger.error('Cache deleteMany error:', error);
            return 0;
        }
    }
    /**
     * Invalidate cache by tags
     */
    async invalidateByTags(tags) {
        try {
            if (!this.connected || tags.length === 0)
                return;
            for (const tag of tags) {
                const keys = await this.client.sMembers(`tag:${tag}`);
                if (keys.length > 0) {
                    await this.deleteMany(keys);
                    await this.client.del(`tag:${tag}`);
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Cache invalidateByTags error:', error);
        }
    }
    /**
     * Clear all cache
     */
    async clear() {
        try {
            if (!this.connected)
                return;
            await this.client.flushDb();
            logger_1.logger.info('Cache cleared successfully');
        }
        catch (error) {
            logger_1.logger.error('Cache clear error:', error);
        }
    }
    /**
     * Get or set cache with a callback
     */
    async getOrSet(key, callback, options) {
        // Try to get from cache first
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        // If not in cache, call the callback
        const value = await callback();
        // Store in cache
        await this.set(key, value, options);
        return value;
    }
    /**
     * Generate cache keys with namespace
     */
    static generateKey(...parts) {
        return parts.join(':');
    }
}
exports.CacheService = CacheService;
/**
 * Cache key patterns for different entities
 */
CacheService.keys = {
    product: (id) => CacheService.generateKey('product', id),
    productList: (params) => CacheService.generateKey('products', JSON.stringify(params)),
    category: (id) => CacheService.generateKey('category', id),
    categoryTree: () => CacheService.generateKey('categories', 'tree'),
    categoryProducts: (categoryId, params) => CacheService.generateKey('category', categoryId, 'products', JSON.stringify(params)),
    search: (query, params) => CacheService.generateKey('search', query, JSON.stringify(params)),
    cart: (sessionId) => CacheService.generateKey('cart', sessionId),
    inventory: (productId) => CacheService.generateKey('inventory', productId),
    pricing: (productId) => CacheService.generateKey('pricing', productId),
    user: (userId) => CacheService.generateKey('user', userId),
    session: (sessionId) => CacheService.generateKey('session', sessionId),
};
/**
 * Cache TTL presets
 */
CacheService.ttl = {
    short: 300, // 5 minutes
    medium: 3600, // 1 hour
    long: 86400, // 24 hours
    week: 604800, // 7 days
};
/**
 * Cache tags for invalidation groups
 */
CacheService.tags = {
    products: 'products',
    categories: 'categories',
    inventory: 'inventory',
    pricing: 'pricing',
    search: 'search',
    carts: 'carts',
};
// Export singleton instance
exports.cacheService = new CacheService();
//# sourceMappingURL=cacheService.js.map