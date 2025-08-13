import { Request, Response, NextFunction } from 'express';
export interface VersionInfo {
    version: string;
    deprecated: boolean;
    deprecationDate?: string;
    sunsetDate?: string;
    replacedBy?: string;
    changelog?: string;
}
export interface ApiVersionContext {
    requestedVersion: string;
    resolvedVersion: string;
    isDeprecated: boolean;
    deprecationWarning?: string;
}
/**
 * API versioning middleware with comprehensive version management
 */
export declare const apiVersioning: () => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Version-specific route middleware
 */
export declare const versionedRoute: (version: string, handler: Function) => (req: Request, res: Response, next: NextFunction) => any;
/**
 * Multi-version route handler
 */
export declare const multiVersionRoute: (handlers: Record<string, Function>, fallback?: Function) => (req: Request, res: Response, next: NextFunction) => any;
/**
 * Version migration helper
 */
export declare const versionMigration: (fromVersion: string, toVersion: string, migrator: Function) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * API version analytics middleware
 */
export declare const versionAnalytics: () => (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Get version usage statistics
 */
export declare const getVersionStatistics: () => {
    supportedVersions: string[];
    defaultVersion: string;
    deprecatedVersions: string[];
    usage: {};
};
//# sourceMappingURL=apiVersioning.d.ts.map