"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartEventHandler = exports.CartEventHandler = void 0;
// import { Socket } from 'socket.io'
const cartService_1 = require("../../services/cartService");
const logger_1 = require("../../utils/logger");
class CartEventHandler {
    // Handle cart sync request from client
    async handleSyncRequest(socket, data) {
        try {
            const { cartId, lastSyncAt } = data;
            // Verify the socket has access to this cart
            const hasAccess = await this.verifyCartAccess(socket, cartId);
            if (!hasAccess) {
                socket.emit('cart-sync-error', {
                    error: 'Access denied to cart',
                    cartId
                });
                return;
            }
            // Get current cart data
            const cart = await cartService_1.cartService.getCartById(cartId);
            // Check if cart has been updated since last sync
            const lastSync = lastSyncAt ? new Date(lastSyncAt) : new Date(0);
            const isOutdated = cart.updatedAt > lastSync;
            if (isOutdated) {
                // Send full cart data if outdated
                socket.emit('cart-sync-response', {
                    type: 'FULL_SYNC',
                    cartId,
                    cart,
                    syncAt: new Date(),
                    message: 'Cart data synchronized'
                });
                logger_1.logger.debug(`Full cart sync sent to socket ${socket.id} for cart ${cartId}`);
            }
            else {
                // Send acknowledgment if up to date
                socket.emit('cart-sync-response', {
                    type: 'UP_TO_DATE',
                    cartId,
                    syncAt: new Date(),
                    message: 'Cart is up to date'
                });
                logger_1.logger.debug(`Cart up-to-date response sent to socket ${socket.id} for cart ${cartId}`);
            }
        }
        catch (error) {
            logger_1.logger.error('Cart sync error:', error);
            socket.emit('cart-sync-error', {
                error: 'Failed to sync cart',
                cartId: data.cartId
            });
        }
    }
    // Handle cart update events
    async handleCartUpdate(event) {
        try {
            const { type, cartId, userId, sessionId, data, timestamp } = event;
            // Get updated cart data
            const cart = await cartService_1.cartService.getCartById(cartId);
            // Create broadcast event
            const broadcastEvent = {
                type,
                cartId,
                userId,
                sessionId,
                data: {
                    ...data,
                    cart,
                    totals: cart.totals,
                    itemCount: cart.totals.itemCount
                },
                timestamp
            };
            // Import socketServer here to avoid circular dependency
            const { socketServer } = await Promise.resolve().then(() => __importStar(require('../socketServer')));
            if (socketServer) {
                socketServer.broadcastCartUpdate(broadcastEvent);
            }
            logger_1.logger.debug(`Cart update event processed: ${type} for cart ${cartId}`);
        }
        catch (error) {
            logger_1.logger.error('Cart update event error:', error);
        }
    }
    // Handle cart item count updates
    async handleCartItemCountUpdate(cartId, userId, sessionId) {
        try {
            const cart = await cartService_1.cartService.getCartById(cartId);
            // Import socketServer here to avoid circular dependency
            const { socketServer } = await Promise.resolve().then(() => __importStar(require('../socketServer')));
            if (socketServer) {
                socketServer.broadcastCartItemCount({
                    cartId,
                    userId,
                    sessionId,
                    itemCount: cart.totals.itemCount
                });
            }
            logger_1.logger.debug(`Cart item count update processed for cart ${cartId}: ${cart.totals.itemCount} items`);
        }
        catch (error) {
            logger_1.logger.error('Cart item count update error:', error);
        }
    }
    // Handle stock validation warnings
    async handleStockWarning(data) {
        try {
            // Import socketServer here to avoid circular dependency
            const { socketServer } = await Promise.resolve().then(() => __importStar(require('../socketServer')));
            if (socketServer) {
                socketServer.broadcastStockWarning(data);
            }
            logger_1.logger.warn(`Stock warning processed for cart ${data.cartId}: product ${data.productId}`);
        }
        catch (error) {
            logger_1.logger.error('Stock warning error:', error);
        }
    }
    // Verify if socket has access to cart
    async verifyCartAccess(socket, cartId) {
        try {
            const cart = await cartService_1.cartService.getCartById(cartId);
            // Check if user owns the cart
            if (socket.userId && cart.userId === socket.userId) {
                return true;
            }
            // Check if session matches
            if (socket.sessionId && cart.sessionId === socket.sessionId) {
                return true;
            }
            // For temporary anonymous sessions, allow access if no specific owner
            if (!cart.userId && !cart.sessionId && socket.sessionId?.startsWith('temp_')) {
                return true;
            }
            return false;
        }
        catch (error) {
            logger_1.logger.error('Cart access verification error:', error);
            return false;
        }
    }
    // Handle cart expiration notification
    async handleCartExpiration(cartId, userId, sessionId) {
        try {
            // Import socketServer here to avoid circular dependency
            const { socketServer } = await Promise.resolve().then(() => __importStar(require('../socketServer')));
            if (socketServer) {
                const expirationEvent = {
                    type: 'CART_EXPIRED',
                    cartId,
                    userId,
                    sessionId,
                    data: {
                        message: 'Your cart has expired. Please refresh to continue shopping.',
                        cartId
                    },
                    timestamp: new Date()
                };
                socketServer.broadcastCartUpdate(expirationEvent);
            }
            logger_1.logger.info(`Cart expiration notification sent for cart ${cartId}`);
        }
        catch (error) {
            logger_1.logger.error('Cart expiration notification error:', error);
        }
    }
    // Handle cart merge notification
    async handleCartMerge(data) {
        try {
            // Import socketServer here to avoid circular dependency
            const { socketServer } = await Promise.resolve().then(() => __importStar(require('../socketServer')));
            if (socketServer) {
                const mergeEvent = {
                    type: 'CART_MERGED',
                    cartId: data.targetCartId,
                    userId: data.userId,
                    sessionId: data.sessionId,
                    data: {
                        sourceCartId: data.sourceCartId,
                        targetCartId: data.targetCartId,
                        message: 'Your carts have been merged successfully'
                    },
                    timestamp: new Date()
                };
                socketServer.broadcastCartUpdate(mergeEvent);
            }
            logger_1.logger.info(`Cart merge notification sent: ${data.sourceCartId} -> ${data.targetCartId}`);
        }
        catch (error) {
            logger_1.logger.error('Cart merge notification error:', error);
        }
    }
}
exports.CartEventHandler = CartEventHandler;
exports.cartEventHandler = new CartEventHandler();
//# sourceMappingURL=cartEventHandler.js.map