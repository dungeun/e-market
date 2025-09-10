import type { User, RequestContext } from '@/lib/types/common';
import { env } from '@/lib/config/env';
import { query } from '@/lib/db'
import { Redis } from 'ioredis'
import { v4 as uuidv4 } from 'uuid'
import { productService } from './product-service'
import { inventoryService } from './inventory-service'
import { 
  unifiedQueryService, 
  findById, 
  findByField, 
  findByIds,
  updateById,
  deleteById,
  CACHE_TTL 
} from './unified-query-service'

const redisUrl = process.env.REDIS_URL
const redis = redisUrl
  ? new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      connectionName: 'cart-service'
    })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      connectionName: 'cart-service'
    })

redis.on('error', (err) => {
  console.warn('Redis connection error (cart service):', err.message)
})

export interface Cart {
  id: string
  user_id?: string
  session_id?: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  currency: string
  expires_at?: Date
  created_at: Date
  updated_at: Date
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  product?: any // Product details
  quantity: number
  price: number
  original_price?: number
  discount?: number
  total: number
  metadata?: Record<string, unknown>
  added_at: Date
  updated_at: Date
}

export interface CartSummary {
  itemCount: number
  uniqueItems: number
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  savings: number
}

export class CartService {
  private readonly CART_TTL = 30 * 24 * 60 * 60 // 30 days for logged-in users
  private readonly GUEST_CART_TTL = 7 * 24 * 60 * 60 // 7 days for guests
  private readonly CACHE_TTL = 300 // 5 minutes cache
  
