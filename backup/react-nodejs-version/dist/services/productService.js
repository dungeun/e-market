"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = exports.ProductService = void 0;
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
const error_1 = require("../middleware/error");
const seoService_1 = require("./seoService");
class ProductService {
    // Create a new product
    async createProduct(data) {
        try {
            // Get existing slugs to ensure uniqueness
            const existingProducts = await database_1.prisma.product.findMany({
                select: { slug: true },
            });
            const existingSlugs = existingProducts.map(p => p.slug);
            // Get category name for SEO
            let categoryName;
            if (data.categoryId) {
                const category = await database_1.prisma.category.findUnique({
                    where: { id: data.categoryId },
                    select: { name: true },
                });
                categoryName = category?.name;
            }
            // Generate SEO data if not provided
            const seoData = seoService_1.seoService.generateProductSEO(data.name, data.description || undefined, categoryName, typeof data.price === 'number' ? data.price : Number(data.price), existingSlugs);
            // Use provided SEO data or generated fallbacks
            const slug = data.slug || seoData.slug;
            const metaTitle = data.metaTitle || seoData.metaTitle;
            const metaDescription = data.metaDescription || seoData.metaDescription;
            const focusKeyword = data.focusKeyword || seoData.focusKeyword;
            // Validate SEO data
            const validation = seoService_1.seoService.validateSEOData({
                slug,
                metaTitle,
                metaDescription,
                focusKeyword,
            });
            if (!validation.isValid) {
                throw new error_1.AppError(`SEO validation failed: ${validation.errors.join(', ')}`, 400);
            }
            // Check if slug already exists
            const existingProduct = await database_1.prisma.product.findUnique({
                where: { slug },
            });
            if (existingProduct) {
                throw new error_1.AppError('Product with this slug already exists', 409);
            }
            // Check if SKU already exists
            const existingSku = await database_1.prisma.product.findUnique({
                where: { sku: data.sku },
            });
            if (existingSku) {
                throw new error_1.AppError('Product with this SKU already exists', 409);
            }
            // Verify category exists if provided
            if (data.categoryId) {
                const category = await database_1.prisma.category.findUnique({
                    where: { id: data.categoryId },
                });
                if (!category) {
                    throw new error_1.AppError('Category not found', 404);
                }
            }
            const product = await database_1.prisma.$transaction(async (tx) => {
                // Create the main product
                const createdProduct = await tx.product.create({
                    data: {
                        name: data.name,
                        slug,
                        description: data.description,
                        shortDescription: data.shortDescription,
                        sku: data.sku,
                        status: data.status,
                        type: data.type,
                        price: data.price,
                        comparePrice: data.comparePrice,
                        costPrice: data.costPrice,
                        trackQuantity: data.trackQuantity,
                        quantity: data.quantity,
                        lowStockThreshold: data.lowStockThreshold,
                        allowBackorders: data.allowBackorders,
                        weight: data.weight || undefined,
                        length: data.length || undefined,
                        width: data.width || undefined,
                        height: data.height || undefined,
                        metaTitle,
                        metaDescription,
                        focusKeyword,
                        isFeatured: data.isFeatured,
                        isDigital: data.isDigital,
                        requiresShipping: data.requiresShipping,
                        categoryId: data.categoryId,
                        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
                    },
                });
                // Create images if provided
                if (data.images && data.images.length > 0) {
                    await tx.productImage.createMany({
                        data: data.images.map((image, index) => ({
                            productId: createdProduct.id,
                            url: image.url,
                            alt: image.alt,
                            sortOrder: image.sortOrder || index,
                            isMain: image.isMain || index === 0,
                        })),
                    });
                }
                // Create variants if provided
                if (data.variants && data.variants.length > 0) {
                    for (const variant of data.variants) {
                        // Check if variant SKU already exists
                        const existingVariantSku = await tx.productVariant.findUnique({
                            where: { sku: variant.sku },
                        });
                        if (existingVariantSku) {
                            throw new error_1.AppError(`Variant SKU ${variant.sku} already exists`, 409);
                        }
                        await tx.productVariant.create({
                            data: {
                                productId: createdProduct.id,
                                name: variant.name,
                                sku: variant.sku,
                                price: variant.price,
                                comparePrice: variant.comparePrice,
                                quantity: variant.quantity,
                                attributes: variant.attributes,
                                isActive: variant.isActive,
                            },
                        });
                    }
                }
                // Create attributes if provided
                if (data.attributes && data.attributes.length > 0) {
                    await tx.productAttribute.createMany({
                        data: data.attributes.map((attr) => ({
                            productId: createdProduct.id,
                            name: attr.name,
                            value: attr.value,
                        })),
                    });
                }
                // Handle tags if provided
                if (data.tags && data.tags.length > 0) {
                    for (const tagName of data.tags) {
                        // Find or create tag
                        const tag = await tx.tag.upsert({
                            where: { slug: this.generateSlug(tagName) },
                            update: {},
                            create: {
                                name: tagName,
                                slug: this.generateSlug(tagName),
                            },
                        });
                        // Create product-tag relation
                        await tx.productTag.create({
                            data: {
                                productId: createdProduct.id,
                                tagId: tag.id,
                            },
                        });
                    }
                }
                return createdProduct;
            });
            // Log inventory if tracking quantity
            if (data.trackQuantity && data.quantity > 0) {
                await this.logInventoryChange({
                    productId: product.id,
                    quantity: data.quantity,
                    type: 'RESTOCK',
                    reason: 'Initial stock',
                });
            }
            logger_1.logger.info(`Product created: ${product.id}`);
            return this.getProductById(product.id);
        }
        catch (error) {
            logger_1.logger.error('Error creating product:', error);
            throw error;
        }
    }
    // Get product by ID with all relations
    async getProductById(id) {
        const product = await database_1.prisma.product.findUnique({
            where: { id },
            include: {
                category: {
                    select: { id: true, name: true, slug: true },
                },
                images: {
                    orderBy: { sortOrder: 'asc' },
                },
                variants: {
                    where: { isActive: true },
                    orderBy: { createdAt: 'asc' },
                },
                attributes: true,
                tags: {
                    include: {
                        tag: {
                            select: { id: true, name: true, slug: true },
                        },
                    },
                },
                _count: {
                    select: {
                        reviews: true,
                        orderItems: true,
                    },
                },
            },
        });
        if (!product) {
            throw new error_1.AppError('Product not found', 404);
        }
        return product;
    }
    // Get products with pagination and filtering
    async getProducts(query) {
        const { page, limit, sortBy, sortOrder, status, categoryId, search, minPrice, maxPrice, isFeatured, inStock, } = query;
        // Build where clause
        const where = {};
        if (status) {
            where.status = status;
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined)
                where.price.gte = minPrice;
            if (maxPrice !== undefined)
                where.price.lte = maxPrice;
        }
        if (isFeatured !== undefined) {
            where.isFeatured = isFeatured;
        }
        if (inStock !== undefined && inStock) {
            where.quantity = { gt: 0 };
        }
        // Build order by
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            database_1.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    category: {
                        select: { id: true, name: true, slug: true },
                    },
                    images: {
                        orderBy: { sortOrder: 'asc' },
                    },
                    variants: {
                        where: { isActive: true },
                        orderBy: { createdAt: 'asc' },
                    },
                    attributes: true,
                    tags: {
                        include: {
                            tag: {
                                select: { id: true, name: true, slug: true },
                            },
                        },
                    },
                    _count: {
                        select: {
                            reviews: true,
                            orderItems: true,
                        },
                    },
                },
            }),
            database_1.prisma.product.count({ where }),
        ]);
        return {
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    // Update product
    async updateProduct(id, data) {
        try {
            // Check if product exists
            const existingProduct = await database_1.prisma.product.findUnique({
                where: { id },
            });
            if (!existingProduct) {
                throw new error_1.AppError('Product not found', 404);
            }
            // Check slug uniqueness if updating
            if (data.slug && data.slug !== existingProduct.slug) {
                const slugExists = await database_1.prisma.product.findUnique({
                    where: { slug: data.slug },
                });
                if (slugExists) {
                    throw new error_1.AppError('Product with this slug already exists', 409);
                }
            }
            // Check SKU uniqueness if updating
            if (data.sku && data.sku !== existingProduct.sku) {
                const skuExists = await database_1.prisma.product.findUnique({
                    where: { sku: data.sku },
                });
                if (skuExists) {
                    throw new error_1.AppError('Product with this SKU already exists', 409);
                }
            }
            // Verify category exists if provided
            if (data.categoryId) {
                const category = await database_1.prisma.category.findUnique({
                    where: { id: data.categoryId },
                });
                if (!category) {
                    throw new error_1.AppError('Category not found', 404);
                }
            }
            await database_1.prisma.$transaction(async (tx) => {
                // Extract images from data to handle separately
                const { images, variants: _variants, attributes, tags, ...productData } = data;
                // Update main product
                const updateData = {
                    ...productData,
                    publishedAt: data.status === 'PUBLISHED' && !existingProduct.publishedAt
                        ? new Date()
                        : undefined,
                };
                await tx.product.update({
                    where: { id },
                    data: updateData,
                });
                // Handle images update if provided
                if (images) {
                    // Delete existing images
                    await tx.productImage.deleteMany({
                        where: { productId: id },
                    });
                    // Create new images
                    if (images.length > 0) {
                        await tx.productImage.createMany({
                            data: images.map((image, index) => ({
                                productId: id,
                                url: image.url,
                                alt: image.alt,
                                sortOrder: image.sortOrder || index,
                                isMain: image.isMain || index === 0,
                            })),
                        });
                    }
                }
                // Handle attributes update if provided
                if (attributes) {
                    // Delete existing attributes
                    await tx.productAttribute.deleteMany({
                        where: { productId: id },
                    });
                    // Create new attributes
                    if (attributes.length > 0) {
                        await tx.productAttribute.createMany({
                            data: attributes.map((attr) => ({
                                productId: id,
                                name: attr.name,
                                value: attr.value,
                            })),
                        });
                    }
                }
                // Handle tags update if provided
                if (tags) {
                    // Delete existing product-tag relations
                    await tx.productTag.deleteMany({
                        where: { productId: id },
                    });
                    // Create new tags and relations
                    for (const tagName of tags) {
                        const tag = await tx.tag.upsert({
                            where: { slug: this.generateSlug(tagName) },
                            update: {},
                            create: {
                                name: tagName,
                                slug: this.generateSlug(tagName),
                            },
                        });
                        await tx.productTag.create({
                            data: {
                                productId: id,
                                tagId: tag.id,
                            },
                        });
                    }
                }
                // Product updated successfully in transaction
                return true;
            });
            logger_1.logger.info(`Product updated: ${id}`);
            return this.getProductById(id);
        }
        catch (error) {
            logger_1.logger.error('Error updating product:', error);
            throw error;
        }
    }
    // Delete product
    async deleteProduct(id) {
        const product = await database_1.prisma.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new error_1.AppError('Product not found', 404);
        }
        await database_1.prisma.product.delete({
            where: { id },
        });
        logger_1.logger.info(`Product deleted: ${id}`);
    }
    // Inventory management
    async adjustInventory(data) {
        const product = await database_1.prisma.product.findUnique({
            where: { id: data.productId },
        });
        if (!product) {
            throw new error_1.AppError('Product not found', 404);
        }
        if (!product.trackQuantity) {
            throw new error_1.AppError('Product does not track quantity', 400);
        }
        const newQuantity = product.quantity + data.quantity;
        if (newQuantity < 0) {
            throw new error_1.AppError('Insufficient inventory', 400);
        }
        await database_1.prisma.$transaction(async (tx) => {
            // Update product quantity
            await tx.product.update({
                where: { id: data.productId },
                data: { quantity: newQuantity },
            });
            // Log inventory change
            await tx.inventoryLog.create({
                data: {
                    productId: data.productId,
                    type: data.type,
                    quantity: data.quantity,
                    reason: data.reason,
                    reference: data.reference,
                },
            });
        });
        logger_1.logger.info(`Inventory adjusted for product ${data.productId}: ${data.quantity}`);
    }
    // Get low stock products
    async getLowStockProducts() {
        return database_1.prisma.product.findMany({
            where: {
                trackQuantity: true,
                quantity: {
                    lte: database_1.prisma.product.fields.lowStockThreshold,
                },
            },
            include: {
                category: {
                    select: { id: true, name: true, slug: true },
                },
            },
        });
    }
    // Get product by slug
    async getProductBySlug(slug) {
        const product = await database_1.prisma.product.findUnique({
            where: { slug },
            include: {
                category: {
                    select: { id: true, name: true, slug: true },
                },
                images: {
                    orderBy: { sortOrder: 'asc' },
                },
                variants: {
                    where: { isActive: true },
                    orderBy: { createdAt: 'asc' },
                },
                attributes: true,
                tags: {
                    include: {
                        tag: {
                            select: { id: true, name: true, slug: true },
                        },
                    },
                },
                _count: {
                    select: {
                        reviews: true,
                        orderItems: true,
                    },
                },
            },
        });
        if (!product) {
            throw new error_1.AppError('Product not found', 404);
        }
        return product;
    }
    // Generate SEO preview for a product
    async generateSEOPreview(productData) {
        try {
            // Get existing slugs
            const existingProducts = await database_1.prisma.product.findMany({
                select: { slug: true },
            });
            const existingSlugs = existingProducts.map(p => p.slug);
            // Get category name
            let categoryName;
            if (productData.categoryId) {
                const category = await database_1.prisma.category.findUnique({
                    where: { id: productData.categoryId },
                    select: { name: true },
                });
                categoryName = category?.name;
            }
            const seoData = seoService_1.seoService.generateProductSEO(productData.name, productData.description, categoryName, productData.price, existingSlugs);
            return {
                slug: seoData.slug,
                metaTitle: seoData.metaTitle,
                metaDescription: seoData.metaDescription,
                focusKeyword: seoData.focusKeyword || '',
            };
        }
        catch (error) {
            logger_1.logger.error('Error generating SEO preview:', error);
            throw new error_1.AppError('Failed to generate SEO preview', 500);
        }
    }
    // Validate product SEO data
    validateProductSEO(seoData) {
        return seoService_1.seoService.validateSEOData(seoData);
    }
    // Private helper methods
    generateSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    async logInventoryChange(data) {
        await database_1.prisma.inventoryLog.create({
            data: {
                productId: data.productId,
                type: data.type,
                quantity: data.quantity,
                reason: data.reason,
                reference: data.reference,
            },
        });
    }
}
exports.ProductService = ProductService;
exports.productService = new ProductService();
//# sourceMappingURL=productService.js.map