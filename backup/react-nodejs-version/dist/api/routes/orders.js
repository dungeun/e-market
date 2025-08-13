"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../../middleware/auth");
const orderWebSocket_1 = require("../../middleware/orderWebSocket");
const router = (0, express_1.Router)();
// All order routes require authentication
router.use(auth_1.authenticate);
// Customer routes
router.post('/', orderWebSocket_1.orderCreatedMiddleware, orderController_1.orderController.createOrder);
router.get('/my-orders', orderController_1.orderController.getMyOrders);
router.get('/my-analytics', orderController_1.orderController.getMyOrderAnalytics);
router.get('/number/:orderNumber', orderController_1.orderController.getOrderByNumber);
router.get('/:id', orderController_1.orderController.getOrderById);
router.get('/:id/timeline', orderController_1.orderController.getOrderTimeline);
router.post('/:id/cancel', orderWebSocket_1.orderCancelledMiddleware, orderController_1.orderController.cancelOrder);
router.get('/:id/invoice', orderController_1.orderController.downloadInvoice);
router.post('/:id/resend-confirmation', orderController_1.orderController.resendOrderConfirmation);
// Admin routes
router.get('/', (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN']), orderController_1.orderController.getOrders);
router.put('/:id', (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN']), orderWebSocket_1.trackStatusChange, orderWebSocket_1.orderUpdatedMiddleware, orderController_1.orderController.updateOrder);
router.post('/:id/refund', (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN']), orderWebSocket_1.orderRefundedMiddleware, orderController_1.orderController.processRefund);
router.put('/:id/shipping', (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN']), orderWebSocket_1.orderShippedMiddleware, orderController_1.orderController.updateShipping);
router.post('/:id/delivered', (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN']), orderWebSocket_1.orderDeliveredMiddleware, orderController_1.orderController.markAsDelivered);
router.get('/analytics/overview', (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN']), orderController_1.orderController.getOrderAnalytics);
router.get('/export', (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN']), orderController_1.orderController.exportOrders);
exports.default = router;
//# sourceMappingURL=orders.js.map