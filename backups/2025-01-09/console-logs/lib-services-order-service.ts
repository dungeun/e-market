import { query } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { productService } from './product-service'
import { inventoryService } from './inventory-service'
import { paymentService } from './payment-service'

export interface Order {
  id: string
  order_number: string
  customer_id: string
  status: OrderStatus
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total_amount: number
  currency: string
  items: OrderItem[]
  shipping_info: ShippingInfo
  payment_id?: string
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_sku: string
  quantity: number
  price: number
  total: number
}

export interface ShippingInfo {
  name: string
  phone: string
  email?: string
  address: string
  city: string
  state?: string
  postal_code: string
  country: string
  tracking_number?: string
  carrier?: string
  estimated_delivery?: Date
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface CreateOrderInput {
  customerId: string
  items: Array<{
    productId: string
    quantity: number
  }>
  shippingInfo: ShippingInfo
  paymentMethod: string
  notes?: string
}

export class OrderService {
  // Create new order
  async createOrder(input: CreateOrderInput): Promise<Order> {
    const orderId = uuidv4()
    const orderNumber = this.generateOrderNumber()
    
    // Start transaction
    await query('BEGIN')
    
    try {
      // Validate and reserve inventory for all items
      const orderItems: OrderItem[] = []
      let subtotal = 0
      
      for (const item of input.items) {
        // Get product details
        const product = await productService.getProduct(item.productId)
        if (!product) {
          throw new Error(`Product ${item.productId} not found`)
        }
        
        // Check stock availability
        const hasStock = await inventoryService.checkStock(item.productId, item.quantity)
        if (!hasStock) {
          throw new Error(`Insufficient stock for product ${product.name}`)
        }
        
        // Reserve stock
        await inventoryService.reserveStock(item.productId, item.quantity)
        
        // Create order item
        const orderItemId = uuidv4()
        const itemTotal = product.price * item.quantity
        
        orderItems.push({
          id: orderItemId,
          order_id: orderId,
          product_id: product.id,
          product_name: product.name,
          product_sku: product.sku,
          quantity: item.quantity,
          price: product.price,
          total: itemTotal
        })
        
        subtotal += itemTotal
      }
      
      // Calculate order totals
      const tax = subtotal * 0.1 // 10% tax
      const shipping = subtotal >= 50000 ? 0 : 3000 // Free shipping over 50,000
      const discount = 0 // No discount for now
      const totalAmount = subtotal + tax + shipping - discount
      
      // Create order
      const orderResult = await query(`
        INSERT INTO orders (
          id, order_number, customer_id, status,
          subtotal, tax, shipping, discount, total_amount, currency,
          shipping_name, shipping_phone, shipping_email,
          shipping_address, shipping_city, shipping_state,
          shipping_postal_code, shipping_country,
          notes, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19,
          NOW(), NOW()
        ) RETURNING *
      `, [
        orderId, orderNumber, input.customerId, OrderStatus.PENDING,
        subtotal, tax, shipping, discount, totalAmount, 'KRW',
        input.shippingInfo.name, input.shippingInfo.phone, input.shippingInfo.email,
        input.shippingInfo.address, input.shippingInfo.city, input.shippingInfo.state,
        input.shippingInfo.postal_code, input.shippingInfo.country,
        input.notes
      ])
      
      // Create order items
      for (const item of orderItems) {
        await query(`
          INSERT INTO order_items (
            id, order_id, product_id, product_name, product_sku,
            quantity, price, total, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `, [
          item.id, item.order_id, item.product_id,
          item.product_name, item.product_sku,
          item.quantity, item.price, item.total
        ])
      }
      
      // Commit transaction
      await query('COMMIT')
      
      // Return created order
      const order: Order = {
        ...orderResult.rows[0],
        items: orderItems,
        shipping_info: input.shippingInfo
      }
      
      // Emit order created event
      this.emitOrderEvent('ORDER_CREATED', order)
      
      return order
    } catch (error) {
      // Rollback transaction
      await query('ROLLBACK')
      
      // Release reserved stock
      for (const item of input.items) {
        await inventoryService.releaseStock(item.productId, item.quantity)
      }
      
      throw error
    }
  }
  
  // Get order by ID
  async getOrder(orderId: string, customerId?: string): Promise<Order | null> {
    let whereClause = 'o.id = $1'
    let params: any[] = [orderId]
    
    if (customerId) {
      whereClause += ' AND o.customer_id = $2'
      params.push(customerId)
    }
    
    const orderResult = await query(`
      SELECT 
        o.*,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_name', oi.product_name,
              'product_sku', oi.product_sku,
              'quantity', oi.quantity,
              'price', oi.price,
              'total', oi.total
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE ${whereClause}
      GROUP BY o.id
    `, params)
    
    if (orderResult.rows.length === 0) {
      return null
    }
    
    const order = orderResult.rows[0]
    
    return {
      ...order,
      shipping_info: {
        name: order.shipping_name,
        phone: order.shipping_phone,
        email: order.shipping_email,
        address: order.shipping_address,
        city: order.shipping_city,
        state: order.shipping_state,
        postal_code: order.shipping_postal_code,
        country: order.shipping_country,
        tracking_number: order.tracking_number,
        carrier: order.carrier,
        estimated_delivery: order.estimated_delivery
      }
    }
  }
  
