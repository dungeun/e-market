"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartExpirationMiddleware = exports.stockWarningMiddleware = exports.addCartEventData = exports.couponRemovedMiddleware = exports.couponAppliedMiddleware = exports.cartClearedMiddleware = exports.itemRemovedMiddleware = exports.itemUpdatedMiddleware = exports.itemAddedMiddleware = exports.cartUpdatedMiddleware = exports.cartWebSocketMiddleware = void 0;
const cartEventHandler_1 = require("../socket/handlers/cartEventHandler");
const logger_1 = require("../utils/logger");
// Middleware to capture cart operations and trigger WebSocket events
const cartWebSocketMiddleware = (eventType) => {
    return async (req, res, next) => {
        // Store original json method
        const originalJson = res.json;
        // Override json method to capture response data
        res.json = function (data) {
            // Call original json method first
            const result = originalJson.call(this, data);
            // Process cart event if response was successful
            if (res.statusCode >= 200 && res.statusCode < 300 && data.success && data.data) {
                // Extract cart information from response
                const cartData = data.data;
                // Create cart event
                const cartEvent = {
                    type: eventType,
                    cartId: cartData.id || req.params.id || req.params.cartId,
                    userId: cartData.userId,
                    sessionId: cartData.sessionId,
                    data: {
                        cart: cartData,
                        ...(req.cartEvent || {}),
                    },
                    timestamp: new Date(),
                };
                // Handle the cart event asynchronously
                setImmediate(() => {
                    cartEventHandler_1.cartEventHandler.handleCartUpdate(cartEvent)
                        .catch(error => {
                        logger_1.logger.error('Failed to handle cart event:', error);
                    });
                });
                // Also handle item count update for relevant events
                if (['ITEM_ADDED', 'ITEM_UPDATED', 'ITEM_REMOVED', 'CART_CLEARED'].includes(eventType)) {
                    setImmediate(() => {
                        cartEventHandler_1.cartEventHandler.handleCartItemCountUpdate(cartEvent.cartId, cartEvent.userId, cartEvent.sessionId).catch(error => {
                            logger_1.logger.error('Failed to handle cart item count update:', error);
                        });
                    });
                }
            }
            return result;
        };
        next();
    };
};
exports.cartWebSocketMiddleware = cartWebSocketMiddleware;
// Middleware for specific cart operations
exports.cartUpdatedMiddleware = (0, exports.cartWebSocketMiddleware)('CART_UPDATED');
exports.itemAddedMiddleware = (0, exports.cartWebSocketMiddleware)('ITEM_ADDED');
exports.itemUpdatedMiddleware = (0, exports.cartWebSocketMiddleware)('ITEM_UPDATED');
exports.itemRemovedMiddleware = (0, exports.cartWebSocketMiddleware)('ITEM_REMOVED');
exports.cartClearedMiddleware = (0, exports.cartWebSocketMiddleware)('CART_CLEARED');
exports.couponAppliedMiddleware = (0, exports.cartWebSocketMiddleware)('COUPON_APPLIED');
exports.couponRemovedMiddleware = (0, exports.cartWebSocketMiddleware)('COUPON_REMOVED');
// Middleware to add additional event data to the request
const addCartEventData = (data) => {
    return (req, _res, next) => {
        req.cartEvent = { ...req.cartEvent, ...data };
        next();
    };
};
exports.addCartEventData = addCartEventData;
// Middleware to handle stock warnings
const stockWarningMiddleware = async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    // Override json method to capture stock validation errors
    res.json = function (data) {
        const result = originalJson.call(this, data);
        // Check for stock-related errors
        if (res.statusCode === 400 && data.error?.message?.includes('stock')) {
            const cartId = req.params.id || req.params.cartId;
            const { productId, variantId } = req.body;
            if (cartId && productId) {
                // Extract stock information from error message or request
                const stockWarningData = {
                    cartId,
                    productId,
                    variantId,
                    availableQuantity: 0, // Would need to extract from actual error
                    requestedQuantity: req.body.quantity || 1,
                };
                // Handle stock warning asynchronously
                setImmediate(() => {
                    cartEventHandler_1.cartEventHandler.handleStockWarning(stockWarningData)
                        .catch(error => {
                        logger_1.logger.error('Failed to handle stock warning:', error);
                    });
                });
            }
        }
        return result;
    };
    next();
};
exports.stockWarningMiddleware = stockWarningMiddleware;
// Middleware to handle cart expiration
const cartExpirationMiddleware = async (_req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    // Override json method to capture expiration errors
    res.json = function (data) {
        const result = originalJson.call(this, data);
        // Check for cart expiration errors
        if (res.statusCode === 410 && data.error?.message?.includes('expired')) {
            const cartId = _req.params.id || _req.params.cartId;
            if (cartId) {
                // Handle cart expiration notification asynchronously
                setImmediate(() => {
                    cartEventHandler_1.cartEventHandler.handleCartExpiration(cartId)
                        .catch(error => {
                        logger_1.logger.error('Failed to handle cart expiration notification:', error);
                    });
                });
            }
        }
        return result;
    };
    next();
};
exports.cartExpirationMiddleware = cartExpirationMiddleware;
//# sourceMappingURL=cartWebSocket.js.map