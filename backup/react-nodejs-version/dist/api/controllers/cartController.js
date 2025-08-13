"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartController = exports.CartController = void 0;
const cartService_1 = require("../../services/cartService");
const sessionService_1 = require("../../services/sessionService");
const error_1 = require("../../middleware/error");
const cart_1 = require("../../types/cart");
const logger_1 = require("../../utils/logger");
const zod_1 = require("zod");
class CartController {
    constructor() {
        // Create a new cart
        this.createCart = (0, error_1.asyncHandler)(async (req, res) => {
            const validatedData = cart_1.CreateCartSchema.parse(req.body);
            // If no sessionId provided, generate one
            if (!validatedData.userId && !validatedData.sessionId) {
                validatedData.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            }
            const cart = await cartService_1.cartService.createCart(validatedData);
            res.status(201).json({
                success: true,
                data: cart,
                message: 'Cart created successfully',
            });
        });
        // Get cart by ID
        this.getCartById = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = cart_1.CartParamsSchema.parse(req.params);
            const cart = await cartService_1.cartService.getCartById(id);
            res.json({
                success: true,
                data: cart,
            });
        });
        // Get cart by user or session
        this.getCartByUserOrSession = (0, error_1.asyncHandler)(async (req, res) => {
            const { userId, sessionId } = req.query;
            if (!userId && !sessionId) {
                res.status(400).json({
                    success: false,
                    error: {
                        type: 'ValidationError',
                        message: 'Either userId or sessionId must be provided',
                    },
                });
                return;
            }
            const cart = await cartService_1.cartService.getCartByUserOrSession(userId, sessionId);
            if (!cart) {
                res.status(404).json({
                    success: false,
                    error: {
                        type: 'NotFoundError',
                        message: 'Cart not found',
                    },
                });
                return;
            }
            res.json({
                success: true,
                data: cart,
            });
        });
        // Get all carts with pagination
        this.getCarts = (0, error_1.asyncHandler)(async (req, res) => {
            const validatedQuery = cart_1.CartQuerySchema.parse(req.query);
            const result = await cartService_1.cartService.getCarts(validatedQuery);
            res.json({
                success: true,
                data: result.carts,
                pagination: result.pagination,
            });
        });
        // Update cart
        this.updateCart = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = cart_1.CartParamsSchema.parse(req.params);
            const validatedData = cart_1.UpdateCartSchema.parse(req.body);
            const cart = await cartService_1.cartService.updateCart(id, validatedData);
            res.json({
                success: true,
                data: cart,
                message: 'Cart updated successfully',
            });
        });
        // Delete cart
        this.deleteCart = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = cart_1.CartParamsSchema.parse(req.params);
            await cartService_1.cartService.deleteCart(id);
            res.json({
                success: true,
                message: 'Cart deleted successfully',
            });
        });
        // Add item to cart
        this.addItemToCart = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = cart_1.CartParamsSchema.parse(req.params);
            const validatedData = cart_1.AddCartItemSchema.parse(req.body);
            const cart = await cartService_1.cartService.addItemToCart(id, validatedData);
            res.json({
                success: true,
                data: cart,
                message: 'Item added to cart successfully',
            });
        });
        // Update cart item
        this.updateCartItem = (0, error_1.asyncHandler)(async (req, res) => {
            const { cartId, itemId } = cart_1.CartItemParamsSchema.parse(req.params);
            const validatedData = cart_1.UpdateCartItemSchema.parse(req.body);
            const cart = await cartService_1.cartService.updateCartItem(cartId, itemId, validatedData);
            res.json({
                success: true,
                data: cart,
                message: 'Cart item updated successfully',
            });
        });
        // Remove item from cart
        this.removeCartItem = (0, error_1.asyncHandler)(async (req, res) => {
            const { cartId, itemId } = cart_1.CartItemParamsSchema.parse(req.params);
            const cart = await cartService_1.cartService.removeCartItem(cartId, itemId);
            res.json({
                success: true,
                data: cart,
                message: 'Item removed from cart successfully',
            });
        });
        // Clear cart
        this.clearCart = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = cart_1.CartParamsSchema.parse(req.params);
            const cart = await cartService_1.cartService.clearCart(id);
            res.json({
                success: true,
                data: cart,
                message: 'Cart cleared successfully',
            });
        });
        // Apply coupon to cart
        this.applyCoupon = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = cart_1.CartParamsSchema.parse(req.params);
            const validatedData = cart_1.ApplyCouponSchema.parse(req.body);
            const cart = await cartService_1.cartService.applyCoupon(id, validatedData);
            res.json({
                success: true,
                data: cart,
                message: 'Coupon applied successfully',
            });
        });
        // Remove coupon from cart
        this.removeCoupon = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = cart_1.CartParamsSchema.parse(req.params);
            const { couponId } = cart_1.RemoveCouponSchema.parse(req.body);
            const cart = await cartService_1.cartService.removeCoupon(id, couponId);
            res.json({
                success: true,
                data: cart,
                message: 'Coupon removed successfully',
            });
        });
        // Merge carts
        this.mergeCarts = (0, error_1.asyncHandler)(async (req, res) => {
            const validatedData = cart_1.MergeCartsSchema.parse(req.body);
            const cart = await cartService_1.cartService.mergeCarts(validatedData);
            res.json({
                success: true,
                data: cart,
                message: 'Carts merged successfully',
            });
        });
        // Transfer cart from session to user
        this.transferCart = (0, error_1.asyncHandler)(async (req, res) => {
            const validatedData = cart_1.TransferCartSchema.parse(req.body);
            const cart = await cartService_1.cartService.transferCart(validatedData);
            res.json({
                success: true,
                data: cart,
                message: 'Cart transferred successfully',
            });
        });
        // Validate cart stock
        this.validateCartStock = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = cart_1.CartParamsSchema.parse(req.params);
            const result = await cartService_1.cartService.validateCartStock(id);
            res.json({
                success: true,
                data: result,
            });
        });
        // Get cart summary/totals
        this.getCartSummary = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = cart_1.CartParamsSchema.parse(req.params);
            const cart = await cartService_1.cartService.getCartById(id);
            res.json({
                success: true,
                data: {
                    id: cart.id,
                    itemCount: cart.totals.itemCount,
                    totals: cart.totals,
                    appliedCoupons: cart.appliedCoupons,
                    isExpired: cart.isExpired,
                    lastActivity: cart.lastActivity,
                },
            });
        });
        // Get cart items count
        this.getCartItemsCount = (0, error_1.asyncHandler)(async (req, res) => {
            const { userId, sessionId } = req.query;
            if (!userId && !sessionId) {
                res.json({
                    success: true,
                    data: { count: 0 },
                });
                return;
            }
            const cart = await cartService_1.cartService.getCartByUserOrSession(userId, sessionId);
            const count = cart ? cart.totals.itemCount : 0;
            res.json({
                success: true,
                data: { count },
            });
        });
        // Quick add to cart (simplified endpoint)
        this.quickAddToCart = (0, error_1.asyncHandler)(async (req, res) => {
            const { productId, variantId, quantity = 1 } = req.body;
            const { userId, sessionId } = req.query;
            if (!productId) {
                res.status(400).json({
                    success: false,
                    error: {
                        type: 'ValidationError',
                        message: 'Product ID is required',
                    },
                });
                return;
            }
            // Try to find existing cart or create new one
            let cart = await cartService_1.cartService.getCartByUserOrSession(userId, sessionId);
            if (!cart) {
                // Create new cart
                const createData = {
                    userId: userId,
                    sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    currency: 'USD',
                };
                cart = await cartService_1.cartService.createCart(createData);
            }
            // Add item to cart
            const updatedCart = await cartService_1.cartService.addItemToCart(cart.id, {
                productId,
                variantId,
                quantity: Number(quantity),
            });
            res.json({
                success: true,
                data: updatedCart,
                message: 'Item added to cart successfully',
            });
        });
        // Cleanup expired carts (admin endpoint)
        this.cleanupExpiredCarts = (0, error_1.asyncHandler)(async (_req, res) => {
            const count = await cartService_1.cartService.cleanupExpiredCarts();
            res.json({
                success: true,
                data: { deletedCount: count },
                message: `Cleaned up ${count} expired carts`,
            });
        });
        // Restore cart from local storage (for PWA/offline support)
        this.restoreCart = (0, error_1.asyncHandler)(async (req, res) => {
            const { cartData, userId, sessionId } = req.body;
            if (!cartData || !cartData.items || !Array.isArray(cartData.items)) {
                res.status(400).json({
                    success: false,
                    error: {
                        type: 'ValidationError',
                        message: 'Invalid cart data provided',
                    },
                });
                return;
            }
            // Create new cart with restored items
            const createData = {
                userId,
                sessionId,
                currency: cartData.currency || 'USD',
                items: cartData.items.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                })),
            };
            const cart = await cartService_1.cartService.createCart(createData);
            logger_1.logger.info(`Cart restored for ${userId ? `user ${userId}` : `session ${sessionId}`}`);
            res.status(201).json({
                success: true,
                data: cart,
                message: 'Cart restored successfully',
            });
        });
        // Duplicate cart (for save for later functionality)
        this.duplicateCart = (0, error_1.asyncHandler)(async (req, res) => {
            const { id } = cart_1.CartParamsSchema.parse(req.params);
            const { userId, sessionId } = req.body;
            const originalCart = await cartService_1.cartService.getCartById(id);
            const createData = {
                userId,
                sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                currency: originalCart.currency,
                items: originalCart.items.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                })),
            };
            const duplicatedCart = await cartService_1.cartService.createCart(createData);
            res.status(201).json({
                success: true,
                data: duplicatedCart,
                message: 'Cart duplicated successfully',
            });
        });
        // ===== GUEST-SPECIFIC ENDPOINTS =====
        // Get or create guest cart by session
        this.getOrCreateGuestCart = (0, error_1.asyncHandler)(async (req, res) => {
            const { sessionId } = req.query;
            if (!sessionId) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Session ID is required for guest cart' }
                });
                return;
            }
            // Try to find existing guest cart
            let cart = await cartService_1.cartService.getCartByUserOrSession(undefined, sessionId);
            if (!cart) {
                // Create new guest cart
                cart = await cartService_1.cartService.createCart({
                    sessionId: sessionId,
                    currency: 'USD'
                });
                logger_1.logger.info(`Created new guest cart for session: ${sessionId}`);
            }
            res.json({
                success: true,
                data: cart,
                message: cart.items.length === 0 ? 'Empty guest cart ready' : 'Guest cart retrieved'
            });
        });
        // Get guest session info
        this.getGuestSessionInfo = (0, error_1.asyncHandler)(async (req, res) => {
            const { sessionId } = req.params;
            const sessionInfo = await sessionService_1.sessionService.getSessionInfo(sessionId);
            res.json({
                success: true,
                data: sessionInfo
            });
        });
        // Extend guest session
        this.extendGuestSession = (0, error_1.asyncHandler)(async (req, res) => {
            const { sessionId } = req.params;
            const { hours = 24 } = req.body;
            const ExtendSessionSchema = zod_1.z.object({
                hours: zod_1.z.number().min(1).max(168).default(24) // Max 1 week
            });
            const { hours: validatedHours } = ExtendSessionSchema.parse({ hours });
            const session = await sessionService_1.sessionService.extendSession(sessionId, validatedHours);
            if (!session) {
                res.status(404).json({
                    success: false,
                    error: { message: 'Guest session not found' }
                });
                return;
            }
            res.json({
                success: true,
                data: session,
                message: `Session extended by ${validatedHours} hours`
            });
        });
        // Transfer guest cart to authenticated user
        this.transferGuestCart = (0, error_1.asyncHandler)(async (req, res) => {
            const { sessionId, userId } = req.body;
            const TransferGuestCartSchema = zod_1.z.object({
                sessionId: zod_1.z.string().min(1, 'Session ID is required'),
                userId: zod_1.z.string().cuid('Invalid user ID')
            });
            const validatedData = TransferGuestCartSchema.parse({ sessionId, userId });
            const success = await sessionService_1.sessionService.transferSessionToUser(validatedData.sessionId, validatedData.userId);
            if (!success) {
                res.status(404).json({
                    success: false,
                    error: { message: 'Guest cart not found or transfer failed' }
                });
                return;
            }
            // Get the user's cart after transfer
            const userCart = await cartService_1.cartService.getCartByUserOrSession(validatedData.userId);
            res.json({
                success: true,
                data: userCart,
                message: 'Guest cart transferred to user successfully'
            });
        });
        // Quick add to guest cart (auto-create cart if needed)
        this.quickAddToGuestCart = (0, error_1.asyncHandler)(async (req, res) => {
            const { sessionId, productId, variantId, quantity = 1 } = req.body;
            const QuickAddSchema = zod_1.z.object({
                sessionId: zod_1.z.string().min(1, 'Session ID is required'),
                productId: zod_1.z.string().cuid('Invalid product ID'),
                variantId: zod_1.z.string().cuid().optional(),
                quantity: zod_1.z.number().int().min(1).max(999).default(1)
            });
            const validatedData = QuickAddSchema.parse({ sessionId, productId, variantId, quantity });
            // Get or create guest cart
            let cart = await cartService_1.cartService.getCartByUserOrSession(undefined, validatedData.sessionId);
            if (!cart) {
                cart = await cartService_1.cartService.createCart({
                    sessionId: validatedData.sessionId,
                    currency: 'USD'
                });
            }
            // Add item to cart
            const updatedCart = await cartService_1.cartService.addItemToCart(cart.id, {
                productId: validatedData.productId,
                variantId: validatedData.variantId,
                quantity: validatedData.quantity
            });
            res.json({
                success: true,
                data: updatedCart,
                message: 'Item added to guest cart'
            });
        });
        // Get guest cart summary (lightweight version)
        this.getGuestCartSummary = (0, error_1.asyncHandler)(async (req, res) => {
            const { sessionId } = req.params;
            const cart = await cartService_1.cartService.getCartByUserOrSession(undefined, sessionId);
            if (!cart) {
                res.json({
                    success: true,
                    data: {
                        itemCount: 0,
                        total: 0,
                        subtotal: 0,
                        currency: 'USD',
                        isEmpty: true
                    }
                });
                return;
            }
            res.json({
                success: true,
                data: {
                    cartId: cart.id,
                    itemCount: cart.totals.itemCount,
                    total: cart.totals.total,
                    subtotal: cart.totals.subtotal,
                    taxAmount: cart.totals.taxAmount,
                    discountAmount: cart.totals.discountAmount,
                    currency: cart.currency,
                    isEmpty: cart.items.length === 0,
                    expiresAt: cart.expiresAt,
                    isExpired: cart.isExpired
                }
            });
        });
        // Migrate guest cart data from local storage
        this.migrateGuestCartFromLocalStorage = (0, error_1.asyncHandler)(async (req, res) => {
            const { sessionId, cartData } = req.body;
            const MigrateCartSchema = zod_1.z.object({
                sessionId: zod_1.z.string().min(1, 'Session ID is required'),
                cartData: zod_1.z.object({
                    items: zod_1.z.array(zod_1.z.object({
                        productId: zod_1.z.string().cuid(),
                        variantId: zod_1.z.string().cuid().optional(),
                        quantity: zod_1.z.number().int().min(1),
                        options: zod_1.z.record(zod_1.z.any()).optional()
                    })),
                    coupons: zod_1.z.array(zod_1.z.string()).optional(),
                    currency: zod_1.z.string().length(3).default('USD')
                })
            });
            const validatedData = MigrateCartSchema.parse({ sessionId, cartData });
            // Create new guest cart
            const cart = await cartService_1.cartService.createCart({
                sessionId: validatedData.sessionId,
                currency: validatedData.cartData.currency
            });
            // Add items from local storage
            for (const item of validatedData.cartData.items) {
                try {
                    await cartService_1.cartService.addItemToCart(cart.id, item);
                }
                catch (error) {
                    logger_1.logger.warn(`Failed to migrate item ${item.productId}:`, error);
                    // Continue with other items
                }
            }
            // Apply coupons if any
            if (validatedData.cartData.coupons) {
                for (const couponCode of validatedData.cartData.coupons) {
                    try {
                        await cartService_1.cartService.applyCoupon(cart.id, { couponCode });
                    }
                    catch (error) {
                        logger_1.logger.warn(`Failed to apply coupon ${couponCode}:`, error);
                        // Continue with other coupons
                    }
                }
            }
            // Get updated cart
            const migratedCart = await cartService_1.cartService.getCartById(cart.id);
            res.json({
                success: true,
                data: migratedCart,
                message: 'Guest cart migrated from local storage'
            });
        });
        // Get guest session statistics (for analytics)
        this.getGuestSessionStats = (0, error_1.asyncHandler)(async (req, res) => {
            const { hours = 24 } = req.query;
            const stats = await sessionService_1.sessionService.getSessionStats(Number(hours));
            res.json({
                success: true,
                data: stats
            });
        });
    }
}
exports.CartController = CartController;
exports.cartController = new CartController();
//# sourceMappingURL=cartController.js.map