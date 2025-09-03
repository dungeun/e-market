"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productOptionsService = exports.ProductOptionsService = void 0;
const database_1 = require("../utils/database");
const logger_1 = require("../utils/logger");
const productOptions_1 = require("../types/productOptions");
const library_1 = require("@prisma/client/runtime/library");
class ProductOptionsService {
    // Create a new product option with values
    async createProductOption(data) {
        try {
            const option = await database_1.prisma.$transaction(async (tx) => {
                // Create the option
                const createdOption = await tx.productOption.create({
                    data: {
                        productId: data.productId,
                        name: data.name,
                        displayName: data.displayName,
                        type: data.type,
                        isRequired: data.isRequired,
                        sortOrder: data.sortOrder,
                        config: data.config ? data.config : null,
                    },
                });
                // Create option values
                if (data.values && data.values.length > 0) {
                    await tx.productOptionValue.createMany({
                        data: data.values.map(value => ({
                            optionId: createdOption.id,
                            value: value.value,
                            displayValue: value.displayValue,
                            sortOrder: value.sortOrder || 0,
                            isActive: value.isActive ?? true,
                            priceAdjustment: value.priceAdjustment ? new library_1.Decimal(value.priceAdjustment) : null,
                            sku: value.sku,
                            image: value.image,
                            hexColor: value.hexColor,
                            description: value.description,
                        })),
                    });
                }
                return createdOption;
            });
            logger_1.logger.info(`Created product option: ${option.id} for product: ${data.productId}`);
            return this.getProductOptionById(option.id);
        }
        catch (error) {
            logger_1.logger.error('Error creating product option:', error);
            throw error;
        }
    }
    // Get product option by ID with values
    async getProductOptionById(optionId) {
        try {
            const option = await database_1.query({
                where: { id: optionId },
                include: {
                    values: {
                        where: { isActive: true },
                        orderBy: { sortOrder: 'asc' },
                    },
                },
            });
            if (!option) {
                throw new Error(`Product option with ID ${optionId} not found`);
            }
            return {
                id: option.id,
                productId: option.productId,
                name: option.name,
                displayName: option.displayName,
                type: option.type,
                isRequired: option.isRequired,
                sortOrder: option.sortOrder,
                isActive: option.isActive,
                config: option.config,
                values: option.values.map(value => ({
                    id: value.id,
                    value: value.value,
                    displayValue: value.displayValue,
                    sortOrder: value.sortOrder,
                    isActive: value.isActive,
                    priceAdjustment: value.priceAdjustment ? Number(value.priceAdjustment) : undefined,
                    sku: value.sku || undefined,
                    image: value.image || undefined,
                    hexColor: value.hexColor || undefined,
                    description: value.description || undefined,
                })),
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting product option:', error);
            throw error;
        }
    }
    // Get all options for a product
    async getProductOptions(productId) {
        try {
            const options = await database_1.query({
                where: {
                    productId,
                    isActive: true,
                },
                include: {
                    values: {
                        where: { isActive: true },
                        orderBy: { sortOrder: 'asc' },
                    },
                },
                orderBy: { sortOrder: 'asc' },
            });
            return options.map(option => ({
                id: option.id,
                productId: option.productId,
                name: option.name,
                displayName: option.displayName,
                type: option.type,
                isRequired: option.isRequired,
                sortOrder: option.sortOrder,
                isActive: option.isActive,
                config: option.config,
                values: option.values.map(value => ({
                    id: value.id,
                    value: value.value,
                    displayValue: value.displayValue,
                    sortOrder: value.sortOrder,
                    isActive: value.isActive,
                    priceAdjustment: value.priceAdjustment ? Number(value.priceAdjustment) : undefined,
                    sku: value.sku || undefined,
                    image: value.image || undefined,
                    hexColor: value.hexColor || undefined,
                    description: value.description || undefined,
                })),
            }));
        }
        catch (error) {
            logger_1.logger.error('Error getting product options:', error);
            throw error;
        }
    }
    // Update product option
    async updateProductOption(optionId, data) {
        try {
            await database_1.query({
                where: { id: optionId },
                data: {
                    name: data.name,
                    displayName: data.displayName,
                    type: data.type,
                    isRequired: data.isRequired,
                    sortOrder: data.sortOrder,
                    isActive: data.isActive,
                    config: data.config || undefined,
                },
            });
            logger_1.logger.info(`Updated product option: ${optionId}`);
            return this.getProductOptionById(optionId);
        }
        catch (error) {
            logger_1.logger.error('Error updating product option:', error);
            throw error;
        }
    }
    // Delete product option
    async deleteProductOption(optionId) {
        try {
            await database_1.query({
                where: { id: optionId },
            });
            logger_1.logger.info(`Deleted product option: ${optionId}`);
        }
        catch (error) {
            logger_1.logger.error('Error deleting product option:', error);
            throw error;
        }
    }
    // Add option value to existing option
    async addOptionValue(optionId, valueData) {
        try {
            await database_1.query({
                data: {
                    optionId,
                    value: valueData.value,
                    displayValue: valueData.displayValue,
                    sortOrder: valueData.sortOrder || 0,
                    isActive: valueData.isActive ?? true,
                    priceAdjustment: valueData.priceAdjustment ? new library_1.Decimal(valueData.priceAdjustment) : null,
                    sku: valueData.sku,
                    image: valueData.image,
                    hexColor: valueData.hexColor,
                    description: valueData.description,
                },
            });
            logger_1.logger.info(`Added option value to option: ${optionId}`);
        }
        catch (error) {
            logger_1.logger.error('Error adding option value:', error);
            throw error;
        }
    }
    // Update option value
    async updateOptionValue(valueId, valueData) {
        try {
            await database_1.query({
                where: { id: valueId },
                data: {
                    value: valueData.value,
                    displayValue: valueData.displayValue,
                    sortOrder: valueData.sortOrder,
                    isActive: valueData.isActive,
                    priceAdjustment: valueData.priceAdjustment ? new library_1.Decimal(valueData.priceAdjustment) : null,
                    sku: valueData.sku,
                    image: valueData.image,
                    hexColor: valueData.hexColor,
                    description: valueData.description,
                },
            });
            logger_1.logger.info(`Updated option value: ${valueId}`);
        }
        catch (error) {
            logger_1.logger.error('Error updating option value:', error);
            throw error;
        }
    }
    // Delete option value
    async deleteOptionValue(valueId) {
        try {
            await database_1.query({
                where: { id: valueId },
            });
            logger_1.logger.info(`Deleted option value: ${valueId}`);
        }
        catch (error) {
            logger_1.logger.error('Error deleting option value:', error);
            throw error;
        }
    }
    // Get product with all options and values
    async getProductWithOptions(productId) {
        try {
            const product = await database_1.query({
                where: { id: productId },
                include: {
                    images: {
                        orderBy: { sortOrder: 'asc' },
                    },
                    variants: {
                        where: { isActive: true },
                        orderBy: { createdAt: 'asc' },
                    },
                    options: {
                        where: { isActive: true },
                        include: {
                            values: {
                                where: { isActive: true },
                                orderBy: { sortOrder: 'asc' },
                            },
                        },
                        orderBy: { sortOrder: 'asc' },
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            });
            if (!product) {
                throw new Error(`Product with ID ${productId} not found`);
            }
            return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                price: Number(product.price),
                comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
                status: product.status,
                type: product.type,
                description: product.description || undefined,
                images: product.images.map(img => ({
                    id: img.id,
                    url: img.url,
                    alt: img.alt || undefined,
                    isMain: img.isMain,
                })),
                variants: product.variants.map(variant => ({
                    id: variant.id,
                    name: variant.name,
                    sku: variant.sku,
                    price: Number(variant.price),
                    attributes: variant.attributes,
                    quantity: variant.quantity,
                })),
                options: product.options.map(option => ({
                    id: option.id,
                    name: option.name,
                    displayName: option.displayName,
                    type: option.type,
                    isRequired: option.isRequired,
                    sortOrder: option.sortOrder,
                    config: option.config || undefined,
                    values: option.values.map(value => ({
                        id: value.id,
                        value: value.value,
                        displayValue: value.displayValue,
                        priceAdjustment: value.priceAdjustment ? Number(value.priceAdjustment) : undefined,
                        sku: value.sku || undefined,
                        image: value.image || undefined,
                        hexColor: value.hexColor || undefined,
                        description: value.description || undefined,
                    })),
                })),
                category: product.category || undefined,
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting product with options:', error);
            throw error;
        }
    }
    // Validate selected options for a product
    async validateProductOptions(productId, selectedOptions) {
        try {
            const options = await this.getProductOptions(productId);
            const errors = [];
            const warnings = [];
            // Check required options
            for (const option of options) {
                if (option.isRequired && !selectedOptions[option.name]) {
                    errors.push({
                        optionName: option.name,
                        message: `${option.displayName} is required`,
                        code: 'REQUIRED_OPTION_MISSING',
                    });
                    continue;
                }
                const selectedValue = selectedOptions[option.name];
                if (selectedValue !== undefined) {
                    // Validate option value exists
                    if (option.type === 'SELECT' || option.type === 'RADIO' || option.type === 'COLOR') {
                        const valueExists = option.values?.some(v => v.value === selectedValue);
                        if (!valueExists) {
                            errors.push({
                                optionName: option.name,
                                message: `Invalid value for ${option.displayName}`,
                                code: 'INVALID_OPTION_VALUE',
                            });
                        }
                    }
                    // Validate checkbox selections
                    if (option.type === 'CHECKBOX' && Array.isArray(selectedValue)) {
                        const config = option.config;
                        if (config?.maxSelections && selectedValue.length > config.maxSelections) {
                            errors.push({
                                optionName: option.name,
                                message: `Maximum ${config.maxSelections} selections allowed for ${option.displayName}`,
                                code: 'TOO_MANY_SELECTIONS',
                            });
                        }
                    }
                    // Validate number range
                    if (option.type === 'NUMBER' || option.type === 'RANGE') {
                        const numValue = Number(selectedValue);
                        const config = option.config;
                        if (config?.min !== undefined && numValue < config.min) {
                            errors.push({
                                optionName: option.name,
                                message: `${option.displayName} must be at least ${config.min}`,
                                code: 'VALUE_TOO_LOW',
                            });
                        }
                        if (config?.max !== undefined && numValue > config.max) {
                            errors.push({
                                optionName: option.name,
                                message: `${option.displayName} cannot exceed ${config.max}`,
                                code: 'VALUE_TOO_HIGH',
                            });
                        }
                    }
                    // Validate text length
                    if (option.type === 'TEXT' || option.type === 'TEXTAREA') {
                        const textValue = String(selectedValue);
                        const config = option.config;
                        if (config?.minLength && textValue.length < config.minLength) {
                            errors.push({
                                optionName: option.name,
                                message: `${option.displayName} must be at least ${config.minLength} characters`,
                                code: 'TEXT_TOO_SHORT',
                            });
                        }
                        if (config?.maxLength && textValue.length > config.maxLength) {
                            errors.push({
                                optionName: option.name,
                                message: `${option.displayName} cannot exceed ${config.maxLength} characters`,
                                code: 'TEXT_TOO_LONG',
                            });
                        }
                    }
                }
            }
            return {
                isValid: errors.length === 0,
                errors,
                warnings,
            };
        }
        catch (error) {
            logger_1.logger.error('Error validating product options:', error);
            throw error;
        }
    }
    // Calculate price adjustments based on selected options
    async calculateOptionPricing(productId, selectedOptions) {
        try {
            const product = await database_1.query({
                where: { id: productId },
                select: { price: true },
            });
            if (!product) {
                throw new Error(`Product with ID ${productId} not found`);
            }
            const options = await this.getProductOptions(productId);
            const basePrice = Number(product.price);
            const optionAdjustments = {};
            const breakdown = [];
            let totalAdjustment = 0;
            for (const option of options) {
                const selectedValue = selectedOptions[option.name];
                if (selectedValue) {
                    // Handle single selection
                    if (typeof selectedValue === 'string') {
                        const optionValue = option.values?.find(v => v.value === selectedValue);
                        if (optionValue?.priceAdjustment) {
                            const adjustment = optionValue.priceAdjustment;
                            optionAdjustments[option.name] = adjustment;
                            totalAdjustment += adjustment;
                            breakdown.push({
                                optionName: option.displayName,
                                optionValue: optionValue.displayValue,
                                adjustment,
                            });
                        }
                    }
                    // Handle multiple selections (checkboxes)
                    else if (Array.isArray(selectedValue)) {
                        let optionTotal = 0;
                        for (const value of selectedValue) {
                            const optionValue = option.values?.find(v => v.value === value);
                            if (optionValue?.priceAdjustment) {
                                optionTotal += optionValue.priceAdjustment;
                                breakdown.push({
                                    optionName: option.displayName,
                                    optionValue: optionValue.displayValue,
                                    adjustment: optionValue.priceAdjustment,
                                });
                            }
                        }
                        if (optionTotal > 0) {
                            optionAdjustments[option.name] = optionTotal;
                            totalAdjustment += optionTotal;
                        }
                    }
                }
            }
            return {
                basePrice,
                optionAdjustments,
                totalAdjustment,
                finalPrice: basePrice + totalAdjustment,
                breakdown,
            };
        }
        catch (error) {
            logger_1.logger.error('Error calculating option pricing:', error);
            throw error;
        }
    }
    // Bulk operations for options
    async bulkOptionOperation(operation) {
        try {
            await database_1.prisma.$transaction(async (tx) => {
                switch (operation.operation) {
                    case 'create':
                        for (const optionData of operation.options) {
                            // Create option
                            const option = await tx.productOption.create({
                                data: {
                                    productId: optionData.productId,
                                    name: optionData.name,
                                    displayName: optionData.displayName,
                                    type: optionData.type,
                                    isRequired: optionData.isRequired || false,
                                    sortOrder: optionData.sortOrder || 0,
                                    config: optionData.config,
                                },
                            });
                            // Create option values
                            if (optionData.values) {
                                await tx.productOptionValue.createMany({
                                    data: optionData.values.map((value) => ({
                                        optionId: option.id,
                                        value: value.value,
                                        displayValue: value.displayValue,
                                        sortOrder: value.sortOrder || 0,
                                        priceAdjustment: value.priceAdjustment ? new library_1.Decimal(value.priceAdjustment) : null,
                                        sku: value.sku,
                                        image: value.image,
                                        hexColor: value.hexColor,
                                        description: value.description,
                                    })),
                                });
                            }
                        }
                        break;
                    case 'update':
                        for (const optionData of operation.options) {
                            if (optionData.id) {
                                await tx.productOption.update({
                                    where: { id: optionData.id },
                                    data: {
                                        name: optionData.name,
                                        displayName: optionData.displayName,
                                        type: optionData.type,
                                        isRequired: optionData.isRequired,
                                        sortOrder: optionData.sortOrder,
                                        config: optionData.config,
                                    },
                                });
                            }
                        }
                        break;
                    case 'delete': {
                        const optionIds = operation.options.map(opt => opt.id).filter(Boolean);
                        if (optionIds.length > 0) {
                            await tx.productOption.deleteMany({
                                where: { id: { in: optionIds } },
                            });
                        }
                        break;
                    }
                    case 'reorder':
                        for (const optionData of operation.options) {
                            if (optionData.id) {
                                await tx.productOption.update({
                                    where: { id: optionData.id },
                                    data: { sortOrder: optionData.sortOrder },
                                });
                            }
                        }
                        break;
                }
            });
            logger_1.logger.info(`Bulk operation ${operation.operation} completed for ${operation.options.length} options`);
        }
        catch (error) {
            logger_1.logger.error('Error in bulk option operation:', error);
            throw error;
        }
    }
    // Apply option template to product
    async applyOptionTemplate(productId, templateId) {
        try {
            const template = productOptions_1.OPTION_TEMPLATES.find(t => t.id === templateId);
            if (!template) {
                throw new Error(`Template with ID ${templateId} not found`);
            }
            const optionsToCreate = template.options.map(option => ({
                ...option,
                productId,
            }));
            await this.bulkOptionOperation({
                operation: 'create',
                options: optionsToCreate,
            });
            logger_1.logger.info(`Applied template ${templateId} to product ${productId}`);
        }
        catch (error) {
            logger_1.logger.error('Error applying option template:', error);
            throw error;
        }
    }
    // Get available option templates
    getOptionTemplates() {
        return productOptions_1.OPTION_TEMPLATES;
    }
    // Clone options from one product to another
    async cloneProductOptions(sourceProductId, targetProductId) {
        try {
            const sourceOptions = await this.getProductOptions(sourceProductId);
            const optionsToCreate = sourceOptions.map(option => ({
                productId: targetProductId,
                name: option.name,
                displayName: option.displayName,
                type: option.type,
                isRequired: option.isRequired,
                sortOrder: option.sortOrder,
                config: option.config,
                values: option.values || [],
            }));
            await this.bulkOptionOperation({
                operation: 'create',
                options: optionsToCreate,
            });
            logger_1.logger.info(`Cloned options from product ${sourceProductId} to product ${targetProductId}`);
        }
        catch (error) {
            logger_1.logger.error('Error cloning product options:', error);
            throw error;
        }
    }
}
exports.ProductOptionsService = ProductOptionsService;
exports.productOptionsService = new ProductOptionsService();
//# sourceMappingURL=productOptionsService.js.map