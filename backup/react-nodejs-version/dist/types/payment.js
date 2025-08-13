"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KCPRequestSchema = exports.InicisRequestSchema = exports.TossPaymentsRequestSchema = exports.WebhookPayloadSchema = exports.SavePaymentMethodSchema = exports.PaymentParamsSchema = exports.PaymentQuerySchema = exports.RefundPaymentSchema = exports.CancelPaymentSchema = exports.ConfirmPaymentSchema = exports.InitiatePaymentSchema = void 0;
const zod_1 = require("zod");
// Payment validation schemas
exports.InitiatePaymentSchema = zod_1.z.object({
    orderId: zod_1.z.string().cuid('Invalid order ID'),
    paymentMethodId: zod_1.z.string().cuid('Invalid payment method ID').optional(),
    gateway: zod_1.z.enum(['TOSS_PAYMENTS', 'INICIS', 'KCP', 'STRIPE', 'PAYPAL']),
    savePaymentMethod: zod_1.z.boolean().default(false),
    returnUrl: zod_1.z.string().url('Invalid return URL'),
    cancelUrl: zod_1.z.string().url('Invalid cancel URL'),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.ConfirmPaymentSchema = zod_1.z.object({
    paymentId: zod_1.z.string().cuid('Invalid payment ID'),
    transactionId: zod_1.z.string().min(1, 'Transaction ID is required'),
    gatewayResponse: zod_1.z.record(zod_1.z.any()),
});
exports.CancelPaymentSchema = zod_1.z.object({
    reason: zod_1.z.enum([
        'CUSTOMER_REQUEST',
        'FRAUD_DETECTED',
        'INSUFFICIENT_FUNDS',
        'TECHNICAL_ERROR',
        'OTHER',
    ]),
    description: zod_1.z.string().max(500).optional(),
});
exports.RefundPaymentSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Refund amount must be positive'),
    reason: zod_1.z.enum([
        'CUSTOMER_REQUEST',
        'DUPLICATE_PAYMENT',
        'FRAUDULENT_TRANSACTION',
        'PRODUCT_ISSUE',
        'OTHER',
    ]),
    description: zod_1.z.string().max(500).optional(),
});
exports.PaymentQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).default('1'),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(100)).default('10'),
    orderId: zod_1.z.string().cuid().optional(),
    userId: zod_1.z.string().cuid().optional(),
    status: zod_1.z.enum([
        'PENDING',
        'PROCESSING',
        'COMPLETED',
        'FAILED',
        'CANCELLED',
        'REFUNDED',
        'PARTIALLY_REFUNDED',
    ]).optional(),
    gateway: zod_1.z.string().optional(),
    fromDate: zod_1.z.string().datetime().optional(),
    toDate: zod_1.z.string().datetime().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'amount', 'status']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.PaymentParamsSchema = zod_1.z.object({
    id: zod_1.z.string().cuid('Invalid payment ID'),
});
exports.SavePaymentMethodSchema = zod_1.z.object({
    type: zod_1.z.enum([
        'CREDIT_CARD',
        'DEBIT_CARD',
        'BANK_TRANSFER',
        'DIGITAL_WALLET',
    ]),
    provider: zod_1.z.string().min(1, 'Provider is required'),
    token: zod_1.z.string().min(1, 'Token is required'),
    last4: zod_1.z.string().length(4).optional(),
    expiryMonth: zod_1.z.number().int().min(1).max(12).optional(),
    expiryYear: zod_1.z.number().int().min(new Date().getFullYear()).optional(),
    brand: zod_1.z.string().optional(),
    holderName: zod_1.z.string().optional(),
    isDefault: zod_1.z.boolean().default(false),
});
exports.WebhookPayloadSchema = zod_1.z.object({
    gateway: zod_1.z.string(),
    event: zod_1.z.string(),
    data: zod_1.z.record(zod_1.z.any()),
    signature: zod_1.z.string().optional(),
});
// Korean payment gateway specific schemas
exports.TossPaymentsRequestSchema = zod_1.z.object({
    amount: zod_1.z.number().positive(),
    orderId: zod_1.z.string(),
    orderName: zod_1.z.string(),
    successUrl: zod_1.z.string().url(),
    failUrl: zod_1.z.string().url(),
    customerName: zod_1.z.string().optional(),
    customerEmail: zod_1.z.string().email().optional(),
    customerMobilePhone: zod_1.z.string().optional(),
    taxFreeAmount: zod_1.z.number().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.InicisRequestSchema = zod_1.z.object({
    amt: zod_1.z.number().positive(),
    mid: zod_1.z.string(),
    oid: zod_1.z.string(),
    goodsName: zod_1.z.string(),
    buyerName: zod_1.z.string(),
    buyerEmail: zod_1.z.string().email(),
    buyerTel: zod_1.z.string(),
    returnUrl: zod_1.z.string().url(),
    closeUrl: zod_1.z.string().url(),
    gopaymethod: zod_1.z.string().optional(),
    acceptmethod: zod_1.z.string().optional(),
});
exports.KCPRequestSchema = zod_1.z.object({
    site_cd: zod_1.z.string(),
    ordr_idxx: zod_1.z.string(),
    good_name: zod_1.z.string(),
    good_mny: zod_1.z.number().positive(),
    buyr_name: zod_1.z.string(),
    buyr_mail: zod_1.z.string().email(),
    buyr_tel1: zod_1.z.string(),
    buyr_tel2: zod_1.z.string(),
    ret_url: zod_1.z.string().url(),
    currency: zod_1.z.string().default('WON'),
});
//# sourceMappingURL=payment.js.map