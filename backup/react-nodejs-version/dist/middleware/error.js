"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.withErrorBoundary = exports.requestIdMiddleware = exports.getErrorStatistics = exports.resetErrorMetrics = exports.getErrorMetrics = exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.createError = exports.createSystemError = exports.createRateLimitError = exports.createConflictError = exports.createNotFoundError = exports.createAuthorizationError = exports.createAuthenticationError = exports.createValidationError = exports.AppError = exports.ERROR_CODES = exports.ErrorCategory = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const config_1 = require("../config/config");
const circuitBreaker_1 = require("./circuitBreaker");
// Error classification
var ErrorCategory;
(function (ErrorCategory) {
    // eslint-disable-next-line no-unused-vars
    ErrorCategory["VALIDATION"] = "VALIDATION";
    // eslint-disable-next-line no-unused-vars
    ErrorCategory["AUTHENTICATION"] = "AUTHENTICATION";
    // eslint-disable-next-line no-unused-vars
    ErrorCategory["AUTHORIZATION"] = "AUTHORIZATION";
    // eslint-disable-next-line no-unused-vars
    ErrorCategory["NOT_FOUND"] = "NOT_FOUND";
    // eslint-disable-next-line no-unused-vars
    ErrorCategory["CONFLICT"] = "CONFLICT";
    // eslint-disable-next-line no-unused-vars
    ErrorCategory["RATE_LIMIT"] = "RATE_LIMIT";
    // eslint-disable-next-line no-unused-vars
    ErrorCategory["DATABASE"] = "DATABASE";
    // eslint-disable-next-line no-unused-vars
    ErrorCategory["EXTERNAL_SERVICE"] = "EXTERNAL_SERVICE";
    // eslint-disable-next-line no-unused-vars
    ErrorCategory["BUSINESS_LOGIC"] = "BUSINESS_LOGIC";
    // eslint-disable-next-line no-unused-vars
    ErrorCategory["SYSTEM"] = "SYSTEM";
    // eslint-disable-next-line no-unused-vars
    ErrorCategory["SECURITY"] = "SECURITY";
    // eslint-disable-next-line no-unused-vars
    ErrorCategory["NETWORK"] = "NETWORK";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
// Error codes for better client handling
exports.ERROR_CODES = {
    // Validation errors
    INVALID_INPUT: 'INVALID_INPUT',
    MISSING_FIELD: 'MISSING_FIELD',
    INVALID_FORMAT: 'INVALID_FORMAT',
    // Authentication errors
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    // Authorization errors
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    ACCESS_DENIED: 'ACCESS_DENIED',
    // Business logic errors
    PRODUCT_OUT_OF_STOCK: 'PRODUCT_OUT_OF_STOCK',
    INVALID_QUANTITY: 'INVALID_QUANTITY',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    // System errors
    DATABASE_ERROR: 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
    CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
    // Rate limiting
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
    // Security
    SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
    CSRF_TOKEN_MISSING: 'CSRF_TOKEN_MISSING',
    IP_BLOCKED: 'IP_BLOCKED',
};
// Error metrics tracking
let errorMetrics = {
    totalErrors: 0,
    errorsByType: {},
    errorsByEndpoint: {},
    recentErrors: [],
};
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true, code, category, details, documentationUrl) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.code = code;
        this.category = category;
        this.details = details;
        this.documentationUrl = documentationUrl;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * Enhanced error factory functions
 */
const createValidationError = (message, details) => {
    return new AppError(message, 400, true, exports.ERROR_CODES.INVALID_INPUT, ErrorCategory.VALIDATION, details, '/docs/errors#validation');
};
exports.createValidationError = createValidationError;
const createAuthenticationError = (message = 'Authentication required', code) => {
    return new AppError(message, 401, true, code || exports.ERROR_CODES.INVALID_CREDENTIALS, ErrorCategory.AUTHENTICATION, undefined, '/docs/errors#authentication');
};
exports.createAuthenticationError = createAuthenticationError;
const createAuthorizationError = (message = 'Insufficient permissions') => {
    return new AppError(message, 403, true, exports.ERROR_CODES.INSUFFICIENT_PERMISSIONS, ErrorCategory.AUTHORIZATION, undefined, '/docs/errors#authorization');
};
exports.createAuthorizationError = createAuthorizationError;
const createNotFoundError = (resource = 'Resource') => {
    return new AppError(`${resource} not found`, 404, true, 'NOT_FOUND', ErrorCategory.NOT_FOUND, { resource }, '/docs/errors#not-found');
};
exports.createNotFoundError = createNotFoundError;
const createConflictError = (message, details) => {
    return new AppError(message, 409, true, 'CONFLICT', ErrorCategory.CONFLICT, details, '/docs/errors#conflict');
};
exports.createConflictError = createConflictError;
const createRateLimitError = (message = 'Rate limit exceeded', details) => {
    return new AppError(message, 429, true, exports.ERROR_CODES.RATE_LIMIT_EXCEEDED, ErrorCategory.RATE_LIMIT, details, '/docs/errors#rate-limiting');
};
exports.createRateLimitError = createRateLimitError;
const createSystemError = (message = 'Internal system error', code) => {
    return new AppError(message, 500, false, code || 'SYSTEM_ERROR', ErrorCategory.SYSTEM, undefined, '/docs/errors#system');
};
exports.createSystemError = createSystemError;
const createError = (message, statusCode = 500) => {
    return new AppError(message, statusCode);
};
exports.createError = createError;
/**
 * Track error metrics
 */
function trackErrorMetrics(error, endpoint) {
    errorMetrics.totalErrors++;
    const errorType = error.name || 'Unknown';
    errorMetrics.errorsByType[errorType] = (errorMetrics.errorsByType[errorType] || 0) + 1;
    errorMetrics.errorsByEndpoint[endpoint] = (errorMetrics.errorsByEndpoint[endpoint] || 0) + 1;
    // Keep only recent 100 errors
    errorMetrics.recentErrors.unshift({
        timestamp: new Date().toISOString(),
        type: errorType,
        message: error.message,
        endpoint,
        statusCode: error.statusCode || 500,
    });
    if (errorMetrics.recentErrors.length > 100) {
        errorMetrics.recentErrors = errorMetrics.recentErrors.slice(0, 100);
    }
}
/**
 * Enhanced error handler with comprehensive error classification and response formatting
 */
const errorHandler = (err, req, res, _next) => {
    const requestId = req.id || generateRequestId();
    const isDevelopment = config_1.config.nodeEnv === 'development';
    const isProduction = config_1.config.nodeEnv === 'production';
    let error;
    // Handle specific error types with enhanced classification
    if (err instanceof zod_1.ZodError) {
        const validationErrors = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code,
            received: e.received,
        }));
        error = (0, exports.createValidationError)('Invalid input data', validationErrors);
        // Track validation errors for circuit breaker
        if (validationErrors.length > 10) {
            logger_1.logger.warn('Excessive validation errors - possible attack', {
                ip: req.ip,
                endpoint: req.originalUrl,
                errorCount: validationErrors.length,
                userAgent: req.headers['user-agent'],
            });
        }
    }
    else if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002': {
                const duplicateField = err.meta?.target || 'unknown field';
                error = (0, exports.createConflictError)(`A record with this ${duplicateField} already exists`, { field: duplicateField, value: err.meta?.target });
                break;
            }
            case 'P2025': {
                error = (0, exports.createNotFoundError)('Record');
                break;
            }
            case 'P2003': {
                error = (0, exports.createValidationError)('Foreign key constraint failed', { constraint: err.meta?.field_name });
                break;
            }
            case 'P2014': {
                error = (0, exports.createValidationError)('Invalid relation data', { relation: err.meta?.relation_name });
                break;
            }
            case 'P2021': {
                error = (0, exports.createSystemError)('Database table does not exist', exports.ERROR_CODES.DATABASE_ERROR);
                break;
            }
            case 'P2024': {
                error = (0, exports.createSystemError)('Connection timeout', exports.ERROR_CODES.DATABASE_ERROR);
                break;
            }
            default: {
                error = (0, exports.createSystemError)(`Database operation failed: ${err.message}`, exports.ERROR_CODES.DATABASE_ERROR);
                // Trigger database circuit breaker on unknown errors
                circuitBreaker_1.circuitBreakers.database.execute(() => Promise.reject(err)).catch(() => { });
                break;
            }
        }
    }
    else if (err instanceof AppError) {
        error = err;
    }
    else if (err.name === 'JsonWebTokenError') {
        error = (0, exports.createAuthenticationError)('Invalid token', exports.ERROR_CODES.TOKEN_INVALID);
    }
    else if (err.name === 'TokenExpiredError') {
        error = (0, exports.createAuthenticationError)('Token expired', exports.ERROR_CODES.TOKEN_EXPIRED);
    }
    else if (err.name === 'MulterError') {
        if (err.message.includes('File too large')) {
            error = (0, exports.createValidationError)('File too large', { maxSize: config_1.config.upload.maxFileSize });
        }
        else if (err.message.includes('Unexpected field')) {
            error = (0, exports.createValidationError)('Invalid file field', { allowedFields: ['image', 'document'] });
        }
        else {
            error = (0, exports.createValidationError)(`File upload error: ${err.message}`);
        }
    }
    else if (err.name === 'PaymentError') {
        error = new AppError(err.message, 402, true, exports.ERROR_CODES.PAYMENT_FAILED, ErrorCategory.BUSINESS_LOGIC, undefined, '/docs/errors#payment');
    }
    else if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
        error = new AppError('External service unavailable', 503, true, exports.ERROR_CODES.EXTERNAL_SERVICE_ERROR, ErrorCategory.EXTERNAL_SERVICE, { originalError: err.message }, '/docs/errors#external-services');
    }
    else {
        // Unknown error - classify as system error
        error = (0, exports.createSystemError)(isProduction ? 'An unexpected error occurred' : err.message, 'UNKNOWN_ERROR');
    }
    // Track error metrics
    trackErrorMetrics(error, req.originalUrl);
    // Enhanced logging with context
    const logContext = {
        requestId,
        errorId: generateErrorId(),
        type: error.name,
        code: error.code,
        category: error.category,
        message: error.message,
        statusCode: error.statusCode,
        isOperational: error.isOperational,
        stack: err.stack,
        request: {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            userId: req.user?.id,
            sessionId: req.session?.id,
        },
        ...(isDevelopment && {
            body: req.body,
            params: req.params,
            query: req.query,
            headers: req.headers,
        }),
    };
    // Log based on error severity
    if (error.statusCode >= 500) {
        logger_1.logger.error('System error occurred', logContext);
        // Report critical errors to external monitoring (if configured)
        if (config_1.config.monitoring.errorReportingUrl) {
            reportErrorToExternalService(error, logContext).catch(reportErr => {
                logger_1.logger.error('Failed to report error to external service', reportErr);
            });
        }
    }
    else if (error.statusCode >= 400) {
        logger_1.logger.warn('Client error occurred', logContext);
    }
    else {
        logger_1.logger.info('Error handled', logContext);
    }
    // Build comprehensive error response
    const errorResponse = {
        success: false,
        error: {
            type: error.name,
            message: error.message,
            code: error.code,
            timestamp: new Date().toISOString(),
            requestId,
            ...(error.details && { details: error.details }),
            ...(error.documentationUrl && { documentation: error.documentationUrl }),
            ...(isDevelopment && error.stack && { stack: error.stack }),
        },
    };
    // Add retry information for specific error types
    if (error.statusCode === 429) {
        res.setHeader('Retry-After', '60');
        errorResponse.error.details = {
            ...errorResponse.error.details,
            retryAfter: 60,
            retryStrategy: 'exponential_backoff',
        };
    }
    if (error.statusCode === 503) {
        res.setHeader('Retry-After', '30');
        errorResponse.error.details = {
            ...errorResponse.error.details,
            retryAfter: 30,
            retryStrategy: 'linear_backoff',
        };
    }
    // Send error response
    res.status(error.statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
/**
 * Generate unique request ID
 */
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Generate unique error ID for tracking
 */
function generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Report error to external monitoring service
 */
async function reportErrorToExternalService(_error, _context) {
    try {
        if (!config_1.config.monitoring.errorReportingUrl)
            return;
        // const errorReport = {
        //   error: {
        //     type: error.name,
        //     message: error.message,
        //     code: error.code,
        //     category: error.category,
        //     statusCode: error.statusCode,
        //     stack: error.stack,
        //   },
        //   context,
        //   environment: config.nodeEnv,
        //   timestamp: new Date().toISOString(),
        //   service: 'commerce-api',
        // }
        // In a real implementation, you would send this to your monitoring service
        // await fetch(config.monitoring.errorReportingUrl, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorReport)
        // })
        logger_1.logger.debug('Error reported to external service', { errorId: _context.errorId });
    }
    catch (reportError) {
        logger_1.logger.error('Failed to report error to external service', reportError);
    }
}
const notFoundHandler = (req, res) => {
    const message = `Route ${req.originalUrl} not found`;
    logger_1.logger.warn(`404 - ${message}`);
    res.status(404).json({
        success: false,
        error: {
            type: 'NotFoundError',
            message,
        },
    });
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
/**
 * Get error metrics for monitoring dashboard
 */
const getErrorMetrics = () => {
    return { ...errorMetrics };
};
exports.getErrorMetrics = getErrorMetrics;
/**
 * Reset error metrics (useful for testing or periodic resets)
 */
const resetErrorMetrics = () => {
    errorMetrics = {
        totalErrors: 0,
        errorsByType: {},
        errorsByEndpoint: {},
        recentErrors: [],
    };
    logger_1.logger.info('Error metrics reset');
};
exports.resetErrorMetrics = resetErrorMetrics;
/**
 * Get error statistics summary
 */
const getErrorStatistics = () => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const recentErrors = errorMetrics.recentErrors;
    const errorsLastHour = recentErrors.filter(e => new Date(e.timestamp).getTime() > oneHourAgo);
    const errorsLastDay = recentErrors.filter(e => new Date(e.timestamp).getTime() > oneDayAgo);
    const criticalErrors = recentErrors.filter(e => e.statusCode >= 500);
    const clientErrors = recentErrors.filter(e => e.statusCode >= 400 && e.statusCode < 500);
    return {
        total: errorMetrics.totalErrors,
        lastHour: errorsLastHour.length,
        lastDay: errorsLastDay.length,
        critical: criticalErrors.length,
        client: clientErrors.length,
        topErrorTypes: Object.entries(errorMetrics.errorsByType)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([type, count]) => ({ type, count })),
        topErrorEndpoints: Object.entries(errorMetrics.errorsByEndpoint)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([endpoint, count]) => ({ endpoint, count })),
        errorRate: {
            hourly: errorsLastHour.length,
            daily: errorsLastDay.length / 24,
            critical: criticalErrors.length / Math.max(1, errorMetrics.totalErrors),
        },
    };
};
exports.getErrorStatistics = getErrorStatistics;
/**
 * Request ID middleware - adds unique ID to each request
 */
