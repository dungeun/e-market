import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
export interface ValidationOptions {
    stripUnknown?: boolean;
    allowHtml?: boolean;
    maxDepth?: number;
    customValidators?: Record<string, (_value: any) => boolean>;
}
export interface SanitizationOptions {
    trimStrings?: boolean;
    normalizeWhitespace?: boolean;
    removeNullBytes?: boolean;
    htmlSanitize?: boolean;
    sqlInjectinPrevention?: boolean;
    xssProtection?: boolean;
}
/**
 * Request validation and sanitization middleware
 */
export declare const requestValidation: (schema?: z.ZodSchema, validationOptions?: ValidationOptions, sanitizationOptions?: SanitizationOptions) => (req: Request, _res: Response, next: NextFunction) => Promise<void>;
/**
 * File upload validation middleware
 */
export declare const fileUploadValidation: (options?: {
    maxFileSize?: number;
    allowedMimeTypes?: string[];
    maxFiles?: number;
}) => (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Content-Type validation middleware
 */
export declare const contentTypeValidation: (allowedTypes?: string[]) => (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=requestValidation.d.ts.map