"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pricingController = exports.PricingController = void 0;
const pricingService_1 = require("../../services/pricingService");
const logger_1 = require("../../utils/logger");
const zod_1 = require("zod");
// Validation schemas
const calculatePriceSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, 'Product ID is required'),
    quantity: zod_1.z.number().min(1, 'Quantity must be at least 1'),
    userId: zod_1.z.string().optional(),
    customerGroup: zod_1.z.string().optional(),
    context: zod_1.z.object({
        cartTotal: zod_1.z.number().optional(),
        isFirstPurchase: zod_1.z.boolean().optional(),
        timeOfDay: zod_1.z.string().optional(),
        seasonalContext: zod_1.z.string().optional()
    }).optional()
});
const bulkCalculatePriceSchema = zod_1.z.object({
    items: zod_1.z.array(calculatePriceSchema),
    userId: zod_1.z.string().optional(),
    customerGroup: zod_1.z.string().optional(),
    context: zod_1.z.any().optional()
});
const createPricingRuleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Rule name is required'),
    description: zod_1.z.string().optional(),
    type: zod_1.z.enum(['QUANTITY_DISCOUNT', 'TIME_BASED', 'CUSTOMER_GROUP', 'CATEGORY_DISCOUNT', 'PRODUCT_BUNDLE', 'INVENTORY_BASED', 'DYNAMIC_MARKET']),
    conditions: zod_1.z.any(),
    discountType: zod_1.z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FIXED_PRICE', 'BUY_X_GET_Y']),
    discountValue: zod_1.z.number().min(0, 'Discount value must be non-negative'),
    maxDiscountValue: zod_1.z.number().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    timeZone: zod_1.z.string().optional(),
    priority: zod_1.z.number().default(0),
    applyToCategories: zod_1.z.boolean().default(false),
    applyToProducts: zod_1.z.boolean().default(false),
    applyToCustomers: zod_1.z.boolean().default(false),
    usageLimit: zod_1.z.number().optional(),
    perCustomerLimit: zod_1.z.number().optional(),
    categoryIds: zod_1.z.array(zod_1.z.string()).optional(),
    productIds: zod_1.z.array(zod_1.z.string()).optional(),
    customerGroupIds: zod_1.z.array(zod_1.z.string()).optional(),
    isActive: zod_1.z.boolean().default(true)
});
const updatePricingRuleSchema = createPricingRuleSchema.partial().omit({
    categoryIds: true,
    productIds: true,
    customerGroupIds: true
});
class PricingController {
    async calculatePrice(req, res) {
        try {
            const validatedData = calculatePriceSchema.parse(req.body);
            const result = await pricingService_1.pricingService.calculatePrice(validatedData);
            res.status(200).json({
                success: true,
                data: result,
                message: 'Price calculated successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Error calculating price:', error);
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: 'Validation error',
                        details: error.errors
                    }
                });
            }
            res.status(500).json({
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Internal server error'
                }
            });
        }
    }
    async calculateBulkPricing(req, res) {
        try {
            const validatedData = bulkCalculatePriceSchema.parse(req.body);
            const result = await pricingService_1.pricingService.calculateBulkPricing(validatedData);
            res.status(200).json({
                success: true,
                data: result,
                message: 'Bulk pricing calculated successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Error calculating bulk pricing:', error);
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: 'Validation error',
                        details: error.errors
                    }
                });
            }
            res.status(500).json({
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Internal server error'
                }
            });
        }
    }
    async createPricingRule(req, res) {
        try {
            const validatedData = createPricingRuleSchema.parse(req.body);
            const rule = await pricingService_1.pricingService.createPricingRule(validatedData);
            res.status(201).json({
                success: true,
                data: rule,
                message: 'Pricing rule created successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Error creating pricing rule:', error);
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: 'Validation error',
                        details: error.errors
                    }
                });
            }
            res.status(500).json({
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Internal server error'
                }
            });
        }
    }
    async updatePricingRule(req, res) {
        try {
            const { ruleId } = req.params;
            const validatedData = updatePricingRuleSchema.parse(req.body);
            const rule = await pricingService_1.pricingService.updatePricingRule(ruleId, validatedData);
            res.status(200).json({
                success: true,
                data: rule,
                message: 'Pricing rule updated successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Error updating pricing rule:', error);
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: 'Validation error',
                        details: error.errors
                    }
                });
            }
            res.status(500).json({
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Internal server error'
                }
            });
        }
    }
    async getPricingRules(req, res) {
        try {
            const filters = {
                isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
                type: req.query.type,
                priority: req.query.priority ? parseInt(req.query.priority) : undefined
            };
            const rules = await pricingService_1.pricingService.getPricingRules(filters);
            res.status(200).json({
                success: true,
                data: rules,
                count: rules.length,
                message: 'Pricing rules retrieved successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting pricing rules:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Internal server error'
                }
            });
        }
    }
    async getPricingRule(req, res) {
        try {
            const { ruleId } = req.params;
            const rules = await pricingService_1.pricingService.getPricingRules();
            const rule = rules.find(r => r.id === ruleId);
            if (!rule) {
                res.status(404).json({
                    success: false,
                    error: {
                        message: 'Pricing rule not found'
                    }
                });
            }
            res.status(200).json({
                success: true,
                data: rule,
                message: 'Pricing rule retrieved successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting pricing rule:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Internal server error'
                }
            });
        }
    }
    async deletePricingRule(req, res) {
        try {
            const { ruleId } = req.params;
            await pricingService_1.pricingService.deletePricingRule(ruleId);
            res.status(200).json({
                success: true,
                message: 'Pricing rule deleted successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Error deleting pricing rule:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Internal server error'
                }
            });
        }
    }
    async getPricingAnalytics(req, res) {
        try {
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate
            };
            const analytics = await pricingService_1.pricingService.getPricingAnalytics(filters);
            res.status(200).json({
                success: true,
                data: analytics,
                message: 'Pricing analytics retrieved successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting pricing analytics:', error);
            res.status(500).json({
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Internal server error'
                }
            });
        }
    }
    async testPricingRule(req, res) {
        try {
            const { ruleId: _ruleId } = req.params;
            const testData = calculatePriceSchema.parse(req.body);
            // Add rule testing logic here
            const result = await pricingService_1.pricingService.calculatePrice({
                ...testData,
                context: { ...testData.context }
            });
            res.status(200).json({
                success: true,
                data: result,
                message: 'Pricing rule test completed'
            });
        }
        catch (error) {
            logger_1.logger.error('Error testing pricing rule:', error);
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: 'Validation error',
                        details: error.errors
                    }
                });
            }
            res.status(500).json({
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Internal server error'
                }
            });
        }
    }
    async previewPricing(req, res) {
        try {
            const validatedData = calculatePriceSchema.parse(req.body);
            // Calculate pricing without recording applications
            const result = await pricingService_1.pricingService.calculatePrice(validatedData);
            res.status(200).json({
                success: true,
                data: {
                    ...result,
                    preview: true
                },
                message: 'Pricing preview generated successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Error generating pricing preview:', error);
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: {
                        message: 'Validation error',
                        details: error.errors
                    }
                });
            }
            res.status(500).json({
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Internal server error'
                }
            });
        }
    }
}
exports.PricingController = PricingController;
exports.pricingController = new PricingController();
//# sourceMappingURL=pricingController.js.map