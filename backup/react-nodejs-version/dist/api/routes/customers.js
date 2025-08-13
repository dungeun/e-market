"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerController_1 = require("../controllers/customerController");
const auth_1 = require("../../middleware/auth");
const rateLimiter_1 = require("../../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Rate limiting for sensitive operations
const strictRateLimit = (0, rateLimiter_1.dynamicRateLimiter)('auth');
const standardRateLimit = (0, rateLimiter_1.dynamicRateLimiter)('api');
// ===== Customer Profile Routes =====
// Get own profile
router.get('/profile', auth_1.authenticate, standardRateLimit, customerController_1.CustomerController.getProfile);
// Update own profile
router.put('/profile', auth_1.authenticate, auth_1.csrfProtection, standardRateLimit, customerController_1.CustomerController.updateProfile);
// ===== Address Management Routes =====
// Get all addresses
router.get('/addresses', auth_1.authenticate, standardRateLimit, customerController_1.CustomerController.getAddresses);
// Get specific address
router.get('/addresses/:addressId', auth_1.authenticate, standardRateLimit, customerController_1.CustomerController.getAddress);
// Add new address
router.post('/addresses', auth_1.authenticate, auth_1.csrfProtection, standardRateLimit, customerController_1.CustomerController.addAddress);
// Update address
router.put('/addresses/:addressId', auth_1.authenticate, auth_1.csrfProtection, standardRateLimit, customerController_1.CustomerController.updateAddress);
// Delete address
router.delete('/addresses/:addressId', auth_1.authenticate, auth_1.csrfProtection, standardRateLimit, customerController_1.CustomerController.deleteAddress);
// Set default address
router.put('/addresses/:addressId/set-default', auth_1.authenticate, auth_1.csrfProtection, standardRateLimit, customerController_1.CustomerController.setDefaultAddress);
// ===== Payment Method Management Routes =====
// Get all payment methods
router.get('/payment-methods', auth_1.authenticate, standardRateLimit, customerController_1.CustomerController.getPaymentMethods);
// Get specific payment method
router.get('/payment-methods/:paymentMethodId', auth_1.authenticate, standardRateLimit, customerController_1.CustomerController.getPaymentMethod);
// Add new payment method
router.post('/payment-methods', auth_1.authenticate, auth_1.csrfProtection, strictRateLimit, // Stricter rate limit for payment operations
customerController_1.CustomerController.addPaymentMethod);
// Update payment method (limited updates allowed)
router.put('/payment-methods/:paymentMethodId', auth_1.authenticate, auth_1.csrfProtection, standardRateLimit, customerController_1.CustomerController.updatePaymentMethod);
// Delete payment method
router.delete('/payment-methods/:paymentMethodId', auth_1.authenticate, auth_1.csrfProtection, standardRateLimit, customerController_1.CustomerController.deletePaymentMethod);
// Set default payment method
router.put('/payment-methods/:paymentMethodId/set-default', auth_1.authenticate, auth_1.csrfProtection, standardRateLimit, customerController_1.CustomerController.setDefaultPaymentMethod);
// ===== Order History Routes =====
// Get order history
router.get('/orders', auth_1.authenticate, standardRateLimit, customerController_1.CustomerController.getOrderHistory);
// ===== Wishlist Management Routes =====
// Get wishlist
router.get('/wishlist', auth_1.authenticate, standardRateLimit, customerController_1.CustomerController.getWishlist);
// Add to wishlist
router.post('/wishlist', auth_1.authenticate, auth_1.csrfProtection, standardRateLimit, customerController_1.CustomerController.addToWishlist);
// Remove from wishlist
router.delete('/wishlist/:productId', auth_1.authenticate, auth_1.csrfProtection, standardRateLimit, customerController_1.CustomerController.removeFromWishlist);
// Clear wishlist
router.delete('/wishlist', auth_1.authenticate, auth_1.csrfProtection, standardRateLimit, customerController_1.CustomerController.clearWishlist);
// ===== Customer Preferences Routes =====
// Get preferences
router.get('/preferences', auth_1.authenticate, standardRateLimit, customerController_1.CustomerController.getPreferences);
// Update preferences
router.put('/preferences', auth_1.authenticate, auth_1.csrfProtection, standardRateLimit, customerController_1.CustomerController.updatePreferences);
// ===== Customer Activity Routes =====
// Get activity history
router.get('/activity', auth_1.authenticate, standardRateLimit, customerController_1.CustomerController.getActivity);
// ===== GDPR Compliance Routes =====
// Export customer data
router.get('/export-data', auth_1.authenticate, strictRateLimit, // Strict rate limit for data export
customerController_1.CustomerController.exportData);
// Delete account
router.delete('/account', auth_1.authenticate, auth_1.csrfProtection, strictRateLimit, // Very strict rate limit for account deletion
customerController_1.CustomerController.deleteAccount);
// ===== Admin Routes =====
// Search customers (admin only)
router.get('/search', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN']), standardRateLimit, customerController_1.CustomerController.searchCustomers);
// Get customer analytics (admin only)
router.get('/:customerId/analytics', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN']), standardRateLimit, customerController_1.CustomerController.getCustomerAnalytics);
// View customer profile (admin only)
router.get('/:customerId/profile', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN']), standardRateLimit, customerController_1.CustomerController.adminGetCustomerProfile);
// Update customer status (admin only)
router.put('/:customerId/status', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'SUPER_ADMIN']), auth_1.csrfProtection, standardRateLimit, customerController_1.CustomerController.adminUpdateCustomerStatus);
exports.default = router;
//# sourceMappingURL=customers.js.map