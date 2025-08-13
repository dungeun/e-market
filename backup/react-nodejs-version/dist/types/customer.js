"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerSearchSchema = exports.CustomerAnalyticsQuerySchema = exports.CustomerActivityQuerySchema = exports.WishlistQuerySchema = exports.AddToWishlistSchema = exports.UpdatePaymentMethodSchema = exports.CustomerPaymentMethodSchema = exports.UpdateCustomerAddressSchema = exports.CustomerAddressSchema = exports.UpdateCustomerProfileSchema = exports.CustomerProfileSchema = exports.CustomerPreferencesSchema = void 0;
const zod_1 = require("zod");
// Customer preferences schema
exports.CustomerPreferencesSchema = zod_1.z.object({
    language: zod_1.z.string().default('en'),
    currency: zod_1.z.string().default('USD'),
    emailNotifications: zod_1.z.boolean().default(true),
    smsNotifications: zod_1.z.boolean().default(false),
    marketingEmails: zod_1.z.boolean().default(false),
    orderUpdates: zod_1.z.boolean().default(true),
    newsletter: zod_1.z.boolean().default(false),
    theme: zod_1.z.enum(['light', 'dark', 'auto']).default('auto'),
});
// Customer profile schema
exports.CustomerProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name is required').max(100),
    lastName: zod_1.z.string().min(1, 'Last name is required').max(100),
    phone: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
    dateOfBirth: zod_1.z.string().datetime().optional(),
    gender: zod_1.z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    avatarUrl: zod_1.z.string().url().optional(),
});
exports.UpdateCustomerProfileSchema = exports.CustomerProfileSchema.partial();
// Address schemas
exports.CustomerAddressSchema = zod_1.z.object({
    type: zod_1.z.enum(['SHIPPING', 'BILLING', 'BOTH']),
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    company: zod_1.z.string().optional(),
    addressLine1: zod_1.z.string().min(1, 'Address is required'),
    addressLine2: zod_1.z.string().optional(),
    city: zod_1.z.string().min(1, 'City is required'),
    state: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().min(1, 'Postal code is required'),
    country: zod_1.z.string().min(2).max(2, 'Country must be 2-letter ISO code'),
    phone: zod_1.z.string().optional(),
    isDefault: zod_1.z.boolean().default(false),
});
exports.UpdateCustomerAddressSchema = exports.CustomerAddressSchema.partial().extend({
    id: zod_1.z.string().cuid(),
});
// Payment method schemas
exports.CustomerPaymentMethodSchema = zod_1.z.object({
    type: zod_1.z.enum([
        'CREDIT_CARD',
        'DEBIT_CARD',
        'PAYPAL',
        'BANK_TRANSFER',
        'APPLE_PAY',
        'GOOGLE_PAY',
        'CRYPTOCURRENCY',
    ]),
    provider: zod_1.z.string().min(1, 'Payment provider is required'),
    last4: zod_1.z.string().length(4).optional(),
    expiryMonth: zod_1.z.number().int().min(1).max(12).optional(),
    expiryYear: zod_1.z.number().int().min(new Date().getFullYear()).optional(),
    brand: zod_1.z.string().optional(),
    isDefault: zod_1.z.boolean().default(false),
    billingAddressId: zod_1.z.string().cuid().optional(),
});
exports.UpdatePaymentMethodSchema = zod_1.z.object({
    id: zod_1.z.string().cuid(),
    isDefault: zod_1.z.boolean().optional(),
    billingAddressId: zod_1.z.string().cuid().optional(),
});
// Wishlist schemas
exports.AddToWishlistSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid('Invalid product ID'),
    notifyOnPriceChange: zod_1.z.boolean().default(false),
    notifyOnBackInStock: zod_1.z.boolean().default(false),
});
exports.WishlistQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).default('1'),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(100)).default('10'),
    sortBy: zod_1.z.enum(['addedAt', 'productName', 'price']).default('addedAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
// Customer activity schemas
exports.CustomerActivityQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).default('1'),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(100)).default('10'),
    type: zod_1.z.enum(['order', 'review', 'wishlist', 'cart', 'profile']).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
// Customer analytics schemas (for admin)
exports.CustomerAnalyticsQuerySchema = zod_1.z.object({
    customerId: zod_1.z.string().cuid(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
});
// Customer search schema (for admin)
exports.CustomerSearchSchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).default('1'),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(100)).default('10'),
    search: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'inactive', 'suspended']).optional(),
    role: zod_1.z.enum(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']).optional(),
    sortBy: zod_1.z.enum(['createdAt', 'lastLoginAt', 'totalOrders', 'totalSpent']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
    hasOrders: zod_1.z.string().transform(val => val === 'true').optional(),
    createdAfter: zod_1.z.string().datetime().optional(),
    createdBefore: zod_1.z.string().datetime().optional(),
});
//# sourceMappingURL=customer.js.map