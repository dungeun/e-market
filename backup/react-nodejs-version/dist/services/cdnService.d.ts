export interface CDNAsset {
    originalUrl: string;
    cdnUrl: string;
    type: 'image' | 'video' | 'document' | 'other';
    size?: number;
    etag?: string;
    lastModified?: Date;
}
export declare class CDNService {
    private baseUrl;
    private enabled;
    constructor();
    /**
     * Check if CDN is enabled
     */
    isEnabled(): boolean;
    /**
     * Generate CDN URL for an asset
     */
    getCDNUrl(assetPath: string, options?: {
        width?: number;
        height?: number;
        quality?: number;
        format?: string;
    }): string;
    /**
     * Generate CDN URLs for responsive images
     */
    getResponsiveImageUrls(imagePath: string, options?: {
        sizes?: number[];
        quality?: number;
        format?: string;
    }): Record<string, string>;
    /**
     * Generate srcset attribute for responsive images
     */
    generateSrcSet(imagePath: string, options?: {
        sizes?: number[];
        quality?: number;
    }): string;
    /**
     * Preload critical assets
     */
    generatePreloadLinks(assets: string[]): string[];
    /**
     * Get asset type from path
     */
    private getAssetType;
    /**
     * Check if asset is an image
     */
    private isImageAsset;
    /**
     * Generate cache key for CDN assets
     */
    generateCacheKey(assetPath: string, version?: string): string;
    /**
     * Purge CDN cache for specific paths
     */
    purgeCache(paths: string[]): Promise<boolean>;
    /**
     * Get CDN analytics/metrics
     */
    getMetrics(): Promise<{
        bandwidth: number;
        requests: number;
        cacheHitRate: number;
        topAssets: Array<{
            path: string;
            requests: number;
        }>;
    }>;
    /**
     * Configure CDN headers for optimal caching
     */
    getCDNHeaders(assetType: string): Record<string, string>;
}
export declare const cdnService: CDNService;
/**
 * Express middleware for CDN URL rewriting
 */
export declare function cdnMiddleware(): (_req: any, res: any, next: Function) => void;
//# sourceMappingURL=cdnService.d.ts.map