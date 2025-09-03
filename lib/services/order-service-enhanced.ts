import { query } from '@/lib/db'
import { env } from '@/lib/config/env';
import { v4 as uuidv4 } from 'uuid'
import { Redis } from 'ioredis'
import { productService } from './product-service'
import { inventoryService } from './inventory-service'
import { paymentService } from './payment-service'
import { cartService } from './cart-service'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
})

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
  metadata?: Record<string, unknown>
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
  original_price?: number
  discount?: number
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
  PAYMENT_PENDING = 'payment_pending',
  PAID = 'paid',
  PREPARING = 'preparing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  FAILED = 'failed'
}

export interface CreateOrderInput {
  customerId: string
  cartId?: string
  items?: Array<{
    productId: string
    quantity: number
  }>
  shippingInfo: ShippingInfo
  paymentMethod: string
  couponCode?: string
  notes?: string
  metadata?: Record<string, unknown>
}

export interface OrderTransaction {
  orderId: string
  reservations: Array<{ productId: string; quantity: number }>
  rollbackHandlers: Array<() => Promise<void>>
}

export class EnhancedOrderService {
  private readonly ORDER_LOCK_TTL = 30 // 30 seconds
  private readonly ORDER_CACHE_TTL = 300 // 5 minutes
  
  // 트랜잭션 관리를 위한 헬퍼
  private async withTransaction<T>(
    fn: (client: unknown) => Promise<T>
  ): Promise<T> {
    const client = await query('BEGIN')
    
    try {
      const result = await fn(client)
      await query('COMMIT')
      return result
    } catch (error) {
      await query('ROLLBACK')
      throw error
    }
  }
  
  // 분산 락 구현
  private async acquireLock(key: string, ttl: number = this.ORDER_LOCK_TTL): Promise<boolean> {
    const lockKey = `lock:${key}`
    const lockValue = uuidv4()
    
    const result = await redis.set(
      lockKey,
      lockValue,
      'NX',
      'EX',
      ttl
    )
    
    return result === 'OK'
  }
  
  private async releaseLock(key: string): Promise<void> {
    await redis.del(`lock:${key}`)
  }
  
