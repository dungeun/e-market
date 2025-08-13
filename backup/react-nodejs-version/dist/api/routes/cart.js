"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cartController_1 = require("../controllers/cartController");
const cartWebSocket_1 = require("../../middleware/cartWebSocket");
const router = (0, express_1.Router)();
// Apply global middlewares for cart operations
router.use(cartWebSocket_1.stockWarningMiddleware);
router.use(cartWebSocket_1.cartExpirationMiddleware);
// Cart CRUD operations
router.post('/', cartWebSocket_1.cartUpdatedMiddleware, cartController_1.cartController.createCart);
router.get('/find', cartController_1.cartController.getCartByUserOrSession);
router.get('/', cartController_1.cartController.getCarts);
router.get('/:id', cartController_1.cartController.getCartById);
router.put('/:id', cartWebSocket_1.cartUpdatedMiddleware, cartController_1.cartController.updateCart);
router.delete('/:id', cartWebSocket_1.cartUpdatedMiddleware, cartController_1.cartController.deleteCart);
// Cart item operations
router.post('/:id/items', (0, cartWebSocket_1.addCartEventData)({ action: 'add_item' }), cartWebSocket_1.itemAddedMiddleware, cartController_1.cartController.addItemToCart);
router.put('/:cartId/items/:itemId', (0, cartWebSocket_1.addCartEventData)({ action: 'update_item' }), cartWebSocket_1.itemUpdatedMiddleware, cartController_1.cartController.updateCartItem);
router.delete('/:cartId/items/:itemId', (0, cartWebSocket_1.addCartEventData)({ action: 'remove_item' }), cartWebSocket_1.itemRemovedMiddleware, cartController_1.cartController.removeCartItem);
router.delete('/:id/items', (0, cartWebSocket_1.addCartEventData)({ action: 'clear_cart' }), cartWebSocket_1.cartClearedMiddleware, cartController_1.cartController.clearCart);
// Coupon operations
router.post('/:id/coupons', (0, cartWebSocket_1.addCartEventData)({ action: 'apply_coupon' }), cartWebSocket_1.couponAppliedMiddleware, cartController_1.cartController.applyCoupon);
router.delete('/:id/coupons', (0, cartWebSocket_1.addCartEventData)({ action: 'remove_coupon' }), cartWebSocket_1.couponRemovedMiddleware, cartController_1.cartController.removeCoupon);
// Cart merge and transfer operations
router.post('/merge', (0, cartWebSocket_1.addCartEventData)({ action: 'merge_carts' }), cartWebSocket_1.cartUpdatedMiddleware, cartController_1.cartController.mergeCarts);
router.post('/transfer', (0, cartWebSocket_1.addCartEventData)({ action: 'transfer_cart' }), cartWebSocket_1.cartUpdatedMiddleware, cartController_1.cartController.transferCart);
// Utility operations
router.get('/:id/validate-stock', cartController_1.cartController.validateCartStock);
router.get('/:id/summary', cartController_1.cartController.getCartSummary);
router.get('/count/items', cartController_1.cartController.getCartItemsCount);
// Quick add operation
router.post('/quick-add', (0, cartWebSocket_1.addCartEventData)({ action: 'quick_add' }), cartWebSocket_1.itemAddedMiddleware, cartController_1.cartController.quickAddToCart);
// Admin operations
router.delete('/expired/cleanup', cartController_1.cartController.cleanupExpiredCarts);
// Restore cart from local storage
router.post('/restore', (0, cartWebSocket_1.addCartEventData)({ action: 'restore_cart' }), cartWebSocket_1.cartUpdatedMiddleware, cartController_1.cartController.restoreCart);
// Duplicate cart
router.post('/:id/duplicate', (0, cartWebSocket_1.addCartEventData)({ action: 'duplicate_cart' }), cartWebSocket_1.cartUpdatedMiddleware, cartController_1.cartController.duplicateCart);
// ===== GUEST CART ROUTES =====
/**
 * @route   GET /api/v1/carts/guest
 * @desc    Get or create guest cart by session ID
 * @access  Public
 * @query   sessionId - Guest session ID
 */
router.get('/guest', cartController_1.cartController.getOrCreateGuestCart);
/**
 * @route   GET /api/v1/carts/guest/:sessionId/summary
 * @desc    Get lightweight guest cart summary
 * @access  Public
 * @params  sessionId - Guest session ID
 */
router.get('/guest/:sessionId/summary', cartController_1.cartController.getGuestCartSummary);
/**
 * @route   POST /api/v1/carts/guest/quick-add
 * @desc    Quick add item to guest cart (auto-creates cart if needed)
 * @access  Public
 * @body    { sessionId, productId, variantId?, quantity? }
 */
router.post('/guest/quick-add', (0, cartWebSocket_1.addCartEventData)({ action: 'guest_quick_add' }), cartWebSocket_1.cartUpdatedMiddleware, cartController_1.cartController.quickAddToGuestCart);
/**
 * @route   POST /api/v1/carts/guest/transfer
 * @desc    Transfer guest cart to authenticated user
 * @access  Public
 * @body    { sessionId, userId }
 */
router.post('/guest/transfer', (0, cartWebSocket_1.addCartEventData)({ action: 'guest_transfer' }), cartWebSocket_1.cartUpdatedMiddleware, cartController_1.cartController.transferGuestCart);
/**
 * @route   POST /api/v1/carts/guest/migrate
 * @desc    Migrate cart data from local storage to guest session
 * @access  Public
 * @body    { sessionId, cartData }
 */
router.post('/guest/migrate', (0, cartWebSocket_1.addCartEventData)({ action: 'guest_migrate' }), cartWebSocket_1.cartUpdatedMiddleware, cartController_1.cartController.migrateGuestCartFromLocalStorage);
/**
 * @route   GET /api/v1/carts/guest/session/:sessionId/info
 * @desc    Get guest session information for debugging
 * @access  Public
 * @params  sessionId - Guest session ID
 */
router.get('/guest/session/:sessionId/info', cartController_1.cartController.getGuestSessionInfo);
/**
 * @route   POST /api/v1/carts/guest/session/:sessionId/extend
 * @desc    Extend guest session expiration
 * @access  Public
 * @params  sessionId - Guest session ID
 * @body    { hours? } - Number of hours to extend (default: 24)
 */
router.post('/guest/session/:sessionId/extend', cartController_1.cartController.extendGuestSession);
/**
 * @route   GET /api/v1/carts/guest/stats
 * @desc    Get guest session statistics for analytics
 * @access  Admin
 * @query   hours? - Time period in hours (default: 24)
 */
router.get('/guest/stats', cartController_1.cartController.getGuestSessionStats);
exports.default = router;
//# sourceMappingURL=cart.js.map