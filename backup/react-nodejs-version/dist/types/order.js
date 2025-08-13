"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderTimelineEventSchema = exports.UpdateShippingSchema = exports.RefundOrderSchema = exports.CancelOrderSchema = exports.OrderItemParamsSchema = exports.OrderParamsSchema = exports.OrderQuerySchema = exports.UpdateOrderSchema = exports.CreateOrderSchema = void 0;
const zod_1 = require("zod");
// Order validation schemas
exports.CreateOrderSchema = zod_1.z.object({
    cartId: zod_1.z.string().cuid('Invalid cart ID'),
    shippingAddressId: zod_1.z.string().cuid('Invalid shipping address ID'),
    billingAddressId: zod_1.z.string().cuid('Invalid billing address ID').optional(),
    paymentMethodId: zod_1.z.string().cuid('Invalid payment method ID').optional(),
    notes: zod_1.z.string().max(500).optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.UpdateOrderSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'REFUNDED',
    ]).optional(),
    trackingNumber: zod_1.z.string().optional(),
    trackingUrl: zod_1.z.string().url().optional(),
    notes: zod_1.z.string().max(500).optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.OrderQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).default('1'),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(100)).default('10'),
    userId: zod_1.z.string().cuid().optional(),
    status: zod_1.z.enum([
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'REFUNDED',
    ]).optional(),
    orderNumber: zod_1.z.string().optional(),
    fromDate: zod_1.z.string().datetime().optional(),
    toDate: zod_1.z.string().datetime().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'total', 'status']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.OrderParamsSchema = zod_1.z.object({
    id: zod_1.z.string().cuid('Invalid order ID'),
});
exports.OrderItemParamsSchema = zod_1.z.object({
    orderId: zod_1.z.string().cuid('Invalid order ID'),
    itemId: zod_1.z.string().cuid('Invalid item ID'),
});
exports.CancelOrderSchema = zod_1.z.object({
    reason: zod_1.z.enum([
        'CUSTOMER_REQUEST',
        'OUT_OF_STOCK',
        'PRICING_ERROR',
        'FRAUD_DETECTED',
        'OTHER',
    ]),
    description: zod_1.z.string().max(500).optional(),
});
exports.RefundOrderSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Refund amount must be positive'),
    reason: zod_1.z.enum([
        'DAMAGED_PRODUCT',
        'WRONG_PRODUCT',
        'NOT_AS_DESCRIBED',
        'CUSTOMER_REQUEST',
        'OTHER',
    ]),
    description: zod_1.z.string().max(500).optional(),
});
exports.UpdateShippingSchema = zod_1.z.object({
    trackingNumber: zod_1.z.string().min(1, 'Tracking number is required'),
    trackingUrl: zod_1.z.string().url('Invalid tracking URL').optional(),
    carrier: zod_1.z.string().min(1, 'Carrier name is required'),
    estimatedDeliveryDate: zod_1.z.string().datetime().optional(),
});
exports.OrderTimelineEventSchema = zod_1.z.object({
    type: zod_1.z.enum([
        'ORDER_CREATED',
        'ORDER_CONFIRMED',
        'PAYMENT_PROCESSED',
        'ORDER_PROCESSING',
        'ORDER_SHIPPED',
        'ORDER_DELIVERED',
        'ORDER_CANCELLED',
        'ORDER_REFUNDED',
        'NOTE_ADDED',
        'STATUS_CHANGED',
    ]),
    description: zod_1.z.string(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
//# sourceMappingURL=order.js.map