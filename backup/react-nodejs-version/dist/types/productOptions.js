"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPTION_TEMPLATES = exports.BulkOptionOperationSchema = exports.RangeOptionConfigSchema = exports.FileOptionConfigSchema = exports.TextOptionConfigSchema = exports.NumberOptionConfigSchema = exports.SelectOptionConfigSchema = exports.ValidateProductOptionsSchema = exports.CartItemWithOptionsSchema = exports.SelectedProductOptionsSchema = exports.UpdateProductOptionSchema = exports.CreateProductOptionSchema = exports.ProductOptionSchema = exports.ProductOptionValueSchema = exports.ProductOptionTypeSchema = void 0;
const zod_1 = require("zod");
// Product Option Type Enum
exports.ProductOptionTypeSchema = zod_1.z.enum([
    'SELECT',
    'RADIO',
    'CHECKBOX',
    'TEXT',
    'TEXTAREA',
    'NUMBER',
    'COLOR',
    'DATE',
    'FILE',
    'RANGE',
]);
// Product Option Value Schema
exports.ProductOptionValueSchema = zod_1.z.object({
    id: zod_1.z.string().cuid().optional(),
    value: zod_1.z.string().min(1, 'Value is required'),
    displayValue: zod_1.z.string().min(1, 'Display value is required'),
    sortOrder: zod_1.z.number().int().default(0),
    isActive: zod_1.z.boolean().default(true),
    priceAdjustment: zod_1.z.number().optional(),
    sku: zod_1.z.string().optional(),
    image: zod_1.z.string().url().optional(),
    hexColor: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    description: zod_1.z.string().optional(),
});
// Product Option Schema
exports.ProductOptionSchema = zod_1.z.object({
    id: zod_1.z.string().cuid().optional(),
    productId: zod_1.z.string().cuid('Invalid product ID'),
    name: zod_1.z.string().min(1, 'Option name is required'),
    displayName: zod_1.z.string().min(1, 'Display name is required'),
    type: exports.ProductOptionTypeSchema.default('SELECT'),
    isRequired: zod_1.z.boolean().default(false),
    sortOrder: zod_1.z.number().int().default(0),
    isActive: zod_1.z.boolean().default(true),
    config: zod_1.z.record(zod_1.z.any()).optional(),
    values: zod_1.z.array(exports.ProductOptionValueSchema).optional(),
});
// Create Product Option Schema
exports.CreateProductOptionSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid('Invalid product ID'),
    name: zod_1.z.string().min(1, 'Option name is required'),
    displayName: zod_1.z.string().min(1, 'Display name is required'),
    type: exports.ProductOptionTypeSchema.default('SELECT'),
    isRequired: zod_1.z.boolean().default(false),
    sortOrder: zod_1.z.number().int().default(0),
    config: zod_1.z.record(zod_1.z.any()).optional(),
    values: zod_1.z.array(exports.ProductOptionValueSchema.omit({ id: true })).min(1, 'At least one option value is required'),
});
// Update Product Option Schema
exports.UpdateProductOptionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    displayName: zod_1.z.string().min(1).optional(),
    type: exports.ProductOptionTypeSchema.optional(),
    isRequired: zod_1.z.boolean().optional(),
    sortOrder: zod_1.z.number().int().optional(),
    isActive: zod_1.z.boolean().optional(),
    config: zod_1.z.record(zod_1.z.any()).optional(),
});
// Selected Product Options Schema (for cart/order)
exports.SelectedProductOptionsSchema = zod_1.z.record(zod_1.z.string(), // option name/id
zod_1.z.union([
    zod_1.z.string(), // Single value selection
    zod_1.z.array(zod_1.z.string()), // Multiple value selection
    zod_1.z.number(), // Number input
    zod_1.z.boolean(), // Checkbox
]));
// Cart Item with Options Schema
exports.CartItemWithOptionsSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid('Invalid product ID'),
    variantId: zod_1.z.string().cuid().optional(),
    quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
    options: exports.SelectedProductOptionsSchema.optional(),
});
// Product Option Validation Schema
exports.ValidateProductOptionsSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid('Invalid product ID'),
    selectedOptions: exports.SelectedProductOptionsSchema,
});
// Option Configuration Schemas for different types
exports.SelectOptionConfigSchema = zod_1.z.object({
    multiSelect: zod_1.z.boolean().default(false),
    maxSelections: zod_1.z.number().int().min(1).optional(),
});
exports.NumberOptionConfigSchema = zod_1.z.object({
    min: zod_1.z.number().optional(),
    max: zod_1.z.number().optional(),
    step: zod_1.z.number().positive().optional(),
    unit: zod_1.z.string().optional(), // e.g., "cm", "kg", "inches"
});
exports.TextOptionConfigSchema = zod_1.z.object({
    minLength: zod_1.z.number().int().min(0).optional(),
    maxLength: zod_1.z.number().int().min(1).optional(),
    placeholder: zod_1.z.string().optional(),
    pattern: zod_1.z.string().optional(), // regex pattern
});
exports.FileOptionConfigSchema = zod_1.z.object({
    allowedTypes: zod_1.z.array(zod_1.z.string()).optional(), // MIME types
    maxSize: zod_1.z.number().int().positive().optional(), // bytes
    maxFiles: zod_1.z.number().int().positive().default(1),
});
exports.RangeOptionConfigSchema = zod_1.z.object({
    min: zod_1.z.number(),
    max: zod_1.z.number(),
    step: zod_1.z.number().positive().default(1),
    unit: zod_1.z.string().optional(),
});
// Bulk Option Operations
exports.BulkOptionOperationSchema = zod_1.z.object({
    operation: zod_1.z.enum(['create', 'update', 'delete', 'reorder']),
    options: zod_1.z.array(zod_1.z.union([
        exports.CreateProductOptionSchema,
        exports.ProductOptionSchema.extend({
            id: zod_1.z.string().cuid(),
        }),
    ])),
});
// Common option templates
exports.OPTION_TEMPLATES = [
    {
        id: 'clothing-basic',
        name: 'Basic Clothing Options',
        description: 'Standard size and color options for clothing',
        category: 'Clothing',
        options: [
            {
                name: 'size',
                displayName: 'Size',
                type: 'SELECT',
                isRequired: true,
                sortOrder: 1,
                values: [
                    { value: 'xs', displayValue: 'Extra Small (XS)', sortOrder: 1, isActive: true },
                    { value: 's', displayValue: 'Small (S)', sortOrder: 2, isActive: true },
                    { value: 'm', displayValue: 'Medium (M)', sortOrder: 3, isActive: true },
                    { value: 'l', displayValue: 'Large (L)', sortOrder: 4, isActive: true },
                    { value: 'xl', displayValue: 'Extra Large (XL)', sortOrder: 5, isActive: true },
                ],
            },
            {
                name: 'color',
                displayName: 'Color',
                type: 'COLOR',
                isRequired: true,
                sortOrder: 2,
                values: [
                    { value: 'black', displayValue: 'Black', hexColor: '#000000', sortOrder: 1, isActive: true },
                    { value: 'white', displayValue: 'White', hexColor: '#FFFFFF', sortOrder: 2, isActive: true },
                    { value: 'red', displayValue: 'Red', hexColor: '#FF0000', sortOrder: 3, isActive: true },
                    { value: 'blue', displayValue: 'Blue', hexColor: '#0000FF', sortOrder: 4, isActive: true },
                ],
            },
        ],
    },
    {
        id: 'electronics-basic',
        name: 'Basic Electronics Options',
        description: 'Standard options for electronic products',
        category: 'Electronics',
        options: [
            {
                name: 'storage',
                displayName: 'Storage Capacity',
                type: 'SELECT',
                isRequired: true,
                sortOrder: 1,
                values: [
                    { value: '64gb', displayValue: '64 GB', priceAdjustment: 0, sortOrder: 1, isActive: true },
                    { value: '128gb', displayValue: '128 GB', priceAdjustment: 50, sortOrder: 2, isActive: true },
                    { value: '256gb', displayValue: '256 GB', priceAdjustment: 100, sortOrder: 3, isActive: true },
                    { value: '512gb', displayValue: '512 GB', priceAdjustment: 200, sortOrder: 4, isActive: true },
                ],
            },
            {
                name: 'warranty',
                displayName: 'Extended Warranty',
                type: 'SELECT',
                isRequired: false,
                sortOrder: 2,
                values: [
                    { value: 'none', displayValue: 'No Extended Warranty', priceAdjustment: 0, sortOrder: 1, isActive: true },
                    { value: '1year', displayValue: '1 Year Extended Warranty', priceAdjustment: 99, sortOrder: 2, isActive: true },
                    { value: '2year', displayValue: '2 Year Extended Warranty', priceAdjustment: 179, sortOrder: 3, isActive: true },
                ],
            },
        ],
    },
];
//# sourceMappingURL=productOptions.js.map