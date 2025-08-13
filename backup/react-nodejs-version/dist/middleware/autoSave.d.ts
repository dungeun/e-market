import { Request, Response, NextFunction } from 'express';
interface AutoSaveConfig {
    interval: number;
    onlyOnChanges: boolean;
    enablePeriodicSave: boolean;
    maxRetries: number;
    enableRecovery: boolean;
}
interface CartSnapshot {
    items: Array<{
        productId: string;
        variantId?: string;
        quantity: number;
        options?: Record<string, any>;
    }>;
    coupons: string[];
    timestamp: Date;
    checksum: string;
}
/**
 * Auto-save middleware for cart operations
 * Automatically saves cart state at regular intervals and on changes
 */
export declare function autoSaveMiddleware(config?: Partial<AutoSaveConfig>): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Recover cart state from snapshot
 */
export declare function recoverCartFromSnapshot(sessionId: string): Promise<boolean>;
/**
 * Clean up auto-save resources for a session
 */
export declare function cleanupAutoSave(sessionId: string): void;
/**
 * Get auto-save statistics
 */
export declare function getAutoSaveStats(): {
    activeSessions: number;
    snapshotsCount: number;
    timersCount: number;
    oldestSnapshot?: Date;
    newestSnapshot?: Date;
};
export declare function shutdownAutoSave(): void;
export { AutoSaveConfig, CartSnapshot };
//# sourceMappingURL=autoSave.d.ts.map