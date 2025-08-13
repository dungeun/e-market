import { z } from 'zod';
export declare const CalculateRatesSchema: z.ZodObject<{
    origin: z.ZodObject<{
        street1: z.ZodString;
        street2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        city: string;
        state: string;
        postalCode: string;
        country: string;
        street1: string;
        street2?: string | undefined;
    }, {
        city: string;
        state: string;
        postalCode: string;
        country: string;
        street1: string;
        street2?: string | undefined;
    }>;
    destination: z.ZodObject<{
        street1: z.ZodString;
        street2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        city: string;
        state: string;
        postalCode: string;
        country: string;
        street1: string;
        street2?: string | undefined;
    }, {
        city: string;
        state: string;
        postalCode: string;
        country: string;
        street1: string;
        street2?: string | undefined;
    }>;
    packages: z.ZodArray<z.ZodObject<{
        weight: z.ZodNumber;
        weightUnit: z.ZodDefault<z.ZodEnum<["lb", "kg"]>>;
        length: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        dimensionUnit: z.ZodDefault<z.ZodEnum<["in", "cm"]>>;
        value: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        length: number;
        currency: string;
        width: number;
        height: number;
        weight: number;
        weightUnit: "lb" | "kg";
        dimensionUnit: "in" | "cm";
    }, {
        value: number;
        length: number;
        width: number;
        height: number;
        weight: number;
        currency?: string | undefined;
        weightUnit?: "lb" | "kg" | undefined;
        dimensionUnit?: "in" | "cm" | undefined;
    }>, "many">;
    services: z.ZodOptional<z.ZodArray<z.ZodEnum<["STANDARD", "EXPRESS", "OVERNIGHT", "PICKUP", "DIGITAL"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    origin: {
        city: string;
        state: string;
        postalCode: string;
        country: string;
        street1: string;
        street2?: string | undefined;
    };
    destination: {
        city: string;
        state: string;
        postalCode: string;
        country: string;
        street1: string;
        street2?: string | undefined;
    };
    packages: {
        value: number;
        length: number;
        currency: string;
        width: number;
        height: number;
        weight: number;
        weightUnit: "lb" | "kg";
        dimensionUnit: "in" | "cm";
    }[];
    services?: ("STANDARD" | "EXPRESS" | "OVERNIGHT" | "PICKUP" | "DIGITAL")[] | undefined;
}, {
    origin: {
        city: string;
        state: string;
        postalCode: string;
        country: string;
        street1: string;
        street2?: string | undefined;
    };
    destination: {
        city: string;
        state: string;
        postalCode: string;
        country: string;
        street1: string;
        street2?: string | undefined;
    };
    packages: {
        value: number;
        length: number;
        width: number;
        height: number;
        weight: number;
        currency?: string | undefined;
        weightUnit?: "lb" | "kg" | undefined;
        dimensionUnit?: "in" | "cm" | undefined;
    }[];
    services?: ("STANDARD" | "EXPRESS" | "OVERNIGHT" | "PICKUP" | "DIGITAL")[] | undefined;
}>;
export declare const CreateShipmentSchema: z.ZodObject<{
    orderId: z.ZodString;
    carrier: z.ZodEnum<["UPS", "FEDEX", "DHL", "USPS", "CUSTOM"]>;
    service: z.ZodEnum<["STANDARD", "EXPRESS", "OVERNIGHT", "PICKUP", "DIGITAL"]>;
    packageInfo: z.ZodObject<{
        weight: z.ZodNumber;
        weightUnit: z.ZodDefault<z.ZodEnum<["lb", "kg"]>>;
        length: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
        dimensionUnit: z.ZodDefault<z.ZodEnum<["in", "cm"]>>;
        value: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        length: number;
        currency: string;
        width: number;
        height: number;
        weight: number;
        weightUnit: "lb" | "kg";
        dimensionUnit: "in" | "cm";
    }, {
        value: number;
        length: number;
        width: number;
        height: number;
        weight: number;
        currency?: string | undefined;
        weightUnit?: "lb" | "kg" | undefined;
        dimensionUnit?: "in" | "cm" | undefined;
    }>;
    labelFormat: z.ZodDefault<z.ZodEnum<["PDF", "PNG", "ZPL"]>>;
    insurance: z.ZodDefault<z.ZodBoolean>;
    signature: z.ZodDefault<z.ZodBoolean>;
    saturdayDelivery: z.ZodDefault<z.ZodBoolean>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    carrier: "UPS" | "FEDEX" | "DHL" | "USPS" | "CUSTOM";
    service: "STANDARD" | "EXPRESS" | "OVERNIGHT" | "PICKUP" | "DIGITAL";
    packageInfo: {
        value: number;
        length: number;
        currency: string;
        width: number;
        height: number;
        weight: number;
        weightUnit: "lb" | "kg";
        dimensionUnit: "in" | "cm";
    };
    labelFormat: "PDF" | "PNG" | "ZPL";
    insurance: boolean;
    signature: boolean;
    saturdayDelivery: boolean;
    metadata?: Record<string, any> | undefined;
}, {
    orderId: string;
    carrier: "UPS" | "FEDEX" | "DHL" | "USPS" | "CUSTOM";
    service: "STANDARD" | "EXPRESS" | "OVERNIGHT" | "PICKUP" | "DIGITAL";
    packageInfo: {
        value: number;
        length: number;
        width: number;
        height: number;
        weight: number;
        currency?: string | undefined;
        weightUnit?: "lb" | "kg" | undefined;
        dimensionUnit?: "in" | "cm" | undefined;
    };
    metadata?: Record<string, any> | undefined;
    labelFormat?: "PDF" | "PNG" | "ZPL" | undefined;
    insurance?: boolean | undefined;
    signature?: boolean | undefined;
    saturdayDelivery?: boolean | undefined;
}>;
export declare const UpdateShipmentSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["PENDING", "PROCESSING", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED_DELIVERY", "RETURNED", "CANCELLED"]>>;
    trackingNumber: z.ZodOptional<z.ZodString>;
    trackingUrl: z.ZodOptional<z.ZodString>;
    estimatedDelivery: z.ZodOptional<z.ZodString>;
    actualDelivery: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "FAILED_DELIVERY" | "RETURNED" | undefined;
    metadata?: Record<string, any> | undefined;
    notes?: string | undefined;
    trackingNumber?: string | undefined;
    trackingUrl?: string | undefined;
    estimatedDelivery?: string | undefined;
    actualDelivery?: string | undefined;
}, {
    status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "FAILED_DELIVERY" | "RETURNED" | undefined;
    metadata?: Record<string, any> | undefined;
    notes?: string | undefined;
    trackingNumber?: string | undefined;
    trackingUrl?: string | undefined;
    estimatedDelivery?: string | undefined;
    actualDelivery?: string | undefined;
}>;
export declare const TrackShipmentSchema: z.ZodObject<{
    trackingNumber: z.ZodString;
    carrier: z.ZodOptional<z.ZodEnum<["UPS", "FEDEX", "DHL", "USPS", "CUSTOM"]>>;
}, "strip", z.ZodTypeAny, {
    trackingNumber: string;
    carrier?: "UPS" | "FEDEX" | "DHL" | "USPS" | "CUSTOM" | undefined;
}, {
    trackingNumber: string;
    carrier?: "UPS" | "FEDEX" | "DHL" | "USPS" | "CUSTOM" | undefined;
}>;
export declare const ShipmentQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    orderId: z.ZodOptional<z.ZodString>;
    carrier: z.ZodOptional<z.ZodEnum<["UPS", "FEDEX", "DHL", "USPS", "CUSTOM"]>>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "PROCESSING", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED_DELIVERY", "RETURNED", "CANCELLED"]>>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "updatedAt", "cost", "status"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    page: number;
    limit: number;
    sortBy: "status" | "createdAt" | "updatedAt" | "cost";
    status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "FAILED_DELIVERY" | "RETURNED" | undefined;
    orderId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    carrier?: "UPS" | "FEDEX" | "DHL" | "USPS" | "CUSTOM" | undefined;
}, {
    status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "FAILED_DELIVERY" | "RETURNED" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    sortBy?: "status" | "createdAt" | "updatedAt" | "cost" | undefined;
    orderId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    carrier?: "UPS" | "FEDEX" | "DHL" | "USPS" | "CUSTOM" | undefined;
}>;
export declare const ShipmentParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const CarrierWebhookSchema: z.ZodObject<{
    trackingNumber: z.ZodString;
    status: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    status: string;
    timestamp: string;
    trackingNumber: string;
    metadata?: Record<string, any> | undefined;
    description?: string | undefined;
    location?: string | undefined;
}, {
    status: string;
    timestamp: string;
    trackingNumber: string;
    metadata?: Record<string, any> | undefined;
    description?: string | undefined;
    location?: string | undefined;
}>;
export declare const ShippingRuleSchema: z.ZodObject<{
    name: z.ZodString;
    conditions: z.ZodObject<{
        minWeight: z.ZodOptional<z.ZodNumber>;
        maxWeight: z.ZodOptional<z.ZodNumber>;
        minValue: z.ZodOptional<z.ZodNumber>;
        maxValue: z.ZodOptional<z.ZodNumber>;
        regions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        productCategories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        excludeCategories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        minWeight?: number | undefined;
        maxWeight?: number | undefined;
        minValue?: number | undefined;
        maxValue?: number | undefined;
        regions?: string[] | undefined;
        productCategories?: string[] | undefined;
        excludeCategories?: string[] | undefined;
    }, {
        minWeight?: number | undefined;
        maxWeight?: number | undefined;
        minValue?: number | undefined;
        maxValue?: number | undefined;
        regions?: string[] | undefined;
        productCategories?: string[] | undefined;
        excludeCategories?: string[] | undefined;
    }>;
    actions: z.ZodObject<{
        freeShipping: z.ZodDefault<z.ZodBoolean>;
        flatRate: z.ZodOptional<z.ZodNumber>;
        percentageDiscount: z.ZodOptional<z.ZodNumber>;
        fixedDiscount: z.ZodOptional<z.ZodNumber>;
        excludeServices: z.ZodOptional<z.ZodArray<z.ZodEnum<["STANDARD", "EXPRESS", "OVERNIGHT", "PICKUP", "DIGITAL"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        freeShipping: boolean;
        flatRate?: number | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: number | undefined;
        excludeServices?: ("STANDARD" | "EXPRESS" | "OVERNIGHT" | "PICKUP" | "DIGITAL")[] | undefined;
    }, {
        freeShipping?: boolean | undefined;
        flatRate?: number | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: number | undefined;
        excludeServices?: ("STANDARD" | "EXPRESS" | "OVERNIGHT" | "PICKUP" | "DIGITAL")[] | undefined;
    }>;
    priority: z.ZodDefault<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    priority: number;
    conditions: {
        minWeight?: number | undefined;
        maxWeight?: number | undefined;
        minValue?: number | undefined;
        maxValue?: number | undefined;
        regions?: string[] | undefined;
        productCategories?: string[] | undefined;
        excludeCategories?: string[] | undefined;
    };
    actions: {
        freeShipping: boolean;
        flatRate?: number | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: number | undefined;
        excludeServices?: ("STANDARD" | "EXPRESS" | "OVERNIGHT" | "PICKUP" | "DIGITAL")[] | undefined;
    };
}, {
    name: string;
    conditions: {
        minWeight?: number | undefined;
        maxWeight?: number | undefined;
        minValue?: number | undefined;
        maxValue?: number | undefined;
        regions?: string[] | undefined;
        productCategories?: string[] | undefined;
        excludeCategories?: string[] | undefined;
    };
    actions: {
        freeShipping?: boolean | undefined;
        flatRate?: number | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: number | undefined;
        excludeServices?: ("STANDARD" | "EXPRESS" | "OVERNIGHT" | "PICKUP" | "DIGITAL")[] | undefined;
    };
    isActive?: boolean | undefined;
    priority?: number | undefined;
}>;
export type CalculateRatesInput = z.infer<typeof CalculateRatesSchema>;
export type CreateShipmentInput = z.infer<typeof CreateShipmentSchema>;
export type UpdateShipmentInput = z.infer<typeof UpdateShipmentSchema>;
export type TrackShipmentInput = z.infer<typeof TrackShipmentSchema>;
export type ShipmentQueryInput = z.infer<typeof ShipmentQuerySchema>;
export type ShipmentParamsInput = z.infer<typeof ShipmentParamsSchema>;
export type CarrierWebhookInput = z.infer<typeof CarrierWebhookSchema>;
export type ShippingRuleInput = z.infer<typeof ShippingRuleSchema>;
export interface ShippingAddress {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    company?: string;
    contact?: {
        name: string;
        phone?: string;
        email?: string;
    };
}
export interface PackageInfo {
    weight: number;
    weightUnit: 'lb' | 'kg';
    length: number;
    width: number;
    height: number;
    dimensionUnit: 'in' | 'cm';
    value: number;
    currency: string;
    description?: string;
    contents?: string[];
}
export interface ShippingRate {
    carrier: string;
    service: 'STANDARD' | 'EXPRESS' | 'OVERNIGHT' | 'PICKUP' | 'DIGITAL';
    serviceName: string;
    cost: number;
    currency: string;
    estimatedDays: number;
    estimatedDelivery?: Date;
    guaranteed: boolean;
    insurance?: {
        available: boolean;
        cost?: number;
    };
    signature?: {
        available: boolean;
        cost?: number;
    };
    saturdayDelivery?: {
        available: boolean;
        cost?: number;
    };
    metadata?: Record<string, any>;
}
export interface ShipmentWithDetails {
    id: string;
    orderId: string;
    trackingNumber?: string;
    trackingUrl?: string;
    carrier: string;
    service: string;
    serviceName: string;
    status: string;
    cost: number;
    currency: string;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
    packageInfo: PackageInfo;
    labelUrl?: string;
    labelFormat?: string;
    insurance: boolean;
    signature: boolean;
    saturdayDelivery: boolean;
    notes?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    order: {
        id: string;
        orderNumber: string;
        status: string;
    };
}
export interface TrackingEvent {
    id: string;
    shipmentId: string;
    status: string;
    location?: string;
    description?: string;
    timestamp: Date;
    metadata?: Record<string, any>;
    createdAt: Date;
}
export interface ShipmentTracking {
    trackingNumber: string;
    carrier: string;
    status: string;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
    events: TrackingEvent[];
    lastUpdated: Date;
}
export interface ShippingZone {
    id: string;
    name: string;
    description?: string;
    countries: string[];
    states?: string[];
    postalCodes?: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ShippingCarrier {
    id: string;
    code: string;
    name: string;
    logoUrl?: string;
    trackingUrlPattern?: string;
    apiConfig?: {
        endpoint: string;
        apiKey?: string;
        accountNumber?: string;
        meterNumber?: string;
    };
    services: Array<{
        code: string;
        name: string;
        estimatedDays: number;
        maxWeight?: number;
        maxDimensions?: {
            length: number;
            width: number;
            height: number;
        };
    }>;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ShippingRule {
    id: string;
    name: string;
    description?: string;
    conditions: {
        minWeight?: number;
        maxWeight?: number;
        minValue?: number;
        maxValue?: number;
        regions?: string[];
        productCategories?: string[];
        excludeCategories?: string[];
    };
    actions: {
        freeShipping: boolean;
        flatRate?: number;
        percentageDiscount?: number;
        fixedDiscount?: number;
        excludeServices?: string[];
    };
    priority: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ShippingSummary {
    id: string;
    orderId: string;
    orderNumber: string;
    trackingNumber?: string;
    carrier: string;
    service: string;
    status: string;
    cost: number;
    currency: string;
    estimatedDelivery?: Date;
    createdAt: Date;
}
export interface ShippingAnalytics {
    totalShipments: number;
    totalCost: number;
    averageCost: number;
    statusCounts: Array<{
        status: string;
        count: number;
        totalCost: number;
    }>;
    carrierCounts: Array<{
        carrier: string;
        count: number;
        totalCost: number;
        averageCost: number;
    }>;
    recentShipments: ShippingSummary[];
}
export interface ShippingEvent {
    type: 'SHIPMENT_CREATED' | 'SHIPMENT_UPDATED' | 'TRACKING_UPDATED' | 'DELIVERY_ATTEMPTED' | 'DELIVERED' | 'EXCEPTION';
    shipmentId: string;
    orderId: string;
    trackingNumber?: string;
    data: any;
    timestamp: Date;
}
export interface ShippingError {
    code: string;
    message: string;
    details?: Record<string, any>;
}
export interface CarrierApiError extends ShippingError {
    carrier: string;
    apiResponse?: any;
}
//# sourceMappingURL=shipping.d.ts.map