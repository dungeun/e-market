"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderController = exports.OrderController = void 0;
const orderService_1 = require("../../services/orderService");
const error_1 = require("../../middleware/error");
const order_1 = require("../../types/order");
class OrderController {
    constructor() {
        // Create order from cart
        this.createOrder = (0, error_1.asyncHandler)(async (req, res) => {
            const validatedData = order_1.CreateOrderSchema.parse(req.body);
            // Add user ID from authenticated user
            const orderData = {
                ...validatedData,
                userId: req.user.id,
            };
            const order = await orderService_1.orderService.createOrderFromCart(orderData);
            res.status(201).json({
                success: true,
                data: order,
                message: 'Order created successfully',
            });
            return;
        });
        // Get order by ID
        this.getOrderById = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = order_1.OrderParamsSchema.parse(req.params);
            const order = await orderService_1.orderService.getOrderById(id);
            // Check if user has access to this order
            if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
                res.status(403).json({
                    success: false,
                    error: {
                        type: 'ForbiddenError',
                        message: 'You do not have access to this order',
                    },
                });
                return;
            }
            res.json({
                success: true,
                data: order,
            });
            return;
        });
        // Get order by order number
        this.getOrderByNumber = (0, error_1.asyncHandler)(async (req, res) => {
            const { orderNumber } = req.params;
            const order = await orderService_1.orderService.getOrderByNumber(orderNumber);
            // Check if user has access to this order
            if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
                res.status(403).json({
                    success: false,
                    error: {
                        type: 'ForbiddenError',
                        message: 'You do not have access to this order',
                    },
                });
                return;
            }
            res.json({
                success: true,
                data: order,
            });
            return;
        });
        // Get user's orders
        this.getMyOrders = (0, error_1.asyncHandler)(async (req, res) => {
            const validatedQuery = order_1.OrderQuerySchema.parse(req.query);
            const result = await orderService_1.orderService.getUserOrders(req.user.id, validatedQuery);
            res.json({
                success: true,
                data: result.orders,
                pagination: result.pagination,
            });
            return;
        });
        // Get all orders (admin)
        this.getOrders = (0, error_1.asyncHandler)(async (req, res) => {
            const validatedQuery = order_1.OrderQuerySchema.parse(req.query);
            const result = await orderService_1.orderService.getOrders(validatedQuery);
            res.json({
                success: true,
                data: result.orders,
                pagination: result.pagination,
            });
        });
        // Update order (admin)
        this.updateOrder = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = order_1.OrderParamsSchema.parse(req.params);
            const validatedData = order_1.UpdateOrderSchema.parse(req.body);
            const order = await orderService_1.orderService.updateOrder(id, validatedData);
            res.json({
                success: true,
                data: order,
                message: 'Order updated successfully',
            });
        });
        // Cancel order
        this.cancelOrder = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = order_1.OrderParamsSchema.parse(req.params);
            const validatedData = order_1.CancelOrderSchema.parse(req.body);
            // Get order to check ownership
            const order = await orderService_1.orderService.getOrderById(id);
            // Check if user has permission to cancel
            if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
                res.status(403).json({
                    success: false,
                    error: {
                        type: 'ForbiddenError',
                        message: 'You do not have permission to cancel this order',
                    },
                });
            }
            const cancelledOrder = await orderService_1.orderService.cancelOrder(id, validatedData);
            res.json({
                success: true,
                data: cancelledOrder,
                message: 'Order cancelled successfully',
            });
        });
        // Process refund (admin)
        this.processRefund = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = order_1.OrderParamsSchema.parse(req.params);
            const validatedData = order_1.RefundOrderSchema.parse(req.body);
            const refundedOrder = await orderService_1.orderService.processRefund(id, validatedData);
            res.json({
                success: true,
                data: refundedOrder,
                message: 'Refund processed successfully',
            });
        });
        // Update shipping information (admin)
        this.updateShipping = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = order_1.OrderParamsSchema.parse(req.params);
            const validatedData = order_1.UpdateShippingSchema.parse(req.body);
            const order = await orderService_1.orderService.updateShipping(id, validatedData);
            res.json({
                success: true,
                data: order,
                message: 'Shipping information updated successfully',
            });
        });
        // Mark order as delivered (admin)
        this.markAsDelivered = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = order_1.OrderParamsSchema.parse(req.params);
            const order = await orderService_1.orderService.markAsDelivered(id);
            res.json({
                success: true,
                data: order,
                message: 'Order marked as delivered',
            });
        });
        // Get order timeline
        this.getOrderTimeline = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = order_1.OrderParamsSchema.parse(req.params);
            // Get order to check ownership
            const order = await orderService_1.orderService.getOrderById(id);
            // Check if user has access to this order
            if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
                res.status(403).json({
                    success: false,
                    error: {
                        type: 'ForbiddenError',
                        message: 'You do not have access to this order timeline',
                    },
                });
            }
            const timeline = await orderService_1.orderService.getOrderTimeline(id);
            res.json({
                success: true,
                data: timeline,
            });
        });
        // Get order analytics (admin)
        this.getOrderAnalytics = (0, error_1.asyncHandler)(async (req, res) => {
            const { userId } = req.query;
            const analytics = await orderService_1.orderService.getOrderAnalytics(userId);
            res.json({
                success: true,
                data: analytics,
            });
        });
        // Get my order analytics
        this.getMyOrderAnalytics = (0, error_1.asyncHandler)(async (req, res) => {
            const analytics = await orderService_1.orderService.getOrderAnalytics(req.user.id);
            res.json({
                success: true,
                data: analytics,
            });
        });
        // Download invoice
        this.downloadInvoice = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = order_1.OrderParamsSchema.parse(req.params);
            // Get order to check ownership
            const order = await orderService_1.orderService.getOrderById(id);
            // Check if user has access to this order
            if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
                res.status(403).json({
                    success: false,
                    error: {
                        type: 'ForbiddenError',
                        message: 'You do not have access to this invoice',
                    },
                });
            }
            // TODO: Generate PDF invoice
            res.json({
                success: false,
                error: {
                    type: 'NotImplementedError',
                    message: 'Invoice generation not yet implemented',
                },
            });
        });
        // Resend order confirmation
        this.resendOrderConfirmation = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = order_1.OrderParamsSchema.parse(req.params);
            // Get order to check ownership
            const order = await orderService_1.orderService.getOrderById(id);
            // Check if user has access to this order
            if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
                res.status(403).json({
                    success: false,
                    error: {
                        type: 'ForbiddenError',
                        message: 'You do not have permission to resend confirmation',
                    },
                });
            }
            // TODO: Send order confirmation email
            res.json({
                success: false,
                error: {
                    type: 'NotImplementedError',
                    message: 'Email service not yet implemented',
                },
            });
        });
        // Export orders (admin)
        this.exportOrders = (0, error_1.asyncHandler)(async (req, res) => {
            // Parse query and format for future implementation
            order_1.OrderQuerySchema.parse(req.query);
            const { format: _format = 'csv' } = req.query;
            // Suppress unused variable warning - functionality not yet implemented
            void _format;
            // TODO: Implement order export functionality
            res.json({
                success: false,
                error: {
                    type: 'NotImplementedError',
                    message: 'Order export not yet implemented',
                },
            });
        });
    }
}
exports.OrderController = OrderController;
exports.orderController = new OrderController();
//# sourceMappingURL=orderController.js.map