  // Get orders list
  async getOrders(filter: {
    customerId?: string
    status?: OrderStatus
    page?: number
    limit?: number
  }): Promise<Order[]> {
    const page = filter.page || 1
    const limit = filter.limit || 20
    const offset = (page - 1) * limit
    
    let whereConditions: string[] = []
    let params: any[] = []
    let paramIndex = 1
    
    if (filter.customerId) {
      whereConditions.push(`o.customer_id = $${paramIndex++}`)
      params.push(filter.customerId)
    }
    
    if (filter.status) {
      whereConditions.push(`o.status = $${paramIndex++}`)
      params.push(filter.status)
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : ''
    
    params.push(limit, offset)
    
    const result = await query(`
      SELECT 
        o.*,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'product_name', oi.product_name,
              'product_sku', oi.product_sku,
              'quantity', oi.quantity,
              'price', oi.price,
              'total', oi.total
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, params)
    
    return result.rows.map(order => ({
      ...order,
      shipping_info: {
        name: order.shipping_name,
        phone: order.shipping_phone,
        email: order.shipping_email,
        address: order.shipping_address,
        city: order.shipping_city,
        state: order.shipping_state,
        postal_code: order.shipping_postal_code,
        country: order.shipping_country,
        tracking_number: order.tracking_number,
        carrier: order.carrier,
        estimated_delivery: order.estimated_delivery
      }
    }))
  }
  
  // Update order status
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const result = await query(`
      UPDATE orders 
      SET status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [orderId, status])
    
    if (result.rows.length === 0) {
      throw new Error('Order not found')
    }
    
    const order = await this.getOrder(orderId)
    if (!order) {
      throw new Error('Order not found')
    }
    
    // Handle status-specific logic
    switch (status) {
      case OrderStatus.PAID:
        // Finalize inventory reservation
        for (const item of order.items) {
          await inventoryService.confirmReservation(item.product_id, item.quantity)
        }
        break
        
      case OrderStatus.CANCELLED:
      case OrderStatus.REFUNDED:
        // Release reserved inventory
        for (const item of order.items) {
          await inventoryService.releaseStock(item.product_id, item.quantity)
        }
        
        // Process refund if paid
        if (order.payment_id && status === OrderStatus.REFUNDED) {
          await paymentService.refundPayment(order.payment_id)
        }
        break
        
      case OrderStatus.SHIPPED:
        // Update shipping info if provided
        // Send shipping notification
        this.sendShippingNotification(order)
        break
    }
    
    // Emit status change event
    this.emitOrderEvent('ORDER_STATUS_CHANGED', order, { previousStatus: order.status, newStatus: status })
    
    return { ...order, status }
  }
  
  // Cancel order
  async cancelOrder(orderId: string, customerId: string): Promise<Order> {
    const order = await this.getOrder(orderId, customerId)
    
    if (!order) {
      throw new Error('Order not found')
    }
    
    if (![OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.PAID].includes(order.status)) {
      throw new Error('Order cannot be cancelled in current status')
    }
    
    return await this.updateOrderStatus(orderId, OrderStatus.CANCELLED)
  }
  
  // Add shipping info
  async updateShippingInfo(orderId: string, trackingNumber: string, carrier: string, estimatedDelivery?: Date): Promise<Order> {
    const result = await query(`
      UPDATE orders 
      SET 
        tracking_number = $2,
        carrier = $3,
        estimated_delivery = $4,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [orderId, trackingNumber, carrier, estimatedDelivery])
    
    if (result.rows.length === 0) {
      throw new Error('Order not found')
    }
    
    const order = await this.getOrder(orderId)
    if (!order) {
      throw new Error('Order not found')
    }
    
    return order
  }
  
  // Generate order number
  private generateOrderNumber(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    
    return `ORD-${year}${month}${day}-${random}`
  }
  
  // Send shipping notification
  private async sendShippingNotification(order: Order) {
    // TODO: Implement email/SMS notification
    console.log(`Shipping notification sent for order ${order.order_number}`)
  }
  
  // Emit order events
  private emitOrderEvent(event: string, order: Order, metadata?: any) {
    // TODO: Implement event emitter for real-time updates
    console.log(`Event: ${event}`, { order, metadata })
  }
}

// Export singleton instance
export const orderService = new OrderService()