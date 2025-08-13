import { Decimal } from '@prisma/client/runtime/library';
export interface PricingCalculationRequest {
    productId: string;
    userId?: string;
    quantity: number;
    customerGroup?: string;
    context?: {
        cartTotal?: number;
        isFirstPurchase?: boolean;
        timeOfDay?: string;
        seasonalContext?: string;
    };
}
export interface PricingCalculationResult {
    productId: string;
    originalPrice: number;
    finalPrice: number;
    discountAmount: number;
    appliedRules: AppliedPricingRule[];
    savings: number;
    savingsPercentage: number;
}
export interface AppliedPricingRule {
    ruleId: string;
    ruleName: string;
    ruleType: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    priority: number;
}
export interface BulkPricingRequest {
    items: PricingCalculationRequest[];
    userId?: string;
    customerGroup?: string;
    context?: any;
}
export interface BulkPricingResult {
    items: PricingCalculationResult[];
    totalOriginalPrice: number;
    totalFinalPrice: number;
    totalSavings: number;
    totalSavingsPercentage: number;
}
export declare class PricingService {
    calculatePrice(request: PricingCalculationRequest): Promise<PricingCalculationResult>;
    calculateBulkPricing(request: BulkPricingRequest): Promise<BulkPricingResult>;
    private getApplicablePricingRules;
    private evaluateRuleConditions;
    private applyPricingRule;
    private recordPricingApplication;
    createPricingRule(data: any): Promise<{
        type: import(".prisma/client").$Enums.PricingRuleType;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        priority: number;
        conditions: import("@prisma/client/runtime/library").JsonValue;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: Decimal;
        maxDiscountValue: Decimal | null;
        timeZone: string | null;
        applyToCategories: boolean;
        applyToProducts: boolean;
        applyToCustomers: boolean;
        usageLimit: number | null;
        usageCount: number;
        perCustomerLimit: number | null;
    }>;
    updatePricingRule(ruleId: string, data: any): Promise<{
        type: import(".prisma/client").$Enums.PricingRuleType;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        priority: number;
        conditions: import("@prisma/client/runtime/library").JsonValue;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: Decimal;
        maxDiscountValue: Decimal | null;
        timeZone: string | null;
        applyToCategories: boolean;
        applyToProducts: boolean;
        applyToCustomers: boolean;
        usageLimit: number | null;
        usageCount: number;
        perCustomerLimit: number | null;
    }>;
    getPricingRules(filters?: any): Promise<({
        customerGroups: ({
            group: {
                name: string;
            };
        } & {
            ruleId: string;
            groupId: string;
        })[];
        _count: {
            applications: number;
        };
        products: ({
            product: {
                name: string;
                sku: string;
            };
        } & {
            productId: string;
            ruleId: string;
        })[];
        categories: ({
            category: {
                name: string;
                slug: string;
            };
        } & {
            categoryId: string;
            ruleId: string;
        })[];
    } & {
        type: import(".prisma/client").$Enums.PricingRuleType;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        startDate: Date | null;
        endDate: Date | null;
        priority: number;
        conditions: import("@prisma/client/runtime/library").JsonValue;
        discountType: import(".prisma/client").$Enums.DiscountType;
        discountValue: Decimal;
        maxDiscountValue: Decimal | null;
        timeZone: string | null;
        applyToCategories: boolean;
        applyToProducts: boolean;
        applyToCustomers: boolean;
        usageLimit: number | null;
        usageCount: number;
        perCustomerLimit: number | null;
    })[]>;
    deletePricingRule(ruleId: string): Promise<void>;
    getPricingAnalytics(filters?: any): Promise<{
        summary: {
            totalApplications: number;
            totalSavings: number;
            averageDiscount: number;
            dateRange: {
                startDate: Date;
                endDate: Date;
            };
        };
        rulePerformance: unknown[];
        applications: ({
            product: {
                name: string;
                sku: string;
            };
            rule: {
                type: import(".prisma/client").$Enums.PricingRuleType;
                name: string;
            };
        } & {
            customerGroup: string | null;
            id: string;
            userId: string | null;
            quantity: number;
            productId: string;
            discountAmount: Decimal;
            finalPrice: Decimal;
            orderId: string | null;
            conditions: import("@prisma/client/runtime/library").JsonValue;
            ruleId: string;
            originalPrice: Decimal;
            appliedAt: Date;
        })[];
    }>;
}
export declare const pricingService: PricingService;
//# sourceMappingURL=pricingService.d.ts.map