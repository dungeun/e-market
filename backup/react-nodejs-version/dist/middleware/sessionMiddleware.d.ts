import { Request, Response, NextFunction } from 'express';
import { sessionService } from '../services/sessionService';
declare global {
    namespace Express {
        interface Request {
            guestSession?: {
                sessionId: string;
                isGuest: boolean;
                isAuthenticated: boolean;
                userId?: string;
                cartId?: string;
                expiresAt: Date;
                lastActivity: Date;
            };
        }
    }
}
export interface SessionOptions {
    cookieName?: string;
    headerName?: string;
    autoCreate?: boolean;
    trackActivity?: boolean;
    extendOnActivity?: boolean;
}
/**
 * Session middleware for handling guest sessions
 * Automatically creates and manages guest sessions for non-authenticated users
 */
export declare function sessionMiddleware(options?: SessionOptions): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware specifically for cart operations
 * Ensures session ID is available for cart operations
 */
export declare function cartSessionMiddleware(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Helper function to transfer guest cart to user on authentication
 */
export declare function transferGuestToUser(sessionId: string, userId: string): Promise<boolean>;
export { sessionService };
//# sourceMappingURL=sessionMiddleware.d.ts.map