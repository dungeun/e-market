"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = exports.webhookEvents = exports.emailsSent = exports.cacheMisses = exports.cacheHits = exports.apiErrors = exports.productInventoryLevel = exports.searchNoResults = exports.searchRequests = exports.sessionTimeouts = exports.sessionCreated = exports.userLogins = exports.userRegistrations = exports.paymentFailures = exports.paymentSuccess = exports.paymentAttempts = exports.productRevenue = exports.revenue = exports.cartAbandoned = exports.cartCreated = exports.ordersByStatus = exports.ordersCreated = exports.ordersCompleted = exports.redisConnections = exports.databaseConnections = exports.activeUsers = exports.httpRequestsTotal = exports.httpRequestDuration = exports.register = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
// Create a Registry which registers the metrics
exports.register = new prom_client_1.default.Registry();
// Add a default label which is added to all metrics
exports.register.setDefaultLabels({
    app: 'commerce-plugin',
});
// Enable the collection of default metrics
prom_client_1.default.collectDefaultMetrics({ register: exports.register });
// Custom metrics
exports.httpRequestDuration = new prom_client_1.default.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'path', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 5, 10],
});
exports.httpRequestsTotal = new prom_client_1.default.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status'],
});
exports.activeUsers = new prom_client_1.default.Gauge({
    name: 'active_users_total',
    help: 'Number of currently active users',
});
exports.databaseConnections = new prom_client_1.default.Gauge({
    name: 'database_connections_active',
    help: 'Number of active database connections',
});
exports.redisConnections = new prom_client_1.default.Gauge({
    name: 'redis_connections_active',
    help: 'Number of active Redis connections',
});
// Business metrics
exports.ordersCompleted = new prom_client_1.default.Counter({
    name: 'orders_completed_total',
    help: 'Total number of completed orders',
});
exports.ordersCreated = new prom_client_1.default.Counter({
    name: 'orders_created_total',
    help: 'Total number of created orders',
});
exports.ordersByStatus = new prom_client_1.default.Gauge({
    name: 'orders_by_status_total',
    help: 'Number of orders by status',
    labelNames: ['status'],
});
exports.cartCreated = new prom_client_1.default.Counter({
    name: 'cart_created_total',
    help: 'Total number of carts created',
});
exports.cartAbandoned = new prom_client_1.default.Counter({
    name: 'cart_abandoned_total',
    help: 'Total number of abandoned carts',
});
exports.revenue = new prom_client_1.default.Counter({
    name: 'revenue_total',
    help: 'Total revenue generated',
});
exports.productRevenue = new prom_client_1.default.Counter({
    name: 'product_revenue_total',
    help: 'Revenue by product',
    labelNames: ['product_id', 'product_name'],
});
exports.paymentAttempts = new prom_client_1.default.Counter({
    name: 'payment_attempts_total',
    help: 'Total number of payment attempts',
    labelNames: ['gateway', 'method'],
});
exports.paymentSuccess = new prom_client_1.default.Counter({
    name: 'payment_success_total',
    help: 'Total number of successful payments',
    labelNames: ['gateway', 'method'],
});
exports.paymentFailures = new prom_client_1.default.Counter({
    name: 'payment_failures_total',
    help: 'Total number of failed payments',
    labelNames: ['gateway', 'method', 'error_code'],
});
exports.userRegistrations = new prom_client_1.default.Counter({
    name: 'user_registrations_total',
    help: 'Total number of user registrations',
});
exports.userLogins = new prom_client_1.default.Counter({
    name: 'user_logins_total',
    help: 'Total number of user logins',
});
exports.sessionCreated = new prom_client_1.default.Counter({
    name: 'session_created_total',
    help: 'Total number of sessions created',
});
exports.sessionTimeouts = new prom_client_1.default.Counter({
    name: 'session_timeouts_total',
    help: 'Total number of session timeouts',
});
exports.searchRequests = new prom_client_1.default.Counter({
    name: 'search_requests_total',
    help: 'Total number of search requests',
});
exports.searchNoResults = new prom_client_1.default.Counter({
    name: 'search_no_results_total',
    help: 'Total number of searches with no results',
});
exports.productInventoryLevel = new prom_client_1.default.Gauge({
    name: 'product_inventory_level',
    help: 'Current inventory level for products',
    labelNames: ['product_id', 'product_name'],
});
exports.apiErrors = new prom_client_1.default.Counter({
    name: 'api_errors_total',
    help: 'Total number of API errors',
    labelNames: ['endpoint', 'error_type', 'status_code'],
});
exports.cacheHits = new prom_client_1.default.Counter({
    name: 'cache_hits_total',
    help: 'Total number of cache hits',
    labelNames: ['cache_type'],
});
exports.cacheMisses = new prom_client_1.default.Counter({
    name: 'cache_misses_total',
    help: 'Total number of cache misses',
    labelNames: ['cache_type'],
});
exports.emailsSent = new prom_client_1.default.Counter({
    name: 'emails_sent_total',
    help: 'Total number of emails sent',
    labelNames: ['type', 'status'],
});
exports.webhookEvents = new prom_client_1.default.Counter({
    name: 'webhook_events_total',
    help: 'Total number of webhook events',
    labelNames: ['event_type', 'status'],
});
// Register all metrics
exports.register.registerMetric(exports.httpRequestDuration);
exports.register.registerMetric(exports.httpRequestsTotal);
exports.register.registerMetric(exports.activeUsers);
exports.register.registerMetric(exports.databaseConnections);
exports.register.registerMetric(exports.redisConnections);
exports.register.registerMetric(exports.ordersCompleted);
exports.register.registerMetric(exports.ordersCreated);
exports.register.registerMetric(exports.ordersByStatus);
exports.register.registerMetric(exports.cartCreated);
exports.register.registerMetric(exports.cartAbandoned);
exports.register.registerMetric(exports.revenue);
exports.register.registerMetric(exports.productRevenue);
exports.register.registerMetric(exports.paymentAttempts);
exports.register.registerMetric(exports.paymentSuccess);
exports.register.registerMetric(exports.paymentFailures);
exports.register.registerMetric(exports.userRegistrations);
exports.register.registerMetric(exports.userLogins);
exports.register.registerMetric(exports.sessionCreated);
exports.register.registerMetric(exports.sessionTimeouts);
exports.register.registerMetric(exports.searchRequests);
exports.register.registerMetric(exports.searchNoResults);
exports.register.registerMetric(exports.productInventoryLevel);
exports.register.registerMetric(exports.apiErrors);
exports.register.registerMetric(exports.cacheHits);
exports.register.registerMetric(exports.cacheMisses);
exports.register.registerMetric(exports.emailsSent);
exports.register.registerMetric(exports.webhookEvents);
// Metrics collection functions
class MetricsService {
    static recordHttpRequest(method, path, statusCode, duration) {
        exports.httpRequestsTotal.inc({ method, path, status: statusCode.toString() });
        exports.httpRequestDuration.observe({ method, path, status_code: statusCode.toString() }, duration);
    }
    static recordOrderCompleted(_orderId, amount) {
        exports.ordersCompleted.inc();
        exports.revenue.inc(amount);
    }
    static recordOrderCreated() {
        exports.ordersCreated.inc();
    }
    static updateOrderStatus(status, count) {
        exports.ordersByStatus.set({ status }, count);
    }
    static recordCartCreated() {
        exports.cartCreated.inc();
    }
    static recordCartAbandoned() {
        exports.cartAbandoned.inc();
    }
    static recordProductRevenue(productId, productName, amount) {
        exports.productRevenue.inc({ product_id: productId, product_name: productName }, amount);
    }
    static recordPaymentAttempt(gateway, method) {
        exports.paymentAttempts.inc({ gateway, method });
    }
    static recordPaymentSuccess(gateway, method) {
        exports.paymentSuccess.inc({ gateway, method });
    }
    static recordPaymentFailure(gateway, method, errorCode) {
        exports.paymentFailures.inc({ gateway, method, error_code: errorCode });
    }
    static recordUserRegistration() {
        exports.userRegistrations.inc();
    }
    static recordUserLogin() {
        exports.userLogins.inc();
    }
    static recordSessionCreated() {
        exports.sessionCreated.inc();
    }
    static recordSessionTimeout() {
        exports.sessionTimeouts.inc();
    }
    static recordSearchRequest() {
        exports.searchRequests.inc();
    }
    static recordSearchNoResults() {
        exports.searchNoResults.inc();
    }
    static updateProductInventory(productId, productName, level) {
        exports.productInventoryLevel.set({ product_id: productId, product_name: productName }, level);
    }
    static recordApiError(endpoint, errorType, statusCode) {
        exports.apiErrors.inc({ endpoint, error_type: errorType, status_code: statusCode.toString() });
    }
    static recordCacheHit(cacheType) {
        exports.cacheHits.inc({ cache_type: cacheType });
    }
    static recordCacheMiss(cacheType) {
        exports.cacheMisses.inc({ cache_type: cacheType });
    }
    static recordEmailSent(type, status) {
        exports.emailsSent.inc({ type, status });
    }
    static recordWebhookEvent(eventType, status) {
        exports.webhookEvents.inc({ event_type: eventType, status });
    }
    static setActiveUsers(count) {
        exports.activeUsers.set(count);
    }
    static setDatabaseConnections(count) {
        exports.databaseConnections.set(count);
    }
    static setRedisConnections(count) {
        exports.redisConnections.set(count);
    }
    // Health check metrics
    static async getHealthMetrics() {
        try {
            const metrics = await exports.register.metrics();
            return metrics;
        }
        catch (error) {
            throw new Error(`Failed to get metrics: ${error}`);
        }
    }
    // Business metrics endpoint
    static async getBusinessMetrics() {
        try {
            const businessRegistry = new prom_client_1.default.Registry();
            // Only register business-related metrics
            businessRegistry.registerMetric(exports.ordersCompleted);
            businessRegistry.registerMetric(exports.ordersCreated);
            businessRegistry.registerMetric(exports.ordersByStatus);
            businessRegistry.registerMetric(exports.cartCreated);
            businessRegistry.registerMetric(exports.cartAbandoned);
            businessRegistry.registerMetric(exports.revenue);
            businessRegistry.registerMetric(exports.productRevenue);
            businessRegistry.registerMetric(exports.paymentAttempts);
            businessRegistry.registerMetric(exports.paymentSuccess);
            businessRegistry.registerMetric(exports.paymentFailures);
            businessRegistry.registerMetric(exports.userRegistrations);
            businessRegistry.registerMetric(exports.userLogins);
            businessRegistry.registerMetric(exports.searchRequests);
            businessRegistry.registerMetric(exports.searchNoResults);
            businessRegistry.registerMetric(exports.productInventoryLevel);
            const metrics = await businessRegistry.metrics();
            return metrics;
        }
        catch (error) {
            throw new Error(`Failed to get business metrics: ${error}`);
        }
    }
}
exports.MetricsService = MetricsService;
exports.default = MetricsService;
//# sourceMappingURL=metricsService.js.map