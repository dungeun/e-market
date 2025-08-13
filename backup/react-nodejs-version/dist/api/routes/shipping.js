"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shippingController_1 = require("../controllers/shippingController");
const auth_1 = require("../../middleware/auth");
const rateLimiter_1 = require("../../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Public routes (no authentication required)
// Calculate shipping rates for checkout
router.post('/rates', (0, rateLimiter_1.dynamicRateLimiter)('api'), shippingController_1.shippingController.calculateRates);
// Track shipment by tracking number (public access)
router.get('/track/:trackingNumber', (0, rateLimiter_1.dynamicRateLimiter)('api'), shippingController_1.shippingController.trackShipment);
// Get available carriers and services
router.get('/carriers', shippingController_1.shippingController.getCarriers);
// Calculate shipping for specific order (used during checkout)
router.post('/orders/:orderId/calculate', shippingController_1.shippingController.calculateOrderShipping);
// Webhook endpoints for carriers (no authentication, but should verify signature)
router.post('/webhooks/ups', (0, rateLimiter_1.dynamicRateLimiter)('api'), shippingController_1.shippingController.handleWebhook);
router.post('/webhooks/fedex', (0, rateLimiter_1.dynamicRateLimiter)('api'), shippingController_1.shippingController.handleWebhook);
router.post('/webhooks/dhl', (0, rateLimiter_1.dynamicRateLimiter)('api'), shippingController_1.shippingController.handleWebhook);
router.post('/webhooks/usps', (0, rateLimiter_1.dynamicRateLimiter)('api'), shippingController_1.shippingController.handleWebhook);
router.post('/webhooks/:carrier', (0, rateLimiter_1.dynamicRateLimiter)('api'), shippingController_1.shippingController.handleWebhook);
// Authenticated routes
router.use(auth_1.authenticate);
// Customer routes (authenticated users)
// Note: Customers typically can't directly create shipments, but they can track their orders
// These might be moved to order routes in a real implementation
// Staff/Admin routes
// Create shipment (staff and admin only)
router.post('/', (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN', 'STAFF']), shippingController_1.shippingController.createShipment);
// Get shipments with pagination (staff and admin only)
router.get('/', (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN', 'STAFF']), shippingController_1.shippingController.getShipments);
// Get shipment by ID (staff and admin only)
router.get('/:id', (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN', 'STAFF']), shippingController_1.shippingController.getShipmentById);
// Update shipment (staff and admin only)
router.put('/:id', (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN', 'STAFF']), shippingController_1.shippingController.updateShipment);
// Cancel shipment (staff and admin only)
router.post('/:id/cancel', (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN', 'STAFF']), shippingController_1.shippingController.cancelShipment);
// Get shipment label (admin only)
router.get('/:id/label', (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN']), shippingController_1.shippingController.getShipmentLabel);
// Admin-only routes
// Get shipping analytics
router.get('/analytics/overview', (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN']), shippingController_1.shippingController.getAnalytics);
// Shipping management routes (admin only)
// TODO: Add shipping rules management
// router.get('/rules', authorize(['ADMIN', 'SUPER_ADMIN']), shippingController.getShippingRules)
// router.post('/rules', authorize(['ADMIN', 'SUPER_ADMIN']), shippingController.createShippingRule)
// router.put('/rules/:id', authorize(['ADMIN', 'SUPER_ADMIN']), shippingController.updateShippingRule)
// router.delete('/rules/:id', authorize(['ADMIN', 'SUPER_ADMIN']), shippingController.deleteShippingRule)
// TODO: Add shipping zones management
// router.get('/zones', authorize(['ADMIN', 'SUPER_ADMIN']), shippingController.getShippingZones)
// router.post('/zones', authorize(['ADMIN', 'SUPER_ADMIN']), shippingController.createShippingZone)
// router.put('/zones/:id', authorize(['ADMIN', 'SUPER_ADMIN']), shippingController.updateShippingZone)
// router.delete('/zones/:id', authorize(['ADMIN', 'SUPER_ADMIN']), shippingController.deleteShippingZone)
// TODO: Add carrier configuration management
// router.get('/carriers/config', authorize(['ADMIN', 'SUPER_ADMIN']), shippingController.getCarrierConfigs)
// router.post('/carriers/config', authorize(['ADMIN', 'SUPER_ADMIN']), shippingController.createCarrierConfig)
// router.put('/carriers/config/:id', authorize(['ADMIN', 'SUPER_ADMIN']), shippingController.updateCarrierConfig)
// router.delete('/carriers/config/:id', authorize(['ADMIN', 'SUPER_ADMIN']), shippingController.deleteCarrierConfig)
// Test endpoints (admin only, for development/testing)
// router.post('/test/rates', authorize(['ADMIN', 'SUPER_ADMIN']), shippingController.testRateCalculation)
// router.post('/test/webhooks', authorize(['ADMIN', 'SUPER_ADMIN']), shippingController.testWebhook)
exports.default = router;
//# sourceMappingURL=shipping.js.map