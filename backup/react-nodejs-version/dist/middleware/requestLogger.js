"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = require("../utils/logger");
const auditLogService_1 = require("../services/auditLogService");
const rateLimiter_1 = require("./rateLimiter");
const requestLogger = (req, res, next) => {
    const start = Date.now();
    // Log request
    logger_1.logger.info('Incoming request', {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        timestamp: new Date().toISOString(),
    });
    // Log request behavior for rate limiting analysis
    (0, rateLimiter_1.logRequestBehavior)(req).catch(err => logger_1.logger.error('Failed to log request behavior', err));
    // Capture errors
    let responseError = null;
    const originalEmit = res.emit;
    res.emit = function (event, ...args) {
        if (event === 'error') {
            responseError = args[0];
        }
        return originalEmit.apply(res, [event, ...args]);
    };
    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function (..._args) {
        const duration = Date.now() - start;
        logger_1.logger.info('Request completed', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
        });
        // Log to audit system for API access
        auditLogService_1.auditLogService.logAPIAccess(req, res, duration, responseError)
            .catch(err => logger_1.logger.error('Failed to log API access', err));
        return originalEnd.apply(res, _args);
    };
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=requestLogger.js.map