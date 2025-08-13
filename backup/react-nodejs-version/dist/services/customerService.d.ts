import { UpdateCustomerProfile, CustomerAddress, CustomerPaymentMethod, UpdatePaymentMethod, CustomerPreferences, CustomerAnalytics, CustomerSearch, WishlistQuery, CustomerActivityQuery } from '../types/customer';
import { Prisma } from '@prisma/client';
export declare class CustomerService {
    static getProfile(userId: string): Promise<{
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        isVerified: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
    }>;
    static updateProfile(userId: string, data: UpdateCustomerProfile): Promise<{
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        id: string;
    }>;
    static getAddresses(userId: string): Promise<{
        type: import(".prisma/client").$Enums.AddressType;
        firstName: string;
        lastName: string;
        phone: string | null;
        addressLine1: string;
        addressLine2: string | null;
        city: string;
        state: string | null;
        postalCode: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        country: string;
        company: string | null;
        isDefault: boolean;
    }[]>;
    static getAddress(userId: string, addressId: string): Promise<{
        type: import(".prisma/client").$Enums.AddressType;
        firstName: string;
        lastName: string;
        phone: string | null;
        addressLine1: string;
        addressLine2: string | null;
        city: string;
        state: string | null;
        postalCode: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        country: string;
        company: string | null;
        isDefault: boolean;
    }>;
    static addAddress(userId: string, data: CustomerAddress): Promise<{
        type: import(".prisma/client").$Enums.AddressType;
        firstName: string;
        lastName: string;
        phone: string | null;
        addressLine1: string;
        addressLine2: string | null;
        city: string;
        state: string | null;
        postalCode: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        country: string;
        company: string | null;
        isDefault: boolean;
    }>;
    static updateAddress(userId: string, addressId: string, data: Partial<CustomerAddress>): Promise<{
        type: import(".prisma/client").$Enums.AddressType;
        firstName: string;
        lastName: string;
        phone: string | null;
        addressLine1: string;
        addressLine2: string | null;
        city: string;
        state: string | null;
        postalCode: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        country: string;
        company: string | null;
        isDefault: boolean;
    }>;
    static deleteAddress(userId: string, addressId: string): Promise<void>;
    static setDefaultAddress(userId: string, addressId: string): Promise<{
        type: import(".prisma/client").$Enums.AddressType;
        firstName: string;
        lastName: string;
        phone: string | null;
        addressLine1: string;
        addressLine2: string | null;
        city: string;
        state: string | null;
        postalCode: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        country: string;
        company: string | null;
        isDefault: boolean;
    }>;
    static getPaymentMethods(userId: string): Promise<{
        type: import(".prisma/client").$Enums.PaymentMethodType;
        id: string;
        createdAt: Date;
        isDefault: boolean;
        last4: string | null;
        brand: string | null;
        expiryMonth: number | null;
        expiryYear: number | null;
        provider: string;
    }[]>;
    static getPaymentMethod(userId: string, paymentMethodId: string): Promise<{
        type: import(".prisma/client").$Enums.PaymentMethodType;
        id: string;
        createdAt: Date;
        isDefault: boolean;
        last4: string | null;
        brand: string | null;
        expiryMonth: number | null;
        expiryYear: number | null;
        provider: string;
    }>;
    static addPaymentMethod(userId: string, data: CustomerPaymentMethod): Promise<{
        type: import(".prisma/client").$Enums.PaymentMethodType;
        id: string;
        createdAt: Date;
        isDefault: boolean;
        last4: string | null;
        brand: string | null;
        expiryMonth: number | null;
        expiryYear: number | null;
        provider: string;
    }>;
    static updatePaymentMethod(userId: string, paymentMethodId: string, data: UpdatePaymentMethod): Promise<{
        type: import(".prisma/client").$Enums.PaymentMethodType;
        id: string;
        createdAt: Date;
        isDefault: boolean;
        last4: string | null;
        brand: string | null;
        expiryMonth: number | null;
        expiryYear: number | null;
        provider: string;
    }>;
    static deletePaymentMethod(userId: string, paymentMethodId: string): Promise<void>;
    static setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<{
        type: import(".prisma/client").$Enums.PaymentMethodType;
        id: string;
        createdAt: Date;
        isDefault: boolean;
        last4: string | null;
        brand: string | null;
        expiryMonth: number | null;
        expiryYear: number | null;
        provider: string;
    }>;
    static getOrderHistory(userId: string, page?: number, limit?: number): Promise<{
        orders: ({
            shippingAddress: {
                type: import(".prisma/client").$Enums.AddressType;
                firstName: string;
                lastName: string;
                phone: string | null;
                addressLine1: string;
                addressLine2: string | null;
                city: string;
                state: string | null;
                postalCode: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                country: string;
                company: string | null;
                isDefault: boolean;
            } | null;
            items: {
                options: Prisma.JsonValue;
                id: string;
                createdAt: Date;
                total: Prisma.Decimal;
                price: Prisma.Decimal;
                quantity: number;
                productId: string;
                variantId: string | null;
                orderId: string;
            }[];
            shipments: {
                status: import(".prisma/client").$Enums.ShippingStatus;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                method: import(".prisma/client").$Enums.ShippingMethod;
                metadata: Prisma.JsonValue;
                currency: string;
                notes: string | null;
                orderId: string;
                trackingNumber: string | null;
                carrier: string | null;
                estimatedDelivery: Date | null;
                actualDelivery: Date | null;
                cost: Prisma.Decimal;
            }[];
        } & {
            status: import(".prisma/client").$Enums.OrderStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            currency: string;
            total: Prisma.Decimal;
            orderNumber: string;
            customerEmail: string | null;
            customerFirstName: string | null;
            customerLastName: string | null;
            customerPhone: string | null;
            shippingAddressId: string | null;
            billingAddressId: string | null;
            subtotal: Prisma.Decimal;
            taxAmount: Prisma.Decimal;
            shippingCost: Prisma.Decimal;
            discountAmount: Prisma.Decimal;
            notes: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static getWishlist(userId: string, query: WishlistQuery): Promise<{
        items: ({
            product: {
                images: {
                    url: string;
                    id: string;
                    createdAt: Date;
                    sortOrder: number;
                    productId: string;
                    alt: string | null;
                    isMain: boolean;
                }[];
                category: {
                    name: string;
                    id: string;
                    slug: string;
                } | null;
            } & {
                type: import(".prisma/client").$Enums.ProductType;
                length: Prisma.Decimal | null;
                status: import(".prisma/client").$Enums.ProductStatus;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                width: Prisma.Decimal | null;
                height: Prisma.Decimal | null;
                slug: string;
                description: string | null;
                shortDescription: string | null;
                sku: string;
                price: Prisma.Decimal;
                comparePrice: Prisma.Decimal | null;
                costPrice: Prisma.Decimal | null;
                trackQuantity: boolean;
                quantity: number;
                lowStockThreshold: number;
                allowBackorders: boolean;
                weight: Prisma.Decimal | null;
                metaTitle: string | null;
                metaDescription: string | null;
                focusKeyword: string | null;
                isFeatured: boolean;
                isDigital: boolean;
                requiresShipping: boolean;
                publishedAt: Date | null;
                categoryId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            productId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static addToWishlist(userId: string, productId: string): Promise<{
        product: {
            images: {
                url: string;
                id: string;
                createdAt: Date;
                sortOrder: number;
                productId: string;
                alt: string | null;
                isMain: boolean;
            }[];
        } & {
            type: import(".prisma/client").$Enums.ProductType;
            length: Prisma.Decimal | null;
            status: import(".prisma/client").$Enums.ProductStatus;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            width: Prisma.Decimal | null;
            height: Prisma.Decimal | null;
            slug: string;
            description: string | null;
            shortDescription: string | null;
            sku: string;
            price: Prisma.Decimal;
            comparePrice: Prisma.Decimal | null;
            costPrice: Prisma.Decimal | null;
            trackQuantity: boolean;
            quantity: number;
            lowStockThreshold: number;
            allowBackorders: boolean;
            weight: Prisma.Decimal | null;
            metaTitle: string | null;
            metaDescription: string | null;
            focusKeyword: string | null;
            isFeatured: boolean;
            isDigital: boolean;
            requiresShipping: boolean;
            publishedAt: Date | null;
            categoryId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        productId: string;
    }>;
    static removeFromWishlist(userId: string, productId: string): Promise<void>;
    static clearWishlist(userId: string): Promise<{
        deleted: number;
    }>;
    static getPreferences(userId: string): Promise<CustomerPreferences>;
    static updatePreferences(userId: string, preferences: Partial<CustomerPreferences>): Promise<{
        currency: string;
        language: string;
        emailNotifications: boolean;
        smsNotifications: boolean;
        marketingEmails: boolean;
        orderUpdates: boolean;
        newsletter: boolean;
        theme: "light" | "dark" | "auto";
    }>;
    static getActivity(userId: string, query: CustomerActivityQuery): Promise<{
        activities: {
            path: string | null;
            id: string;
            createdAt: Date;
            userId: string;
            ipAddress: string | null;
            userAgent: string | null;
            action: string;
            entityType: string | null;
            entityId: string | null;
            method: string | null;
            statusCode: number | null;
            metadata: Prisma.JsonValue;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static getAnalytics(customerId: string, startDate?: Date, endDate?: Date): Promise<CustomerAnalytics>;
    static searchCustomers(query: CustomerSearch): Promise<{
        customers: {
            email: string;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            isVerified: boolean;
            lastLoginAt: Date | null;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    static deleteAccount(userId: string, _password: string): Promise<void>;
    static exportCustomerData(userId: string): Promise<any>;
}
//# sourceMappingURL=customerService.d.ts.map