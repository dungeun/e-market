/// <reference types="node" />
import { Request, Response, NextFunction } from 'express';
/**
 * Security headers middleware with advanced configuration
 */
export declare const securityHeaders: () => (req: import("http").IncomingMessage, res: import("http").ServerResponse<import("http").IncomingMessage>, next: (err?: unknown) => void) => void;
/**
 * CSRF Protection middleware
 */
export declare const csrfProtection: () => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * Additional security headers
 */
export declare const additionalSecurityHeaders: (req: Request, res: Response, next: NextFunction) => void;
/**
 * CORS preflight handling with security considerations
 */
export declare const corsSecurityMiddleware: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Request sanitization middleware
 */
export declare const requestSanitizer: (req: Request, res: Response, next: NextFunction) => void;
/**
 * IP-based security middleware
 */
export declare const ipSecurityMiddleware: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Combined security middleware
 */
export declare const combinedSecurityMiddleware: ((req: Request, res: Response, next: NextFunction) => void)[];
//# sourceMappingURL=securityHeaders.d.ts.map