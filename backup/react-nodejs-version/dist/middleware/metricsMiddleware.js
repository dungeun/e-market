"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessMetricsMiddleware = exports.metricsMiddleware = void 0;
const metricsService_1 = require("../services/metricsService");
const logger_1 = require("../utils/logger");
const metricsMiddleware = (req, res, next) => {
    // Record the start time
    req.startTime = Date.now();
    // Override the end method to capture metrics
    const originalEnd = res.end;
    res.end = function (..._args) {
        // Calculate duration
        const duration = (Date.now() - (req.startTime || Date.now())) / 1000;
        // Clean up the path for metrics (remove IDs and query params)
        const cleanPath = req.path
            .replace(/\/\d+/g, '/:id')
            .replace(/\?.*/, '')
            .toLowerCase();
        // Record the HTTP request metrics
        metricsService_1.MetricsService.recordHttpRequest(req.method, cleanPath, res.statusCode, duration);
        // Record API errors if status code indicates an error
        if (res.statusCode >= 400) {
            const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error';
            metricsService_1.MetricsService.recordApiError(cleanPath, errorType, res.statusCode);
        }
        // Call the original end method
        return originalEnd.apply(res, _args);
    };
    next();
};
exports.metricsMiddleware = metricsMiddleware;
const businessMetricsMiddleware = (req, res, next) => {
    // Track specific business events based on the endpoint
    const originalJson = res.json;
    res.json = function (data) {
        try {
            // Track business metrics based on the endpoint and response
            if (req.method === 'POST' && req.path.includes('/orders') && res.statusCode === 201) {
                metricsService_1.MetricsService.recordOrderCreated();
                if (data?.amount) {
                    metricsService_1.MetricsService.recordOrderCompleted(data.id, data.amount);
                }
            }
            if (req.method === 'POST' && req.path.includes('/cart') && res.statusCode === 201) {
                metricsService_1.MetricsService.recordCartCreated();
            }
            if (req.method === 'POST' && req.path.includes('/users/register') && res.statusCode === 201) {
                metricsService_1.MetricsService.recordUserRegistration();
            }
            if (req.method === 'POST' && req.path.includes('/users/login') && res.statusCode === 200) {
                metricsService_1.MetricsService.recordUserLogin();
            }
            if (req.method === 'POST' && req.path.includes('/search') && res.statusCode === 200) {
                metricsService_1.MetricsService.recordSearchRequest();
                if (data?.results?.length === 0) {
                    metricsService_1.MetricsService.recordSearchNoResults();
                }
            }
            if (req.method === 'POST' && req.path.includes('/payment') && res.statusCode === 200) {
                const gateway = req.body?.gateway || 'unknown';
                const method = req.body?.method || 'unknown';
                metricsService_1.MetricsService.recordPaymentAttempt(gateway, method);
                if (data?.status === 'success') {
                    metricsService_1.MetricsService.recordPaymentSuccess(gateway, method);
                }
                else if (data?.status === 'failed') {
                    metricsService_1.MetricsService.recordPaymentFailure(gateway, method, data?.errorCode || 'unknown');
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Error recording business metrics:', error);
        }
        // Call the original json method
        return originalJson.call(this, data);
    };
    next();
};
exports.businessMetricsMiddleware = businessMetricsMiddleware;
exports.default = { metricsMiddleware: exports.metricsMiddleware, businessMetricsMiddleware: exports.businessMetricsMiddleware };
//# sourceMappingURL=metricsMiddleware.js.map