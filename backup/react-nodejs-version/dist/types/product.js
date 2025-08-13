"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryAdjustmentSchema = exports.UpdateProductVariantSchema = exports.CreateProductVariantSchema = exports.ProductVariantSchema = exports.ProductImageSchema = exports.ProductParamsSchema = exports.ProductQuerySchema = exports.UpdateProductSchema = exports.CreateProductSchema = exports.ProductTypeEnum = exports.ProductStatusEnum = void 0;
const zod_1 = require("zod");
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - sku
 *         - price
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           description: Unique product identifier
 *           example: "prod_123456789"
 *         name:
 *           type: string
 *           description: Product name
 *           example: "Premium Wireless Headphones"
 *           maxLength: 255
 *         slug:
 *           type: string
 *           description: URL-friendly product identifier
 *           example: "premium-wireless-headphones"
 *           maxLength: 255
 *         description:
 *           type: string
 *           description: Detailed product description
 *           example: "High-quality wireless headphones with noise cancellation"
 *         shortDescription:
 *           type: string
 *           description: Brief product description
 *           example: "Wireless headphones with noise cancellation"
 *           maxLength: 500
 *         sku:
 *           type: string
 *           description: Stock Keeping Unit
 *           example: "WH-1000XM4"
 *           maxLength: 100
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *           description: Product status
 *           example: "PUBLISHED"
 *         type:
 *           type: string
 *           enum: [SIMPLE, VARIABLE, GROUPED, EXTERNAL]
 *           description: Product type
 *           example: "SIMPLE"
 *         price:
 *           type: number
 *           format: decimal
 *           description: Product price
 *           example: 299.99
 *           minimum: 0
 *         comparePrice:
 *           type: number
 *           format: decimal
 *           description: Compare at price (MSRP)
 *           example: 399.99
 *           minimum: 0
 *         costPrice:
 *           type: number
 *           format: decimal
 *           description: Cost price for profit calculations
 *           example: 150.00
 *           minimum: 0
 *         trackQuantity:
 *           type: boolean
 *           description: Whether to track inventory quantity
 *           example: true
 *         quantity:
 *           type: integer
 *           description: Current stock quantity
 *           example: 50
 *           minimum: 0
 *         lowStockThreshold:
 *           type: integer
 *           description: Threshold for low stock alerts
 *           example: 5
 *           minimum: 0
 *         allowBackorders:
 *           type: boolean
 *           description: Allow orders when out of stock
 *           example: false
 *         weight:
 *           type: number
 *           format: decimal
 *           description: Product weight in grams
 *           example: 250.5
 *           minimum: 0
 *         length:
 *           type: number
 *           format: decimal
 *           description: Product length in centimeters
 *           example: 15.5
 *           minimum: 0
 *         width:
 *           type: number
 *           format: decimal
 *           description: Product width in centimeters
 *           example: 10.2
 *           minimum: 0
 *         height:
 *           type: number
 *           format: decimal
 *           description: Product height in centimeters
 *           example: 8.0
 *           minimum: 0
 *         metaTitle:
 *           type: string
 *           description: SEO meta title
 *           example: "Premium Wireless Headphones | Best Audio Quality"
 *           maxLength: 255
 *         metaDescription:
 *           type: string
 *           description: SEO meta description
 *           example: "Experience superior sound quality with our premium wireless headphones featuring active noise cancellation."
 *           maxLength: 500
 *         focusKeyword:
 *           type: string
 *           description: Primary SEO keyword
 *           example: "wireless headphones"
 *           maxLength: 100
 *         isFeatured:
 *           type: boolean
 *           description: Whether product is featured
 *           example: true
 *         isDigital:
 *           type: boolean
 *           description: Whether product is digital
 *           example: false
 *         requiresShipping:
 *           type: boolean
 *           description: Whether product requires shipping
 *           example: true
 *         categoryId:
 *           type: string
 *           description: Associated category ID
 *           example: "cat_electronics"
 *         category:
 *           $ref: '#/components/schemas/Category'
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductImage'
 *         variants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductVariant'
 *         attributes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductAttribute'
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["electronics", "audio", "wireless"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Product creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     ProductImage:
 *       type: object
 *       required:
 *         - id
 *         - url
 *       properties:
 *         id:
 *           type: string
 *           description: Image identifier
 *         url:
 *           type: string
 *           format: uri
 *           description: Image URL
 *           example: "https://cdn.example.com/images/headphones-1.jpg"
 *         alt:
 *           type: string
 *           description: Alt text for accessibility
 *           example: "Premium wireless headphones in black"
 *         sortOrder:
 *           type: integer
 *           description: Display order
 *           example: 1
 *           minimum: 0
 *         isMain:
 *           type: boolean
 *           description: Whether this is the primary image
 *           example: true
 *     ProductVariant:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - sku
 *         - price
 *       properties:
 *         id:
 *           type: string
 *           description: Variant identifier
 *         name:
 *           type: string
 *           description: Variant name
 *           example: "Black - Large"
 *         sku:
 *           type: string
 *           description: Variant SKU
 *           example: "WH-1000XM4-BLK-L"
 *         price:
 *           type: number
 *           format: decimal
 *           description: Variant price
 *           example: 299.99
 *         comparePrice:
 *           type: number
 *           format: decimal
 *           description: Variant compare price
 *           example: 399.99
 *         quantity:
 *           type: integer
 *           description: Variant stock quantity
 *           example: 25
 *         attributes:
 *           type: object
 *           description: Variant-specific attributes
 *           example:
 *             color: "Black"
 *             size: "Large"
 *         isActive:
 *           type: boolean
 *           description: Whether variant is active
 *           example: true
 *     ProductAttribute:
 *       type: object
 *       required:
 *         - name
 *         - value
 *       properties:
 *         name:
 *           type: string
 *           description: Attribute name
 *           example: "Brand"
 *         value:
 *           type: string
 *           description: Attribute value
 *           example: "Sony"
 *     Category:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: Category identifier
 *         name:
 *           type: string
 *           description: Category name
 *           example: "Electronics"
 *         slug:
 *           type: string
 *           description: Category slug
 *           example: "electronics"
 */
// Product status enum
exports.ProductStatusEnum = zod_1.z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
// Product type enum
exports.ProductTypeEnum = zod_1.z.enum(['SIMPLE', 'VARIABLE', 'GROUPED', 'EXTERNAL']);
// Base product validation schema
exports.CreateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Product name is required').max(255),
    slug: zod_1.z.string().min(1, 'Product slug is required').max(255).optional(),
    description: zod_1.z.string().optional(),
    shortDescription: zod_1.z.string().max(500).optional(),
    sku: zod_1.z.string().min(1, 'SKU is required').max(100),
    status: exports.ProductStatusEnum.default('DRAFT'),
    type: exports.ProductTypeEnum.default('SIMPLE'),
    // Pricing
    price: zod_1.z.number().positive('Price must be positive'),
    comparePrice: zod_1.z.number().positive().optional(),
    costPrice: zod_1.z.number().positive().optional(),
    // Inventory
    trackQuantity: zod_1.z.boolean().default(true),
    quantity: zod_1.z.number().int().min(0).default(0),
    lowStockThreshold: zod_1.z.number().int().min(0).default(5),
    allowBackorders: zod_1.z.boolean().default(false),
    // Physical properties
    weight: zod_1.z.number().positive().optional(),
    length: zod_1.z.number().positive().optional(),
    width: zod_1.z.number().positive().optional(),
    height: zod_1.z.number().positive().optional(),
    // SEO
    metaTitle: zod_1.z.string().max(255).optional(),
    metaDescription: zod_1.z.string().max(500).optional(),
    focusKeyword: zod_1.z.string().max(100).optional(),
    // Flags
    isFeatured: zod_1.z.boolean().default(false),
    isDigital: zod_1.z.boolean().default(false),
    requiresShipping: zod_1.z.boolean().default(true),
    // Relations
    categoryId: zod_1.z.string().cuid().optional(),
    // Images (array of image objects)
    images: zod_1.z.array(zod_1.z.object({
        url: zod_1.z.string().url(),
        alt: zod_1.z.string().optional(),
        sortOrder: zod_1.z.number().int().min(0).default(0),
        isMain: zod_1.z.boolean().default(false),
    })).optional(),
    // Variants
    variants: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1),
        sku: zod_1.z.string().min(1),
        price: zod_1.z.number().positive(),
        comparePrice: zod_1.z.number().positive().optional(),
        quantity: zod_1.z.number().int().min(0).default(0),
        attributes: zod_1.z.record(zod_1.z.any()),
        isActive: zod_1.z.boolean().default(true),
    })).optional(),
    // Attributes
    attributes: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string().min(1),
        value: zod_1.z.string().min(1),
    })).optional(),
    // Tags
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.UpdateProductSchema = exports.CreateProductSchema.partial().extend({
    id: zod_1.z.string().cuid(),
});
exports.ProductQuerySchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1)).default('1'),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(100)).default('10'),
    sortBy: zod_1.z.enum(['name', 'price', 'createdAt', 'updatedAt']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
    status: exports.ProductStatusEnum.optional(),
    categoryId: zod_1.z.string().cuid().optional(),
    search: zod_1.z.string().optional(),
    minPrice: zod_1.z.string().transform(Number).pipe(zod_1.z.number().positive()).optional(),
    maxPrice: zod_1.z.string().transform(Number).pipe(zod_1.z.number().positive()).optional(),
    isFeatured: zod_1.z.string().transform(val => val === 'true').optional(),
    inStock: zod_1.z.string().transform(val => val === 'true').optional(),
});
exports.ProductParamsSchema = zod_1.z.object({
    id: zod_1.z.string().cuid('Invalid product ID'),
});
// Image upload schema
exports.ProductImageSchema = zod_1.z.object({
    alt: zod_1.z.string().optional(),
    sortOrder: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(0)).default('0'),
    isMain: zod_1.z.string().transform(val => val === 'true').default('false'),
});
// Variant schema
exports.ProductVariantSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Variant name is required'),
    sku: zod_1.z.string().min(1, 'Variant SKU is required'),
    price: zod_1.z.number().positive('Variant price must be positive'),
    comparePrice: zod_1.z.number().positive().optional(),
    quantity: zod_1.z.number().int().min(0).default(0),
    attributes: zod_1.z.record(zod_1.z.any()),
    isActive: zod_1.z.boolean().default(true),
});
exports.CreateProductVariantSchema = exports.ProductVariantSchema.extend({
    productId: zod_1.z.string().cuid(),
});
exports.UpdateProductVariantSchema = exports.ProductVariantSchema.partial().extend({
    id: zod_1.z.string().cuid(),
});
// Inventory adjustment schema
exports.InventoryAdjustmentSchema = zod_1.z.object({
    productId: zod_1.z.string().cuid(),
    quantity: zod_1.z.number().int(),
    type: zod_1.z.enum(['SALE', 'PURCHASE', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'RESTOCK']),
    reason: zod_1.z.string().optional(),
    reference: zod_1.z.string().optional(),
});
//# sourceMappingURL=product.js.map