  // 강화된 주문 생성 with 분산 트랜잭션
  async createOrder(input: CreateOrderInput): Promise<Order> {
    const orderId = uuidv4()
    const orderNumber = this.generateOrderNumber()
    const transaction: OrderTransaction = {
      orderId,
      reservations: [],
      rollbackHandlers: []
    }
    
    // 사용자별 주문 생성 락 획득
    const lockKey = `order:create:${input.customerId}`
    const hasLock = await this.acquireLock(lockKey)
    
    if (!hasLock) {
      throw new Error('동시에 여러 주문을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.')
    }
    
    try {
      return await this.withTransaction(async () => {
        let orderItems: OrderItem[] = []
        let subtotal = 0
        
        // 장바구니에서 아이템 가져오기 또는 직접 입력 사용
        let items = input.items || []
        
        if (input.cartId) {
          const cart = await cartService.getCart(input.cartId, true)
          items = cart.items.map(item => ({
            productId: item.product_id,
            quantity: item.quantity
          }))
        }
        
        if (items.length === 0) {
          throw new Error('주문할 상품이 없습니다')
        }
        
        // 모든 상품 재고 확인 및 예약 (병렬 처리)
        const reservationPromises = items.map(async (item) => {
          // 제품 정보 조회
          const product = await productService.getProduct(item.productId)
          if (!product) {
            throw new Error(`상품을 찾을 수 없습니다: ${item.productId}`)
          }
          
          // 재고 확인 및 예약 (원자적 연산)
          const reserved = await inventoryService.reserveStock(
            item.productId,
            item.quantity
          )
          
          if (!reserved) {
            throw new Error(`${product.name} 재고가 부족합니다`)
          }
          
          // 예약 기록
          transaction.reservations.push({
            productId: item.productId,
            quantity: item.quantity
          })
          
          // 롤백 핸들러 등록
          transaction.rollbackHandlers.push(async () => {
            await inventoryService.releaseStock(item.productId, item.quantity)
          })
          
          // 주문 아이템 생성
          const orderItemId = uuidv4()
          const itemTotal = product.price * item.quantity
          
          return {
            id: orderItemId,
            order_id: orderId,
            product_id: product.id,
            product_name: product.name,
            product_sku: product.sku,
            quantity: item.quantity,
            price: product.price,
            original_price: product.original_price,
            discount: product.original_price ? 
              (product.original_price - product.price) * item.quantity : 0,
            total: itemTotal
          }
        })
        
        // 병렬로 모든 예약 처리
        orderItems = await Promise.all(reservationPromises)
        
        // 소계 계산
        subtotal = orderItems.reduce((sum, item) => sum + item.total, 0)
        
        // 쿠폰 할인 적용
        let discount = 0
        if (input.couponCode) {
          discount = await this.applyCoupon(input.couponCode, subtotal)
        }
        
        // 주문 총액 계산
        const tax = (subtotal - discount) * 0.1 // 10% 세금
        const shipping = this.calculateShipping(subtotal, input.shippingInfo)
        const totalAmount = subtotal + tax + shipping - discount
        
        // 주문 생성
        const orderResult = await query(`
          INSERT INTO orders (
            id, order_number, customer_id, status,
            subtotal, tax, shipping, discount, total_amount, currency,
            shipping_name, shipping_phone, shipping_email,
            shipping_address, shipping_city, shipping_state,
            shipping_postal_code, shipping_country,
            notes, metadata, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            NOW(), NOW()
          ) RETURNING *
        `, [
          orderId, orderNumber, input.customerId, OrderStatus.PENDING,
          subtotal, tax, shipping, discount, totalAmount, 'KRW',
          input.shippingInfo.name, input.shippingInfo.phone, input.shippingInfo.email,
          input.shippingInfo.address, input.shippingInfo.city, input.shippingInfo.state,
          input.shippingInfo.postal_code, input.shippingInfo.country,
          input.notes, JSON.stringify(input.metadata || {})
        ])
        
        // 주문 아이템 일괄 삽입
        const itemValues = orderItems.map(item => [
          item.id, item.order_id, item.product_id,
          item.product_name, item.product_sku,
          item.quantity, item.price, item.original_price,
          item.discount, item.total
        ])
        
        await query(`
          INSERT INTO order_items (
            id, order_id, product_id, product_name, product_sku,
            quantity, price, original_price, discount, total, created_at
          ) VALUES ${itemValues.map((_, i) => 
            `($${i*10+1}, $${i*10+2}, $${i*10+3}, $${i*10+4}, $${i*10+5}, 
              $${i*10+6}, $${i*10+7}, $${i*10+8}, $${i*10+9}, $${i*10+10}, NOW())`
          ).join(', ')}
        `, itemValues.flat())
        
        // 결제 처리 시작
        const payment = await paymentService.processPayment(
          orderId,
          input.paymentMethod,
          input.customerId
        )
        
        // 주문 상태 업데이트
        await query(`
          UPDATE orders 
          SET status = $2, payment_id = $3, updated_at = NOW()
          WHERE id = $1
        `, [orderId, OrderStatus.PAYMENT_PENDING, payment.id])
        
        // 장바구니 비우기
        if (input.cartId) {
          await cartService.clearCart(input.cartId, true)
        }
        
        // 주문 완성
        const order: Order = {
          ...orderResult.rows[0],
          items: orderItems,
          shipping_info: input.shippingInfo,
          payment_id: payment.id
        }
        
        // 캐시 저장
        await this.cacheOrder(order)
        
        // 이벤트 발행
        await this.publishOrderEvent('ORDER_CREATED', order)
        
        // 주문 확인 이메일 발송 (비동기)
        this.sendOrderConfirmation(order).catch(console.error)
        
        return order
      })
    } catch (error) {
      // 트랜잭션 실패 시 모든 예약 롤백
      await this.rollbackTransaction(transaction)
      throw error
    } finally {
      // 락 해제
      await this.releaseLock(lockKey)
    }
  }
  
  // 트랜잭션 롤백
  private async rollbackTransaction(transaction: OrderTransaction): Promise<void> {

    // 모든 롤백 핸들러 실행
    await Promise.allSettled(
      transaction.rollbackHandlers.map(handler => handler())
    )
  }
  
  // 결제 완료 처리
  async completePayment(orderId: string, paymentId: string): Promise<Order> {
    const order = await this.getOrder(orderId)
    
    if (!order) {
      throw new Error('주문을 찾을 수 없습니다')
    }
    
    if (order.status !== OrderStatus.PAYMENT_PENDING) {
      throw new Error('결제 대기 중인 주문이 아닙니다')
    }
    
    return await this.withTransaction(async () => {
      // 주문 상태 업데이트
      await query(`
        UPDATE orders 
        SET status = $2, payment_id = $3, updated_at = NOW()
        WHERE id = $1
      `, [orderId, OrderStatus.PAID, paymentId])
      
      // 재고 예약 확정
      for (const item of order.items) {
        await inventoryService.confirmReservation(
          item.product_id,
          item.quantity
        )
      }
      
      // 캐시 무효화
      await this.invalidateOrderCache(orderId)
      
      // 이벤트 발행
      await this.publishOrderEvent('ORDER_PAID', { ...order, status: OrderStatus.PAID })
      
      // 주문 준비 시작 알림
      this.notifyOrderPreparation(order).catch(console.error)
      
      return { ...order, status: OrderStatus.PAID }
    })
  }
  
