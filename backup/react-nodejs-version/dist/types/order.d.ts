import { z } from 'zod';
export declare const CreateOrderSchema: z.ZodObject<{
    cartId: z.ZodString;
    shippingAddressId: z.ZodString;
    billingAddressId: z.ZodOptional<z.ZodString>;
    paymentMethodId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    shippingAddressId: string;
    cartId: string;
    metadata?: Record<string, any> | undefined;
    billingAddressId?: string | undefined;
    notes?: string | undefined;
    paymentMethodId?: string | undefined;
}, {
    shippingAddressId: string;
    cartId: string;
    metadata?: Record<string, any> | undefined;
    billingAddressId?: string | undefined;
    notes?: string | undefined;
    paymentMethodId?: string | undefined;
}>;
export declare const UpdateOrderSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]>>;
    trackingNumber: z.ZodOptional<z.ZodString>;
    trackingUrl: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED" | undefined;
    metadata?: Record<string, any> | undefined;
    notes?: string | undefined;
    trackingNumber?: string | undefined;
    trackingUrl?: string | undefined;
}, {
    status?: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED" | undefined;
    metadata?: Record<string, any> | undefined;
    notes?: string | undefined;
    trackingNumber?: string | undefined;
    trackingUrl?: string | undefined;
}>;
export declare const OrderQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    userId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]>>;
    orderNumber: z.ZodOptional<z.ZodString>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "updatedAt", "total", "status"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    page: number;
    limit: number;
    sortBy: "status" | "createdAt" | "updatedAt" | "total";
    status?: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED" | undefined;
    userId?: string | undefined;
    orderNumber?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}, {
    status?: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED" | undefined;
    userId?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    orderNumber?: string | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    sortBy?: "status" | "createdAt" | "updatedAt" | "total" | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
}>;
export declare const OrderParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const OrderItemParamsSchema: z.ZodObject<{
    orderId: z.ZodString;
    itemId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    itemId: string;
}, {
    orderId: string;
    itemId: string;
}>;
export declare const CancelOrderSchema: z.ZodObject<{
    reason: z.ZodEnum<["CUSTOMER_REQUEST", "OUT_OF_STOCK", "PRICING_ERROR", "FRAUD_DETECTED", "OTHER"]>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: "OUT_OF_STOCK" | "CUSTOMER_REQUEST" | "PRICING_ERROR" | "FRAUD_DETECTED" | "OTHER";
    description?: string | undefined;
}, {
    reason: "OUT_OF_STOCK" | "CUSTOMER_REQUEST" | "PRICING_ERROR" | "FRAUD_DETECTED" | "OTHER";
    description?: string | undefined;
}>;
export declare const RefundOrderSchema: z.ZodObject<{
    amount: z.ZodNumber;
    reason: z.ZodEnum<["DAMAGED_PRODUCT", "WRONG_PRODUCT", "NOT_AS_DESCRIBED", "CUSTOMER_REQUEST", "OTHER"]>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    reason: "CUSTOMER_REQUEST" | "OTHER" | "DAMAGED_PRODUCT" | "WRONG_PRODUCT" | "NOT_AS_DESCRIBED";
    description?: string | undefined;
}, {
    amount: number;
    reason: "CUSTOMER_REQUEST" | "OTHER" | "DAMAGED_PRODUCT" | "WRONG_PRODUCT" | "NOT_AS_DESCRIBED";
    description?: string | undefined;
}>;
export declare const UpdateShippingSchema: z.ZodObject<{
    trackingNumber: z.ZodString;
    trackingUrl: z.ZodOptional<z.ZodString>;
    carrier: z.ZodString;
    estimatedDeliveryDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    trackingNumber: string;
    carrier: string;
    trackingUrl?: string | undefined;
    estimatedDeliveryDate?: string | undefined;
}, {
    trackingNumber: string;
    carrier: string;
    trackingUrl?: string | undefined;
    estimatedDeliveryDate?: string | undefined;
}>;
export declare const OrderTimelineEventSchema: z.ZodObject<{
    type: z.ZodEnum<["ORDER_CREATED", "ORDER_CONFIRMED", "PAYMENT_PROCESSED", "ORDER_PROCESSING", "ORDER_SHIPPED", "ORDER_DELIVERED", "ORDER_CANCELLED", "ORDER_REFUNDED", "NOTE_ADDED", "STATUS_CHANGED"]>;
    description: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type: "ORDER_CREATED" | "ORDER_CONFIRMED" | "PAYMENT_PROCESSED" | "ORDER_PROCESSING" | "ORDER_SHIPPED" | "ORDER_DELIVERED" | "ORDER_CANCELLED" | "ORDER_REFUNDED" | "NOTE_ADDED" | "STATUS_CHANGED";
    description: string;
    metadata?: Record<string, any> | undefined;
}, {
    type: "ORDER_CREATED" | "ORDER_CONFIRMED" | "PAYMENT_PROCESSED" | "ORDER_PROCESSING" | "ORDER_SHIPPED" | "ORDER_DELIVERED" | "ORDER_CANCELLED" | "ORDER_REFUNDED" | "NOTE_ADDED" | "STATUS_CHANGED";
    description: string;
    metadata?: Record<string, any> | undefined;
}>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;
export type OrderQueryInput = z.infer<typeof OrderQuerySchema>;
export type OrderParamsInput = z.infer<typeof OrderParamsSchema>;
export type OrderItemParamsInput = z.infer<typeof OrderItemParamsSchema>;
export type CancelOrderInput = z.infer<typeof CancelOrderSchema>;
export type RefundOrderInput = z.infer<typeof RefundOrderSchema>;
export type UpdateShippingInput = z.infer<typeof UpdateShippingSchema>;
export type OrderTimelineEventInput = z.infer<typeof OrderTimelineEventSchema>;
export interface OrderTotals {
    subtotal: number;
    taxAmount: number;
    shippingCost: number;
    discountAmount: number;
    total: number;
    refundedAmount: number;
    netTotal: number;
    currency: string;
}
export interface OrderItemWithDetails {
    id: string;
    orderId: string;
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discountAmount: number;
    taxAmount: number;
    product: {
        id: string;
        name: string;
        slug: string;
        sku: string;
        images: Array<{
            id: string;
            url: string;
            alt?: string;
            isMain: boolean;
        }>;
    };
    variant?: {
        id: string;
        name: string;
        sku: string;
        attributes: Record<string, any>;
    };
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export interface OrderAddress {
    id: string;
    type: 'SHIPPING' | 'BILLING';
    firstName: string;
    lastName: string;
    company?: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
}
export interface OrderWithDetails {
    id: string;
    orderNumber: string;
    userId: string;
    status: string;
    items: OrderItemWithDetails[];
    totals: OrderTotals;
    shippingAddress: OrderAddress;
    billingAddress: OrderAddress;
    paymentMethod?: {
        id: string;
        type: string;
        last4?: string;
        brand?: string;
    };
    trackingNumber?: string;
    trackingUrl?: string;
    carrier?: string;
    estimatedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    notes?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export interface OrderTimeline {
    id: string;
    orderId: string;
    type: string;
    description: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}
export interface OrderSummary {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    currency: string;
    itemCount: number;
    createdAt: Date;
    customer: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    } | null;
}
export interface OrderStatusCount {
    status: string;
    count: number;
    totalValue: number;
}
export interface OrderAnalytics {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusCounts: OrderStatusCount[];
    recentOrders: OrderSummary[];
}
export interface OrderEvent {
    type: 'ORDER_CREATED' | 'ORDER_UPDATED' | 'ORDER_CANCELLED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'ORDER_REFUNDED';
    orderId: string;
    userId: string;
    data: any;
    timestamp: Date;
}
//# sourceMappingURL=order.d.ts.map