import { Request, Response, NextFunction } from 'express';
export interface PerformanceMetrics {
    requestCount: number;
    errorCount: number;
    averageResponseTime: number;
    peakResponseTime: number;
    activeRequests: number;
    memoryUsage: ReturnType<typeof process.memoryUsage>;
    cpuUsage: ReturnType<typeof process.cpuUsage>;
    systemInfo: SystemInfo;
    uptime: number;
    timestamp: Date;
}
interface SystemInfo {
    platform: string;
    totalMemory: number;
    freeMemory: number;
    cpuCount: number;
    loadAverage: number[];
}
interface RequestMetrics {
    path: string;
    method: string;
    statusCode: number;
    responseTime: number;
    timestamp: Date;
}
declare class PerformanceMonitor {
    private requestMetrics;
    private startTime;
    private activeRequests;
    private errorCount;
    private maxMetricsHistory;
    /**
     * Middleware to track response times
     */
    responseTimeMiddleware(): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Record request metrics
     */
    private recordMetrics;
    /**
     * Get current performance metrics
     */
    getMetrics(): PerformanceMetrics;
    /**
     * Get system information
     */
    private getSystemInfo;
    /**
     * Get endpoint-specific metrics
     */
    getEndpointMetrics(path: string, method?: string): RequestMetrics[];
    /**
     * Get slow queries (response time > threshold)
     */
    getSlowQueries(threshold?: number): RequestMetrics[];
    /**
     * Reset metrics
     */
    resetMetrics(): void;
    /**
     * Get health status
     */
    getHealthStatus(): {
        status: string;
        issues: string[];
        metrics: {
            uptime: number;
            requestCount: number;
            errorRate: string;
            averageResponseTime: string;
            memoryUsage: string;
            systemMemory: string;
            cpuLoad: string;
        };
    };
}
export declare const performanceMonitor: PerformanceMonitor;
export declare const performanceService: PerformanceMonitor;
/**
 * Express middleware for performance monitoring
 */
export declare const performanceMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=performanceService.d.ts.map