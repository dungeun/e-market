export interface CacheOptions {
    ttl?: number;
    tags?: string[];
}
export declare class CacheService {
    private client;
    private connected;
    private defaultTTL;
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    /**
     * Get a value from cache
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set a value in cache
     */
    set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean>;
    /**
     * Delete a value from cache
     */
    delete(key: string): Promise<boolean>;
    /**
     * Delete multiple values from cache
     */
    deleteMany(keys: string[]): Promise<number>;
    /**
     * Invalidate cache by tags
     */
    invalidateByTags(tags: string[]): Promise<void>;
    /**
     * Clear all cache
     */
    clear(): Promise<void>;
    /**
     * Get or set cache with a callback
     */
    getOrSet<T>(key: string, callback: () => Promise<T>, options?: CacheOptions): Promise<T>;
    /**
     * Generate cache keys with namespace
     */
    static generateKey(...parts: (string | number)[]): string;
    /**
     * Cache key patterns for different entities
     */
    static keys: {
        product: (id: string) => string;
        productList: (params: any) => string;
        category: (id: string) => string;
        categoryTree: () => string;
        categoryProducts: (categoryId: string, params: any) => string;
        search: (query: string, params: any) => string;
        cart: (sessionId: string) => string;
        inventory: (productId: string) => string;
        pricing: (productId: string) => string;
        user: (userId: string) => string;
        session: (sessionId: string) => string;
    };
    /**
     * Cache TTL presets
     */
    static ttl: {
        short: number;
        medium: number;
        long: number;
        week: number;
    };
    /**
     * Cache tags for invalidation groups
     */
    static tags: {
        products: string;
        categories: string;
        inventory: string;
        pricing: string;
        search: string;
        carts: string;
    };
}
export declare const cacheService: CacheService;
//# sourceMappingURL=cacheService.d.ts.map