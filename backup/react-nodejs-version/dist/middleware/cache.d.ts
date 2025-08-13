import { Request, Response, NextFunction } from 'express';
import { CacheOptions } from '../services/cacheService';
export interface CacheMiddlewareOptions extends CacheOptions {
    keyGenerator?: (_req: Request) => string;
    condition?: (_req: Request) => boolean;
    varyBy?: string[];
}
/**
 * Cache middleware for GET requests
 */
export declare function cache(options?: CacheMiddlewareOptions): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Cache invalidation middleware
 */
export declare function invalidateCache(tags: string[] | ((_req: Request) => string[])): (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * Specific cache middleware for product endpoints
 */
export declare const cacheProduct: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Specific cache middleware for product list endpoints
 */
export declare const cacheProductList: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Specific cache middleware for category endpoints
 */
export declare const cacheCategory: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Specific cache middleware for category tree
 */
export declare const cacheCategoryTree: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Specific cache middleware for search endpoints
 */
export declare const cacheSearch: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=cache.d.ts.map