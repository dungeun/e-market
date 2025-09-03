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
exports.orderEventHandler = exports.OrderEventHandler = void 0;
const orderService_1 = require("../../services/orderService");
const logger_1 = require("../../utils/logger");
class OrderEventHandler {
    // Handle order creation event
    async handleOrderCreated(orderId, userId) {
        try {
            const order = await orderService_1.orderService.getOrderById(orderId);
            const orderEvent = {
                type: 'ORDER_CREATED',
                orderId,
                userId,
                data: {
                    order,
                    message: `Your order ${order.orderNumber} has been created successfully`,
                },
                timestamp: new Date(),
            };
            // Import socketServer here to avoid circular dependency
            const { socketServer } = await Promise.resolve().then(() => __importStar(require('../socketServer')));
            if (socketServer) {
                // Broadcast to user
                socketServer.sendToUser(userId, 'order-created', orderEvent);
                // Broadcast to admin users
                this.broadcastToAdmins('order-created', orderEvent);
            }
            logger_1.logger.debug(`Order created event processed: ${orderId}`);
        }
        catch (error) {
            logger_1.logger.error('Order created event error:', error);
        }
    }
    // Handle order status update
    async handleOrderStatusUpdate(orderId, previousStatus, newStatus) {
        try {
            const order = await orderService_1.orderService.getOrderById(orderId);
            const orderEvent = {
                type: 'ORDER_UPDATED',
                orderId,
                userId: order.userId,
                data: {
                    order,
                    previousStatus,
                    newStatus,
                    message: this.getStatusUpdateMessage(newStatus, order.orderNumber),
                },
                timestamp: new Date(),
            };
            // Import socketServer here to avoid circular dependency
            const { socketServer } = await Promise.resolve().then(() => __importStar(require('../socketServer')));
            if (socketServer) {
                // Broadcast to user
                socketServer.sendToUser(order.userId, 'order-updated', orderEvent);
                // Broadcast to admin users
                this.broadcastToAdmins('order-updated', orderEvent);
            }
            logger_1.logger.debug(`Order status update event processed: ${orderId} - ${previousStatus} -> ${newStatus}`);
        }
        catch (error) {
            logger_1.logger.error('Order status update event error:', error);
        }
    }
    // Handle order cancellation
    async handleOrderCancelled(orderId, reason) {
        try {
            const order = await orderService_1.orderService.getOrderById(orderId);
            const orderEvent = {
                type: 'ORDER_CANCELLED',
                orderId,
                userId: order.userId,
                data: {
                    order,
                    reason,
                    message: `Your order ${order.orderNumber} has been cancelled`,
                },
                timestamp: new Date(),
            };
            // Import socketServer here to avoid circular dependency
            const { socketServer } = await Promise.resolve().then(() => __importStar(require('../socketServer')));
            if (socketServer) {
                // Broadcast to user
                socketServer.sendToUser(order.userId, 'order-cancelled', orderEvent);
                // Broadcast to admin users
                this.broadcastToAdmins('order-cancelled', orderEvent);
            }
            logger_1.logger.debug(`Order cancelled event processed: ${orderId}`);
        }
        catch (error) {
            logger_1.logger.error('Order cancelled event error:', error);
        }
    }
    // Handle order shipped
    async handleOrderShipped(orderId, trackingInfo) {
        try {
            const order = await orderService_1.orderService.getOrderById(orderId);
            const orderEvent = {
                type: 'ORDER_SHIPPED',
                orderId,
                userId: order.userId,
                data: {
                    order,
                    trackingInfo,
                    message: `Your order ${order.orderNumber} has been shipped! Track your package: ${trackingInfo.trackingNumber}`,
                },
                timestamp: new Date(),
            };
            // Import socketServer here to avoid circular dependency
            const { socketServer } = await Promise.resolve().then(() => __importStar(require('../socketServer')));
            if (socketServer) {
                // Broadcast to user
                socketServer.sendToUser(order.userId, 'order-shipped', orderEvent);
                // Broadcast to admin users
                this.broadcastToAdmins('order-shipped', orderEvent);
            }
            logger_1.logger.debug(`Order shipped event processed: ${orderId}`);
        }
        catch (error) {
            logger_1.logger.error('Order shipped event error:', error);
        }
    }
    // Handle order delivered
    async handleOrderDelivered(orderId) {
        try {
            const order = await orderService_1.orderService.getOrderById(orderId);
            const orderEvent = {
                type: 'ORDER_DELIVERED',
                orderId,
                userId: order.userId,
                data: {
                    order,
                    message: `Your order ${order.orderNumber} has been delivered successfully!`,
                },
                timestamp: new Date(),
            };
            // Import socketServer here to avoid circular dependency
            const { socketServer } = await Promise.resolve().then(() => __importStar(require('../socketServer')));
            if (socketServer) {
                // Broadcast to user
                socketServer.sendToUser(order.userId, 'order-delivered', orderEvent);
                // Broadcast to admin users
                this.broadcastToAdmins('order-delivered', orderEvent);
            }
            logger_1.logger.debug(`Order delivered event processed: ${orderId}`);
        }
        catch (error) {
            logger_1.logger.error('Order delivered event error:', error);
        }
    }
    // Handle order refund
    async handleOrderRefunded(orderId, refundAmount, isFullRefund) {
        try {
            const order = await orderService_1.orderService.getOrderById(orderId);
            const orderEvent = {
                type: 'ORDER_REFUNDED',
                orderId,
                userId: order.userId,
                data: {
                    order,
                    refundAmount,
                    isFullRefund,
                    message: isFullRefund
                        ? `Your order ${order.orderNumber} has been fully refunded`
                        : `A partial refund of ${refundAmount} ${order.totals.currency} has been processed for order ${order.orderNumber}`,
                },
                timestamp: new Date(),
            };
            // Import socketServer here to avoid circular dependency
            const { socketServer } = await Promise.resolve().then(() => __importStar(require('../socketServer')));
            if (socketServer) {
                // Broadcast to user
                socketServer.sendToUser(order.userId, 'order-refunded', orderEvent);
                // Broadcast to admin users
                this.broadcastToAdmins('order-refunded', orderEvent);
            }
            logger_1.logger.debug(`Order refunded event processed: ${orderId}`);
        }
        catch (error) {
            logger_1.logger.error('Order refunded event error:', error);
        }
    }
    // Broadcast to admin users
    async broadcastToAdmins(event, data) {
        try {
            // Get all admin users
            const { prisma } = await Promise.resolve().then(() => __importStar(require('../../utils/database')));
            const adminUsers = await query({
                where: {
                    role: {
                        in: ['ADMIN', 'SUPER_ADMIN'],
                    },
                    isActive: true,
                },
                select: {
                    id: true,
                },
            });
            const { socketServer } = await Promise.resolve().then(() => __importStar(require('../socketServer')));
            if (socketServer) {
                // Broadcast to each admin
                adminUsers.forEach(admin => {
                    socketServer.sendToUser(admin.id, `admin-${event}`, data);
                });
            }
        }
        catch (error) {
            logger_1.logger.error('Error broadcasting to admins:', error);
        }
    }
    // Get status update message
    getStatusUpdateMessage(status, orderNumber) {
        const messages = {
            CONFIRMED: `Your order ${orderNumber} has been confirmed`,
            PROCESSING: `Your order ${orderNumber} is being processed`,
            SHIPPED: `Your order ${orderNumber} has been shipped`,
            DELIVERED: `Your order ${orderNumber} has been delivered`,
            CANCELLED: `Your order ${orderNumber} has been cancelled`,
            REFUNDED: `Your order ${orderNumber} has been refunded`,
        };
        return messages[status] || `Your order ${orderNumber} status has been updated to ${status}`;
    }
}
exports.OrderEventHandler = OrderEventHandler;
exports.orderEventHandler = new OrderEventHandler();
//# sourceMappingURL=orderEventHandler.js.map