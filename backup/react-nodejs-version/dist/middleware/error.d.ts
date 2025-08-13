import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { circuitBreakers } from './circuitBreaker';
export interface ErrorResponse {
    success: false;
    error: {
        type: string;
        message: string;
        code?: string;
        details?: any;
        timestamp?: string;
        requestId?: string;
        documentation?: string;
        stack?: string;
    };
}
export interface ErrorMetrics {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByEndpoint: Record<string, number>;
    recentErrors: Array<{
        timestamp: string;
        type: string;
        message: string;
        endpoint: string;
        statusCode: number;
    }>;
}
export declare enum ErrorCategory {
    VALIDATION = "VALIDATION",
    AUTHENTICATION = "AUTHENTICATION",
    AUTHORIZATION = "AUTHORIZATION",
    NOT_FOUND = "NOT_FOUND",
    CONFLICT = "CONFLICT",
    RATE_LIMIT = "RATE_LIMIT",
    DATABASE = "DATABASE",
    EXTERNAL_SERVICE = "EXTERNAL_SERVICE",
    BUSINESS_LOGIC = "BUSINESS_LOGIC",
    SYSTEM = "SYSTEM",
    SECURITY = "SECURITY",
    NETWORK = "NETWORK"
}
export declare const ERROR_CODES: {
    readonly INVALID_INPUT: "INVALID_INPUT";
    readonly MISSING_FIELD: "MISSING_FIELD";
    readonly INVALID_FORMAT: "INVALID_FORMAT";
    readonly INVALID_CREDENTIALS: "INVALID_CREDENTIALS";
    readonly TOKEN_EXPIRED: "TOKEN_EXPIRED";
    readonly TOKEN_INVALID: "TOKEN_INVALID";
    readonly INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS";
    readonly ACCESS_DENIED: "ACCESS_DENIED";
    readonly PRODUCT_OUT_OF_STOCK: "PRODUCT_OUT_OF_STOCK";
    readonly INVALID_QUANTITY: "INVALID_QUANTITY";
    readonly PAYMENT_FAILED: "PAYMENT_FAILED";
    readonly DATABASE_ERROR: "DATABASE_ERROR";
    readonly EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR";
    readonly CONFIGURATION_ERROR: "CONFIGURATION_ERROR";
    readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
    readonly TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS";
    readonly SUSPICIOUS_ACTIVITY: "SUSPICIOUS_ACTIVITY";
    readonly CSRF_TOKEN_MISSING: "CSRF_TOKEN_MISSING";
    readonly IP_BLOCKED: "IP_BLOCKED";
};
export interface ApiError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare class AppError extends Error implements ApiError {
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly code?: string;
    readonly category?: ErrorCategory;
    readonly details?: any;
    readonly documentationUrl?: string;
    constructor(message: string, statusCode?: number, isOperational?: boolean, code?: string, category?: ErrorCategory, details?: any, documentationUrl?: string);
}
/**
 * Enhanced error factory functions
 */
export declare const createValidationError: (message: string, details?: any) => AppError;
export declare const createAuthenticationError: (message?: string, code?: string) => AppError;
export declare const createAuthorizationError: (message?: string) => AppError;
export declare const createNotFoundError: (resource?: string) => AppError;
export declare const createConflictError: (message: string, details?: any) => AppError;
export declare const createRateLimitError: (message?: string, details?: any) => AppError;
export declare const createSystemError: (message?: string, code?: string) => AppError;
export declare const createError: (message: string, statusCode?: number) => AppError;
/**
 * Enhanced error handler with comprehensive error classification and response formatting
 */
export declare const errorHandler: (err: Error | ApiError | ZodError | Prisma.PrismaClientKnownRequestError, req: Request, res: Response, _next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Get error metrics for monitoring dashboard
 */
export declare const getErrorMetrics: () => ErrorMetrics;
/**
 * Reset error metrics (useful for testing or periodic resets)
 */
export declare const resetErrorMetrics: () => void;
/**
 * Get error statistics summary
 */
export declare const getErrorStatistics: () => {
    total: number;
    lastHour: number;
    lastDay: number;
    critical: number;
    client: number;
    topErrorTypes: {
        type: string;
        count: number;
    }[];
    topErrorEndpoints: {
        endpoint: string;
        count: number;
    }[];
    errorRate: {
        hourly: number;
        daily: number;
        critical: number;
    };
};
/**
 * Request ID middleware - adds unique ID to each request
 */
export declare const requestIdMiddleware: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Error boundary for async operations with circuit breaker integration
 */
export declare const withErrorBoundary: <T>(operation: () => Promise<T>, context: {
    operationName: string;
    circuitBreaker?: keyof typeof circuitBreakers;
    fallback?: () => Promise<T>;
}) => Promise<T>;
/**
 * Validation middleware with enhanced error messages
 */
export declare const validateRequest: (schema: any, property?: 'body' | 'query' | 'params') => (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=error.d.ts.map