  // Get or create cart
  async getCart(identifier: string, isUserId: boolean = false): Promise<Cart> {
    // Try cache first
    const cacheKey = `cart:${identifier}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return JSON.parse(cached)
    }
    
    // Get from database
    let cart = await this.findCart(identifier, isUserId)
    
    if (!cart) {
      // Create new cart
      cart = await this.createCart(identifier, isUserId)
    } else {
      // Check if cart is expired
      if (cart.expires_at && new Date(cart.expires_at) < new Date()) {
        await this.clearCart(cart.id)
        cart = await this.createCart(identifier, isUserId)
      }
    }
    
    // Load cart items with product details
    cart = await this.loadCartWithItems(cart)
    
    // Calculate totals
    cart = this.calculateCartTotals(cart)
    
    // Cache result
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(cart))
    
    return cart
  }
  
  // Find existing cart
  private async findCart(identifier: string, isUserId: boolean): Promise<Cart | null> {
    const field = isUserId ? 'user_id' : 'session_id'
    
    // 통합 쿼리 서비스 사용으로 캐싱 자동 적용
    const carts = await unifiedQueryService.executeRaw<Cart>(`
      SELECT * FROM carts
      WHERE ${field} = $1
      AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
      LIMIT 1
    `, [identifier], { useCache: true, cacheTTL: CACHE_TTL.SHORT })
    
    return carts[0] || null
  }
  
  // Create new cart
  private async createCart(identifier: string, isUserId: boolean): Promise<Cart> {
    const cartId = uuidv4()
    const expiresAt = new Date(
      Date.now() + (isUserId ? this.CART_TTL : this.GUEST_CART_TTL) * 1000
    )
    
    const result = await query(`
      INSERT INTO carts (
        id, ${isUserId ? 'user_id' : 'session_id'}, 
        currency, expires_at, created_at, updated_at
      ) VALUES ($1, $2, 'KRW', $3, NOW(), NOW())
      RETURNING *
    `, [cartId, identifier, expiresAt])
    
    return {
      ...result.rows[0],
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0
    }
  }
  
  // Load cart with items
  private async loadCartWithItems(cart: Cart): Promise<Cart> {
    // 통합 쿼리 서비스로 카트 아이템 조회 (캐싱 적용)
    const cartItems = await unifiedQueryService.findByField<CartItem>(
      'cart_items',
      'cart_id',
      cart.id,
      { useCache: true, cacheTTL: CACHE_TTL.SHORT }
    );
    
    if (!cartItems || cartItems.length === 0) {
      return { ...cart, items: [] };
    }
    
    const items: CartItem[] = []
    
    // 상품 ID 배치 조회로 N+1 문제 해결
    const productIds = (cartItems as any[]).map(item => item.product_id);
    const products = await findByIds('products', productIds, { 
      useCache: true, 
      cacheTTL: CACHE_TTL.MEDIUM 
    });
    
    for (const item of cartItems as any[]) {
      const product = products.get(item.product_id);
      
      if (product) {
        items.push({
          ...item,
          product,
          price: product.price, // Update price to current
          original_price: product.original_price,
          total: product.price * item.quantity
        })
      }
    }
    
    return { ...cart, items }
  }
  
  // Add item to cart
  async addToCart(
    identifier: string,
    productId: string,
    quantity: number,
    metadata?: Record<string, unknown>,
    isUserId: boolean = false
  ): Promise<Cart> {
    // Get or create cart
    let cart = await this.getCart(identifier, isUserId)
    
    // Get product details
    const product = await productService.getProduct(productId)
    if (!product) {
      throw new Error('Product not found')
    }
    
    // Check stock availability
    const hasStock = await inventoryService.checkStock(productId, quantity)
    if (!hasStock) {
      throw new Error('Insufficient stock')
    }
    
    // 통합 쿼리로 기존 아이템 확인
    const existingItem = await unifiedQueryService.executeRaw<CartItem>(`
      SELECT * FROM cart_items
      WHERE cart_id = $1 AND product_id = $2
    `, [cart.id, productId], { useCache: false }); // 실시간 데이터 필요
    
    if (existingItem.length > 0) {
      // Update quantity
      const item = existingItem[0];
      const newQuantity = (item as any).quantity + quantity;
      
      // Check stock for new quantity
      const hasStockForUpdate = await inventoryService.checkStock(productId, newQuantity)
      if (!hasStockForUpdate) {
        throw new Error('Insufficient stock for requested quantity')
      }
      
      // 통합 쿼리로 업데이트
      await updateById('cart_items', (item as any).id, {
        quantity: newQuantity
      }, { transaction: false });
      
      // 카트 캐시 무효화
      await unifiedQueryService.invalidateTableCache('cart_items');
    } else {
      // Add new item - 배치 삽입 활용
      const itemId = uuidv4()
      await unifiedQueryService.batchInsert('cart_items', [{
        id: itemId,
        cart_id: cart.id,
        product_id: productId,
        quantity: quantity,
        price: product.price,
        metadata: metadata || {},
        created_at: new Date(),
        updated_at: new Date()
      }], { transaction: false });
    }
    
    // Update cart timestamp
    await query(`
      UPDATE carts SET updated_at = NOW() WHERE id = $1
    `, [cart.id])
    
    // Invalidate cache
    await this.invalidateCache(identifier)
    
    // Return updated cart
    return await this.getCart(identifier, isUserId)
  }
  
  // Update cart item quantity
  async updateCartItem(
    identifier: string,
    cartItemId: string,
    quantity: number,
    isUserId: boolean = false
  ): Promise<Cart> {
    const cart = await this.getCart(identifier, isUserId)
    
    // Find the item
    const itemResult = await query(`
      SELECT * FROM cart_items
      WHERE id = $1 AND cart_id = $2
    `, [cartItemId, cart.id])
    
    if (itemResult.rows.length === 0) {
      throw new Error('Cart item not found')
    }
    
    const item = itemResult.rows[0]
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      return await this.removeFromCart(identifier, cartItemId, isUserId)
    }
    
    // Check stock availability
    const hasStock = await inventoryService.checkStock(item.product_id, quantity)
    if (!hasStock) {
      throw new Error('Insufficient stock for requested quantity')
    }
    
    // Update quantity
    await query(`
      UPDATE cart_items
      SET quantity = $1, updated_at = NOW()
      WHERE id = $2
    `, [quantity, cartItemId])
    
    // Update cart timestamp
    await query(`
      UPDATE carts SET updated_at = NOW() WHERE id = $1
    `, [cart.id])
    
    // Invalidate cache
    await this.invalidateCache(identifier)
    
    return await this.getCart(identifier, isUserId)
  }
  
  // Remove item from cart
  async removeFromCart(
    identifier: string,
    cartItemId: string,
    isUserId: boolean = false
  ): Promise<Cart> {
    const cart = await this.getCart(identifier, isUserId)
    
    // Remove item
    await query(`
      DELETE FROM cart_items
      WHERE id = $1 AND cart_id = $2
    `, [cartItemId, cart.id])
    
    // Update cart timestamp
    await query(`
      UPDATE carts SET updated_at = NOW() WHERE id = $1
    `, [cart.id])
    
    // Invalidate cache
    await this.invalidateCache(identifier)
    
    return await this.getCart(identifier, isUserId)
  }
  
  // Clear entire cart
  async clearCart(identifier: string, isUserId: boolean = false): Promise<boolean> {
    try {
      const cart = await this.getCart(identifier, isUserId)
      
      // Delete all items
      await query(`
        DELETE FROM cart_items WHERE cart_id = $1
      `, [cart.id])
      
      // Update cart
      await query(`
        UPDATE carts SET updated_at = NOW() WHERE id = $1
      `, [cart.id])
      
      // Invalidate cache
      await this.invalidateCache(identifier)
      
      return true
    } catch (error) {

      return false
    }
  }
  
  // Merge carts (when user logs in)
  async mergeCarts(sessionId: string, userId: string): Promise<Cart> {
    // Get both carts
    const guestCart = await this.findCart(sessionId, false)
    const userCart = await this.findCart(userId, true)
    
    if (!guestCart || guestCart.items?.length === 0) {
      // No guest cart or empty, just return user cart
      return await this.getCart(userId, true)
    }
    
    if (!userCart) {
      // No user cart, convert guest cart to user cart
      await query(`
        UPDATE carts 
        SET user_id = $1, session_id = NULL, updated_at = NOW()
        WHERE id = $2
      `, [userId, guestCart.id])
      
      await this.invalidateCache(sessionId)
      return await this.getCart(userId, true)
    }
    
    // Merge items from guest cart to user cart
    const guestItems = await query(`
      SELECT * FROM cart_items WHERE cart_id = $1
    `, [guestCart.id])
    
    for (const item of guestItems.rows) {
      // Check if item already exists in user cart
      const existingItem = await query(`
        SELECT * FROM cart_items
        WHERE cart_id = $1 AND product_id = $2
      `, [userCart.id, item.product_id])
      
      if (existingItem.rows.length > 0) {
        // Update quantity
        const newQuantity = existingItem.rows[0].quantity + item.quantity
        
        // Check stock
        const hasStock = await inventoryService.checkStock(item.product_id, newQuantity)
        const finalQuantity = hasStock ? newQuantity : existingItem.rows[0].quantity
        
        await query(`
          UPDATE cart_items
          SET quantity = $1, updated_at = NOW()
          WHERE cart_id = $2 AND product_id = $3
        `, [finalQuantity, userCart.id, item.product_id])
      } else {
        // Add new item
        await query(`
          INSERT INTO cart_items (
            id, cart_id, product_id, quantity,
            price, metadata, added_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        `, [
          uuidv4(), userCart.id, item.product_id,
          item.quantity, item.price, item.metadata
        ])
      }
    }
    
    // Delete guest cart
    await query(`DELETE FROM cart_items WHERE cart_id = $1`, [guestCart.id])
    await query(`DELETE FROM carts WHERE id = $1`, [guestCart.id])
    
    // Invalidate caches
    await this.invalidateCache(sessionId)
    await this.invalidateCache(userId)
    
    return await this.getCart(userId, true)
  }
  
  // Apply discount/coupon
  async applyDiscount(
    identifier: string,
    discountCode: string,
    isUserId: boolean = false
  ): Promise<Cart> {
    const cart = await this.getCart(identifier, isUserId)
    
    // Validate discount code
    const discount = await this.validateDiscountCode(discountCode, cart)
    
    if (!discount) {
      throw new Error('Invalid discount code')
    }
    
    // Apply discount to cart
    await query(`
      UPDATE carts 
      SET discount_code = $1, discount_amount = $2, updated_at = NOW()
      WHERE id = $3
    `, [discountCode, discount.amount, cart.id])
    
    // Invalidate cache
    await this.invalidateCache(identifier)
    
    return await this.getCart(identifier, isUserId)
  }
  
  // Validate discount code
  private async validateDiscountCode(code: string, cart: Cart): Promise<unknown> {
    // TODO: Implement discount validation logic
    // Check if code exists, is active, not expired, meets minimum requirements, etc.
    
    // Mock implementation
    if (code === 'WELCOME10') {
      return {
        code: 'WELCOME10',
        type: 'percentage',
        amount: cart.subtotal * 0.1,
        percentage: 10
      }
    }
    
    if (code === 'SAVE5000') {
      return {
        code: 'SAVE5000',
        type: 'fixed',
        amount: 5000
      }
    }
    
    return null
  }
  
  // Calculate cart totals
  private calculateCartTotals(cart: Cart): Cart {
    let subtotal = 0
    let savings = 0
    
    for (const item of cart.items) {
      subtotal += item.price * item.quantity
      
      if (item.original_price && item.original_price > item.price) {
        savings += (item.original_price - item.price) * item.quantity
      }
    }
    
    const tax = subtotal * 0.1 // 10% tax
    const shipping = subtotal >= 50000 ? 0 : 3000 // Free shipping over 50,000
    const discount = cart.discount || 0
    const total = subtotal + tax + shipping - discount
    
    return {
      ...cart,
      subtotal,
      tax,
      shipping,
      discount,
      total
    }
  }
  
  // Get cart summary
  async getCartSummary(identifier: string, isUserId: boolean = false): Promise<CartSummary> {
    const cart = await this.getCart(identifier, isUserId)
    
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    const uniqueItems = cart.items.length
    
    let savings = 0
    for (const item of cart.items) {
      if (item.original_price && item.original_price > item.price) {
        savings += (item.original_price - item.price) * item.quantity
      }
    }
    
    return {
      itemCount,
      uniqueItems,
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: cart.shipping,
      discount: cart.discount,
      total: cart.total,
      savings
    }
  }
  
  // Convert cart to order
  async convertToOrder(cartId: string): Promise<void> {
    // Clear cart items after order is created
    await query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId])
    
    // Mark cart as converted
    await query(`
      UPDATE carts 
      SET status = 'converted', updated_at = NOW()
      WHERE id = $1
    `, [cartId])
  }
  
  // Clean up expired carts
  async cleanupExpiredCarts(): Promise<void> {
    const result = await query(`
      DELETE FROM cart_items
      WHERE cart_id IN (
        SELECT id FROM carts
        WHERE expires_at < NOW()
      )
    `)
    
    const cartsResult = await query(`
      DELETE FROM carts
      WHERE expires_at < NOW()
    `)

  }
  
  // Get abandoned carts (for recovery emails)
  async getAbandonedCarts(hours: number = 24): Promise<Cart[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000)
    
    const result = await query(`
      SELECT c.*, u.email, u.name
      FROM carts c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.updated_at < $1
      AND c.status = 'active'
      AND EXISTS (
        SELECT 1 FROM cart_items ci WHERE ci.cart_id = c.id
      )
      ORDER BY c.updated_at DESC
    `, [cutoffTime])
    
    const carts: Cart[] = []
    for (const row of result.rows) {
      const cart = await this.loadCartWithItems(row)
      carts.push(this.calculateCartTotals(cart))
    }
    
    return carts
  }
  
  // Invalidate cache
  private async invalidateCache(identifier: string): Promise<void> {
    await redis.del(`cart:${identifier}`)
  }
}

// Export singleton instance
export const cartService = new CartService()

// Start cleanup job
setInterval(() => {
  cartService.cleanupExpiredCarts().catch(console.error)
}, 60 * 60 * 1000) // Run every hour