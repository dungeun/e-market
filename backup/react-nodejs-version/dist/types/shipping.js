"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingRuleSchema = exports.CarrierWebhookSchema = exports.ShipmentParamsSchema = exports.ShipmentQuerySchema = exports.TrackShipmentSchema = exports.UpdateShipmentSchema = exports.CreateShipmentSchema = exports.CalculateRatesSchema = void 0;
const zod_1 = require("zod");
// Shipping validation schemas
exports.CalculateRatesSchema = zod_1.z.object({
    origin: zod_1.z.object({
        street1: zod_1.z.string().min(1, 'Origin street address is required'),
        street2: zod_1.z.string().optional(),
        city: zod_1.z.string().min(1, 'Origin city is required'),
        state: zod_1.z.string().min(1, 'Origin state is required'),
        postalCode: zod_1.z.string().min(1, 'Origin postal code is required'),
        country: zod_1.z.string().min(2, 'Origin country code is required').max(2),
    }),
    destination: zod_1.z.object({
        street1: zod_1.z.string().min(1, 'Destination street address is required'),
        street2: zod_1.z.string().optional(),
        city: zod_1.z.string().min(1, 'Destination city is required'),
        state: zod_1.z.string().min(1, 'Destination state is required'),
        postalCode: zod_1.z.string().min(1, 'Destination postal code is required'),
        country: zod_1.z.string().min(2, 'Destination country code is required').max(2),
    }),
    packages: zod_1.z.array(zod_1.z.object({
        weight: zod_1.z.number().positive('Package weight must be positive'),
        weightUnit: zod_1.z.enum(['lb', 'kg']).default('kg'),
        length: zod_1.z.number().positive('Package length must be positive'),
        width: zod_1.z.number().positive('Package width must be positive'),
        height: zod_1.z.number().positive('Package height must be positive'),
        dimensionUnit: zod_1.z.enum(['in', 'cm']).default('cm'),
        value: zod_1.z.number().positive('Package value must be positive'),
        currency: zod_1.z.string().length(3, 'Currency must be 3 characters').default('USD'),
    })).min(1, 'At least one package is required'),
    services: zod_1.z.array(zod_1.z.enum(['STANDARD', 'EXPRESS', 'OVERNIGHT', 'PICKUP', 'DIGITAL'])).optional(),
});
exports.CreateShipmentSchema = zod_1.z.object({
    orderId: zod_1.z.string().cuid('Invalid order ID'),
    carrier: zod_1.z.enum(['UPS', 'FEDEX', 'DHL', 'USPS', 'CUSTOM']),
    service: zod_1.z.enum(['STANDARD', 'EXPRESS', 'OVERNIGHT', 'PICKUP', 'DIGITAL']),
    packageInfo: zod_1.z.object({
        weight: zod_1.z.number().positive('Package weight must be positive'),
        weightUnit: zod_1.z.enum(['lb', 'kg']).default('kg'),
        length: zod_1.z.number().positive('Package length must be positive'),
        width: zod_1.z.number().positive('Package width must be positive'),
        height: zod_1.z.number().positive('Package height must be positive'),
        dimensionUnit: zod_1.z.enum(['in', 'cm']).default('cm'),
        value: zod_1.z.number().positive('Package value must be positive'),
        currency: zod_1.z.string().length(3, 'Currency must be 3 characters').default('USD'),
    }),
    labelFormat: zod_1.z.enum(['PDF', 'PNG', 'ZPL']).default('PDF'),
    insurance: zod_1.z.boolean().default(false),
    signature: zod_1.z.boolean().default(false),
    saturdayDelivery: zod_1.z.boolean().default(false),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.UpdateShipmentSchema = zod_1.z.object({
    status: zod_1.z.enum([
        'PENDING',
        'PROCESSING',
        'SHIPPED',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'FAILED_DELIVERY',
        'RETURNED',
        'CANCELLED',
    ]).optional(),
    trackingNumber: zod_1.z.string().optional(),
    trackingUrl: zod_1.z.string().url().optional(),
    estimatedDelivery: zod_1.z.string().datetime().optional(),
    actualDelivery: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().max(500).optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.TrackShipmentSchema = zod_1.z.object({
    trackingNumber: zod_1.z.string().min(1, 'Tracking number is required'),
    carrier: zod_1.z.enum(['UPS', 'FEDEX', 'DHL', 'USPS', 'CUSTOM']).optional(),
});
exports.ShipmentQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).default('1'),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(100)).default('10'),
    orderId: zod_1.z.string().cuid().optional(),
    carrier: zod_1.z.enum(['UPS', 'FEDEX', 'DHL', 'USPS', 'CUSTOM']).optional(),
    status: zod_1.z.enum([
        'PENDING',
        'PROCESSING',
        'SHIPPED',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'FAILED_DELIVERY',
        'RETURNED',
        'CANCELLED',
    ]).optional(),
    fromDate: zod_1.z.string().datetime().optional(),
    toDate: zod_1.z.string().datetime().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'cost', 'status']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.ShipmentParamsSchema = zod_1.z.object({
    id: zod_1.z.string().cuid('Invalid shipment ID'),
});
exports.CarrierWebhookSchema = zod_1.z.object({
    trackingNumber: zod_1.z.string().min(1, 'Tracking number is required'),
    status: zod_1.z.string().min(1, 'Status is required'),
    location: zod_1.z.string().optional(),
    timestamp: zod_1.z.string().datetime(),
    description: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.ShippingRuleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Rule name is required'),
    conditions: zod_1.z.object({
        minWeight: zod_1.z.number().optional(),
        maxWeight: zod_1.z.number().optional(),
        minValue: zod_1.z.number().optional(),
        maxValue: zod_1.z.number().optional(),
        regions: zod_1.z.array(zod_1.z.string()).optional(),
        productCategories: zod_1.z.array(zod_1.z.string()).optional(),
        excludeCategories: zod_1.z.array(zod_1.z.string()).optional(),
    }),
    actions: zod_1.z.object({
        freeShipping: zod_1.z.boolean().default(false),
        flatRate: zod_1.z.number().optional(),
        percentageDiscount: zod_1.z.number().min(0).max(100).optional(),
        fixedDiscount: zod_1.z.number().optional(),
        excludeServices: zod_1.z.array(zod_1.z.enum(['STANDARD', 'EXPRESS', 'OVERNIGHT', 'PICKUP', 'DIGITAL'])).optional(),
    }),
    priority: zod_1.z.number().int().min(1).default(1),
    isActive: zod_1.z.boolean().default(true),
});
//# sourceMappingURL=shipping.js.map