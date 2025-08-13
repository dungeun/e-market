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
exports.trackStatusChange = exports.addOrderEventData = exports.orderRefundedMiddleware = exports.orderDeliveredMiddleware = exports.orderShippedMiddleware = exports.orderCancelledMiddleware = exports.orderUpdatedMiddleware = exports.orderCreatedMiddleware = void 0;
const orderEventHandler_1 = require("../socket/handlers/orderEventHandler");
const logger_1 = require("../utils/logger");
// Middleware to capture order creation and trigger WebSocket events
const orderCreatedMiddleware = async (_req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    // Override json method to capture response data
    res.json = function (data) {
        // Call original json method first
        const result = originalJson.call(this, data);
        // Process order event if response was successful
        if (res.statusCode === 201 && data.success && data.data) {
            const orderData = data.data;
            // Handle the order created event asynchronously
            setImmediate(() => {
                orderEventHandler_1.orderEventHandler.handleOrderCreated(orderData.id, orderData.userId)
                    .catch(error => {
                    logger_1.logger.error('Failed to handle order created event:', error);
                });
            });
        }
        return result;
    };
    next();
};
exports.orderCreatedMiddleware = orderCreatedMiddleware;
// Middleware to capture order status updates
const orderUpdatedMiddleware = async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    // Override json method to capture response data
    res.json = function (data) {
        // Call original json method first
        const result = originalJson.call(this, data);
        // Process order event if response was successful
        if (res.statusCode >= 200 && res.statusCode < 300 && data.success && data.data) {
            const orderData = data.data;
            // Check if status was updated
            if (req.orderEvent?.previousStatus && req.orderEvent?.newStatus) {
                // Handle the order status update event asynchronously
                setImmediate(() => {
                    orderEventHandler_1.orderEventHandler.handleOrderStatusUpdate(orderData.id, req.orderEvent.previousStatus, req.orderEvent.newStatus).catch(error => {
                        logger_1.logger.error('Failed to handle order status update event:', error);
                    });
                });
            }
        }
        return result;
    };
    next();
};
exports.orderUpdatedMiddleware = orderUpdatedMiddleware;
// Middleware to capture order cancellation
const orderCancelledMiddleware = async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    // Override json method to capture response data
    res.json = function (data) {
        // Call original json method first
        const result = originalJson.call(this, data);
        // Process order event if response was successful
        if (res.statusCode >= 200 && res.statusCode < 300 && data.success && data.data) {
            const orderData = data.data;
            const reason = req.body.reason || 'Unknown reason';
            // Handle the order cancelled event asynchronously
            setImmediate(() => {
                orderEventHandler_1.orderEventHandler.handleOrderCancelled(orderData.id, reason)
                    .catch(error => {
                    logger_1.logger.error('Failed to handle order cancelled event:', error);
                });
            });
        }
        return result;
    };
    next();
};
exports.orderCancelledMiddleware = orderCancelledMiddleware;
// Middleware to capture order shipped
const orderShippedMiddleware = async (_req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    // Override json method to capture response data
    res.json = function (data) {
        // Call original json method first
        const result = originalJson.call(this, data);
        // Process order event if response was successful
        if (res.statusCode >= 200 && res.statusCode < 300 && data.success && data.data) {
            const orderData = data.data;
            const trackingInfo = {
                trackingNumber: orderData.trackingNumber,
                trackingUrl: orderData.trackingUrl,
                carrier: orderData.carrier,
                estimatedDeliveryDate: orderData.estimatedDeliveryDate,
            };
            // Handle the order shipped event asynchronously
            setImmediate(() => {
                orderEventHandler_1.orderEventHandler.handleOrderShipped(orderData.id, trackingInfo)
                    .catch(error => {
                    logger_1.logger.error('Failed to handle order shipped event:', error);
                });
            });
        }
        return result;
    };
    next();
};
exports.orderShippedMiddleware = orderShippedMiddleware;
// Middleware to capture order delivered
const orderDeliveredMiddleware = async (_req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    // Override json method to capture response data
    res.json = function (data) {
        // Call original json method first
        const result = originalJson.call(this, data);
        // Process order event if response was successful
        if (res.statusCode >= 200 && res.statusCode < 300 && data.success && data.data) {
            const orderData = data.data;
            // Handle the order delivered event asynchronously
            setImmediate(() => {
                orderEventHandler_1.orderEventHandler.handleOrderDelivered(orderData.id)
                    .catch(error => {
                    logger_1.logger.error('Failed to handle order delivered event:', error);
                });
            });
        }
        return result;
    };
    next();
};
exports.orderDeliveredMiddleware = orderDeliveredMiddleware;
// Middleware to capture order refund
const orderRefundedMiddleware = async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    // Override json method to capture response data
    res.json = function (data) {
        // Call original json method first
        const result = originalJson.call(this, data);
        // Process order event if response was successful
        if (res.statusCode >= 200 && res.statusCode < 300 && data.success && data.data) {
            const orderData = data.data;
            const refundAmount = req.body.amount || 0;
            const isFullRefund = orderData.status === 'REFUNDED';
            // Handle the order refunded event asynchronously
            setImmediate(() => {
                orderEventHandler_1.orderEventHandler.handleOrderRefunded(orderData.id, refundAmount, isFullRefund)
                    .catch(error => {
                    logger_1.logger.error('Failed to handle order refunded event:', error);
                });
            });
        }
        return result;
    };
    next();
};
exports.orderRefundedMiddleware = orderRefundedMiddleware;
// Middleware to add order event data to the request
const addOrderEventData = (data) => {
    return (req, _res, next) => {
        req.orderEvent = { ...req.orderEvent, ...data };
        next();
    };
};
exports.addOrderEventData = addOrderEventData;
// Middleware to track status changes
const trackStatusChange = async (req, _res, next) => {
    try {
        // Get current order status before update
        if (req.params.id && req.body.status) {
            const { orderService } = await Promise.resolve().then(() => __importStar(require('../services/orderService')));
            const currentOrder = await orderService.getOrderById(req.params.id);
            if (currentOrder && currentOrder.status !== req.body.status) {
                req.orderEvent = {
                    ...req.orderEvent,
                    previousStatus: currentOrder.status,
                    newStatus: req.body.status,
                };
            }
        }
    }
    catch (error) {
        // Continue without tracking if error occurs
        logger_1.logger.debug('Error tracking status change:', error);
    }
    next();
};
exports.trackStatusChange = trackStatusChange;
//# sourceMappingURL=orderWebSocket.js.map