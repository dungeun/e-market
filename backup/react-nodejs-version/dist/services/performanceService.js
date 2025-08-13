"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceMiddleware = exports.performanceService = exports.performanceMonitor = void 0;
const logger_1 = require("../utils/logger");
const config_1 = require("../config/config");
const os_1 = __importDefault(require("os"));
const perf_hooks_1 = require("perf_hooks");
class PerformanceMonitor {
    constructor() {
        this.requestMetrics = [];
        this.startTime = Date.now();
        this.activeRequests = new Set();
        this.errorCount = 0;
        this.maxMetricsHistory = 10000;
    }
    /**
     * Middleware to track response times
     */
    responseTimeMiddleware() {
        return (req, res, next) => {
            if (!config_1.config.performance.enableResponseTime) {
                return next();
            }
            const startTime = perf_hooks_1.performance.now();
            const requestId = `${req.method}:${req.path}:${Date.now()}`;
            this.activeRequests.add(requestId);
            // Track response finish
            res.on('finish', () => {
                const responseTime = perf_hooks_1.performance.now() - startTime;
                this.activeRequests.delete(requestId);
                this.recordMetrics({
                    path: req.path,
                    method: req.method,
                    statusCode: res.statusCode,
                    responseTime,
                    timestamp: new Date(),
                });
                // Set response time header
                res.setHeader('X-Response-Time', `${responseTime.toFixed(2)}ms`);
                // Log slow requests
                if (responseTime > 1000) {
                    logger_1.logger.warn(`Slow request detected: ${req.method} ${req.path} took ${responseTime.toFixed(2)}ms`);
                }
                // Track errors
                if (res.statusCode >= 400) {
                    this.errorCount++;
                }
            });
            next();
        };
    }
    /**
     * Record request metrics
     */
    recordMetrics(metrics) {
        this.requestMetrics.push(metrics);
        // Maintain history limit
        if (this.requestMetrics.length > this.maxMetricsHistory) {
            this.requestMetrics = this.requestMetrics.slice(-this.maxMetricsHistory);
        }
    }
    /**
     * Get current performance metrics
     */
    getMetrics() {
        const now = Date.now();
        const recentMetrics = this.requestMetrics.filter(m => now - m.timestamp.getTime() < 300000);
        const responseTimes = recentMetrics.map(m => m.responseTime);
        const averageResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            : 0;
        const peakResponseTime = responseTimes.length > 0
            ? Math.max(...responseTimes)
            : 0;
        return {
            requestCount: this.requestMetrics.length,
            errorCount: this.errorCount,
            averageResponseTime: parseFloat(averageResponseTime.toFixed(2)),
            peakResponseTime: parseFloat(peakResponseTime.toFixed(2)),
            activeRequests: this.activeRequests.size,
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            systemInfo: this.getSystemInfo(),
            uptime: (now - this.startTime) / 1000, // in seconds
            timestamp: new Date(),
        };
    }
    /**
     * Get system information
     */
    getSystemInfo() {
        return {
            platform: os_1.default.platform(),
            totalMemory: os_1.default.totalmem(),
            freeMemory: os_1.default.freemem(),
            cpuCount: os_1.default.cpus().length,
            loadAverage: os_1.default.loadavg(),
        };
    }
    /**
     * Get endpoint-specific metrics
     */
    getEndpointMetrics(path, method) {
        return this.requestMetrics.filter(m => {
            const pathMatch = m.path === path || m.path.startsWith(path);
            const methodMatch = !method || m.method === method;
            return pathMatch && methodMatch;
        });
    }
    /**
     * Get slow queries (response time > threshold)
     */
    getSlowQueries(threshold = 1000) {
        return this.requestMetrics
            .filter(m => m.responseTime > threshold)
            .sort((a, b) => b.responseTime - a.responseTime)
            .slice(0, 100); // Top 100 slowest
    }
    /**
     * Reset metrics
     */
    resetMetrics() {
        this.requestMetrics = [];
        this.errorCount = 0;
        this.startTime = Date.now();
        logger_1.logger.info('Performance metrics reset');
    }
    /**
     * Get health status
     */
    getHealthStatus() {
        const metrics = this.getMetrics();
        const memoryUsagePercent = (metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100;
        const freeMemoryPercent = (metrics.systemInfo.freeMemory / metrics.systemInfo.totalMemory) * 100;
        const issues = [];
        if (metrics.averageResponseTime > 500) {
            issues.push(`High average response time: ${metrics.averageResponseTime}ms`);
        }
        if (memoryUsagePercent > 90) {
            issues.push(`High memory usage: ${memoryUsagePercent.toFixed(2)}%`);
        }
        if (freeMemoryPercent < 10) {
            issues.push(`Low system memory: ${freeMemoryPercent.toFixed(2)}% free`);
        }
        if (metrics.errorCount > 100) {
            issues.push(`High error count: ${metrics.errorCount}`);
        }
        const loadAverage1Min = metrics.systemInfo.loadAverage[0];
        if (loadAverage1Min > metrics.systemInfo.cpuCount * 0.8) {
            issues.push(`High CPU load: ${loadAverage1Min.toFixed(2)}`);
        }
        return {
            status: issues.length === 0 ? 'healthy' : 'degraded',
            issues,
            metrics: {
                uptime: metrics.uptime,
                requestCount: metrics.requestCount,
                errorRate: metrics.requestCount > 0
                    ? (metrics.errorCount / metrics.requestCount * 100).toFixed(2) + '%'
                    : '0%',
                averageResponseTime: metrics.averageResponseTime + 'ms',
                memoryUsage: memoryUsagePercent.toFixed(2) + '%',
                systemMemory: freeMemoryPercent.toFixed(2) + '% free',
                cpuLoad: loadAverage1Min.toFixed(2),
            },
        };
    }
}
// Export singleton instance
exports.performanceMonitor = new PerformanceMonitor();
// Alias for backward compatibility
exports.performanceService = exports.performanceMonitor;
/**
 * Express middleware for performance monitoring
 */
exports.performanceMiddleware = exports.performanceMonitor.responseTimeMiddleware();
//# sourceMappingURL=performanceService.js.map