const requestIdMiddleware = (req, res, next) => {
    const requestId = generateRequestId();
    req.id = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
};
exports.requestIdMiddleware = requestIdMiddleware;
/**
 * Error boundary for async operations with circuit breaker integration
 */
const withErrorBoundary = async (operation, context) => {
    try {
        let result;
        if (context.circuitBreaker) {
            const breaker = circuitBreaker_1.circuitBreakers[context.circuitBreaker];
            result = await breaker.execute(operation);
        }
        else {
            result = await operation();
        }
        return result;
    }
    catch (error) {
        logger_1.logger.error(`Error in ${context.operationName}`, {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            operationName: context.operationName,
            circuitBreaker: context.circuitBreaker,
        });
        if (context.fallback) {
            try {
                const fallbackResult = await context.fallback();
                logger_1.logger.info(`Fallback executed successfully for ${context.operationName}`);
                return fallbackResult;
            }
            catch (fallbackError) {
                logger_1.logger.error(`Fallback failed for ${context.operationName}`, fallbackError);
                throw fallbackError;
            }
        }
        else {
            throw error;
        }
    }
};
exports.withErrorBoundary = withErrorBoundary;
/**
 * Validation middleware with enhanced error messages
 */
const validateRequest = (schema, property = 'body') => {
    return (req, _res, next) => {
        try {
            const validatedData = schema.parse(req[property]);
            req[property] = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const validationError = (0, exports.createValidationError)(`Invalid ${property} data`, error.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message,
                    code: e.code,
                    received: e.received,
                    expected: e.expected,
                })));
                next(validationError);
            }
            else {
                next((0, exports.createSystemError)('Validation system error'));
            }
        }
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=error.js.map