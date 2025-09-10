/**
 * 실시간 재고 관리 시스템
 * 동시접속 1만명 처리를 위한 엔터프라이즈급 재고 관리
 */

import { query } from '@/lib/db'
import { EventEmitter } from 'events'
import Redis from 'ioredis'

// Redis configuration with proper error handling
const redisConfig = process.env.REDIS_URL || 'redis://localhost:6379'
const redis = new Redis(redisConfig, {
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  connectionName: 'inventory-service'
})

// Handle Redis connection errors gracefully
redis.on('error', (err) => {
  console.warn('Redis connection error (inventory service):', err.message)
})

redis.on('connect', () => {
  console.log('Redis connected (inventory service)')
})

const inventoryEvents = new EventEmitter()

// 재고 예약 만료 시간 (분)
const RESERVATION_EXPIRY_MINUTES = 15

export interface InventoryReservation {
  productId: string
  quantity: number
  userId?: string
  cartId?: string
  orderId?: string
}

export interface InventoryUpdate {
  productId: string
  locationId?: string
  quantity: number
  type: 'increment' | 'decrement' | 'set'
}

export interface StockStatus {
  productId: string
  available: number
  reserved: number
  total: number
  lowStock: boolean
  outOfStock: boolean
}

/**
 * 실시간 재고 서비스
 */
export class RealtimeInventoryService {
  private static instance: RealtimeInventoryService
  private reservationCleanupInterval: NodeJS.Timeout | null = null

  private constructor() {
    this.startReservationCleanup()
    this.initializeRedisSubscriptions()
  }

  static getInstance(): RealtimeInventoryService {
    if (!RealtimeInventoryService.instance) {
      RealtimeInventoryService.instance = new RealtimeInventoryService()
    }
    return RealtimeInventoryService.instance
  }

  /**
   * 재고 상태 조회 (캐시 우선)
   */
  async getStockStatus(productId: string): Promise<StockStatus> {
    try {
      // Redis 캐시 확인
      const cacheKey = `inventory:${productId}`
      const cached = await redis.get(cacheKey)
      
      if (cached) {
        return JSON.parse(cached)
      }
    } catch (error) {
      console.warn('Redis cache read failed:', error)
      // Redis 실패 시 DB로 직접 이동
    }

    // DB에서 조회
    const result = await query(`
      SELECT * FROM inventory WHERE "productId" = $1 LIMIT 1
    `, [productId])
    
    const inventory = result.rows[0]

    if (!inventory) {
      throw new Error(`Inventory not found for product ${productId}`)
    }

    // 현재 예약된 수량 확인
    let reserved = 0
    try {
      const reservedResult = await query(`
        SELECT COALESCE(SUM(quantity), 0) as reserved 
        FROM "inventoryReservation" 
        WHERE "productId" = $1 AND status = 'ACTIVE'
      `, [productId])
      
      reserved = parseInt(reservedResult.rows[0]?.reserved || '0')
    } catch (error) {
      console.warn('Failed to get reserved quantity:', error)
    }

    const available = inventory.quantity - reserved

    const status: StockStatus = {
      productId,
      available,
      reserved,
      total: inventory.quantity,
      lowStock: available <= 10, // lowStockThreshold 필드가 없으므로 10으로 고정
      outOfStock: available <= 0
    }

    // 캐시 저장 (1분) - 실패해도 계속 진행
    try {
      const cacheKey = `inventory:${productId}`
      await redis.setex(cacheKey, 60, JSON.stringify(status))
    } catch (error) {
      console.warn('Redis cache write failed:', error)
    }

    return status
  }

