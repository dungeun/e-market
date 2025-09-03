import { query } from '@/lib/db'
import { Redis } from 'ioredis'
import { v4 as uuidv4 } from 'uuid'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
})

export interface Inventory {
  product_id: string
  quantity: number
  reserved: number
  available: number
  warehouse_id?: string
  warehouse_name?: string
  location?: string
  last_restocked?: Date
  reorder_point?: number
  reorder_quantity?: number
  updated_at: Date
}

export interface StockMovement {
  id: string
  product_id: string
  type: MovementType
  quantity: number
  reference_id?: string
  reference_type?: string
  from_location?: string
  to_location?: string
  reason?: string
  user_id?: string
  created_at: Date
}

export enum MovementType {
  IN = 'in',           // 입고
  OUT = 'out',         // 출고
  RESERVED = 'reserved', // 예약
  RELEASED = 'released', // 예약 해제
  ADJUSTED = 'adjusted', // 재고 조정
  TRANSFERRED = 'transferred' // 창고 이동
}

export interface StockReservation {
  id: string
  product_id: string
  order_id?: string
  cart_id?: string
  quantity: number
  expires_at: Date
  status: 'active' | 'confirmed' | 'expired' | 'cancelled'
  created_at: Date
}

export class InventoryService {
  private readonly RESERVATION_TTL = 15 * 60 // 15 minutes in seconds
  private readonly CACHE_TTL = 60 // 1 minute for inventory cache
  
