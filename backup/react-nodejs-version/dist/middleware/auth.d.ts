import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
    session?: {
        id: string;
        token: string;
        csrfToken?: string;
    };
}
export declare const authenticate: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (allowedRoles: string[]) => (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => Promise<void>;
export declare const csrfProtection: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
export declare const sessionAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const apiKeyAuth: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const authMiddleware: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map