  // 주문 취소 (강화된 버전)
  async cancelOrder(
    orderId: string,
    customerId: string,
    reason?: string
  ): Promise<Order> {
    const lockKey = `order:cancel:${orderId}`
    const hasLock = await this.acquireLock(lockKey)
    
    if (!hasLock) {
      throw new Error('주문 처리 중입니다. 잠시 후 다시 시도해주세요.')
    }
    
    try {
      const order = await this.getOrder(orderId, customerId)
      
      if (!order) {
        throw new Error('주문을 찾을 수 없습니다')
      }
      
      // 취소 가능한 상태 확인
      const cancellableStatuses = [
        OrderStatus.PENDING,
        OrderStatus.PAYMENT_PENDING,
        OrderStatus.PAID,
        OrderStatus.PREPARING
      ]
      
      if (!cancellableStatuses.includes(order.status)) {
        throw new Error(`현재 상태(${order.status})에서는 주문을 취소할 수 없습니다`)
      }
      
      return await this.withTransaction(async () => {
        // 주문 상태 업데이트
        await query(`
          UPDATE orders 
          SET 
            status = $2,
            metadata = metadata || $3::jsonb,
            updated_at = NOW()
          WHERE id = $1
        `, [
          orderId,
          OrderStatus.CANCELLED,
          JSON.stringify({ cancel_reason: reason, cancelled_at: new Date() })
        ])
        
        // 재고 복구
        for (const item of order.items) {
          await inventoryService.releaseStock(item.product_id, item.quantity)
        }
        
        // 결제 환불 처리
        if (order.payment_id && order.status === OrderStatus.PAID) {
          await paymentService.refundPayment(
            order.payment_id,
            undefined,
            reason || '고객 요청에 의한 취소'
          )
        }
        
        // 캐시 무효화
        await this.invalidateOrderCache(orderId)
        
        // 이벤트 발행
        await this.publishOrderEvent('ORDER_CANCELLED', {
          ...order,
          status: OrderStatus.CANCELLED,
          metadata: { ...order.metadata, cancel_reason: reason }
        })
        
        // 취소 알림 발송
        this.sendCancellationNotification(order, reason).catch(console.error)
        
        return { ...order, status: OrderStatus.CANCELLED }
      })
    } finally {
      await this.releaseLock(lockKey)
    }
  }
  
  // 배송 정보 업데이트
  async updateShippingStatus(
    orderId: string,
    trackingNumber: string,
    carrier: string,
    estimatedDelivery?: Date
  ): Promise<Order> {
    const order = await this.getOrder(orderId)
    
    if (!order) {
      throw new Error('주문을 찾을 수 없습니다')
    }
    
    if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.PREPARING) {
      throw new Error('배송 정보를 업데이트할 수 없는 상태입니다')
    }
    
    await query(`
      UPDATE orders 
      SET 
        status = $2,
        tracking_number = $3,
        carrier = $4,
        estimated_delivery = $5,
        updated_at = NOW()
      WHERE id = $1
    `, [orderId, OrderStatus.SHIPPED, trackingNumber, carrier, estimatedDelivery])
    
    // 캐시 무효화
    await this.invalidateOrderCache(orderId)
    
    // 배송 알림 발송
    const updatedOrder = { 
      ...order,
      status: OrderStatus.SHIPPED,
      shipping_info: {
        ...order.shipping_info,
        tracking_number: trackingNumber,
        carrier: carrier,
        estimated_delivery: estimatedDelivery
      }
    }
    
    await this.publishOrderEvent('ORDER_SHIPPED', updatedOrder)
    this.sendShippingNotification(updatedOrder).catch(console.error)
    