  // Get inventory for a product
  async getInventory(productId: string): Promise<Inventory | null> {
    // Try cache first
    const cacheKey = `inventory:${productId}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }
    
    const result = await query(`
      SELECT 
        i.*,
        w.name as warehouse_name,
        w.location as location,
        i.quantity - COALESCE(
          (SELECT SUM(quantity) 
           FROM stock_reservations 
           WHERE product_id = i.product_id 
           AND status = 'active' 
           AND expires_at > NOW()),
          0
        ) as available
      FROM inventory i
      LEFT JOIN warehouses w ON i.warehouse_id = w.id
      WHERE i.product_id = $1
    `, [productId])
    
    if (result.rows.length === 0) {
      // Create default inventory if not exists
      return await this.createInventory(productId)
    }
    
    const inventory = result.rows[0]
    
    // Get reserved quantity
    const reservedResult = await query(`
      SELECT COALESCE(SUM(quantity), 0) as reserved
      FROM stock_reservations
      WHERE product_id = $1 
      AND status = 'active'
      AND expires_at > NOW()
    `, [productId])
    
    inventory.reserved = parseInt(reservedResult.rows[0].reserved)
    inventory.available = inventory.quantity - inventory.reserved
    
    // Cache result
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(inventory))
    
    return inventory
  }
  
  // Create inventory record for new product
  private async createInventory(productId: string, initialQuantity: number = 0): Promise<Inventory> {
    const result = await query(`
      INSERT INTO inventory (
        product_id, quantity, warehouse_id, 
        reorder_point, reorder_quantity, 
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `, [productId, initialQuantity, null, 10, 50])
    
    return {
      ...result.rows[0],
      reserved: 0,
      available: initialQuantity
    }
  }
  
  // Check if stock is available
  async checkStock(productId: string, quantity: number): Promise<boolean> {
    const inventory = await this.getInventory(productId)
    if (!inventory) return false
    
    return inventory.available >= quantity
  }
  
  // Check stock for multiple products
  async checkBulkStock(items: Array<{ productId: string; quantity: number }>): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>()
    
    for (const item of items) {
      const hasStock = await this.checkStock(item.productId, item.quantity)
      results.set(item.productId, hasStock)
    }
    
    return results
  }
  
  // Reserve stock for order/cart
  async reserveStock(
    productId: string, 
    quantity: number, 
    referenceId?: string,
    referenceType: 'order' | 'cart' = 'cart'
  ): Promise<string> {
    // Check availability
    const hasStock = await this.checkStock(productId, quantity)
    if (!hasStock) {
      throw new Error(`Insufficient stock for product ${productId}`)
    }
    
    // Create reservation
    const reservationId = uuidv4()
    const expiresAt = new Date(Date.now() + this.RESERVATION_TTL * 1000)
    
    await query(`
      INSERT INTO stock_reservations (
        id, product_id, ${referenceType}_id, 
        quantity, expires_at, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, 'active', NOW())
    `, [reservationId, productId, referenceId, quantity, expiresAt])
    
    // Record stock movement
    await this.recordMovement({
      product_id: productId,
      type: MovementType.RESERVED,
      quantity,
      reference_id: referenceId,
      reference_type: referenceType
    })
    
    // Invalidate cache
    await this.invalidateCache(productId)
    
    // Set expiration handler in Redis
    await redis.setex(
      `reservation:${reservationId}`,
      this.RESERVATION_TTL,
      JSON.stringify({ productId, quantity })
    )
    
    return reservationId
  }
  
  // Release reserved stock
  async releaseStock(productId: string, quantity: number, reservationId?: string): Promise<boolean> {
    try {
      if (reservationId) {
        // Release specific reservation
        await query(`
          UPDATE stock_reservations 
          SET status = 'cancelled', updated_at = NOW()
          WHERE id = $1
        `, [reservationId])
      } else {
        // Release oldest reservations up to quantity
        await query(`
          UPDATE stock_reservations 
          SET status = 'cancelled', updated_at = NOW()
          WHERE product_id = $1 
          AND status = 'active'
          ORDER BY created_at ASC
          LIMIT $2
        `, [productId, quantity])
      }
      
      // Record movement
      await this.recordMovement({
        product_id: productId,
        type: MovementType.RELEASED,
        quantity,
        reference_id: reservationId
      })
      
      // Invalidate cache
      await this.invalidateCache(productId)
      
      return true
    } catch (error) {

      return false
    }
  }
  
  // Confirm reservation (when order is paid)
  async confirmReservation(productId: string, quantity: number, orderId: string): Promise<boolean> {
    try {
      // Update reservation status
      await query(`
        UPDATE stock_reservations 
        SET status = 'confirmed', updated_at = NOW()
        WHERE product_id = $1 
        AND order_id = $2
        AND status = 'active'
      `, [productId, orderId])
      
      // Deduct from actual inventory
      await query(`
        UPDATE inventory 
        SET quantity = quantity - $2, updated_at = NOW()
        WHERE product_id = $1
      `, [productId, quantity])
      
      // Record movement
      await this.recordMovement({
        product_id: productId,
        type: MovementType.OUT,
        quantity,
        reference_id: orderId,
        reference_type: 'order'
      })
      
      // Invalidate cache
      await this.invalidateCache(productId)
      
      // Check if reorder is needed
      await this.checkReorderPoint(productId)
      
      return true
    } catch (error) {

      return false
    }
  }
  
  // Update stock quantity
  async updateStock(
    productId: string, 
    quantity: number, 
    operation: 'increment' | 'decrement' | 'set',
    reason?: string,
    userId?: string
  ): Promise<Inventory> {
    let updateQuery = ''
    let actualQuantity = quantity
    
    switch (operation) {
      case 'increment':
        updateQuery = 'UPDATE inventory SET quantity = quantity + $2'
        break
      case 'decrement':
        updateQuery = 'UPDATE inventory SET quantity = GREATEST(0, quantity - $2)'
        actualQuantity = -quantity
        break
      case 'set':
        updateQuery = 'UPDATE inventory SET quantity = $2'
        break
    }
    
    updateQuery += ', updated_at = NOW() WHERE product_id = $1 RETURNING *'
    
    const result = await query(updateQuery, [productId, Math.abs(quantity)])
    
    if (result.rows.length === 0) {
      throw new Error('Product inventory not found')
    }
    
    // Record movement
    await this.recordMovement({
      product_id: productId,
      type: operation === 'increment' ? MovementType.IN : 
            operation === 'decrement' ? MovementType.OUT : 
            MovementType.ADJUSTED,
      quantity: actualQuantity,
      reason,
      user_id: userId
    })
    
    // Invalidate cache
    await this.invalidateCache(productId)
    
    // Check reorder point
    await this.checkReorderPoint(productId)
    
    return await this.getInventory(productId) as Inventory
  }
  
  // Bulk update stock (for receiving shipments)
  async bulkUpdateStock(
    updates: Array<{
      productId: string
      quantity: number
      operation: 'increment' | 'decrement' | 'set'
    }>,
    reason?: string,
    userId?: string
  ): Promise<boolean> {
    await query('BEGIN')
    
    try {
      for (const update of updates) {
        await this.updateStock(
          update.productId,
          update.quantity,
          update.operation,
          reason,
          userId
        )
      }
      
      await query('COMMIT')
      return true
    } catch (error) {
      await query('ROLLBACK')

      return false
    }
  }
  
  // Transfer stock between warehouses
  async transferStock(
    productId: string,
    quantity: number,
    fromWarehouseId: string,
    toWarehouseId: string,
    userId?: string
  ): Promise<boolean> {
    await query('BEGIN')
    
    try {
      // Deduct from source warehouse
      await query(`
        UPDATE inventory 
        SET quantity = quantity - $2, updated_at = NOW()
        WHERE product_id = $1 AND warehouse_id = $3
      `, [productId, quantity, fromWarehouseId])
      
      // Add to destination warehouse
      await query(`
        INSERT INTO inventory (product_id, quantity, warehouse_id, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (product_id, warehouse_id) 
        DO UPDATE SET quantity = inventory.quantity + $2, updated_at = NOW()
      `, [productId, quantity, toWarehouseId])
      
      // Record movement
      await this.recordMovement({
        product_id: productId,
        type: MovementType.TRANSFERRED,
        quantity,
        from_location: fromWarehouseId,
        to_location: toWarehouseId,
        user_id: userId
      })
      
      await query('COMMIT')
      
      // Invalidate cache
      await this.invalidateCache(productId)
      
      return true
    } catch (error) {
      await query('ROLLBACK')

      return false
    }
  }
  
  // Record stock movement
  private async recordMovement(movement: Partial<StockMovement>): Promise<void> {
    await query(`
      INSERT INTO stock_movements (
        id, product_id, type, quantity,
        reference_id, reference_type,
        from_location, to_location,
        reason, user_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    `, [
      uuidv4(),
      movement.product_id,
      movement.type,
      movement.quantity,
      movement.reference_id,
      movement.reference_type,
      movement.from_location,
      movement.to_location,
      movement.reason,
      movement.user_id
    ])
  }
  
  // Get stock movements history
  async getStockMovements(
    productId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<StockMovement[]> {
    const result = await query(`
      SELECT * FROM stock_movements
      WHERE product_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [productId, limit, offset])
    
    return result.rows
  }
  
  // Check and alert for reorder point
  private async checkReorderPoint(productId: string): Promise<void> {
    const inventory = await this.getInventory(productId)
    if (!inventory) return
    
    if (inventory.reorder_point && inventory.available <= inventory.reorder_point) {
      // Emit low stock event
      this.emitLowStockAlert(productId, inventory.available, inventory.reorder_point)
      
      // Auto-create purchase order if configured
      if (inventory.reorder_quantity) {
        await this.createReorderRequest(productId, inventory.reorder_quantity)
      }
    }
  }
  
  // Create reorder request
  private async createReorderRequest(productId: string, quantity: number): Promise<void> {
    // TODO: Integrate with purchase order system

  }
  
  // Clean up expired reservations
  async cleanupExpiredReservations(): Promise<void> {
    const result = await query(`
      UPDATE stock_reservations
      SET status = 'expired', updated_at = NOW()
      WHERE status = 'active'
      AND expires_at < NOW()
      RETURNING product_id, quantity
    `)
    
    // Invalidate cache for affected products
    for (const row of result.rows) {
      await this.invalidateCache(row.product_id)
      
      // Record movement
      await this.recordMovement({
        product_id: row.product_id,
        type: MovementType.RELEASED,
        quantity: row.quantity,
        reason: 'Reservation expired'
      })
    }

  }
  
  // Get low stock products
  async getLowStockProducts(warehouseId?: string): Promise<Array<{
    product_id: string
    product_name: string
    quantity: number
    available: number
    reorder_point: number
  }>> {
    let whereClause = 'WHERE i.quantity <= i.reorder_point'
    const params: unknown[] = []
    
    if (warehouseId) {
      whereClause += ' AND i.warehouse_id = $1'
      params.push(warehouseId)
    }
    
    const result = await query(`
      SELECT 
        i.product_id,
        p.name as product_name,
        i.quantity,
        i.quantity - COALESCE(
          (SELECT SUM(quantity) 
           FROM stock_reservations 
           WHERE product_id = i.product_id 
           AND status = 'active'),
          0
        ) as available,
        i.reorder_point
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      ${whereClause}
      ORDER BY (i.quantity::float / NULLIF(i.reorder_point, 0)) ASC
    `, params)
    
    return result.rows
  }
  
  // Emit low stock alert
  private emitLowStockAlert(productId: string, available: number, reorderPoint: number): void {
    // TODO: Implement notification system

  }
  
  // Invalidate cache
  private async invalidateCache(productId: string): Promise<void> {
    await redis.del(`inventory:${productId}`)
  }
}

// Export singleton instance
export const inventoryService = new InventoryService()

// Start cleanup job for expired reservations
setInterval(() => {
  inventoryService.cleanupExpiredReservations().catch(console.error)
}, 5 * 60 * 1000) // Run every 5 minutes