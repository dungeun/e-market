"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../../utils/logger");
const authMiddleware = (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        const sessionId = socket.handshake.auth.sessionId || socket.handshake.headers['x-session-id'];
        // Initialize socket properties
        socket.isAuthenticated = false;
        socket.userId = undefined;
        socket.sessionId = sessionId || undefined;
        // If token is provided, try to authenticate
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || env.jwt.secret);
                socket.userId = decoded.userId || decoded.id;
                socket.isAuthenticated = true;
                logger_1.logger.debug(`Socket authenticated for user: ${socket.userId}`);
            }
            catch (jwtError) {
                logger_1.logger.warn(`Invalid JWT token for socket ${socket.id}:`, jwtError);
                // Continue without authentication - allow anonymous users
            }
        }
        // If no token but sessionId is provided, allow anonymous access
        if (!socket.isAuthenticated && sessionId) {
            socket.sessionId = sessionId;
            logger_1.logger.debug(`Socket connected with session: ${sessionId}`);
        }
        // Allow connection even without authentication (for anonymous users)
        if (!socket.isAuthenticated && !sessionId) {
            // Generate a temporary session ID for truly anonymous users
            socket.sessionId = `temp_${socket.id}_${Date.now()}`;
            logger_1.logger.debug(`Socket connected anonymously with temp session: ${socket.sessionId}`);
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Socket auth middleware error:', error);
        next(new Error('Authentication failed'));
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.js.map