"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoutes = void 0;
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const upload_1 = require("../../middleware/upload");
const cache_1 = require("../../middleware/cache");
const cacheService_1 = require("../../services/cacheService");
const router = (0, express_1.Router)();
exports.productRoutes = router;
/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get all products with pagination and filtering
 *     description: Retrieve a paginated list of products with optional filtering and sorting
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, createdAt, updatedAt, stockQuantity]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, draft]
 *         description: Filter by product status
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in product name and description
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum price filter
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Filter by featured products
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Filter by stock availability
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *                 success:
 *                   type: boolean
 *                   example: true
 *             examples:
 *               success:
 *                 summary: Successful response
 *                 value:
 *                   data:
 *                     - id: "prod_123"
 *                       name: "Premium Laptop"
 *                       description: "High-performance laptop for professionals"
 *                       price: 1299.99
 *                       stockQuantity: 25
 *                       status: "active"
 *                       isFeatured: true
 *                       images:
 *                         - id: "img_1"
 *                           url: "https://example.com/laptop1.jpg"
 *                           alt: "Laptop front view"
 *                           isPrimary: true
 *                       category:
 *                         id: "cat_1"
 *                         name: "Electronics"
 *                       createdAt: "2024-01-01T00:00:00Z"
 *                       updatedAt: "2024-01-01T00:00:00Z"
 *                   meta:
 *                     page: 1
 *                     limit: 20
 *                     total: 150
 *                     totalPages: 8
 *                     hasNextPage: true
 *                     hasPrevPage: false
 *                   success: true
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', cache_1.cacheProductList, productController_1.productController.getProducts);
/**
 * @route   POST /api/v1/products
 * @desc    Create a new product
 * @access  Private (Admin)
 * @body    Product data and optional images
 */
router.post('/', (0, upload_1.uploadMultiple)('images', 10), (0, cache_1.invalidateCache)([cacheService_1.CacheService.tags.products]), productController_1.productController.createProduct);
/**
 * @route   GET /api/v1/products/stats
 * @desc    Get product statistics
 * @access  Private (Admin)
 */
router.get('/stats', productController_1.productController.getProductStats);
/**
 * @route   GET /api/v1/products/low-stock
 * @desc    Get products with low stock
 * @access  Private (Admin)
 */
router.get('/low-stock', productController_1.productController.getLowStockProducts);
/**
 * @route   PUT /api/v1/products/bulk
 * @desc    Bulk update products
 * @access  Private (Admin)
 * @body    { productIds: string[], updates: Partial<Product> }
 */
router.put('/bulk', productController_1.productController.bulkUpdateProducts);
/**
 * @route   POST /api/v1/products/inventory/adjust
 * @desc    Adjust product inventory
 * @access  Private (Admin)
 * @body    { productId, quantity, type, reason?, reference? }
 */
router.post('/inventory/adjust', (0, cache_1.invalidateCache)([cacheService_1.CacheService.tags.products, cacheService_1.CacheService.tags.inventory]), productController_1.productController.adjustInventory);
/**
 * @route   POST /api/v1/products/seo/preview
 * @desc    Generate SEO preview for product data
 * @access  Private (Admin)
 * @body    { name, description?, categoryId?, price }
 */
router.post('/seo/preview', productController_1.productController.generateSEOPreview);
/**
 * @route   POST /api/v1/products/seo/validate
 * @desc    Validate SEO data
 * @access  Private (Admin)
 * @body    { slug?, metaTitle?, metaDescription?, focusKeyword? }
 */
router.post('/seo/validate', productController_1.productController.validateSEO);
/**
 * @route   GET /api/v1/products/slug/:slug
 * @desc    Get product by slug
 * @access  Public
 */
router.get('/slug/:slug', cache_1.cacheProduct, productController_1.productController.getProductBySlug);
/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id', cache_1.cacheProduct, productController_1.productController.getProductById);
/**
 * @route   PUT /api/v1/products/:id
 * @desc    Update product by ID
 * @access  Private (Admin)
 * @body    Product data and optional images
 */
router.put('/:id', (0, upload_1.uploadMultiple)('images', 10), (0, cache_1.invalidateCache)((req) => [
    cacheService_1.CacheService.tags.products,
    cacheService_1.CacheService.keys.product(req.params.id)
]), productController_1.productController.updateProduct);
/**
 * @route   DELETE /api/v1/products/:id
 * @desc    Delete product by ID
 * @access  Private (Admin)
 */
router.delete('/:id', productController_1.productController.deleteProduct);
/**
 * @route   POST /api/v1/products/:id/images
 * @desc    Upload multiple images for a product
 * @access  Private (Admin)
 * @body    Images (multipart/form-data)
 */
router.post('/:id/images', (0, upload_1.uploadMultipleImages)('images', 10), productController_1.productController.uploadImages);
/**
 * @route   POST /api/v1/products/:id/image
 * @desc    Upload single image for a product
 * @access  Private (Admin)
 * @body    Single image (multipart/form-data)
 */
router.post('/:id/image', (0, upload_1.uploadSingleImage)('image'), productController_1.productController.uploadSingleImage);
/**
 * @route   DELETE /api/v1/products/:id/images/:imageId
 * @desc    Delete specific image from a product
 * @access  Private (Admin)
 */
router.delete('/:id/images/:imageId', productController_1.productController.deleteImage);
/**
 * @route   POST /api/v1/products/:id/duplicate
 * @desc    Duplicate a product
 * @access  Private (Admin)
 */
router.post('/:id/duplicate', productController_1.productController.duplicateProduct);
//# sourceMappingURL=products.js.map