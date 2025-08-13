"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionService = exports.transferGuestToUser = exports.cartSessionMiddleware = exports.sessionMiddleware = void 0;
const sessionService_1 = require("../services/sessionService");
Object.defineProperty(exports, "sessionService", { enumerable: true, get: function () { return sessionService_1.sessionService; } });
const logger_1 = require("../utils/logger");
const autoSave_1 = require("./autoSave");
const DEFAULT_OPTIONS = {
    cookieName: 'guest_session_id',
    headerName: 'X-Session-ID',
    autoCreate: true,
    trackActivity: true,
    extendOnActivity: false,
};
/**
 * Session middleware for handling guest sessions
 * Automatically creates and manages guest sessions for non-authenticated users
 */
function sessionMiddleware(options = {}) {
    const config = { ...DEFAULT_OPTIONS, ...options };
    return async (req, res, next) => {
        try {
            // Skip session handling for certain paths
            if (shouldSkipSession(req.path)) {
                return next();
            }
            // Check if user is authenticated (has userId in JWT or similar)
            const isAuthenticated = !!req.user?.id || !!req.userId;
            const userId = req.user?.id || req.userId;
            if (isAuthenticated) {
                // User is authenticated, set session info
                req.guestSession = {
                    sessionId: userId,
                    isGuest: false,
                    isAuthenticated: true,
                    userId,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                    lastActivity: new Date(),
                };
                return next();
            }
            // Handle guest session
            let sessionId = getSessionIdFromRequest(req, config);
            if (!sessionId && config.autoCreate) {
                // Create new guest session
                const guestSession = await sessionService_1.sessionService.getOrCreateGuestSession(undefined, getClientIP(req), req.headers['user-agent']);
                sessionId = guestSession.sessionId;
                // Set session ID in response cookie
                setSessionCookie(res, sessionId, config.cookieName);
                logger_1.logger.debug(`Created new guest session: ${sessionId}`);
            }
            else if (sessionId) {
                // Validate existing session
                const existingSession = await sessionService_1.sessionService.getGuestSession(sessionId);
                if (!existingSession || sessionService_1.sessionService.isSessionExpired(existingSession)) {
                    // Try to recover cart from auto-save snapshot before creating new session
                    const recoveryAttempted = await (0, autoSave_1.recoverCartFromSnapshot)(sessionId);
                    if (recoveryAttempted) {
                        logger_1.logger.info(`Cart recovery attempted for expired session: ${sessionId}`);
                    }
                    // Session expired or invalid, create new one
                    const newSession = await sessionService_1.sessionService.getOrCreateGuestSession(undefined, getClientIP(req), req.headers['user-agent']);
                    sessionId = newSession.sessionId;
                    setSessionCookie(res, sessionId, config.cookieName);
                    logger_1.logger.debug(`Recreated expired guest session: ${sessionId}`);
                }
                else {
                    // Update activity if enabled
                    if (config.trackActivity) {
                        await sessionService_1.sessionService.updateSessionActivity(sessionId, {
                            type: getActivityType(req),
                            data: {
                                path: req.path,
                                method: req.method,
                                timestamp: new Date(),
                            },
                        });
                    }
                    // Extend session if enabled
                    if (config.extendOnActivity) {
                        await sessionService_1.sessionService.extendSession(sessionId, 24);
                    }
                }
            }
            // Set session info on request
            if (sessionId) {
                const session = await sessionService_1.sessionService.getGuestSession(sessionId);
                req.guestSession = {
                    sessionId,
                    isGuest: true,
                    isAuthenticated: false,
                    cartId: session?.cartId,
                    expiresAt: session?.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    lastActivity: session?.lastActivity || new Date(),
                };
            }
            next();
        }
        catch (error) {
            logger_1.logger.error('Session middleware error:', error);
            // Don't block request on session errors
            next();
        }
    };
}
exports.sessionMiddleware = sessionMiddleware;
/**
 * Middleware specifically for cart operations
 * Ensures session ID is available for cart operations
 */
function cartSessionMiddleware() {
    return async (req, res, next) => {
        try {
            // If no session exists, create one for cart operations
            if (!req.guestSession?.sessionId) {
                const guestSession = await sessionService_1.sessionService.getOrCreateGuestSession(undefined, getClientIP(req), req.headers['user-agent']);
                req.guestSession = {
                    sessionId: guestSession.sessionId,
                    isGuest: true,
                    isAuthenticated: false,
                    expiresAt: guestSession.expiresAt,
                    lastActivity: guestSession.lastActivity,
                };
                // Set cookie for future requests
                setSessionCookie(res, guestSession.sessionId, 'guest_session_id');
            }
            // Add sessionId to request body/query for cart operations
            if (req.guestSession.isGuest) {
                // For POST/PUT requests, add to body
                if (req.method === 'POST' || req.method === 'PUT') {
                    req.body = req.body || {};
                    if (!req.body.sessionId && !req.body.userId) {
                        req.body.sessionId = req.guestSession.sessionId;
                    }
                }
                // For GET requests, add to query
                if (req.method === 'GET') {
                    req.query = req.query || {};
                    if (!req.query.sessionId && !req.query.userId) {
                        req.query.sessionId = req.guestSession.sessionId;
                    }
                }
            }
            next();
        }
        catch (error) {
            logger_1.logger.error('Cart session middleware error:', error);
            next(error);
        }
    };
}
exports.cartSessionMiddleware = cartSessionMiddleware;
/**
 * Helper function to transfer guest cart to user on authentication
 */
async function transferGuestToUser(sessionId, userId) {
    try {
        return await sessionService_1.sessionService.transferSessionToUser(sessionId, userId);
    }
    catch (error) {
        logger_1.logger.error('Error transferring guest to user:', error);
        return false;
    }
}
exports.transferGuestToUser = transferGuestToUser;
// Helper functions
function shouldSkipSession(path) {
    const skipPaths = [
        '/health',
        '/api/v1/security',
        '/api-docs',
        '/metrics',
        '/favicon.ico',
    ];
    return skipPaths.some(skipPath => path.startsWith(skipPath));
}
function getSessionIdFromRequest(req, config) {
    // Try to get session ID from header first
    let sessionId = req.headers[config.headerName.toLowerCase()];
    if (!sessionId) {
        // Try to get from cookie
        sessionId = req.cookies?.[config.cookieName];
    }
    if (!sessionId) {
        // Try to get from query parameter
        sessionId = req.query.sessionId;
    }
    if (!sessionId) {
        // Try to get from body
        sessionId = req.body?.sessionId;
    }
    return sessionId || null;
}
function setSessionCookie(res, sessionId, cookieName) {
    res.cookie(cookieName, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
    });
}
function getClientIP(req) {
    return (req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        'unknown').split(',')[0].trim();
}
function getActivityType(req) {
    const path = req.path.toLowerCase();
    if (path.includes('/cart'))
        return 'cart_action';
    if (path.includes('/product'))
        return 'product_view';
    if (path.includes('/search'))
        return 'search';
    if (path.includes('/checkout'))
        return 'checkout_start';
    return 'other';
}
//# sourceMappingURL=sessionMiddleware.js.map