import { PrismaClient } from '@prisma/client';
export declare class QueryOptimizationService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Create database indexes for optimal performance
     */
    createIndexes(): Promise<void>;
    /**
     * Analyze query performance
     */
    analyzeQuery(query: string): Promise<any>;
    /**
     * Get slow queries from pg_stat_statements
     */
    getSlowQueries(limit?: number): Promise<any[]>;
    /**
     * Optimize common queries with query hints
     */
    getOptimizedQueries(): {
        productList: (limit: number, offset: number, categoryId?: string) => import(".prisma/client").Prisma.PrismaPromise<({
            images: {
                url: string;
                id: string;
                sortOrder: number;
                alt: string | null;
            }[];
            category: {
                name: string;
                id: string;
                slug: string;
            } | null;
            _count: {
                reviews: number;
            };
        } & {
            type: import(".prisma/client").$Enums.ProductType;
            length: import("@prisma/client/runtime/library").Decimal | null;
            status: import(".prisma/client").$Enums.ProductStatus;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            width: import("@prisma/client/runtime/library").Decimal | null;
            height: import("@prisma/client/runtime/library").Decimal | null;
            slug: string;
            description: string | null;
            shortDescription: string | null;
            sku: string;
            price: import("@prisma/client/runtime/library").Decimal;
            comparePrice: import("@prisma/client/runtime/library").Decimal | null;
            costPrice: import("@prisma/client/runtime/library").Decimal | null;
            trackQuantity: boolean;
            quantity: number;
            lowStockThreshold: number;
            allowBackorders: boolean;
            weight: import("@prisma/client/runtime/library").Decimal | null;
            metaTitle: string | null;
            metaDescription: string | null;
            focusKeyword: string | null;
            isFeatured: boolean;
            isDigital: boolean;
            requiresShipping: boolean;
            publishedAt: Date | null;
            categoryId: string | null;
        })[]>;
        productSearch: (searchTerm: string, limit?: number) => import(".prisma/client").Prisma.PrismaPromise<unknown>;
        categoryTree: () => import(".prisma/client").Prisma.PrismaPromise<unknown>;
        orderWithDetails: (orderId: string) => import(".prisma/client").Prisma.Prisma__OrderClient<({
            user: {
                email: string;
                firstName: string | null;
                lastName: string | null;
                id: string;
            } | null;
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
                    name: string;
                    id: string;
                    slug: string;
                };
            } & {
                options: import("@prisma/client/runtime/library").JsonValue;
                id: string;
                createdAt: Date;
                total: import("@prisma/client/runtime/library").Decimal;
                price: import("@prisma/client/runtime/library").Decimal;
                quantity: number;
                productId: string;
                variantId: string | null;
                orderId: string;
            })[];
            payments: {
                status: import(".prisma/client").$Enums.PaymentStatus;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                method: import(".prisma/client").$Enums.PaymentMethodType;
                amount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                gateway: string;
                orderId: string;
                transactionId: string | null;
                gatewayResponse: import("@prisma/client/runtime/library").JsonValue;
                processedAt: Date | null;
            }[];
        } & {
            status: import(".prisma/client").$Enums.OrderStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            currency: string;
            total: import("@prisma/client/runtime/library").Decimal;
            orderNumber: string;
            customerEmail: string | null;
            customerFirstName: string | null;
            customerLastName: string | null;
            customerPhone: string | null;
            shippingAddressId: string | null;
            billingAddressId: string | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            shippingCost: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
        }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    };
    /**
     * Database connection pooling stats
     */
    getConnectionPoolStats(): Promise<any>;
    /**
     * Vacuum and analyze tables for performance
     */
    performMaintenance(): Promise<void>;
}
/**
 * Query result cache wrapper
 */
export declare function withQueryCache<T extends (...args: any[]) => Promise<any>>(fn: T, getCacheKey: (...args: Parameters<T>) => string, ttl?: number): T;
//# sourceMappingURL=queryOptimizationService.d.ts.map