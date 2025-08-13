"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionService = exports.SessionService = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
class SessionService {
    constructor() {
        this.SESSION_EXPIRY_HOURS = 24 * 7; // 7 days for session tracking
    }
    // private readonly CART_EXPIRY_HOURS = 72 // 3 days for cart
    // Generate a new session ID
    generateSessionId() {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substr(2, 12);
        const uuid = (0, uuid_1.v4)().replace(/-/g, '').substr(0, 8);
        return `guest_${timestamp}_${randomPart}_${uuid}`;
    }
    // Create or get existing guest session
    async getOrCreateGuestSession(sessionId, ipAddress, userAgent) {
        try {
            // If sessionId provided, try to find existing session
            if (sessionId) {
                const existingSession = await this.getGuestSession(sessionId);
                if (existingSession && !this.isSessionExpired(existingSession)) {
                    // Update last activity
                    return this.updateSessionActivity(sessionId, { type: 'other' });
                }
            }
            // Create new session
            const newSessionId = this.generateSessionId();
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + this.SESSION_EXPIRY_HOURS);
            const session = {
                id: newSessionId,
                sessionId: newSessionId,
                ipAddress,
                userAgent,
                lastActivity: new Date(),
                expiresAt,
                metadata: {
                    createdAt: new Date(),
                    source: 'guest_session',
                    isActive: true,
                },
            };
            logger_1.logger.info(`Created new guest session: ${newSessionId}`, {
                ipAddress,
                userAgent: userAgent?.substring(0, 100), // Truncate for logging
            });
            return session;
        }
        catch (error) {
            logger_1.logger.error('Error creating guest session:', error);
            throw error;
        }
    }
    // Get guest session by sessionId
    async getGuestSession(sessionId) {
        try {
            // For now, we'll use a simple in-memory approach
            // In production, you might want to use Redis or database storage
            // Since we don't have a dedicated session table, we'll work with cart sessions
            const cart = await database_1.prisma.cart.findFirst({
                where: {
                    sessionId,
                    userId: null, // Only guest carts
                },
                orderBy: { updatedAt: 'desc' },
            });
            if (!cart) {
                return null;
            }
            return {
                id: cart.sessionId || sessionId,
                sessionId: cart.sessionId || sessionId,
                cartId: cart.id,
                lastActivity: cart.updatedAt,
                expiresAt: cart.expiresAt || new Date(Date.now() + this.SESSION_EXPIRY_HOURS * 60 * 60 * 1000),
                metadata: {
                    cartCreatedAt: cart.createdAt,
                    cartCurrency: cart.currency,
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting guest session:', error);
            return null;
        }
    }
    // Update session activity
    async updateSessionActivity(sessionId, activity) {
        try {
            // Update cart's updatedAt timestamp to track activity
            const cart = await database_1.prisma.cart.findFirst({
                where: {
                    sessionId,
                    userId: null,
                },
                orderBy: { updatedAt: 'desc' },
            });
            if (cart) {
                await database_1.prisma.cart.update({
                    where: { id: cart.id },
                    data: { updatedAt: new Date() },
                });
            }
            logger_1.logger.debug(`Updated session activity: ${sessionId}`, { activity });
            // Return updated session
            const session = await this.getGuestSession(sessionId);
            return session || {
                id: sessionId,
                sessionId,
                lastActivity: new Date(),
                expiresAt: new Date(Date.now() + this.SESSION_EXPIRY_HOURS * 60 * 60 * 1000),
            };
        }
        catch (error) {
            logger_1.logger.error('Error updating session activity:', error);
            throw error;
        }
    }
    // Check if session is expired
    isSessionExpired(session) {
        return new Date() > session.expiresAt;
    }
    // Extend session expiry
    async extendSession(sessionId, additionalHours = 24) {
        try {
            const session = await this.getGuestSession(sessionId);
            if (!session) {
                return null;
            }
            // Extend cart expiry if cart exists
            if (session.cartId) {
                const newExpiresAt = new Date();
                newExpiresAt.setHours(newExpiresAt.getHours() + additionalHours);
                await database_1.prisma.cart.update({
                    where: { id: session.cartId },
                    data: { expiresAt: newExpiresAt },
                });
                logger_1.logger.info(`Extended session: ${sessionId} by ${additionalHours} hours`);
            }
            return this.getGuestSession(sessionId);
        }
        catch (error) {
            logger_1.logger.error('Error extending session:', error);
            throw error;
        }
    }
    // Transfer guest session to authenticated user
    async transferSessionToUser(sessionId, userId) {
        try {
            // Find guest cart for this session
            const guestCart = await database_1.prisma.cart.findFirst({
                where: {
                    sessionId,
                    userId: null,
                },
            });
            if (!guestCart) {
                logger_1.logger.warn(`No guest cart found for session: ${sessionId}`);
                return false;
            }
            // Check if user already has a cart
            const userCart = await database_1.prisma.cart.findFirst({
                where: {
                    userId,
                    expiresAt: { gt: new Date() },
                },
                orderBy: { updatedAt: 'desc' },
            });
            if (userCart) {
                // User has existing cart - merge guest cart into user cart
                logger_1.logger.info(`Merging guest cart ${guestCart.id} into user cart ${userCart.id}`);
                // Move all items from guest cart to user cart
                await database_1.prisma.cartItem.updateMany({
                    where: { cartId: guestCart.id },
                    data: { cartId: userCart.id },
                });
                // Move coupons
                await database_1.prisma.cartCoupon.updateMany({
                    where: { cartId: guestCart.id },
                    data: { cartId: userCart.id },
                });
                // Delete guest cart
                await database_1.prisma.cart.delete({
                    where: { id: guestCart.id },
                });
            }
            else {
                // User has no cart - transfer ownership
                logger_1.logger.info(`Transferring guest cart ${guestCart.id} to user ${userId}`);
                await database_1.prisma.cart.update({
                    where: { id: guestCart.id },
                    data: {
                        userId,
                        sessionId: null, // Clear session ID
                        expiresAt: null, // Remove expiry for authenticated user
                    },
                });
            }
            logger_1.logger.info(`Successfully transferred session ${sessionId} to user ${userId}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Error transferring session to user:', error);
            throw error;
        }
    }
    // Clean up expired sessions
    async cleanupExpiredSessions() {
        try {
            // Clean up expired guest carts (sessions)
            const result = await database_1.prisma.cart.deleteMany({
                where: {
                    userId: null, // Guest carts only
                    expiresAt: {
                        lt: new Date(), // Expired
                    },
                },
            });
            logger_1.logger.info(`Cleaned up ${result.count} expired guest sessions`);
            return result.count;
        }
        catch (error) {
            logger_1.logger.error('Error cleaning up expired sessions:', error);
            throw error;
        }
    }
    // Get session statistics
    async getSessionStats(hours = 24) {
        try {
            const hoursAgo = new Date();
            hoursAgo.setHours(hoursAgo.getHours() - hours);
            const activeGuestCarts = await database_1.prisma.cart.count({
                where: {
                    userId: null,
                    expiresAt: { gt: new Date() },
                    updatedAt: { gt: hoursAgo },
                },
            });
            const totalGuestCarts = await database_1.prisma.cart.count({
                where: {
                    userId: null,
                    expiresAt: { gt: new Date() },
                },
            });
            const newGuestCarts = await database_1.prisma.cart.count({
                where: {
                    userId: null,
                    createdAt: { gt: hoursAgo },
                },
            });
            // Calculate average session duration (simplified)
            const sessions = await database_1.prisma.cart.findMany({
                where: {
                    userId: null,
                    createdAt: { gt: hoursAgo },
                },
                select: {
                    createdAt: true,
                    updatedAt: true,
                },
            });
            const averageSessionDuration = sessions.length > 0
                ? sessions.reduce((acc, session) => {
                    const duration = session.updatedAt.getTime() - session.createdAt.getTime();
                    return acc + duration;
                }, 0) / sessions.length / (1000 * 60) // Convert to minutes
                : 0;
            return {
                activeGuestSessions: activeGuestCarts,
                activeCarts: totalGuestCarts,
                averageSessionDuration: Math.round(averageSessionDuration),
                newSessionsInPeriod: newGuestCarts,
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting session stats:', error);
            throw error;
        }
    }
    // Associate cart with session
    async associateCartWithSession(sessionId, cartId) {
        try {
            await database_1.prisma.cart.update({
                where: { id: cartId },
                data: { sessionId },
            });
            logger_1.logger.debug(`Associated cart ${cartId} with session ${sessionId}`);
        }
        catch (error) {
            logger_1.logger.error('Error associating cart with session:', error);
            throw error;
        }
    }
    // Get session info for debugging
    async getSessionInfo(sessionId) {
        try {
            const session = await this.getGuestSession(sessionId);
            let cart = null;
            let itemCount = 0;
            if (session?.cartId) {
                cart = await database_1.prisma.cart.findUnique({
                    where: { id: session.cartId },
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: { name: true, price: true },
                                },
                            },
                        },
                    },
                });
                itemCount = cart?.items?.length || 0;
            }
            return {
                session,
                cart,
                itemCount,
                isExpired: session ? this.isSessionExpired(session) : true,
                lastActivity: session?.lastActivity.toISOString() || 'N/A',
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting session info:', error);
            throw error;
        }
    }
}
exports.SessionService = SessionService;
exports.sessionService = new SessionService();
//# sourceMappingURL=sessionService.js.map