"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.apiKeyAuth = exports.sessionAuth = exports.csrfProtection = exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const error_1 = require("./error");
const database_1 = require("../utils/database");
const security_1 = require("../utils/security");
const logger_1 = require("../utils/logger");
// Verify JWT token and attach user to request
const authenticate = async (req, _res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            throw new error_1.AppError('Authentication token required', 401);
        }
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        // Get user from database
        const user = await database_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                isVerified: true,
            },
        });
        if (!user || !user.isActive || !user.isVerified) {
            throw new error_1.AppError('Invalid or inactive user', 401);
        }
        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new error_1.AppError('Invalid token', 401);
        }
        throw error;
    }
};
exports.authenticate = authenticate;
// Authorization middleware to check user roles
const authorize = (allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new error_1.AppError('Authentication required', 401);
        }
        if (!allowedRoles.includes(req.user.role)) {
            throw new error_1.AppError('Insufficient permissions', 403);
        }
        next();
    };
};
exports.authorize = authorize;
// Optional authentication (user can be null)
const optionalAuth = async (req, _res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
            const user = await database_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isActive: true,
                    isVerified: true,
                },
            });
            if (user && user.isActive && user.isVerified) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                };
            }
        }
        next();
    }
    catch (error) {
        // Ignore auth errors for optional auth
        next();
    }
};
exports.optionalAuth = optionalAuth;
// CSRF Protection
const csrfProtection = (req, _res, next) => {
    // Skip CSRF for GET requests and API calls
    if (req.method === 'GET' || req.path.startsWith('/api/')) {
        return next();
    }
    const csrfToken = req.headers['x-csrf-token'] || req.body._token;
    const sessionCsrfToken = req.session?.csrfToken;
    if (!csrfToken || csrfToken !== sessionCsrfToken) {
        throw new error_1.AppError('Invalid CSRF token', 403);
    }
    next();
};
exports.csrfProtection = csrfProtection;
// Session-based authentication
const sessionAuth = async (req, res, next) => {
    try {
        const sessionToken = req.cookies?.sessionToken || req.headers['x-session-token'];
        if (!sessionToken) {
            return next(); // Allow anonymous sessions
        }
        // Find session in database
        const session = await database_1.prisma.session.findUnique({
            where: { token: sessionToken },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true,
                        isVerified: true,
                    },
                },
            },
        });
        if (!session || session.expiresAt < new Date()) {
            // Clear invalid session cookie
            res.clearCookie('sessionToken');
            return next();
        }
        // Update session last activity
        await database_1.prisma.session.update({
            where: { id: session.id },
            data: { lastActivityAt: new Date() },
        });
        // Attach user and session to request
        if (session.user && session.user.isActive && session.user.isVerified) {
            req.user = {
                id: session.user.id,
                email: session.user.email,
                role: session.user.role,
            };
        }
        req.session = {
            id: session.id,
            token: session.token,
            csrfToken: session.csrfToken || undefined,
        };
        next();
    }
    catch (error) {
        logger_1.logger.error('Session authentication error', error);
        next();
    }
};
exports.sessionAuth = sessionAuth;
// API Key authentication
const apiKeyAuth = async (req, _res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            throw new error_1.AppError('API key required', 401);
        }
        if (!security_1.SecurityUtils.isValidAPIKey(apiKey)) {
            throw new error_1.AppError('Invalid API key format', 401);
        }
        // Verify API key in database
        const hashedKey = security_1.SecurityUtils.hashData(apiKey);
        const apiClient = await database_1.prisma.apiClient.findFirst({
            where: {
                hashedKey,
                isActive: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
        });
        if (!apiClient) {
            logger_1.logger.warn('Invalid API key attempt', {
                ip: req.ip,
                userAgent: req.headers['user-agent'],
            });
            throw new error_1.AppError('Invalid API key', 401);
        }
        // Rate limit check
        await database_1.prisma.apiClient.update({
            where: { id: apiClient.id },
            data: {
                lastUsedAt: new Date(),
                requestCount: { increment: 1 },
            },
        });
        // Attach client info to request
        const authReq = req;
        authReq.apiClient = {
            id: apiClient.id,
            name: apiClient.name,
            permissions: apiClient.permissions,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.apiKeyAuth = apiKeyAuth;
// Alias for backward compatibility
exports.authMiddleware = exports.authenticate;
//# sourceMappingURL=auth.js.map