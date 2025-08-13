import { Request, Response } from 'express';
/**
 * Configure compression middleware with optimal settings
 */
export declare function configureCompression(): import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Brotli compression middleware for better compression ratios
 */
export declare function brotliCompression(): (_req: Request, res: Response, next: Function) => any;
/**
 * Static file compression configuration
 */
export declare function staticCompression(): {
    preCompressed: boolean;
    extensions: {
        '.html': {
            level: number;
        };
        '.css': {
            level: number;
        };
        '.js': {
            level: number;
        };
        '.json': {
            level: number;
        };
        '.xml': {
            level: number;
        };
        '.svg': {
            level: number;
        };
        '.jpg': boolean;
        '.jpeg': boolean;
        '.png': boolean;
        '.gif': boolean;
        '.webp': boolean;
        '.pdf': {
            level: number;
        };
        '.woff': boolean;
        '.woff2': boolean;
    };
};
//# sourceMappingURL=compression.d.ts.map