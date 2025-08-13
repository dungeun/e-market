"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetCircuitBreaker = exports.resetAllCircuitBreakers = exports.getCircuitBreakerMetrics = exports.circuitBreakerMiddleware = exports.circuitBreakers = exports.CircuitBreaker = exports.CircuitBreakerState = void 0;
const logger_1 = require("../utils/logger");
const error_1 = require("./error");
var CircuitBreakerState;
(function (CircuitBreakerState) {
    // eslint-disable-next-line no-unused-vars
    CircuitBreakerState["CLOSED"] = "CLOSED";
    // eslint-disable-next-line no-unused-vars
    CircuitBreakerState["OPEN"] = "OPEN";
    // eslint-disable-next-line no-unused-vars
    CircuitBreakerState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitBreakerState || (exports.CircuitBreakerState = CircuitBreakerState = {}));
class CircuitBreaker {
    constructor(config) {
        this.state = CircuitBreakerState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.config = config;
    }
    async execute(operation) {
        if (this.state === CircuitBreakerState.OPEN) {
            if (this.shouldAttemptReset()) {
                this.state = CircuitBreakerState.HALF_OPEN;
                this.successCount = 0;
                logger_1.logger.info(`Circuit breaker ${this.config.name} moving to HALF_OPEN state`);
            }
            else {
                throw new error_1.AppError(`Circuit breaker ${this.config.name} is OPEN`, 503);
            }
        }
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failureCount = 0;
        this.successCount++;
        if (this.state === CircuitBreakerState.HALF_OPEN && this.successCount >= 3) {
            this.state = CircuitBreakerState.CLOSED;
            this.successCount = 0;
            logger_1.logger.info(`Circuit breaker ${this.config.name} moving to CLOSED state`);
        }
    }
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.state === CircuitBreakerState.HALF_OPEN) {
            this.state = CircuitBreakerState.OPEN;
            logger_1.logger.warn(`Circuit breaker ${this.config.name} moving to OPEN state from HALF_OPEN`);
        }
        else if (this.failureCount >= this.config.failureThreshold) {
            this.state = CircuitBreakerState.OPEN;
            logger_1.logger.warn(`Circuit breaker ${this.config.name} moving to OPEN state`, {
                failureCount: this.failureCount,
                threshold: this.config.failureThreshold,
            });
        }
    }
    shouldAttemptReset() {
        return Boolean(this.lastFailureTime &&
            Date.now() - this.lastFailureTime >= this.config.resetTimeout);
    }
    getState() {
        return this.state;
    }
    getMetrics() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            lastFailureTime: this.lastFailureTime,
            name: this.config.name,
        };
    }
    reset() {
        this.state = CircuitBreakerState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = undefined;
        logger_1.logger.info(`Circuit breaker ${this.config.name} manually reset`);
    }
}
exports.CircuitBreaker = CircuitBreaker;
// Circuit breaker instances for different services
exports.circuitBreakers = {
    database: new CircuitBreaker({
        name: 'database',
        failureThreshold: 5,
        resetTimeout: 60000, // 1 minute
        monitoringPeriod: 10000, // 10 seconds
    }),
    payment: new CircuitBreaker({
        name: 'payment',
        failureThreshold: 3,
        resetTimeout: 30000, // 30 seconds
        monitoringPeriod: 5000, // 5 seconds
    }),
    external_api: new CircuitBreaker({
        name: 'external_api',
        failureThreshold: 10,
        resetTimeout: 120000, // 2 minutes
        monitoringPeriod: 15000, // 15 seconds
    }),
    email: new CircuitBreaker({
        name: 'email',
        failureThreshold: 5,
        resetTimeout: 60000, // 1 minute
        monitoringPeriod: 10000, // 10 seconds
    }),
};
/**
 * Circuit breaker middleware for protecting external service calls
 */
const circuitBreakerMiddleware = (breakerName) => {
    return async (req, res, next) => {
        const breaker = exports.circuitBreakers[breakerName];
        if (breaker.getState() === CircuitBreakerState.OPEN) {
            logger_1.logger.warn(`Circuit breaker ${breakerName} is OPEN, rejecting request`, {
                endpoint: req.originalUrl,
                method: req.method,
            });
            res.status(503).json({
                success: false,
                error: {
                    type: 'ServiceUnavailable',
                    message: `${breakerName} service is temporarily unavailable`,
                    retryAfter: '60',
                },
            });
            return;
        }
        // Store breaker in request for use in route handlers
        req.circuitBreaker = breaker;
        next();
    };
};
exports.circuitBreakerMiddleware = circuitBreakerMiddleware;
/**
 * Get all circuit breaker metrics
 */
const getCircuitBreakerMetrics = () => {
    return Object.fromEntries(Object.entries(exports.circuitBreakers).map(([name, breaker]) => [
        name,
        breaker.getMetrics(),
    ]));
};
exports.getCircuitBreakerMetrics = getCircuitBreakerMetrics;
/**
 * Reset all circuit breakers
 */
const resetAllCircuitBreakers = () => {
    Object.values(exports.circuitBreakers).forEach(breaker => breaker.reset());
    logger_1.logger.info('All circuit breakers reset');
};
exports.resetAllCircuitBreakers = resetAllCircuitBreakers;
/**
 * Reset specific circuit breaker
 */
const resetCircuitBreaker = (name) => {
    exports.circuitBreakers[name].reset();
    logger_1.logger.info(`Circuit breaker ${name} reset`);
};
exports.resetCircuitBreaker = resetCircuitBreaker;
//# sourceMappingURL=circuitBreaker.js.map