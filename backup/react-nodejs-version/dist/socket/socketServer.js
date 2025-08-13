"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocketServer = exports.socketServer = exports.SocketServer = void 0;
const socket_io_1 = require("socket.io");
const logger_1 = require("../utils/logger");
const cartEventHandler_1 = require("./handlers/cartEventHandler");
const auth_1 = require("./middleware/auth");
class SocketServer {
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.CORS_ORIGIN || '*',
                methods: ['GET', 'POST'],
            },
            transports: ['websocket', 'polling'],
        });
        this.setupMiddleware();
        this.setupEventHandlers();
    }
    setupMiddleware() {
        // Authentication middleware
        this.io.use((socket, next) => (0, auth_1.authMiddleware)(socket, next));
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            logger_1.logger.info(`Client connected: ${socket.id}`);
            // Join cart room based on user/session
            socket.on('join-cart', (data) => {
                const { cartId, userId, sessionId } = data;
                if (cartId) {
                    socket.join(`cart:${cartId}`);
                    logger_1.logger.debug(`Socket ${socket.id} joined cart room: cart:${cartId}`);
                }
                if (userId) {
                    socket.join(`user:${userId}`);
                    logger_1.logger.debug(`Socket ${socket.id} joined user room: user:${userId}`);
                }
                if (sessionId) {
                    socket.join(`session:${sessionId}`);
                    logger_1.logger.debug(`Socket ${socket.id} joined session room: session:${sessionId}`);
                }
                socket.emit('cart-joined', {
                    cartId,
                    userId,
                    sessionId,
                    message: 'Successfully joined cart room',
                });
            });
            // Leave cart room
            socket.on('leave-cart', (data) => {
                const { cartId, userId, sessionId } = data;
                if (cartId) {
                    socket.leave(`cart:${cartId}`);
                    logger_1.logger.debug(`Socket ${socket.id} left cart room: cart:${cartId}`);
                }
                if (userId) {
                    socket.leave(`user:${userId}`);
                    logger_1.logger.debug(`Socket ${socket.id} left user room: user:${userId}`);
                }
                if (sessionId) {
                    socket.leave(`session:${sessionId}`);
                    logger_1.logger.debug(`Socket ${socket.id} left session room: session:${sessionId}`);
                }
            });
            // Cart synchronization request
            socket.on('cart-sync-request', async (data) => {
                try {
                    await cartEventHandler_1.cartEventHandler.handleSyncRequest(socket, data);
                }
                catch (error) {
                    logger_1.logger.error('Cart sync error:', error);
                    socket.emit('cart-sync-error', {
                        error: 'Failed to sync cart data',
                        cartId: data.cartId,
                    });
                }
            });
            // Ping/pong for connection health
            socket.on('ping', () => {
                socket.emit('pong');
            });
            // Handle disconnection
            socket.on('disconnect', (reason) => {
                logger_1.logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
            });
            // Error handling
            socket.on('error', (error) => {
                logger_1.logger.error(`Socket error for ${socket.id}:`, error);
            });
        });
        // Global error handler
        this.io.engine.on('connection_error', (err) => {
            logger_1.logger.error('Socket.io connection error:', err);
        });
    }
    // Broadcast cart update to all relevant clients
    broadcastCartUpdate(event) {
        const { cartId, userId, sessionId, ...eventData } = event;
        // Broadcast to cart room
        this.io.to(`cart:${cartId}`).emit('cart-updated', eventData);
        // Broadcast to user room if userId exists
        if (userId) {
            this.io.to(`user:${userId}`).emit('cart-updated', eventData);
        }
        // Broadcast to session room if sessionId exists
        if (sessionId) {
            this.io.to(`session:${sessionId}`).emit('cart-updated', eventData);
        }
        logger_1.logger.debug(`Cart event broadcasted: ${event.type} for cart ${cartId}`);
    }
    // Broadcast cart item count update
    broadcastCartItemCount(data) {
        const { cartId, userId, sessionId, itemCount } = data;
        const countUpdate = {
            type: 'CART_ITEM_COUNT_UPDATED',
            cartId,
            itemCount,
            timestamp: new Date(),
        };
        // Broadcast to cart room
        this.io.to(`cart:${cartId}`).emit('cart-item-count-updated', countUpdate);
        // Broadcast to user room if userId exists
        if (userId) {
            this.io.to(`user:${userId}`).emit('cart-item-count-updated', countUpdate);
        }
        // Broadcast to session room if sessionId exists
        if (sessionId) {
            this.io.to(`session:${sessionId}`).emit('cart-item-count-updated', countUpdate);
        }
        logger_1.logger.debug(`Cart item count updated: ${itemCount} for cart ${cartId}`);
    }
    // Broadcast stock warning to cart
    broadcastStockWarning(data) {
        const stockWarning = {
            type: 'STOCK_WARNING',
            ...data,
            timestamp: new Date(),
        };
        // Broadcast to cart room
        this.io.to(`cart:${data.cartId}`).emit('stock-warning', stockWarning);
        // Broadcast to user room if userId exists
        if (data.userId) {
            this.io.to(`user:${data.userId}`).emit('stock-warning', stockWarning);
        }
        // Broadcast to session room if sessionId exists
        if (data.sessionId) {
            this.io.to(`session:${data.sessionId}`).emit('stock-warning', stockWarning);
        }
        logger_1.logger.warn(`Stock warning broadcasted for cart ${data.cartId}: product ${data.productId}`);
    }
    // Get connected clients count
    getConnectedClientsCount() {
        return this.io.engine.clientsCount;
    }
    // Get clients in a specific room
    getClientsInRoom(room) {
        const clients = this.io.sockets.adapter.rooms.get(room);
        return clients ? clients.size : 0;
    }
    // Send message to specific user
    sendToUser(userId, event, data) {
        this.io.to(`user:${userId}`).emit(event, data);
    }
    // Send message to specific session
    sendToSession(sessionId, event, data) {
        this.io.to(`session:${sessionId}`).emit(event, data);
    }
    // Graceful shutdown
    close() {
        logger_1.logger.info('Closing Socket.io server...');
        this.io.close();
    }
}
exports.SocketServer = SocketServer;
const initializeSocketServer = (server) => {
    exports.socketServer = new SocketServer(server);
    logger_1.logger.info('Socket.io server initialized');
    return exports.socketServer;
};
exports.initializeSocketServer = initializeSocketServer;
//# sourceMappingURL=socketServer.js.map