    return updatedOrder
  }
  
  // 주문 조회 (캐시 적용)
  async getOrder(orderId: string, customerId?: string): Promise<Order | null> {
    // 캐시 확인
    const cached = await redis.get(`order:${orderId}`)
    if (cached) {
      const order = JSON.parse(cached)
      if (!customerId || order.customer_id === customerId) {
        return order
      }
    }
    
    let whereClause = 'o.id = $1'
    let params: unknown[] = [orderId]
    
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
              'original_price', oi.original_price,
              'discount', oi.discount,
              'total', oi.total
            ) ORDER BY oi.created_at
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
    
    const order = this.mapOrderFromDB(orderResult.rows[0])
    
    // 캐시 저장
    await this.cacheOrder(order)
    
    return order
  }
  
  // 주문 목록 조회
  async getOrders(filter: {
    customerId?: string
    status?: OrderStatus
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
  }): Promise<{ orders: Order[]; total: number }> {
    const page = filter.page || 1
    const limit = filter.limit || 20
    const offset = (page - 1) * limit
    
    let whereConditions: string[] = []
    let params: unknown[] = []
    let paramIndex = 1
    
    if (filter.customerId) {
      whereConditions.push(`o.customer_id = $${paramIndex++}`)
      params.push(filter.customerId)
    }
    
    if (filter.status) {
      whereConditions.push(`o.status = $${paramIndex++}`)
      params.push(filter.status)
    }
    
    if (filter.startDate) {
      whereConditions.push(`o.created_at >= $${paramIndex++}`)
      params.push(filter.startDate)
    }
    
    if (filter.endDate) {
      whereConditions.push(`o.created_at <= $${paramIndex++}`)
      params.push(filter.endDate)
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : ''
    
    // 총 개수 조회
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM orders o
      ${whereClause}
    `, params)
    
    const total = parseInt(countResult.rows[0].total)
    
    // 주문 목록 조회
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
              'original_price', oi.original_price,
              'discount', oi.discount,
              'total', oi.total
            ) ORDER BY oi.created_at
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
    
    const orders = result.rows.map(row => this.mapOrderFromDB(row))
    
    return { orders, total }
  }
  
  // 주문 통계
  async getOrderStats(
    customerId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<unknown> {
    let whereConditions: string[] = []
    let params: unknown[] = []
    let paramIndex = 1
    
    if (customerId) {
      whereConditions.push(`customer_id = $${paramIndex++}`)
      params.push(customerId)
    }
    
    if (startDate) {
      whereConditions.push(`created_at >= $${paramIndex++}`)
      params.push(startDate)
    }
    
    if (endDate) {
      whereConditions.push(`created_at <= $${paramIndex++}`)
      params.push(endDate)
    }
    
    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : ''
    
    const result = await query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as avg_order_value,
        MAX(total_amount) as max_order_value,
        MIN(total_amount) as min_order_value
      FROM orders
      ${whereClause}
    `, params)
    
    return result.rows[0]
  }
  
  // Helper 메서드들
  private mapOrderFromDB(row: unknown): Order {
    return {
      ...row,
      shipping_info: {
        name: row.shipping_name,
        phone: row.shipping_phone,
        email: row.shipping_email,
        address: row.shipping_address,
        city: row.shipping_city,
        state: row.shipping_state,
        postal_code: row.shipping_postal_code,
        country: row.shipping_country,
        tracking_number: row.tracking_number,
        carrier: row.carrier,
        estimated_delivery: row.estimated_delivery
      }
    }
  }
  
  private async cacheOrder(order: Order): Promise<void> {
    await redis.setex(
      `order:${order.id}`,
      this.ORDER_CACHE_TTL,
      JSON.stringify(order)
    )
  }
  
  private async invalidateOrderCache(orderId: string): Promise<void> {
    await redis.del(`order:${orderId}`)
  }
  
  private generateOrderNumber(): string {
    const date = new Date()
    const timestamp = date.getTime().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `ORD-${timestamp}-${random}`
  }
  
  private calculateShipping(subtotal: number, shippingInfo: ShippingInfo): number {
    // 기본 배송비 로직
    if (subtotal >= 50000) return 0 // 5만원 이상 무료배송
    if (shippingInfo.city === '서울') return 2500
    return 3000
  }
  
  private async applyCoupon(code: string, subtotal: number): Promise<number> {
    // TODO: 쿠폰 시스템 구현
    if (code === 'WELCOME10') {
      return subtotal * 0.1
    }
    return 0
  }
  
  // 이벤트 발행
  private async publishOrderEvent(event: string, order: Order): Promise<void> {
    await redis.publish(
      'order-events',
      JSON.stringify({ event, order, timestamp: new Date() })
    )
  }
  
  // 알림 메서드들
  private async sendOrderConfirmation(order: Order): Promise<void> {

    // TODO: 실제 이메일/SMS 발송 구현
  }
  
  private async sendShippingNotification(order: Order): Promise<void> {

    // TODO: 실제 알림 구현
  }
  
  private async sendCancellationNotification(order: Order, reason?: string): Promise<void> {

    // TODO: 실제 알림 구현
  }
  
  private async notifyOrderPreparation(order: Order): Promise<void> {

    // TODO: 실제 알림 구현
  }
}

// Export singleton instance
export const enhancedOrderService = new EnhancedOrderService()