import { Request, Response, NextFunction } from 'express';
export interface CircuitBreakerConfig {
    failureThreshold: number;
    resetTimeout: number;
    monitoringPeriod: number;
    name: string;
}
export declare enum CircuitBreakerState {
    CLOSED = "CLOSED",
    OPEN = "OPEN",
    HALF_OPEN = "HALF_OPEN"
}
export declare class CircuitBreaker {
    private state;
    private failureCount;
    private lastFailureTime?;
    private successCount;
    private config;
    constructor(config: CircuitBreakerConfig);
    execute<T>(operation: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    private shouldAttemptReset;
    getState(): CircuitBreakerState;
    getMetrics(): {
        state: CircuitBreakerState;
        failureCount: number;
        successCount: number;
        lastFailureTime: number | undefined;
        name: string;
    };
    reset(): void;
}
export declare const circuitBreakers: {
    database: CircuitBreaker;
    payment: CircuitBreaker;
    external_api: CircuitBreaker;
    email: CircuitBreaker;
};
/**
 * Circuit breaker middleware for protecting external service calls
 */
export declare const circuitBreakerMiddleware: (breakerName: keyof typeof circuitBreakers) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get all circuit breaker metrics
 */
export declare const getCircuitBreakerMetrics: () => {
    [k: string]: {
        state: CircuitBreakerState;
        failureCount: number;
        successCount: number;
        lastFailureTime: number | undefined;
        name: string;
    };
};
/**
 * Reset all circuit breakers
 */
export declare const resetAllCircuitBreakers: () => void;
/**
 * Reset specific circuit breaker
 */
export declare const resetCircuitBreaker: (name: keyof typeof circuitBreakers) => void;
//# sourceMappingURL=circuitBreaker.d.ts.map