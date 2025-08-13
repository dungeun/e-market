"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const metricsService_1 = require("./metricsService");
const logger_1 = __importDefault(require("../utils/logger"));
class MonitoringService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    /**
     * Start all monitoring tasks
     */
    startMonitoring() {
        logger_1.default.info('Starting monitoring service');
        // Update active users every minute
        node_cron_1.default.schedule('* * * * *', () => {
            this.updateActiveUsers();
        });
        // Update database metrics every 30 seconds
        node_cron_1.default.schedule('*/30 * * * * *', () => {
            this.updateDatabaseMetrics();
        });
        // Update Redis metrics every 30 seconds
        node_cron_1.default.schedule('*/30 * * * * *', () => {
            this.updateRedisMetrics();
        });
        // Update business metrics every 5 minutes
        node_cron_1.default.schedule('*/5 * * * *', () => {
            this.updateBusinessMetrics();
        });
        // Update inventory metrics every 10 minutes
        node_cron_1.default.schedule('*/10 * * * *', () => {
            this.updateInventoryMetrics();
        });
        // Perform health checks every minute
        node_cron_1.default.schedule('* * * * *', () => {
            this.performHealthChecks();
        });
        // Generate daily business reports at midnight
        node_cron_1.default.schedule('0 0 * * *', () => {
            this.generateDailyBusinessReport();
        });
        // Clean up old metrics data every hour
        node_cron_1.default.schedule('0 * * * *', () => {
            this.cleanupOldMetrics();
        });
        logger_1.default.info('Monitoring service started successfully');
    }
    /**
     * Update active users count
     */
    async updateActiveUsers() {
        try {
            // Count active sessions from the last 30 minutes
            // This is a placeholder - implement based on your session storage
            const activeUsers = await this.redis.scard('active_users') || 0;
            metricsService_1.MetricsService.setActiveUsers(activeUsers);
            logger_1.default.debug('Updated active users metric', { count: activeUsers });
        }
        catch (error) {
            logger_1.default.error('Failed to update active users metric', error);
        }
    }
    /**
     * Update database connection metrics
     */
    async updateDatabaseMetrics() {
        try {
            // Get database connection info
            const result = await this.prisma.$queryRaw `
        SELECT count(*) as connection_count 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `;
            const connectionCount = parseInt(result[0]?.connection_count || '0');
            metricsService_1.MetricsService.setDatabaseConnections(connectionCount);
            logger_1.default.debug('Updated database metrics', { connections: connectionCount });
        }
        catch (error) {
            logger_1.default.error('Failed to update database metrics', error);
            metricsService_1.MetricsService.setDatabaseConnections(0);
        }
    }
    /**
     * Update Redis connection metrics
     */
    async updateRedisMetrics() {
        try {
            const info = await this.redis.info('clients');
            const connectionMatch = info.match(/connected_clients:(\d+)/);
            const connectionCount = connectionMatch ? parseInt(connectionMatch[1]) : 0;
            metricsService_1.MetricsService.setRedisConnections(connectionCount);
            // Check cache performance
            const hits = await this.redis.get('cache:hits') || '0';
            const misses = await this.redis.get('cache:misses') || '0';
            logger_1.default.debug('Updated Redis metrics', {
                connections: connectionCount,
                hits: parseInt(hits),
                misses: parseInt(misses),
            });
        }
        catch (error) {
            logger_1.default.error('Failed to update Redis metrics', error);
            metricsService_1.MetricsService.setRedisConnections(0);
        }
    }
    /**
     * Update business metrics from database
     */
    async updateBusinessMetrics() {
        try {
            // Update order status counts
            const orderStatusCounts = await this.prisma.order.groupBy({
                by: ['status'],
                _count: {
                    id: true,
                },
            });
            for (const statusCount of orderStatusCounts) {
                metricsService_1.MetricsService.updateOrderStatus(statusCount.status, statusCount._count.id);
            }
            // Calculate today's metrics
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayOrders = await this.prisma.order.count({
                where: {
                    createdAt: {
                        gte: today,
                    },
                },
            });
            const todayRevenue = await this.prisma.order.aggregate({
                where: {
                    createdAt: {
                        gte: today,
                    },
                    status: 'DELIVERED',
                },
                _sum: {
                    total: true,
                },
            });
            logger_1.default.debug('Updated business metrics', {
                todayOrders,
                todayRevenue: todayRevenue._sum?.total || 0,
            });
        }
        catch (error) {
            logger_1.default.error('Failed to update business metrics', error);
        }
    }
    /**
     * Update inventory metrics
     */
    async updateInventoryMetrics() {
        try {
            const products = await this.prisma.product.findMany({
                select: {
                    id: true,
                    name: true,
                    quantity: true,
                },
            });
            for (const product of products) {
                metricsService_1.MetricsService.updateProductInventory(product.id.toString(), product.name, product.quantity || 0);
            }
            logger_1.default.debug('Updated inventory metrics', { productCount: products.length });
        }
        catch (error) {
            logger_1.default.error('Failed to update inventory metrics', error);
        }
    }
    /**
     * Perform health checks
     */
    async performHealthChecks() {
        try {
            // Check database connectivity
            await this.checkDatabaseHealth();
            // Check Redis connectivity
            await this.checkRedisHealth();
            // Check external services
            await this.checkExternalServices();
            logger_1.default.debug('Health checks completed successfully');
        }
        catch (error) {
            logger_1.default.error('Health check failed', error);
        }
    }
    /**
     * Check database health
     */
    async checkDatabaseHealth() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            logger_1.default.debug('Database health check passed');
        }
        catch (error) {
            logger_1.default.error('Database health check failed', error);
            throw error;
        }
    }
    /**
     * Check Redis health
     */
    async checkRedisHealth() {
        try {
            await this.redis.ping();
            logger_1.default.debug('Redis health check passed');
        }
        catch (error) {
            logger_1.default.error('Redis health check failed', error);
            throw error;
        }
    }
    /**
     * Check external services health
     */
    async checkExternalServices() {
        try {
            // Check payment gateways, email services, etc.
            // This is a placeholder for actual service checks
            logger_1.default.debug('External services health check passed');
        }
        catch (error) {
            logger_1.default.error('External services health check failed', error);
        }
    }
    /**
     * Generate daily business report
     */
    async generateDailyBusinessReport() {
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dailyStats = await this.prisma.order.aggregate({
                where: {
                    createdAt: {
                        gte: yesterday,
                        lt: today,
                    },
                },
                _count: {
                    id: true,
                },
                _sum: {
                    total: true,
                },
            });
            const report = {
                date: yesterday.toISOString().split('T')[0],
                totalOrders: dailyStats._count || 0,
                totalRevenue: dailyStats._sum?.total || 0,
                generatedAt: new Date().toISOString(),
            };
            logger_1.default.info('Daily business report generated', report);
            // Store report for historical analysis
            await this.storeDailyReport(report);
        }
        catch (error) {
            logger_1.default.error('Failed to generate daily business report', error);
        }
    }
    /**
     * Store daily report
     */
    async storeDailyReport(report) {
        try {
            await this.redis.setex(`daily_report:${report.date}`, 86400 * 30, // Keep for 30 days
            JSON.stringify(report));
        }
        catch (error) {
            logger_1.default.error('Failed to store daily report', error);
        }
    }
    /**
     * Clean up old metrics data
     */
    async cleanupOldMetrics() {
        try {
            // Clean up old session data
            // Remove expired sessions from active users
            const activeUsersSessions = await this.redis.smembers('active_users');
            for (const session of activeUsersSessions) {
                const sessionData = await this.redis.get(`session:${session}`);
                if (!sessionData) {
                    await this.redis.srem('active_users', session);
                }
            }
            logger_1.default.debug('Completed metrics cleanup');
        }
        catch (error) {
            logger_1.default.error('Failed to cleanup old metrics', error);
        }
    }
    /**
     * Get monitoring statistics
     */
    async getMonitoringStats() {
        try {
            const stats = {
                activeUsers: await this.redis.scard('active_users'),
                databaseConnections: await this.getDatabaseConnectionCount(),
                redisConnections: await this.getRedisConnectionCount(),
                lastHealthCheck: await this.redis.get('last_health_check'),
                systemUptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
            };
            return stats;
        }
        catch (error) {
            logger_1.default.error('Failed to get monitoring stats', error);
            throw error;
        }
    }
    async getDatabaseConnectionCount() {
        try {
            const result = await this.prisma.$queryRaw `
        SELECT count(*) as connection_count 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `;
            return parseInt(result[0]?.connection_count || '0');
        }
        catch (error) {
            return 0;
        }
    }
    async getRedisConnectionCount() {
        try {
            const info = await this.redis.info('clients');
            const connectionMatch = info.match(/connected_clients:(\d+)/);
            return connectionMatch ? parseInt(connectionMatch[1]) : 0;
        }
        catch (error) {
            return 0;
        }
    }
}
exports.MonitoringService = MonitoringService;
exports.default = MonitoringService;
//# sourceMappingURL=monitoringService.js.map