import { Product, InventoryAction, InventoryLog } from '@prisma/client';
export interface InventoryAlert {
    id: string;
    productId: string;
    productName: string;
    productSku: string;
    currentQuantity: number;
    lowStockThreshold: number;
    alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'CRITICAL_STOCK';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    createdAt: Date;
}
export interface InventoryAdjustment {
    productId: string;
    quantity: number;
    type: InventoryAction;
    reason?: string;
    reference?: string;
    batchId?: string;
}
export interface InventoryReport {
    totalProducts: number;
    inStockProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
    totalValue: number;
    lowStockValue: number;
    averageStockLevel: number;
    topLowStockProducts: Array<{
        id: string;
        name: string;
        sku: string;
        quantity: number;
        lowStockThreshold: number;
        value: number;
    }>;
}
export interface InventoryMovement {
    date: Date;
    type: InventoryAction;
    quantity: number;
    runningBalance: number;
    reason?: string;
    reference?: string;
}
export declare class InventoryService {
    adjustInventory(adjustment: InventoryAdjustment): Promise<InventoryLog>;
    bulkAdjustInventory(adjustments: InventoryAdjustment[]): Promise<InventoryLog[]>;
    getLowStockProducts(): Promise<Array<Product & {
        category: {
            name: string;
            slug: string;
        } | null;
    }>>;
    getOutOfStockProducts(): Promise<Array<Product & {
        category: {
            name: string;
            slug: string;
        } | null;
    }>>;
    generateInventoryReport(): Promise<InventoryReport>;
    getProductInventoryHistory(productId: string, limit?: number, offset?: number): Promise<InventoryMovement[]>;
    reserveInventory(items: Array<{
        productId: string;
        quantity: number;
    }>, orderId: string): Promise<void>;
    releaseInventory(items: Array<{
        productId: string;
        quantity: number;
    }>, orderId: string): Promise<void>;
    private checkAndCreateLowStockAlert;
    getInventoryStats(): Promise<{
        totalProducts: number;
        lowStockCount: number;
        outOfStockCount: number;
        totalValue: number;
        recentMovements: number;
    }>;
}
export declare const inventoryService: InventoryService;
//# sourceMappingURL=inventoryService.d.ts.map