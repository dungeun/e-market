import { z } from 'zod';
export declare const CustomerPreferencesSchema: z.ZodObject<{
    language: z.ZodDefault<z.ZodString>;
    currency: z.ZodDefault<z.ZodString>;
    emailNotifications: z.ZodDefault<z.ZodBoolean>;
    smsNotifications: z.ZodDefault<z.ZodBoolean>;
    marketingEmails: z.ZodDefault<z.ZodBoolean>;
    orderUpdates: z.ZodDefault<z.ZodBoolean>;
    newsletter: z.ZodDefault<z.ZodBoolean>;
    theme: z.ZodDefault<z.ZodEnum<["light", "dark", "auto"]>>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    language: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    orderUpdates: boolean;
    newsletter: boolean;
    theme: "light" | "dark" | "auto";
}, {
    currency?: string | undefined;
    language?: string | undefined;
    emailNotifications?: boolean | undefined;
    smsNotifications?: boolean | undefined;
    marketingEmails?: boolean | undefined;
    orderUpdates?: boolean | undefined;
    newsletter?: boolean | undefined;
    theme?: "light" | "dark" | "auto" | undefined;
}>;
export declare const CustomerProfileSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["male", "female", "other", "prefer_not_to_say"]>>;
    avatarUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    gender?: "other" | "male" | "female" | "prefer_not_to_say" | undefined;
    avatarUrl?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    gender?: "other" | "male" | "female" | "prefer_not_to_say" | undefined;
    avatarUrl?: string | undefined;
}>;
export declare const UpdateCustomerProfileSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    dateOfBirth: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    gender: z.ZodOptional<z.ZodOptional<z.ZodEnum<["male", "female", "other", "prefer_not_to_say"]>>>;
    avatarUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    gender?: "other" | "male" | "female" | "prefer_not_to_say" | undefined;
    avatarUrl?: string | undefined;
}, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    dateOfBirth?: string | undefined;
    gender?: "other" | "male" | "female" | "prefer_not_to_say" | undefined;
    avatarUrl?: string | undefined;
}>;
export declare const CustomerAddressSchema: z.ZodObject<{
    type: z.ZodEnum<["SHIPPING", "BILLING", "BOTH"]>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    company: z.ZodOptional<z.ZodString>;
    addressLine1: z.ZodString;
    addressLine2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    state: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodString;
    country: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    isDefault: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "SHIPPING" | "BILLING" | "BOTH";
    firstName: string;
    lastName: string;
    addressLine1: string;
    city: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
    phone?: string | undefined;
    addressLine2?: string | undefined;
    state?: string | undefined;
    company?: string | undefined;
}, {
    type: "SHIPPING" | "BILLING" | "BOTH";
    firstName: string;
    lastName: string;
    addressLine1: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string | undefined;
    addressLine2?: string | undefined;
    state?: string | undefined;
    company?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const UpdateCustomerAddressSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["SHIPPING", "BILLING", "BOTH"]>>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    addressLine1: z.ZodOptional<z.ZodString>;
    addressLine2: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    postalCode: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isDefault: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
} & {
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    type?: "SHIPPING" | "BILLING" | "BOTH" | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    addressLine1?: string | undefined;
    addressLine2?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    postalCode?: string | undefined;
    country?: string | undefined;
    company?: string | undefined;
    isDefault?: boolean | undefined;
}, {
    id: string;
    type?: "SHIPPING" | "BILLING" | "BOTH" | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
    addressLine1?: string | undefined;
    addressLine2?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    postalCode?: string | undefined;
    country?: string | undefined;
    company?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const CustomerPaymentMethodSchema: z.ZodObject<{
    type: z.ZodEnum<["CREDIT_CARD", "DEBIT_CARD", "PAYPAL", "BANK_TRANSFER", "APPLE_PAY", "GOOGLE_PAY", "CRYPTOCURRENCY"]>;
    provider: z.ZodString;
    last4: z.ZodOptional<z.ZodString>;
    expiryMonth: z.ZodOptional<z.ZodNumber>;
    expiryYear: z.ZodOptional<z.ZodNumber>;
    brand: z.ZodOptional<z.ZodString>;
    isDefault: z.ZodDefault<z.ZodBoolean>;
    billingAddressId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "CREDIT_CARD" | "DEBIT_CARD" | "PAYPAL" | "BANK_TRANSFER" | "APPLE_PAY" | "GOOGLE_PAY" | "CRYPTOCURRENCY";
    isDefault: boolean;
    provider: string;
    billingAddressId?: string | undefined;
    last4?: string | undefined;
    brand?: string | undefined;
    expiryMonth?: number | undefined;
    expiryYear?: number | undefined;
}, {
    type: "CREDIT_CARD" | "DEBIT_CARD" | "PAYPAL" | "BANK_TRANSFER" | "APPLE_PAY" | "GOOGLE_PAY" | "CRYPTOCURRENCY";
    provider: string;
    billingAddressId?: string | undefined;
    isDefault?: boolean | undefined;
    last4?: string | undefined;
    brand?: string | undefined;
    expiryMonth?: number | undefined;
    expiryYear?: number | undefined;
}>;
export declare const UpdatePaymentMethodSchema: z.ZodObject<{
    id: z.ZodString;
    isDefault: z.ZodOptional<z.ZodBoolean>;
    billingAddressId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    billingAddressId?: string | undefined;
    isDefault?: boolean | undefined;
}, {
    id: string;
    billingAddressId?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const AddToWishlistSchema: z.ZodObject<{
    productId: z.ZodString;
    notifyOnPriceChange: z.ZodDefault<z.ZodBoolean>;
    notifyOnBackInStock: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    productId: string;
    notifyOnPriceChange: boolean;
    notifyOnBackInStock: boolean;
}, {
    productId: string;
    notifyOnPriceChange?: boolean | undefined;
    notifyOnBackInStock?: boolean | undefined;
}>;
export declare const WishlistQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    sortBy: z.ZodDefault<z.ZodEnum<["addedAt", "productName", "price"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    page: number;
    limit: number;
    sortBy: "price" | "productName" | "addedAt";
}, {
    sortOrder?: "asc" | "desc" | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    sortBy?: "price" | "productName" | "addedAt" | undefined;
}>;
export declare const CustomerActivityQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    type: z.ZodOptional<z.ZodEnum<["order", "review", "wishlist", "cart", "profile"]>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    type?: "cart" | "order" | "review" | "profile" | "wishlist" | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    type?: "cart" | "order" | "review" | "profile" | "wishlist" | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const CustomerAnalyticsQuerySchema: z.ZodObject<{
    customerId: z.ZodString;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    customerId: string;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    customerId: string;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const CustomerSearchSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    search: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["active", "inactive", "suspended"]>>;
    role: z.ZodOptional<z.ZodEnum<["CUSTOMER", "ADMIN", "SUPER_ADMIN"]>>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "lastLoginAt", "totalOrders", "totalSpent"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    hasOrders: z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>;
    createdAfter: z.ZodOptional<z.ZodString>;
    createdBefore: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    page: number;
    limit: number;
    sortBy: "lastLoginAt" | "createdAt" | "totalOrders" | "totalSpent";
    status?: "active" | "inactive" | "suspended" | undefined;
    email?: string | undefined;
    search?: string | undefined;
    phone?: string | undefined;
    role?: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN" | undefined;
    hasOrders?: boolean | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
}, {
    status?: "active" | "inactive" | "suspended" | undefined;
    email?: string | undefined;
    search?: string | undefined;
    phone?: string | undefined;
    role?: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    sortBy?: "lastLoginAt" | "createdAt" | "totalOrders" | "totalSpent" | undefined;
    hasOrders?: string | undefined;
    createdAfter?: string | undefined;
    createdBefore?: string | undefined;
}>;
export type CustomerPreferences = z.infer<typeof CustomerPreferencesSchema>;
export type CustomerProfile = z.infer<typeof CustomerProfileSchema>;
export type UpdateCustomerProfile = z.infer<typeof UpdateCustomerProfileSchema>;
export type CustomerAddress = z.infer<typeof CustomerAddressSchema>;
export type UpdateCustomerAddress = z.infer<typeof UpdateCustomerAddressSchema>;
export type CustomerPaymentMethod = z.infer<typeof CustomerPaymentMethodSchema>;
export type UpdatePaymentMethod = z.infer<typeof UpdatePaymentMethodSchema>;
export type AddToWishlist = z.infer<typeof AddToWishlistSchema>;
export type WishlistQuery = z.infer<typeof WishlistQuerySchema>;
export type CustomerActivityQuery = z.infer<typeof CustomerActivityQuerySchema>;
export type CustomerAnalyticsQuery = z.infer<typeof CustomerAnalyticsQuerySchema>;
export type CustomerSearch = z.infer<typeof CustomerSearchSchema>;
export interface CustomerActivity {
    id: string;
    type: 'order' | 'review' | 'wishlist' | 'cart' | 'profile';
    action: string;
    details: Record<string, any>;
    timestamp: Date;
    metadata?: Record<string, any>;
}
export interface CustomerAnalytics {
    overview: {
        totalOrders: number;
        totalSpent: number;
        averageOrderValue: number;
        lastOrderDate?: Date;
        customerSince: Date;
        lifetimeValue: number;
    };
    orders: {
        count: number;
        statuses: Record<string, number>;
        monthlySpend: Array<{
            month: string;
            amount: number;
            orderCount: number;
        }>;
    };
    products: {
        topCategories: Array<{
            categoryId: string;
            categoryName: string;
            orderCount: number;
            totalSpent: number;
        }>;
        topProducts: Array<{
            productId: string;
            productName: string;
            quantity: number;
            totalSpent: number;
        }>;
        recentlyViewed: Array<{
            productId: string;
            productName: string;
            viewedAt: Date;
        }>;
    };
    engagement: {
        reviewCount: number;
        averageRating: number;
        wishlistCount: number;
        lastLoginAt?: Date;
        loginCount: number;
    };
}
//# sourceMappingURL=customer.d.ts.map