  /**
   * 재고 예약 (장바구니, 주문 처리 시)
   */
  async reserveStock(reservation: InventoryReservation): Promise<string> {
    const { productId, quantity, userId, cartId, orderId } = reservation

    try {
      // 재고 확인
      const inventoryResult = await query(`
        SELECT * FROM inventory WHERE "productId" = $1 LIMIT 1
      `, [productId])
      
      const inventory = inventoryResult.rows[0]

      if (!inventory) {
        throw new Error(`Product ${productId} not found`)
      }

      // 현재 예약된 수량 확인
      const reservedResult = await query(`
        SELECT COALESCE(SUM(quantity), 0) as reserved 
        FROM "inventoryReservation" 
        WHERE "productId" = $1 AND status = 'ACTIVE'
      `, [productId])
      
      const reserved = parseInt(reservedResult.rows[0]?.reserved || '0')
      const available = inventory.quantity - reserved

      if (available < quantity) {
        throw new Error(`Insufficient stock. Available: ${available}, Requested: ${quantity}`)
      }

      // 예약 생성
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + RESERVATION_EXPIRY_MINUTES)

      const reservationResult = await query(`
        INSERT INTO "inventoryReservation" 
        ("productId", quantity, "userId", "cartId", "orderId", "expiresAt", status, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', NOW(), NOW())
        RETURNING id
      `, [productId, quantity, userId, cartId, orderId, expiresAt])

      const newReservationId = reservationResult.rows[0]?.id

      // 캐시 무효화
      try {
        await redis.del(`inventory:${productId}`)
      } catch (error) {
        console.warn('Redis cache invalidation failed:', error)
      }

      // 실시간 이벤트 발행
      this.emitInventoryUpdate(productId, 'reservation_created')

      return newReservationId
    } catch (error) {
      console.error('Error reserving stock:', error)
      throw error
    }
  }

  /**
   * 예약 확정 (주문 완료 시)
   */
  async confirmReservation(reservationId: string): Promise<void> {
    try {
      // 예약 정보 조회 및 확정으로 업데이트
      const reservationResult = await query(`
        UPDATE "inventoryReservation" 
        SET status = 'CONFIRMED', "updatedAt" = NOW()
        WHERE id = $1 
        RETURNING "productId", quantity
      `, [reservationId])

      const reservation = reservationResult.rows[0]
      
      if (!reservation) {
        throw new Error(`Reservation ${reservationId} not found`)
      }

      // 실제 재고 차감
      await query(`
        UPDATE inventory 
        SET quantity = quantity - $1, "updatedAt" = NOW()
        WHERE "productId" = $2
      `, [reservation.quantity, reservation.productId])

      // 캐시 무효화
      try {
        await redis.del(`inventory:${reservation.productId}`)
      } catch (error) {
        console.warn('Redis cache invalidation failed:', error)
      }

      // 실시간 이벤트 발행
      this.emitInventoryUpdate(reservation.productId, 'stock_confirmed')
    } catch (error) {
      console.error('Error confirming reservation:', error)
      throw error
    }
  }

  /**
   * 예약 취소
   */
  async cancelReservation(reservationId: string): Promise<void> {
    try {
      // 예약 취소로 업데이트
      const reservationResult = await query(`
        UPDATE "inventoryReservation" 
        SET status = 'CANCELLED', "updatedAt" = NOW()
        WHERE id = $1 
        RETURNING "productId"
      `, [reservationId])

      const reservation = reservationResult.rows[0]
      
      if (!reservation) {
        throw new Error(`Reservation ${reservationId} not found`)
      }

      // 캐시 무효화
      try {
        await redis.del(`inventory:${reservation.productId}`)
      } catch (error) {
        console.warn('Redis cache invalidation failed:', error)
      }

      // 실시간 이벤트 발행
      this.emitInventoryUpdate(reservation.productId, 'reservation_cancelled')
    } catch (error) {
      console.error('Error cancelling reservation:', error)
      throw error
    }
  }

  /**
   * 벌크 재고 업데이트 (관리자용)
   */
  async bulkUpdateInventory(updates: InventoryUpdate[]): Promise<void> {
    try {
      for (const update of updates) {
        const { productId, quantity, type, locationId } = update

        let sql = ''
        let params = []
        
        if (type === 'increment') {
          sql = `UPDATE inventory SET quantity = quantity + $1, "updatedAt" = NOW() WHERE "productId" = $2 AND "locationId" = $3`
          params = [quantity, productId, locationId || 'default']
        } else if (type === 'decrement') {
          sql = `UPDATE inventory SET quantity = quantity - $1, "updatedAt" = NOW() WHERE "productId" = $2 AND "locationId" = $3`
          params = [quantity, productId, locationId || 'default']
        } else {
          sql = `UPDATE inventory SET quantity = $1, "updatedAt" = NOW() WHERE "productId" = $2 AND "locationId" = $3`
          params = [quantity, productId, locationId || 'default']
        }

        await query(sql, params)

        // 캐시 무효화
        try {
          await redis.del(`inventory:${productId}`)
        } catch (error) {
          console.warn('Redis cache invalidation failed:', error)
        }
      }

      // 실시간 이벤트 발행
      updates.forEach(update => {
        this.emitInventoryUpdate(update.productId, 'bulk_update')
      })
    } catch (error) {
      console.error('Error in bulk update inventory:', error)
      throw error
    }
  }

  /**
   * 재고 알림 설정
   */
  async setLowStockAlert(productId: string, threshold: number): Promise<void> {
    // lowStockThreshold 필드가 없으므로 주석 처리
    // await queryMany({
    //   where: { productId },
    //   data: { lowStockThreshold: threshold }
    // })

    // 현재 재고 확인 및 알림
    const status = await this.getStockStatus(productId)
    if (status.available <= threshold) {
      await this.createInventoryAlert(productId, 'LOW_STOCK', status.available)
    }
  }

  /**
   * 재고 알림 생성
   */
  private async createInventoryAlert(
    productId: string, 
    type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK',
    currentQuantity: number
  ): Promise<void> {
    // inventoryAlert 모델이 없으므로 콘솔 로그로 대체
    console.warn(`Inventory Alert: Product ${productId} has ${type.toLowerCase().replace('_', ' ')}. Current: ${currentQuantity}`)
    
    // TODO: 알림 시스템 구현 필요
    // await query({
    //   data: {
    //     productId,
    //     type,
    //     message: `Product ${productId} has ${type.toLowerCase().replace('_', ' ')}. Current: ${currentQuantity}`,
    //     severity: type === 'OUT_OF_STOCK' ? 'CRITICAL' : 'WARNING',
    //     status: 'ACTIVE'
    //   }
    // })

    // 관리자에게 실시간 알림
    this.emitInventoryUpdate(productId, 'alert_created', { type, quantity: currentQuantity })
  }

  /**
   * 만료된 예약 정리 (주기적 실행)
   */
  private async cleanupExpiredReservations(): Promise<void> {
    try {
      // 만료된 예약을 EXPIRED로 업데이트
      const result = await query(`
        UPDATE "inventoryReservation" 
        SET status = 'EXPIRED' 
        WHERE status = 'ACTIVE' AND "expiresAt" <= NOW()
        RETURNING "productId"
      `)

      if (result.rows && result.rows.length > 0) {
        // 영향받은 상품의 캐시 무효화
        const uniqueProductIds = [...new Set(result.rows.map(row => row.productId))]
        
        for (const productId of uniqueProductIds) {
          try {
            await redis.del(`inventory:${productId}`)
          } catch (error) {
            console.warn('Redis cache invalidation failed:', error)
          }
          this.emitInventoryUpdate(productId, 'reservation_expired')
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired reservations:', error)
    }
  }

  /**
   * 예약 정리 스케줄러 시작
   */
  private startReservationCleanup(): void {
    // 1분마다 만료된 예약 정리
    this.reservationCleanupInterval = setInterval(() => {
      this.cleanupExpiredReservations().catch(console.error)
    }, 60000)
  }

  /**
   * Redis 구독 초기화 (실시간 동기화)
   */
  private initializeRedisSubscriptions(): void {
    try {
      const subscriber = new Redis(redisConfig, {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
        lazyConnect: true,
        connectionName: 'inventory-subscriber'
      })
      
      subscriber.on('error', (err) => {
        console.warn('Redis subscriber error (inventory service):', err.message)
      })
      
      subscriber.on('connect', () => {
        console.log('Redis subscriber connected (inventory service)')
      })
      
      subscriber.subscribe('inventory:updates').catch(err => {
        console.warn('Redis subscription failed:', err.message)
      })
      
      subscriber.on('message', (channel, message) => {
        if (channel === 'inventory:updates') {
          try {
            const update = JSON.parse(message)
            inventoryEvents.emit('inventory:changed', update)
          } catch (error) {
            console.error('Error parsing Redis message:', error)
          }
        }
      })
    } catch (error) {
      console.warn('Redis subscription initialization failed:', error)
    }
  }

  /**
   * 재고 변경 이벤트 발행
   */
  private emitInventoryUpdate(productId: string, event: string, data?: unknown): void {
    const update = {
      productId,
      event,
      timestamp: new Date(),
      data
    }

    // Redis pub/sub으로 발행 (실패해도 로컬 이벤트는 계속)
    redis.publish('inventory:updates', JSON.stringify(update)).catch(err => {
      console.warn('Redis publish failed:', err.message)
    })
    
    // 로컬 이벤트 발행
    inventoryEvents.emit('inventory:changed', update)
  }

  /**
   * 재고 변경 이벤트 구독
   */
  onInventoryChange(callback: (update: unknown) => void): void {
    inventoryEvents.on('inventory:changed', callback)
  }

  /**
   * 재고 스냅샷 생성 (감사 및 분석용)
   */
  async createInventorySnapshot(reason?: string): Promise<void> {
    try {
      const inventoriesResult = await query(`SELECT * FROM inventory`)
      const inventories = inventoriesResult.rows

      for (const inventory of inventories) {
        // 현재 예약된 수량 계산
        const reservedResult = await query(`
          SELECT COALESCE(SUM(quantity), 0) as reserved 
          FROM "inventoryReservation" 
          WHERE "productId" = $1 AND status = 'ACTIVE'
        `, [inventory.productId])
        
        const reserved = parseInt(reservedResult.rows[0]?.reserved || '0')
        const available = inventory.quantity - reserved

        // 스냅샷 테이블이 있다면 삽입 (없으면 로그만)
        console.log(`Inventory Snapshot: Product ${inventory.productId}, Quantity: ${inventory.quantity}, Reserved: ${reserved}, Available: ${available}, Reason: ${reason || 'Scheduled snapshot'}`)
        
        // TODO: 스냅샷 테이블 구현 필요
        // await query(`
        //   INSERT INTO inventory_snapshots 
        //   ("productId", "locationId", quantity, reserved, available, reason, "createdAt")
        //   VALUES ($1, $2, $3, $4, $5, $6, NOW())
        // `, [inventory.productId, inventory.locationId, inventory.quantity, reserved, available, reason || 'Scheduled snapshot'])
      }
    } catch (error) {
      console.error('Error creating inventory snapshot:', error)
      throw error
    }
  }

  /**
   * 서비스 종료 시 정리
   */
  async cleanup(): Promise<void> {
    if (this.reservationCleanupInterval) {
      clearInterval(this.reservationCleanupInterval)
    }
    await redis.quit()
    // Note: DB connection pool cleanup is handled by the Database singleton
  }
}

// 싱글톤 인스턴스 export
export const inventoryService = RealtimeInventoryService.getInstance()