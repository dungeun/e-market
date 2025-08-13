import { z } from 'zod';
export declare const CreateCartSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    currency: z.ZodDefault<z.ZodString>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        variantId: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        productId: string;
        variantId?: string | undefined;
    }, {
        quantity: number;
        productId: string;
        variantId?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    userId?: string | undefined;
    sessionId?: string | undefined;
    items?: {
        quantity: number;
        productId: string;
        variantId?: string | undefined;
    }[] | undefined;
}, {
    userId?: string | undefined;
    sessionId?: string | undefined;
    currency?: string | undefined;
    items?: {
        quantity: number;
        productId: string;
        variantId?: string | undefined;
    }[] | undefined;
}>;
export declare const UpdateCartSchema: z.ZodObject<{
    currency: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency?: string | undefined;
}, {
    currency?: string | undefined;
}>;
export declare const AddCartItemSchema: z.ZodObject<{
    productId: z.ZodString;
    variantId: z.ZodOptional<z.ZodString>;
    quantity: z.ZodNumber;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    productId: string;
    options?: Record<string, any> | undefined;
    variantId?: string | undefined;
}, {
    quantity: number;
    productId: string;
    options?: Record<string, any> | undefined;
    variantId?: string | undefined;
}>;
export declare const UpdateCartItemSchema: z.ZodObject<{
    quantity: z.ZodNumber;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    options?: Record<string, any> | undefined;
}, {
    quantity: number;
    options?: Record<string, any> | undefined;
}>;
export declare const CartQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    userId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    includeExpired: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    includeExpired: boolean;
    userId?: string | undefined;
    sessionId?: string | undefined;
}, {
    userId?: string | undefined;
    sessionId?: string | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    includeExpired?: string | undefined;
}>;
export declare const CartParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const CartItemParamsSchema: z.ZodObject<{
    cartId: z.ZodString;
    itemId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    cartId: string;
    itemId: string;
}, {
    cartId: string;
    itemId: string;
}>;
export declare const ApplyCouponSchema: z.ZodObject<{
    couponCode: z.ZodString;
}, "strip", z.ZodTypeAny, {
    couponCode: string;
}, {
    couponCode: string;
}>;
export declare const RemoveCouponSchema: z.ZodObject<{
    couponId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    couponId: string;
}, {
    couponId: string;
}>;
export declare const MergeCartsSchema: z.ZodObject<{
    sourceCartId: z.ZodString;
    targetCartId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sourceCartId: string;
    targetCartId: string;
}, {
    sourceCartId: string;
    targetCartId: string;
}>;
export declare const TransferCartSchema: z.ZodObject<{
    sessionId: z.ZodString;
    userId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
    sessionId: string;
}, {
    userId: string;
    sessionId: string;
}>;
export declare const CartItemOptionsSchema: z.ZodObject<{
    color: z.ZodOptional<z.ZodString>;
    size: z.ZodOptional<z.ZodString>;
    material: z.ZodOptional<z.ZodString>;
    customization: z.ZodOptional<z.ZodString>;
    giftWrap: z.ZodOptional<z.ZodBoolean>;
    giftMessage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    size?: string | undefined;
    color?: string | undefined;
    material?: string | undefined;
    customization?: string | undefined;
    giftWrap?: boolean | undefined;
    giftMessage?: string | undefined;
}, {
    size?: string | undefined;
    color?: string | undefined;
    material?: string | undefined;
    customization?: string | undefined;
    giftWrap?: boolean | undefined;
    giftMessage?: string | undefined;
}>;
export declare const CartCalculationSchema: z.ZodObject<{
    cartId: z.ZodString;
    shippingAddress: z.ZodOptional<z.ZodObject<{
        country: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        country: string;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    }, {
        country: string;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    }>>;
    shippingMethod: z.ZodOptional<z.ZodString>;
    taxCalculation: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    cartId: string;
    taxCalculation: boolean;
    shippingAddress?: {
        country: string;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    } | undefined;
    shippingMethod?: string | undefined;
}, {
    cartId: string;
    shippingAddress?: {
        country: string;
        city?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    } | undefined;
    shippingMethod?: string | undefined;
    taxCalculation?: boolean | undefined;
}>;
export declare const CartItemStockSchema: z.ZodObject<{
    productId: z.ZodString;
    variantId: z.ZodOptional<z.ZodString>;
    requestedQuantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    productId: string;
    requestedQuantity: number;
    variantId?: string | undefined;
}, {
    productId: string;
    requestedQuantity: number;
    variantId?: string | undefined;
}>;
export declare const CartEventSchema: z.ZodObject<{
    type: z.ZodEnum<["CART_UPDATED", "ITEM_ADDED", "ITEM_UPDATED", "ITEM_REMOVED", "CART_CLEARED", "COUPON_APPLIED", "COUPON_REMOVED"]>;
    cartId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    data: z.ZodAny;
    timestamp: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    type: "CART_UPDATED" | "ITEM_ADDED" | "ITEM_UPDATED" | "ITEM_REMOVED" | "CART_CLEARED" | "COUPON_APPLIED" | "COUPON_REMOVED";
    timestamp: Date;
    cartId: string;
    userId?: string | undefined;
    data?: any;
    sessionId?: string | undefined;
}, {
    type: "CART_UPDATED" | "ITEM_ADDED" | "ITEM_UPDATED" | "ITEM_REMOVED" | "CART_CLEARED" | "COUPON_APPLIED" | "COUPON_REMOVED";
    cartId: string;
    timestamp?: Date | undefined;
    userId?: string | undefined;
    data?: any;
    sessionId?: string | undefined;
}>;
export declare const CartSyncSchema: z.ZodObject<{
    cartId: z.ZodString;
    lastSyncAt: z.ZodOptional<z.ZodDate>;
    forceSync: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    cartId: string;
    forceSync: boolean;
    lastSyncAt?: Date | undefined;
}, {
    cartId: string;
    lastSyncAt?: Date | undefined;
    forceSync?: boolean | undefined;
}>;
export type CreateCartInput = z.infer<typeof CreateCartSchema>;
export type UpdateCartInput = z.infer<typeof UpdateCartSchema>;
export type AddCartItemInput = z.infer<typeof AddCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;
export type CartQueryInput = z.infer<typeof CartQuerySchema>;
export type CartParamsInput = z.infer<typeof CartParamsSchema>;
export type CartItemParamsInput = z.infer<typeof CartItemParamsSchema>;
export type ApplyCouponInput = z.infer<typeof ApplyCouponSchema>;
export type RemoveCouponInput = z.infer<typeof RemoveCouponSchema>;
export type MergeCartsInput = z.infer<typeof MergeCartsSchema>;
export type TransferCartInput = z.infer<typeof TransferCartSchema>;
export type CartItemOptionsInput = z.infer<typeof CartItemOptionsSchema>;
export type CartCalculationInput = z.infer<typeof CartCalculationSchema>;
export type CartItemStockInput = z.infer<typeof CartItemStockSchema>;
export type CartEventInput = z.infer<typeof CartEventSchema>;
export type CartSyncInput = z.infer<typeof CartSyncSchema>;
export interface CartTotals {
    subtotal: number;
    taxAmount: number;
    shippingCost: number;
    discountAmount: number;
    total: number;
    itemCount: number;
    currency: string;
}
export interface CartItemWithDetails {
    id: string;
    cartId: string;
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product: {
        id: string;
        name: string;
        slug: string;
        sku: string;
        price: number;
        images: Array<{
            id: string;
            url: string;
            alt?: string;
            isMain: boolean;
        }>;
        status: string;
        trackQuantity: boolean;
        quantity: number;
    };
    variant?: {
        id: string;
        name: string;
        sku: string;
        price: number;
        attributes: Record<string, any>;
    };
    options?: Record<string, any>;
    isAvailable: boolean;
    stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
    createdAt: Date;
    updatedAt: Date;
}
export interface CartWithDetails {
    id: string;
    userId?: string;
    sessionId?: string;
    currency: string;
    items: CartItemWithDetails[];
    totals: CartTotals;
    appliedCoupons: Array<{
        id: string;
        code: string;
        name: string;
        type: string;
        value: number;
        discountAmount: number;
    }>;
    expiresAt?: Date;
    isExpired: boolean;
    lastActivity: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface StockValidationResult {
    isValid: boolean;
    issues: Array<{
        productId: string;
        variantId?: string;
        requestedQuantity: number;
        availableQuantity: number;
        message: string;
    }>;
}
export interface CartEvent {
    type: 'CART_UPDATED' | 'ITEM_ADDED' | 'ITEM_UPDATED' | 'ITEM_REMOVED' | 'CART_CLEARED' | 'COUPON_APPLIED' | 'COUPON_REMOVED';
    cartId: string;
    userId?: string;
    sessionId?: string;
    data: any;
    timestamp: Date;
}
//# sourceMappingURL=cart.d.ts.map