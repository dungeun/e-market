import { z } from 'zod';
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
export declare const ProductStatusEnum: z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>;
export type ProductStatus = z.infer<typeof ProductStatusEnum>;
export declare const ProductTypeEnum: z.ZodEnum<["SIMPLE", "VARIABLE", "GROUPED", "EXTERNAL"]>;
export type ProductType = z.infer<typeof ProductTypeEnum>;
export declare const CreateProductSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    shortDescription: z.ZodOptional<z.ZodString>;
    sku: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>>;
    type: z.ZodDefault<z.ZodEnum<["SIMPLE", "VARIABLE", "GROUPED", "EXTERNAL"]>>;
    price: z.ZodNumber;
    comparePrice: z.ZodOptional<z.ZodNumber>;
    costPrice: z.ZodOptional<z.ZodNumber>;
    trackQuantity: z.ZodDefault<z.ZodBoolean>;
    quantity: z.ZodDefault<z.ZodNumber>;
    lowStockThreshold: z.ZodDefault<z.ZodNumber>;
    allowBackorders: z.ZodDefault<z.ZodBoolean>;
    weight: z.ZodOptional<z.ZodNumber>;
    length: z.ZodOptional<z.ZodNumber>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    metaTitle: z.ZodOptional<z.ZodString>;
    metaDescription: z.ZodOptional<z.ZodString>;
    focusKeyword: z.ZodOptional<z.ZodString>;
    isFeatured: z.ZodDefault<z.ZodBoolean>;
    isDigital: z.ZodDefault<z.ZodBoolean>;
    requiresShipping: z.ZodDefault<z.ZodBoolean>;
    categoryId: z.ZodOptional<z.ZodString>;
    images: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
        sortOrder: z.ZodDefault<z.ZodNumber>;
        isMain: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        sortOrder: number;
        isMain: boolean;
        alt?: string | undefined;
    }, {
        url: string;
        sortOrder?: number | undefined;
        alt?: string | undefined;
        isMain?: boolean | undefined;
    }>, "many">>;
    variants: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        sku: z.ZodString;
        price: z.ZodNumber;
        comparePrice: z.ZodOptional<z.ZodNumber>;
        quantity: z.ZodDefault<z.ZodNumber>;
        attributes: z.ZodRecord<z.ZodString, z.ZodAny>;
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        isActive: boolean;
        sku: string;
        price: number;
        quantity: number;
        attributes: Record<string, any>;
        comparePrice?: number | undefined;
    }, {
        name: string;
        sku: string;
        price: number;
        attributes: Record<string, any>;
        isActive?: boolean | undefined;
        comparePrice?: number | undefined;
        quantity?: number | undefined;
    }>, "many">>;
    attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        name: string;
    }, {
        value: string;
        name: string;
    }>, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "SIMPLE" | "VARIABLE" | "GROUPED" | "EXTERNAL";
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    name: string;
    sku: string;
    price: number;
    trackQuantity: boolean;
    quantity: number;
    lowStockThreshold: number;
    allowBackorders: boolean;
    isFeatured: boolean;
    isDigital: boolean;
    requiresShipping: boolean;
    length?: number | undefined;
    images?: {
        url: string;
        sortOrder: number;
        isMain: boolean;
        alt?: string | undefined;
    }[] | undefined;
    tags?: string[] | undefined;
    width?: number | undefined;
    height?: number | undefined;
    slug?: string | undefined;
    description?: string | undefined;
    shortDescription?: string | undefined;
    comparePrice?: number | undefined;
    costPrice?: number | undefined;
    weight?: number | undefined;
    metaTitle?: string | undefined;
    metaDescription?: string | undefined;
    focusKeyword?: string | undefined;
    categoryId?: string | undefined;
    variants?: {
        name: string;
        isActive: boolean;
        sku: string;
        price: number;
        quantity: number;
        attributes: Record<string, any>;
        comparePrice?: number | undefined;
    }[] | undefined;
    attributes?: {
        value: string;
        name: string;
    }[] | undefined;
}, {
    name: string;
    sku: string;
    price: number;
    type?: "SIMPLE" | "VARIABLE" | "GROUPED" | "EXTERNAL" | undefined;
    length?: number | undefined;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    images?: {
        url: string;
        sortOrder?: number | undefined;
        alt?: string | undefined;
        isMain?: boolean | undefined;
    }[] | undefined;
    tags?: string[] | undefined;
    width?: number | undefined;
    height?: number | undefined;
    slug?: string | undefined;
    description?: string | undefined;
    shortDescription?: string | undefined;
    comparePrice?: number | undefined;
    costPrice?: number | undefined;
    trackQuantity?: boolean | undefined;
    quantity?: number | undefined;
    lowStockThreshold?: number | undefined;
    allowBackorders?: boolean | undefined;
    weight?: number | undefined;
    metaTitle?: string | undefined;
    metaDescription?: string | undefined;
    focusKeyword?: string | undefined;
    isFeatured?: boolean | undefined;
    isDigital?: boolean | undefined;
    requiresShipping?: boolean | undefined;
    categoryId?: string | undefined;
    variants?: {
        name: string;
        sku: string;
        price: number;
        attributes: Record<string, any>;
        isActive?: boolean | undefined;
        comparePrice?: number | undefined;
        quantity?: number | undefined;
    }[] | undefined;
    attributes?: {
        value: string;
        name: string;
    }[] | undefined;
}>;
export declare const UpdateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    shortDescription: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    sku: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>>>;
    type: z.ZodOptional<z.ZodDefault<z.ZodEnum<["SIMPLE", "VARIABLE", "GROUPED", "EXTERNAL"]>>>;
    price: z.ZodOptional<z.ZodNumber>;
    comparePrice: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    costPrice: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    trackQuantity: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    quantity: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    lowStockThreshold: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    allowBackorders: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    weight: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    length: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    width: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    height: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    metaTitle: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    metaDescription: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    focusKeyword: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isFeatured: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isDigital: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    requiresShipping: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    categoryId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    images: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        alt: z.ZodOptional<z.ZodString>;
        sortOrder: z.ZodDefault<z.ZodNumber>;
        isMain: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        sortOrder: number;
        isMain: boolean;
        alt?: string | undefined;
    }, {
        url: string;
        sortOrder?: number | undefined;
        alt?: string | undefined;
        isMain?: boolean | undefined;
    }>, "many">>>;
    variants: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        sku: z.ZodString;
        price: z.ZodNumber;
        comparePrice: z.ZodOptional<z.ZodNumber>;
        quantity: z.ZodDefault<z.ZodNumber>;
        attributes: z.ZodRecord<z.ZodString, z.ZodAny>;
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        isActive: boolean;
        sku: string;
        price: number;
        quantity: number;
        attributes: Record<string, any>;
        comparePrice?: number | undefined;
    }, {
        name: string;
        sku: string;
        price: number;
        attributes: Record<string, any>;
        isActive?: boolean | undefined;
        comparePrice?: number | undefined;
        quantity?: number | undefined;
    }>, "many">>>;
    attributes: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        name: string;
    }, {
        value: string;
        name: string;
    }>, "many">>>;
    tags: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
} & {
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    type?: "SIMPLE" | "VARIABLE" | "GROUPED" | "EXTERNAL" | undefined;
    length?: number | undefined;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    images?: {
        url: string;
        sortOrder: number;
        isMain: boolean;
        alt?: string | undefined;
    }[] | undefined;
    name?: string | undefined;
    tags?: string[] | undefined;
    width?: number | undefined;
    height?: number | undefined;
    slug?: string | undefined;
    description?: string | undefined;
    shortDescription?: string | undefined;
    sku?: string | undefined;
    price?: number | undefined;
    comparePrice?: number | undefined;
    costPrice?: number | undefined;
    trackQuantity?: boolean | undefined;
    quantity?: number | undefined;
    lowStockThreshold?: number | undefined;
    allowBackorders?: boolean | undefined;
    weight?: number | undefined;
    metaTitle?: string | undefined;
    metaDescription?: string | undefined;
    focusKeyword?: string | undefined;
    isFeatured?: boolean | undefined;
    isDigital?: boolean | undefined;
    requiresShipping?: boolean | undefined;
    categoryId?: string | undefined;
    variants?: {
        name: string;
        isActive: boolean;
        sku: string;
        price: number;
        quantity: number;
        attributes: Record<string, any>;
        comparePrice?: number | undefined;
    }[] | undefined;
    attributes?: {
        value: string;
        name: string;
    }[] | undefined;
}, {
    id: string;
    type?: "SIMPLE" | "VARIABLE" | "GROUPED" | "EXTERNAL" | undefined;
    length?: number | undefined;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    images?: {
        url: string;
        sortOrder?: number | undefined;
        alt?: string | undefined;
        isMain?: boolean | undefined;
    }[] | undefined;
    name?: string | undefined;
    tags?: string[] | undefined;
    width?: number | undefined;
    height?: number | undefined;
    slug?: string | undefined;
    description?: string | undefined;
    shortDescription?: string | undefined;
    sku?: string | undefined;
    price?: number | undefined;
    comparePrice?: number | undefined;
    costPrice?: number | undefined;
    trackQuantity?: boolean | undefined;
    quantity?: number | undefined;
    lowStockThreshold?: number | undefined;
    allowBackorders?: boolean | undefined;
    weight?: number | undefined;
    metaTitle?: string | undefined;
    metaDescription?: string | undefined;
    focusKeyword?: string | undefined;
    isFeatured?: boolean | undefined;
    isDigital?: boolean | undefined;
    requiresShipping?: boolean | undefined;
    categoryId?: string | undefined;
    variants?: {
        name: string;
        sku: string;
        price: number;
        attributes: Record<string, any>;
        isActive?: boolean | undefined;
        comparePrice?: number | undefined;
        quantity?: number | undefined;
    }[] | undefined;
    attributes?: {
        value: string;
        name: string;
    }[] | undefined;
}>;
export declare const ProductQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "price", "createdAt", "updatedAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>>;
    categoryId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    minPrice: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    maxPrice: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    isFeatured: z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>;
    inStock: z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>;
}, "strip", z.ZodTypeAny, {
    sortOrder: "asc" | "desc";
    page: number;
    limit: number;
    sortBy: "name" | "createdAt" | "updatedAt" | "price";
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    search?: string | undefined;
    isFeatured?: boolean | undefined;
    categoryId?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    inStock?: boolean | undefined;
}, {
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    search?: string | undefined;
    isFeatured?: string | undefined;
    categoryId?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    sortBy?: "name" | "createdAt" | "updatedAt" | "price" | undefined;
    minPrice?: string | undefined;
    maxPrice?: string | undefined;
    inStock?: string | undefined;
}>;
export declare const ProductParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const ProductImageSchema: z.ZodObject<{
    alt: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    isMain: z.ZodDefault<z.ZodEffects<z.ZodString, boolean, string>>;
}, "strip", z.ZodTypeAny, {
    sortOrder: number;
    isMain: boolean;
    alt?: string | undefined;
}, {
    sortOrder?: string | undefined;
    alt?: string | undefined;
    isMain?: string | undefined;
}>;
export declare const ProductVariantSchema: z.ZodObject<{
    name: z.ZodString;
    sku: z.ZodString;
    price: z.ZodNumber;
    comparePrice: z.ZodOptional<z.ZodNumber>;
    quantity: z.ZodDefault<z.ZodNumber>;
    attributes: z.ZodRecord<z.ZodString, z.ZodAny>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    sku: string;
    price: number;
    quantity: number;
    attributes: Record<string, any>;
    comparePrice?: number | undefined;
}, {
    name: string;
    sku: string;
    price: number;
    attributes: Record<string, any>;
    isActive?: boolean | undefined;
    comparePrice?: number | undefined;
    quantity?: number | undefined;
}>;
export declare const CreateProductVariantSchema: z.ZodObject<{
    name: z.ZodString;
    sku: z.ZodString;
    price: z.ZodNumber;
    comparePrice: z.ZodOptional<z.ZodNumber>;
    quantity: z.ZodDefault<z.ZodNumber>;
    attributes: z.ZodRecord<z.ZodString, z.ZodAny>;
    isActive: z.ZodDefault<z.ZodBoolean>;
} & {
    productId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    sku: string;
    price: number;
    quantity: number;
    attributes: Record<string, any>;
    productId: string;
    comparePrice?: number | undefined;
}, {
    name: string;
    sku: string;
    price: number;
    attributes: Record<string, any>;
    productId: string;
    isActive?: boolean | undefined;
    comparePrice?: number | undefined;
    quantity?: number | undefined;
}>;
export declare const UpdateProductVariantSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    sku: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    comparePrice: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    quantity: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
} & {
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name?: string | undefined;
    isActive?: boolean | undefined;
    sku?: string | undefined;
    price?: number | undefined;
    comparePrice?: number | undefined;
    quantity?: number | undefined;
    attributes?: Record<string, any> | undefined;
}, {
    id: string;
    name?: string | undefined;
    isActive?: boolean | undefined;
    sku?: string | undefined;
    price?: number | undefined;
    comparePrice?: number | undefined;
    quantity?: number | undefined;
    attributes?: Record<string, any> | undefined;
}>;
export declare const InventoryAdjustmentSchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
    type: z.ZodEnum<["SALE", "PURCHASE", "ADJUSTMENT", "RETURN", "DAMAGE", "RESTOCK"]>;
    reason: z.ZodOptional<z.ZodString>;
    reference: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "SALE" | "PURCHASE" | "ADJUSTMENT" | "RETURN" | "DAMAGE" | "RESTOCK";
    quantity: number;
    productId: string;
    reason?: string | undefined;
    reference?: string | undefined;
}, {
    type: "SALE" | "PURCHASE" | "ADJUSTMENT" | "RETURN" | "DAMAGE" | "RESTOCK";
    quantity: number;
    productId: string;
    reason?: string | undefined;
    reference?: string | undefined;
}>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductQueryInput = z.infer<typeof ProductQuerySchema>;
export type ProductParamsInput = z.infer<typeof ProductParamsSchema>;
export type ProductImageInput = z.infer<typeof ProductImageSchema>;
export type CreateProductVariantInput = z.infer<typeof CreateProductVariantSchema>;
export type UpdateProductVariantInput = z.infer<typeof UpdateProductVariantSchema>;
export type InventoryAdjustmentInput = z.infer<typeof InventoryAdjustmentSchema>;
//# sourceMappingURL=product.d.ts.map