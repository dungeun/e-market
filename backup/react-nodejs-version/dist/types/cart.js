"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartSyncSchema = exports.CartEventSchema = exports.CartItemStockSchema = exports.CartCalculationSchema = exports.CartItemOptionsSchema = exports.TransferCartSchema = exports.MergeCartsSchema = exports.RemoveCouponSchema = exports.ApplyCouponSchema = exports.CartItemParamsSchema = exports.CartParamsSchema = exports.CartQuerySchema = exports.UpdateCartItemSchema = exports.AddCartItemSchema = exports.UpdateCartSchema = exports.CreateCartSchema = void 0;
const zod_1 = require("zod");
// Cart validation schemas
exports.CreateCartSchema = zod_1.z.object({
    userId: zod_1.z.string().cuid().optional(),
    sessionId: zod_1.z.string().min(1).optional(),
    currency: zod_1.z.string().length(3).default('USD'),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().cuid(),
        variantId: zod_1.z.string().cuid().optional(),
        quantity: zod_1.z.number().int().min(1),
    })).optional(),
});
exports.UpdateCartSchema = zod_1.z.object({
    currency: zod_1.z.string().length(3).optional(),
});
exports.AddCartItemSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid('Invalid product ID'),
    variantId: zod_1.z.string().cuid().optional(),
    quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1').max(999, 'Quantity cannot exceed 999'),
    options: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.UpdateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1').max(999, 'Quantity cannot exceed 999'),
    options: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.CartQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).default('1'),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(100)).default('10'),
    userId: zod_1.z.string().cuid().optional(),
    sessionId: zod_1.z.string().optional(),
    includeExpired: zod_1.z.string().transform(val => val === 'true').default('false'),
});
exports.CartParamsSchema = zod_1.z.object({
    id: zod_1.z.string().cuid('Invalid cart ID'),
});
exports.CartItemParamsSchema = zod_1.z.object({
    cartId: zod_1.z.string().cuid('Invalid cart ID'),
    itemId: zod_1.z.string().cuid('Invalid item ID'),
});
exports.ApplyCouponSchema = zod_1.z.object({
    couponCode: zod_1.z.string().min(1, 'Coupon code is required'),
});
exports.RemoveCouponSchema = zod_1.z.object({
    couponId: zod_1.z.string().cuid('Invalid coupon ID'),
});
exports.MergeCartsSchema = zod_1.z.object({
    sourceCartId: zod_1.z.string().cuid('Invalid source cart ID'),
    targetCartId: zod_1.z.string().cuid('Invalid target cart ID'),
});
exports.TransferCartSchema = zod_1.z.object({
    sessionId: zod_1.z.string().min(1, 'Session ID is required'),
    userId: zod_1.z.string().cuid('Invalid user ID'),
});
// Cart item options schema for flexible product configuration
exports.CartItemOptionsSchema = zod_1.z.object({
    color: zod_1.z.string().optional(),
    size: zod_1.z.string().optional(),
    material: zod_1.z.string().optional(),
    customization: zod_1.z.string().optional(),
    giftWrap: zod_1.z.boolean().optional(),
    giftMessage: zod_1.z.string().optional(),
});
// Cart summary calculation schema
exports.CartCalculationSchema = zod_1.z.object({
    cartId: zod_1.z.string().cuid(),
    shippingAddress: zod_1.z.object({
        country: zod_1.z.string().length(2),
        state: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        postalCode: zod_1.z.string().optional(),
    }).optional(),
    shippingMethod: zod_1.z.string().optional(),
    taxCalculation: zod_1.z.boolean().default(true),
});
// Cart item validation for stock check
exports.CartItemStockSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid(),
    variantId: zod_1.z.string().cuid().optional(),
    requestedQuantity: zod_1.z.number().int().min(1),
});
// WebSocket event schemas
exports.CartEventSchema = zod_1.z.object({
    type: zod_1.z.enum([
        'CART_UPDATED',
        'ITEM_ADDED',
        'ITEM_UPDATED',
        'ITEM_REMOVED',
        'CART_CLEARED',
        'COUPON_APPLIED',
        'COUPON_REMOVED',
    ]),
    cartId: zod_1.z.string().cuid(),
    userId: zod_1.z.string().cuid().optional(),
    sessionId: zod_1.z.string().optional(),
    data: zod_1.z.any(),
    timestamp: zod_1.z.date().default(() => new Date()),
});
exports.CartSyncSchema = zod_1.z.object({
    cartId: zod_1.z.string().cuid(),
    lastSyncAt: zod_1.z.date().optional(),
    forceSync: zod_1.z.boolean().default(false),
});
//# sourceMappingURL=cart.js.map