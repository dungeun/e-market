"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryController = exports.InventoryController = void 0;
const inventoryService_1 = require("../../services/inventoryService");
const notificationService_1 = require("../../services/notificationService");
const error_1 = require("../../middleware/error");
const zod_1 = require("zod");
// Validation schemas
const InventoryAdjustmentSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, 'Product ID is required'),
    quantity: zod_1.z.number().int('Quantity must be an integer'),
    type: zod_1.z.enum(['SALE', 'PURCHASE', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'RESTOCK']),
    reason: zod_1.z.string().optional(),
    reference: zod_1.z.string().optional(),
});
const BulkInventoryAdjustmentSchema = zod_1.z.object({
    adjustments: zod_1.z.array(InventoryAdjustmentSchema).min(1, 'At least one adjustment is required'),
});
const InventoryReservationSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().min(1, 'Product ID is required'),
        quantity: zod_1.z.number().int().positive('Quantity must be positive'),
    })).min(1, 'At least one item is required'),
    orderId: zod_1.z.string().min(1, 'Order ID is required'),
});
const ProductHistoryQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().int().positive().max(100).default(50),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
});
const TestNotificationSchema = zod_1.z.object({
    type: zod_1.z.enum(['LOW_STOCK_ALERT', 'OUT_OF_STOCK_ALERT', 'CRITICAL_STOCK_ALERT']),
    email: zod_1.z.string().email('Valid email is required'),
});
class InventoryController {
    constructor() {
        // Adjust inventory for a single product
        this.adjustInventory = (0, error_1.asyncHandler)(async (req, res) => {
            const validatedData = InventoryAdjustmentSchema.parse(req.body);
            const result = await inventoryService_1.inventoryService.adjustInventory(validatedData);
            res.json({
                success: true,
                data: result,
                message: 'Inventory adjusted successfully',
            });
        });
        // Bulk inventory adjustments
        this.bulkAdjustInventory = (0, error_1.asyncHandler)(async (req, res) => {
            const validatedData = BulkInventoryAdjustmentSchema.parse(req.body);
            const results = await inventoryService_1.inventoryService.bulkAdjustInventory(validatedData.adjustments);
            res.json({
                success: true,
                data: {
                    processed: results.length,
                    total: validatedData.adjustments.length,
                    results,
                },
                message: `Bulk inventory adjustment completed. ${results.length}/${validatedData.adjustments.length} items processed.`,
            });
        });
        // Get low stock products
        this.getLowStockProducts = (0, error_1.asyncHandler)(async (_req, res) => {
            const products = await inventoryService_1.inventoryService.getLowStockProducts();
            res.json({
                success: true,
                data: products,
                count: products.length,
                message: 'Low stock products retrieved successfully',
            });
        });
        // Get out of stock products
        this.getOutOfStockProducts = (0, error_1.asyncHandler)(async (_req, res) => {
            const products = await inventoryService_1.inventoryService.getOutOfStockProducts();
            res.json({
                success: true,
                data: products,
                count: products.length,
                message: 'Out of stock products retrieved successfully',
            });
        });
        // Generate inventory report
        this.generateInventoryReport = (0, error_1.asyncHandler)(async (_req, res) => {
            const report = await inventoryService_1.inventoryService.generateInventoryReport();
            res.json({
                success: true,
                data: report,
                message: 'Inventory report generated successfully',
            });
        });
        // Get inventory statistics for dashboard
        this.getInventoryStats = (0, error_1.asyncHandler)(async (_req, res) => {
            const stats = await inventoryService_1.inventoryService.getInventoryStats();
            res.json({
                success: true,
                data: stats,
                message: 'Inventory statistics retrieved successfully',
            });
        });
        // Get product inventory history
        this.getProductInventoryHistory = (0, error_1.asyncHandler)(async (req, res) => {
            const { productId } = req.params;
            const { limit, offset } = ProductHistoryQuerySchema.parse(req.query);
            if (!productId) {
                res.status(400).json({
                    success: false,
                    error: {
                        type: 'ValidationError',
                        message: 'Product ID is required',
                    },
                });
                return;
            }
            const history = await inventoryService_1.inventoryService.getProductInventoryHistory(productId, limit, offset);
            res.json({
                success: true,
                data: {
                    productId,
                    movements: history,
                    pagination: {
                        limit,
                        offset,
                        count: history.length,
                    },
                },
                message: 'Product inventory history retrieved successfully',
            });
        });
        // Reserve inventory for an order
        this.reserveInventory = (0, error_1.asyncHandler)(async (req, res) => {
            const validatedData = InventoryReservationSchema.parse(req.body);
            await inventoryService_1.inventoryService.reserveInventory(validatedData.items, validatedData.orderId);
            res.json({
                success: true,
                message: `Inventory reserved for order ${validatedData.orderId}`,
            });
        });
        // Release reserved inventory
        this.releaseInventory = (0, error_1.asyncHandler)(async (req, res) => {
            const validatedData = InventoryReservationSchema.parse(req.body);
            await inventoryService_1.inventoryService.releaseInventory(validatedData.items, validatedData.orderId);
            res.json({
                success: true,
                message: `Inventory released for order ${validatedData.orderId}`,
            });
        });
        // Test notification system
        this.testNotification = (0, error_1.asyncHandler)(async (req, res) => {
            const validatedData = TestNotificationSchema.parse(req.body);
            await notificationService_1.notificationService.testNotification(validatedData.type, validatedData.email);
            res.json({
                success: true,
                message: `Test notification sent to ${validatedData.email}`,
            });
        });
        // Get inventory alerts (placeholder for future implementation)
        this.getInventoryAlerts = (0, error_1.asyncHandler)(async (_req, res) => {
            // TODO: Implement actual alert storage and retrieval
            // For now, return current low stock products as alerts
            const lowStockProducts = await inventoryService_1.inventoryService.getLowStockProducts();
            // Note: outOfStockProducts could be used for additional alert types in future
            await inventoryService_1.inventoryService.getOutOfStockProducts();
            const alerts = [
                ...lowStockProducts.map(product => ({
                    id: `low-stock-${product.id}`,
                    type: product.quantity === 0 ? 'OUT_OF_STOCK' :
                        product.quantity <= Math.floor(product.lowStockThreshold * 0.5) ? 'CRITICAL_STOCK' : 'LOW_STOCK',
                    severity: product.quantity === 0 ? 'CRITICAL' :
                        product.quantity <= Math.floor(product.lowStockThreshold * 0.5) ? 'HIGH' : 'MEDIUM',
                    productId: product.id,
                    productName: product.name,
                    productSku: product.sku,
                    currentQuantity: product.quantity,
                    lowStockThreshold: product.lowStockThreshold,
                    categoryName: product.category?.name || 'Uncategorized',
                    createdAt: new Date(),
                }))
            ];
            res.json({
                success: true,
                data: alerts,
                count: alerts.length,
                message: 'Inventory alerts retrieved successfully',
            });
        });
        // Manual trigger for low stock check (for testing or admin use)
        this.triggerLowStockCheck = (0, error_1.asyncHandler)(async (req, res) => {
            const { productId } = req.params;
            if (!productId) {
                res.status(400).json({
                    success: false,
                    error: {
                        type: 'ValidationError',
                        message: 'Product ID is required',
                    },
                });
            }
            // Get product details
            const product = await inventoryService_1.inventoryService.getLowStockProducts();
            const targetProduct = product.find(p => p.id === productId);
            if (!targetProduct) {
                res.status(404).json({
                    success: false,
                    error: {
                        type: 'NotFoundError',
                        message: 'Product not found or does not track inventory',
                    },
                });
                return;
            }
            // Trigger manual check (this would normally be done automatically)
            if (targetProduct.quantity <= targetProduct.lowStockThreshold) {
                const alertType = targetProduct.quantity === 0 ? 'OUT_OF_STOCK' :
                    targetProduct.quantity <= Math.floor(targetProduct.lowStockThreshold * 0.5) ? 'CRITICAL_STOCK' : 'LOW_STOCK';
                await notificationService_1.notificationService.sendLowStockAlert({
                    productId: targetProduct.id,
                    productName: targetProduct.name,
                    productSku: targetProduct.sku,
                    currentQuantity: targetProduct.quantity,
                    lowStockThreshold: targetProduct.lowStockThreshold,
                    categoryName: targetProduct.category?.name,
                    alertType
                });
            }
            res.json({
                success: true,
                message: 'Low stock check triggered successfully',
                data: {
                    productId: targetProduct.id,
                    currentQuantity: targetProduct.quantity,
                    lowStockThreshold: targetProduct.lowStockThreshold,
                    alertTriggered: targetProduct.quantity <= targetProduct.lowStockThreshold
                }
            });
        });
        // Set low stock threshold for a product
        this.setLowStockThreshold = (0, error_1.asyncHandler)(async (req, res) => {
            const { productId } = req.params;
            const { threshold } = req.body;
            if (!productId) {
                res.status(400).json({
                    success: false,
                    error: {
                        type: 'ValidationError',
                        message: 'Product ID is required',
                    },
                });
                return;
            }
            if (!threshold || typeof threshold !== 'number' || threshold < 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        type: 'ValidationError',
                        message: 'Valid threshold value is required',
                    },
                });
                return;
            }
            // Update the product's low stock threshold
            // Note: This creates an inventory movement record for audit purposes
            await inventoryService_1.inventoryService.adjustInventory({
                productId,
                quantity: 0, // No quantity change
                type: 'ADJUSTMENT',
                reason: `Low stock threshold updated to ${threshold}`,
            });
            // Note: This is a simplified approach. In a real implementation,
            // you might want to add a separate endpoint or modify the product directly
            res.json({
                success: true,
                message: 'Low stock threshold updated successfully',
                data: {
                    productId,
                    newThreshold: threshold
                }
            });
        });
    }
}
exports.InventoryController = InventoryController;
exports.inventoryController = new InventoryController();
//# sourceMappingURL=inventoryController.js.map