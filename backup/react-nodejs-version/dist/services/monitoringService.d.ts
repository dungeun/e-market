import Redis from 'ioredis';
export declare class MonitoringService {
    private prisma;
    private redis;
    constructor(prisma: PrismaClient, redis: Redis);
    /**
     * Start all monitoring tasks
     */
    startMonitoring(): void;
    /**
     * Update active users count
     */
    private updateActiveUsers;
    /**
     * Update database connection metrics
     */
    private updateDatabaseMetrics;
    /**
     * Update Redis connection metrics
     */
    private updateRedisMetrics;
    /**
     * Update business metrics from database
     */
    private updateBusinessMetrics;
    /**
     * Update inventory metrics
     */
    private updateInventoryMetrics;
    /**
     * Perform health checks
     */
    private performHealthChecks;
    /**
     * Check database health
     */
    private checkDatabaseHealth;
    /**
     * Check Redis health
     */
    private checkRedisHealth;
    /**
     * Check external services health
     */
    private checkExternalServices;
    /**
     * Generate daily business report
     */
    private generateDailyBusinessReport;
    /**
     * Store daily report
     */
    private storeDailyReport;
    /**
     * Clean up old metrics data
     */
    private cleanupOldMetrics;
    /**
     * Get monitoring statistics
     */
    getMonitoringStats(): Promise<any>;
    private getDatabaseConnectionCount;
    private getRedisConnectionCount;
}
export default MonitoringService;
//# sourceMappingURL=monitoringService.d.ts.map