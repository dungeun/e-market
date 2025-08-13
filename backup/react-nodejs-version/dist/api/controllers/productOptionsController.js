"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productOptionsController = exports.ProductOptionsController = void 0;
const productOptionsService_1 = require("../../services/productOptionsService");
const logger_1 = require("../../utils/logger");
const zod_1 = require("zod");
const productOptions_1 = require("../../types/productOptions");
class ProductOptionsController {
    constructor() {
        // Create a new product option
        this.createProductOption = async (req, res) => {
            try {
                const validatedData = productOptions_1.CreateProductOptionSchema.parse(req.body);
                const option = await productOptionsService_1.productOptionsService.createProductOption(validatedData);
                return res.status(201).json({
                    success: true,
                    data: option,
                    message: 'Product option created successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error creating product option:', error);
                if (error instanceof zod_1.z.ZodError) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            message: 'Validation error',
                            details: error.errors
                        }
                    });
                }
                return res.status(500).json({
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Internal server error'
                    }
                });
            }
        };
        // Get product option by ID
        this.getProductOption = async (req, res) => {
            try {
                const { optionId } = req.params;
                const option = await productOptionsService_1.productOptionsService.getProductOptionById(optionId);
                return res.json({
                    success: true,
                    data: option
                });
            }
            catch (error) {
                logger_1.logger.error('Error getting product option:', error);
                if (error instanceof Error && error.message.includes('not found')) {
                    return res.status(404).json({
                        success: false,
                        error: { message: error.message }
                    });
                }
                return res.status(500).json({
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Internal server error'
                    }
                });
            }
        };
        // Get all options for a product
        this.getProductOptions = async (req, res) => {
            try {
                const { productId } = req.params;
                const options = await productOptionsService_1.productOptionsService.getProductOptions(productId);
                return res.json({
                    success: true,
                    data: options,
                    count: options.length
                });
            }
            catch (error) {
                logger_1.logger.error('Error getting product options:', error);
                return res.status(500).json({
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Internal server error'
                    }
                });
            }
        };
        // Update product option
        this.updateProductOption = async (req, res) => {
            try {
                const { optionId } = req.params;
                const validatedData = productOptions_1.UpdateProductOptionSchema.parse(req.body);
                const option = await productOptionsService_1.productOptionsService.updateProductOption(optionId, validatedData);
                return res.json({
                    success: true,
                    data: option,
                    message: 'Product option updated successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error updating product option:', error);
                if (error instanceof zod_1.z.ZodError) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            message: 'Validation error',
                            details: error.errors
                        }
                    });
                }
                return res.status(500).json({
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Internal server error'
                    }
                });
            }
        };
        // Delete product option
        this.deleteProductOption = async (req, res) => {
            try {
                const { optionId } = req.params;
                await productOptionsService_1.productOptionsService.deleteProductOption(optionId);
                return res.json({
                    success: true,
                    message: 'Product option deleted successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error deleting product option:', error);
                return res.status(500).json({
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Internal server error'
                    }
                });
            }
        };
        // Add option value to existing option
        this.addOptionValue = async (req, res) => {
            try {
                const { optionId } = req.params;
                const validatedData = productOptions_1.ProductOptionValueSchema.omit({ id: true }).parse(req.body);
                await productOptionsService_1.productOptionsService.addOptionValue(optionId, validatedData);
                return res.status(201).json({
                    success: true,
                    message: 'Option value added successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error adding option value:', error);
                if (error instanceof zod_1.z.ZodError) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            message: 'Validation error',
                            details: error.errors
                        }
                    });
                }
                return res.status(500).json({
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Internal server error'
                    }
                });
            }
        };
        // Update option value
        this.updateOptionValue = async (req, res) => {
            try {
                const { valueId } = req.params;
                const validatedData = productOptions_1.ProductOptionValueSchema.partial().parse(req.body);
                await productOptionsService_1.productOptionsService.updateOptionValue(valueId, validatedData);
                return res.json({
                    success: true,
                    message: 'Option value updated successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error updating option value:', error);
                if (error instanceof zod_1.z.ZodError) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            message: 'Validation error',
                            details: error.errors
                        }
                    });
                }
                return res.status(500).json({
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Internal server error'
                    }
                });
            }
        };
        // Delete option value
        this.deleteOptionValue = async (req, res) => {
            try {
                const { valueId } = req.params;
                await productOptionsService_1.productOptionsService.deleteOptionValue(valueId);
                return res.json({
                    success: true,
                    message: 'Option value deleted successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error deleting option value:', error);
                return res.status(500).json({
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Internal server error'
                    }
                });
            }
        };
        // Get product with all options and values
        this.getProductWithOptions = async (req, res) => {
            try {
                const { productId } = req.params;
                const product = await productOptionsService_1.productOptionsService.getProductWithOptions(productId);
                return res.json({
                    success: true,
                    data: product
                });
            }
            catch (error) {
                logger_1.logger.error('Error getting product with options:', error);
                if (error instanceof Error && error.message.includes('not found')) {
                    return res.status(404).json({
                        success: false,
                        error: { message: error.message }
                    });
                }
                return res.status(500).json({
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Internal server error'
                    }
                });
            }
        };
        // Validate selected options for a product
        this.validateProductOptions = async (req, res) => {
            try {
                const validatedData = productOptions_1.ValidateProductOptionsSchema.parse(req.body);
                const validation = await productOptionsService_1.productOptionsService.validateProductOptions(validatedData.productId, validatedData.selectedOptions);
                return res.json({
                    success: true,
                    data: validation
                });
            }
            catch (error) {
                logger_1.logger.error('Error validating product options:', error);
                if (error instanceof zod_1.z.ZodError) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            message: 'Validation error',
                            details: error.errors
                        }
                    });
                }
                return res.status(500).json({
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Internal server error'
                    }
                });
            }
        };
        // Calculate price with selected options
        this.calculateOptionPricing = async (req, res) => {
            try {
                const { productId } = req.params;
                const { selectedOptions } = req.body;
                const validatedOptions = productOptions_1.SelectedProductOptionsSchema.parse(selectedOptions);
                const pricing = await productOptionsService_1.productOptionsService.calculateOptionPricing(productId, validatedOptions);
                return res.json({
                    success: true,
                    data: pricing
                });
            }
            catch (error) {
                logger_1.logger.error('Error calculating option pricing:', error);
                if (error instanceof zod_1.z.ZodError) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            message: 'Validation error',
                            details: error.errors
                        }
                    });
                }
                return res.status(500).json({
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Internal server error'
                    }
                });
            }
        };
        // Bulk operations for options
        this.bulkOptionOperation = async (req, res) => {
            try {
                const validatedData = productOptions_1.BulkOptionOperationSchema.parse(req.body);
                await productOptionsService_1.productOptionsService.bulkOptionOperation(validatedData);
                return res.json({
                    success: true,
                    message: `Bulk ${validatedData.operation} operation completed successfully`
                });
            }
            catch (error) {
                logger_1.logger.error('Error in bulk option operation:', error);
                if (error instanceof zod_1.z.ZodError) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            message: 'Validation error',
                            details: error.errors
                        }
                    });
                }
                return res.status(500).json({
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Internal server error'
                    }
                });
            }
        };
        // Apply option template to product
        this.applyOptionTemplate = async (req, res) => {
            try {
                const { productId } = req.params;
                const { templateId } = req.body;
                const schema = zod_1.z.object({
                    templateId: zod_1.z.string().min(1, 'Template ID is required')
                });
                const validatedData = schema.parse({ templateId });
                await productOptionsService_1.productOptionsService.applyOptionTemplate(productId, validatedData.templateId);
                return res.json({
                    success: true,
                    message: 'Option template applied successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error applying option template:', error);
                if (error instanceof zod_1.z.ZodError) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            message: 'Validation error',
                            details: error.errors
                        }
                    });
                }
                return res.status(500).json({
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Internal server error'
                    }
                });
            }
        };
        // Get available option templates
        this.getOptionTemplates = async (_req, res) => {
            try {
                const templates = productOptionsService_1.productOptionsService.getOptionTemplates();
                return res.json({
                    success: true,
                    data: templates,
                    count: templates.length
                });
            }
            catch (error) {
                logger_1.logger.error('Error getting option templates:', error);
                return res.status(500).json({
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Internal server error'
                    }
                });
            }
        };
        // Clone options from one product to another
        this.cloneProductOptions = async (req, res) => {
            try {
                const { sourceProductId, targetProductId } = req.body;
                const schema = zod_1.z.object({
                    sourceProductId: zod_1.z.string().cuid('Invalid source product ID'),
                    targetProductId: zod_1.z.string().cuid('Invalid target product ID')
                });
                const validatedData = schema.parse({ sourceProductId, targetProductId });
                await productOptionsService_1.productOptionsService.cloneProductOptions(validatedData.sourceProductId, validatedData.targetProductId);
                return res.json({
                    success: true,
                    message: 'Product options cloned successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error cloning product options:', error);
                if (error instanceof zod_1.z.ZodError) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            message: 'Validation error',
                            details: error.errors
                        }
                    });
                }
                return res.status(500).json({
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Internal server error'
                    }
                });
            }
        };
        // Reorder product options
        this.reorderProductOptions = async (req, res) => {
            try {
                const { productId: _productId } = req.params;
                const { optionIds } = req.body;
                const schema = zod_1.z.object({
                    optionIds: zod_1.z.array(zod_1.z.string().cuid()).min(1, 'At least one option ID is required')
                });
                const validatedData = schema.parse({ optionIds });
                // Create reorder operation
                const reorderOptions = validatedData.optionIds.map((id, index) => ({
                    id,
                    sortOrder: index
                }));
                await productOptionsService_1.productOptionsService.bulkOptionOperation({
                    operation: 'reorder',
                    options: reorderOptions
                });
                return res.json({
                    success: true,
                    message: 'Product options reordered successfully'
                });
            }
            catch (error) {
                logger_1.logger.error('Error reordering product options:', error);
                if (error instanceof zod_1.z.ZodError) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            message: 'Validation error',
                            details: error.errors
                        }
                    });
                }
                return res.status(500).json({
                    success: false,
                    error: {
                        message: error instanceof Error ? error.message : 'Internal server error'
                    }
                });
            }
        };
    }
}
exports.ProductOptionsController = ProductOptionsController;
exports.productOptionsController = new ProductOptionsController();
//# sourceMappingURL=productOptionsController.js.map