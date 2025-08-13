"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = require("http");
const response_time_1 = __importDefault(require("response-time"));
const config_1 = require("./config/config");
const logger_1 = require("./utils/logger");
const error_1 = require("./middleware/error");
const requestLogger_1 = require("./middleware/requestLogger");
const rateLimiter_1 = require("./middleware/rateLimiter");
const securityHeaders_1 = require("./middleware/securityHeaders");
const apiVersioning_1 = require("./middleware/apiVersioning");
const requestValidation_1 = require("./middleware/requestValidation");
const circuitBreaker_1 = require("./middleware/circuitBreaker");
const compression_1 = require("./middleware/compression");
const cacheService_1 = require("./services/cacheService");
const performanceService_1 = require("./services/performanceService");
const cdnService_1 = require("./services/cdnService");
const queryOptimizationService_1 = require("./services/queryOptimizationService");
const client_1 = require("@prisma/client");
const products_1 = require("./api/routes/products");
const productOptions_1 = require("./api/routes/productOptions");
const health_1 = require("./api/routes/health");
const admin_1 = require("./api/routes/admin");
const inventory_1 = require("./api/routes/inventory");
const pricing_1 = require("./api/routes/pricing");
const cart_1 = __importDefault(require("./api/routes/cart"));
const orders_1 = __importDefault(require("./api/routes/orders"));
const shipping_1 = __importDefault(require("./api/routes/shipping"));
const categories_1 = __importDefault(require("./api/routes/categories"));
const security_1 = __importDefault(require("./api/routes/security"));
const customers_1 = __importDefault(require("./api/routes/customers"));
const autoSave_1 = require("./api/routes/autoSave");
const metrics_1 = __importDefault(require("./api/routes/metrics"));
const webhooks_1 = __importDefault(require("./api/routes/webhooks"));
const socketServer_1 = require("./socket/socketServer");
const sessionMiddleware_1 = require("./middleware/sessionMiddleware");
const autoSave_2 = require("./middleware/autoSave");
const metricsMiddleware_1 = require("./middleware/metricsMiddleware");
const swagger_1 = require("./middleware/swagger");
const monitoringService_1 = require("./services/monitoringService");
const ioredis_1 = __importDefault(require("ioredis"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Initialize Prisma Client with connection pooling
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: config_1.config.databaseUrl,
        },
    },
    log: config_1.config.database.enableQueryLogging ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
});
// Initialize Redis client for monitoring
const redis = new ioredis_1.default({
    host: config_1.config.redis.host,
    port: config_1.config.redis.port,
    password: config_1.config.redis.password,
    enableReadyCheck: false,
    maxRetriesPerRequest: null
});
// Initialize services
const queryOptimizer = new queryOptimizationService_1.QueryOptimizationService(prisma);
const monitoringService = new monitoringService_1.MonitoringService(prisma, redis);
// Initialize cache service
async function initializeCache() {
    try {
        await cacheService_1.cacheService.connect();
        logger_1.logger.info('Redis cache connected successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to connect to Redis cache:', error);
        logger_1.logger.warn('Running without cache');
    }
}
// Initialize database optimizations
async function initializeDatabase() {
    try {
        await queryOptimizer.createIndexes();
        logger_1.logger.info('Database indexes created successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to create database indexes:', error);
    }
}
// ============= ENHANCED MIDDLEWARE STACK =============
// 1. Request ID and basic security (first)
app.use(error_1.requestIdMiddleware);
// 2. Enhanced security headers and CORS
app.use(securityHeaders_1.combinedSecurityMiddleware);
// 3. Performance monitoring
app.use(performanceService_1.performanceMiddleware);
app.use((0, response_time_1.default)());
// 4. CDN middleware
app.use((0, cdnService_1.cdnMiddleware)());
// 5. Compression middleware
if (config_1.config.performance.enableCompression) {
    app.use((0, compression_1.configureCompression)());
    app.use((0, compression_1.brotliCompression)());
}
// 6. Body parsing with validation
app.use(express_1.default.json({
    limit: '10mb',
    verify: (_req, _res, buf) => {
        // Basic size validation
        if (buf.length > 10 * 1024 * 1024) {
            throw new Error('Request body too large');
        }
    }
}));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// 7. Content-Type validation for POST/PUT requests
app.use((0, requestValidation_1.contentTypeValidation)(['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded']));
// 8. Metrics collection middleware
app.use(metricsMiddleware_1.metricsMiddleware);
app.use(metricsMiddleware_1.businessMetricsMiddleware);
// 9. Request logging and analytics
app.use(requestLogger_1.requestLogger);
// 10. Security checks (blacklist, etc.)
app.use(rateLimiter_1.blacklistCheck);
// 11. Whitelist check (bypass rate limits for trusted sources)
app.use(rateLimiter_1.whitelistMiddleware);
// 12. API versioning
if (config_1.config.api.enableVersioning) {
    app.use('/api', (0, apiVersioning_1.apiVersioning)());
    app.use('/api', (0, apiVersioning_1.versionAnalytics)());
}
// 13. Request validation and sanitization
app.use('/api', (0, requestValidation_1.requestValidation)());
// 14. Enhanced rate limiting with user tiers
app.use('/api/auth', (0, rateLimiter_1.dynamicRateLimiter)('auth'));
app.use('/api/payment', (0, rateLimiter_1.dynamicRateLimiter)('payment'));
app.use('/api/search', (0, rateLimiter_1.dynamicRateLimiter)('search'));
app.use('/api', (0, rateLimiter_1.smartAdaptiveRateLimiter)());
// 15. Circuit breaker for external services
app.use('/api/payment', (0, circuitBreaker_1.circuitBreakerMiddleware)('payment'));
app.use('/api/email', (0, circuitBreaker_1.circuitBreakerMiddleware)('email'));
// Session management for guest users
app.use((0, sessionMiddleware_1.sessionMiddleware)({
    autoCreate: true,
    trackActivity: true,
    extendOnActivity: false
}));
// Static files for uploads
app.use('/uploads', express_1.default.static('uploads'));
// ============= API DOCUMENTATION =============
(0, swagger_1.setupSwagger)(app);
// ============= ROUTES =============
// Health check and monitoring (no auth required)
app.use('/health', health_1.healthRoutes);
app.use('/metrics', metrics_1.default);
app.use('/webhooks', webhooks_1.default);
// Admin routes (should add auth middleware in production)
app.use('/admin', admin_1.adminRoutes);
// API routes with versioning
app.use('/api/v1/products', products_1.productRoutes);
app.use('/api/v1/product-options', productOptions_1.productOptionsRoutes);
app.use('/api/v1/categories', categories_1.default);
app.use('/api/v1/inventory', inventory_1.inventoryRoutes);
app.use('/api/v1/pricing', pricing_1.pricingRoutes);
app.use('/api/v1/carts', (0, sessionMiddleware_1.cartSessionMiddleware)(), (0, autoSave_2.autoSaveMiddleware)({
    interval: 30,
    onlyOnChanges: true,
    enablePeriodicSave: true,
    maxRetries: 3,
    enableRecovery: true
}), cart_1.default);
app.use('/api/v1/orders', orders_1.default);
app.use('/api/v1/shipping', shipping_1.default);
app.use('/api/v1/security', security_1.default);
app.use('/api/v1/customers', customers_1.default);
app.use('/api/v1/auto-save', autoSave_1.autoSaveRoutes);
// Error handling
app.use(error_1.notFoundHandler);
app.use(error_1.errorHandler);
const PORT = config_1.config.port || 3000;
// Initialize Socket.io server
const socketServer = (0, socketServer_1.initializeSocketServer)(server);
// Start server with async initialization
async function startServer() {
    try {
        // Initialize cache
        await initializeCache();
        // Initialize database optimizations
        await initializeDatabase();
        // Start monitoring service
        monitoringService.startMonitoring();
        logger_1.logger.info('Monitoring service started');
        // Send ready signal for PM2
        if (process.send) {
            process.send('ready');
        }
        server.listen(PORT, () => {
            logger_1.logger.info(`🚀 Commerce API server running on port ${PORT}`);
            logger_1.logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
            logger_1.logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
            logger_1.logger.info(`📊 Prometheus Metrics: http://localhost:${PORT}/metrics`);
            logger_1.logger.info(`📈 Business Metrics: http://localhost:${PORT}/metrics/business`);
            logger_1.logger.info(`🔔 AlertManager Webhooks: http://localhost:${PORT}/webhooks/alerts`);
            logger_1.logger.info(`🔌 WebSocket server initialized for real-time cart sync`);
            logger_1.logger.info(`🚄 Performance optimizations enabled`);
            logger_1.logger.info(`📊 Performance metrics: http://localhost:${PORT}/health/performance`);
            // Enhanced features info
            logger_1.logger.info(`🛡️ Enhanced Security: Rate limiting, CSRF protection, input sanitization`);
            logger_1.logger.info(`⚡ Circuit Breakers: External service protection enabled`);
            logger_1.logger.info(`🔄 API Versioning: Multi-version support with deprecation notices`);
            logger_1.logger.info(`📈 Monitoring: Comprehensive metrics and error tracking with Prometheus`);
            logger_1.logger.info(`🚨 Alerting: Real-time alerts via AlertManager with multiple notification channels`);
            logger_1.logger.info(`📊 Grafana Ready: Dashboards for application and business metrics`);
            logger_1.logger.info(`🎯 Rate Limiting: User tier-based with adaptive behavior analysis`);
            logger_1.logger.info(`🔧 Admin Dashboard: http://localhost:${PORT}/admin/dashboard`);
            logger_1.logger.info(`📋 Error Documentation: http://localhost:${PORT}/docs/api/error-codes.md`);
            logger_1.logger.info(`🔍 Monitoring Stack: Start with 'npm run monitoring:start'`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully...');
    (0, autoSave_2.shutdownAutoSave)();
    socketServer.close();
    await cacheService_1.cacheService.disconnect();
    await redis.disconnect();
    await prisma.$disconnect();
    server.close(() => {
        logger_1.logger.info('Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', async () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully...');
    (0, autoSave_2.shutdownAutoSave)();
    socketServer.close();
    await cacheService_1.cacheService.disconnect();
    await redis.disconnect();
    await prisma.$disconnect();
    server.close(() => {
        logger_1.logger.info('Server closed');
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map