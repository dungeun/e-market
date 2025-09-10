import type { User, RequestContext } from '@/lib/types/common';
import { env } from '@/lib/config/env';
import { query } from '@/lib/db'
import { Redis } from 'ioredis'
import { v4 as uuidv4 } from 'uuid'
import { inventoryService } from './inventory-service'
import { productService } from './product-service'

const redisUrl = process.env.REDIS_URL
const redis = redisUrl
  ? new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      connectionName: 'stock-alert-main'
    })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      connectionName: 'stock-alert-main'
    })

// Redis Pub/Sub를 위한 별도 연결
const pubClient = redisUrl
  ? new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      connectionName: 'stock-alert-pub'
    })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      connectionName: 'stock-alert-pub'
    })

const subClient = redisUrl
  ? new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      connectionName: 'stock-alert-sub'
    })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      connectionName: 'stock-alert-sub'
    })

export interface StockAlert {
  id: string
  product_id: string
  product_name: string
  alert_type: AlertType
  threshold: number
  current_stock: number
  status: AlertStatus
  notified_at?: Date
  resolved_at?: Date
  metadata?: Record<string, unknown>
  created_at: Date
  updated_at: Date
}

export interface StockSubscription {
  id: string
  user_id: string
  product_id: string
  notification_type: NotificationType
  threshold?: number
  active: boolean
  created_at: Date
}

export enum AlertType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  RESTOCK = 'restock',
  HIGH_DEMAND = 'high_demand',
  SLOW_MOVING = 'slow_moving'
}

export enum AlertStatus {
  PENDING = 'pending',
  NOTIFIED = 'notified',
  RESOLVED = 'resolved',
  IGNORED = 'ignored'
}

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app'
}

export interface StockMovementEvent {
  product_id: string
  movement_type: 'in' | 'out' | 'reserved' | 'released'
  quantity: number
  before_stock: number
  after_stock: number
  timestamp: Date
}

export class StockAlertService {
  private readonly ALERT_CACHE_TTL = 300 // 5 minutes
  private readonly THRESHOLD_CHECK_INTERVAL = 60000 // 1 minute
  private isMonitoring = false
  
  constructor() {
    // 재고 이벤트 구독 시작
    this.initializeEventListeners()
  }
  
  // 이벤트 리스너 초기화
  private initializeEventListeners() {
    // Redis Pub/Sub 구독
    subClient.subscribe('inventory-events')
    
    subClient.on('message', async (channel, message) => {
      if (channel === 'inventory-events') {
        const event = JSON.parse(message) as StockMovementEvent
        await this.handleStockMovement(event)
      }
    })
    
    // 주기적 재고 체크 시작
    this.startMonitoring()
  }
  
  // 재고 모니터링 시작
  startMonitoring() {
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    
    // 주기적으로 재고 임계값 체크
    setInterval(async () => {
      await this.checkAllThresholds()
    }, this.THRESHOLD_CHECK_INTERVAL)

  }
  
  // 재고 이동 이벤트 처리
  private async handleStockMovement(event: StockMovementEvent) {
    const { product_id, after_stock } = event
    
    // 재고 수준별 알림 생성
    if (after_stock === 0) {
      await this.createAlert(product_id, AlertType.OUT_OF_STOCK, 0, after_stock)
      await this.notifySubscribers(product_id, AlertType.OUT_OF_STOCK)
    } else if (after_stock <= 10) {
      await this.createAlert(product_id, AlertType.LOW_STOCK, 10, after_stock)
      await this.notifySubscribers(product_id, AlertType.LOW_STOCK)
    } else if (event.movement_type === 'in' && event.before_stock === 0) {
      // 재입고 알림
      await this.createAlert(product_id, AlertType.RESTOCK, 0, after_stock)
      await this.notifyRestockSubscribers(product_id)
    }
    
    // 실시간 대시보드 업데이트
    await this.broadcastStockUpdate(product_id, after_stock)
  }
  
  // 알림 생성
  async createAlert(
    productId: string,
    alertType: AlertType,
    threshold: number,
    currentStock: number,
    metadata?: Record<string, unknown>
  ): Promise<StockAlert> {
    const alertId = uuidv4()
    
    // 제품 정보 조회
    const product = await productService.getProduct(productId)
    if (!product) {
      throw new Error('Product not found')
    }
    
    // 중복 알림 방지
    const existingAlert = await this.getActiveAlert(productId, alertType)
    if (existingAlert) {
      return existingAlert
    }
    
    // 알림 저장
    const result = await query(`
      INSERT INTO stock_alerts (
        id, product_id, product_name, alert_type,
        threshold, current_stock, status, metadata,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `, [
      alertId, productId, product.name, alertType,
      threshold, currentStock, AlertStatus.PENDING,
      JSON.stringify(metadata || {})
    ])
    
    const alert = result.rows[0]
    
    // 캐시 저장
    await redis.setex(
      `alert:${alertId}`,
      this.ALERT_CACHE_TTL,
      JSON.stringify(alert)
    )
    
    // 관리자 알림 발송
    await this.notifyAdmins(alert)
    
    return alert
  }
  
  // 재고 구독 생성
  async createSubscription(
    userId: string,
    productId: string,
    notificationType: NotificationType,
    threshold?: number
  ): Promise<StockSubscription> {
    const subscriptionId = uuidv4()
    
    // 기존 구독 확인
    const existing = await query(`
      SELECT * FROM stock_subscriptions
      WHERE user_id = $1 AND product_id = $2 AND active = true
    `, [userId, productId])
    
    if (existing.rows.length > 0) {
      return existing.rows[0]
    }
    
    // 새 구독 생성
    const result = await query(`
      INSERT INTO stock_subscriptions (
        id, user_id, product_id, notification_type,
        threshold, active, created_at
      ) VALUES ($1, $2, $3, $4, $5, true, NOW())
      RETURNING *
    `, [subscriptionId, userId, productId, notificationType, threshold])
    
    return result.rows[0]
  }
  
  // 구독 취소
  async cancelSubscription(userId: string, productId: string): Promise<boolean> {
    const result = await query(`
      UPDATE stock_subscriptions
      SET active = false
      WHERE user_id = $1 AND product_id = $2
    `, [userId, productId])
    
    return result.rowCount > 0
  }
  
  // 구독자에게 알림 발송
  private async notifySubscribers(productId: string, alertType: AlertType) {
    const subscribers = await query(`
      SELECT s.*, u.email, u.phone, u.name
      FROM stock_subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.product_id = $1 AND s.active = true
    `, [productId])
    
    const product = await productService.getProduct(productId)
    if (!product) return
    
    // 병렬로 모든 구독자에게 알림 발송
    await Promise.allSettled(
      subscribers.rows.map(async (subscriber) => {
        switch (subscriber.notification_type) {
          case NotificationType.EMAIL:
            await this.sendEmailNotification(
              subscriber.email,
              product.name,
              alertType
            )
            break
            
          case NotificationType.SMS:
            await this.sendSMSNotification(
              subscriber.phone,
              product.name,
              alertType
            )
            break
            
          case NotificationType.PUSH:
            await this.sendPushNotification(
              subscriber.user_id,
              product.name,
              alertType
            )
            break
            
          case NotificationType.IN_APP:
            await this.createInAppNotification(
              subscriber.user_id,
              productId,
              alertType
            )
            break
        }
      })
    )
  }
  
  // 재입고 구독자 알림
  private async notifyRestockSubscribers(productId: string) {
    const subscribers = await query(`
      SELECT s.*, u.email, u.name
      FROM stock_subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.product_id = $1 AND s.active = true
    `, [productId])
    
    const product = await productService.getProduct(productId)
    if (!product) return
    
    // 재입고 알림 이메일 발송
    await Promise.allSettled(
      subscribers.rows.map(subscriber =>
        this.sendRestockEmail(subscriber.email, subscriber.name, product)
      )
    )
    
    // 구독 자동 해제 (재입고 알림은 1회성)
    await query(`
      UPDATE stock_subscriptions
      SET active = false
      WHERE product_id = $1
    `, [productId])
  }
  
  // 관리자 알림
  private async notifyAdmins(alert: StockAlert) {
    // 관리자 목록 조회
    const admins = await query(`
      SELECT email, name FROM users
      WHERE role = 'admin' AND active = true
    `)
    
    // 알림 내용 생성
    const message = this.generateAlertMessage(alert)
    
    // 모든 관리자에게 알림 발송
    await Promise.allSettled(
      admins.rows.map(admin =>
        this.sendAdminAlert(admin.email, admin.name, alert, message)
      )
    )
    
    // 알림 상태 업데이트
    await query(`
      UPDATE stock_alerts
      SET status = $2, notified_at = NOW()
      WHERE id = $1
    `, [alert.id, AlertStatus.NOTIFIED])
  }
  
  // 모든 제품 임계값 체크
  private async checkAllThresholds() {
    // 모니터링 대상 제품 조회
    const products = await query(`
      SELECT p.id, p.name, p.sku, i.quantity, i.reserved
      FROM products p
      JOIN inventory i ON p.id = i.product_id
      WHERE p.status = 'active'
    `)
    
    for (const product of products.rows) {
      const availableStock = product.quantity - product.reserved
      
      // 재고 수준별 알림 생성
      if (availableStock === 0) {
        await this.createAlert(
          product.id,
          AlertType.OUT_OF_STOCK,
          0,
          availableStock
        )
      } else if (availableStock <= 5) {
        await this.createAlert(
          product.id,
          AlertType.LOW_STOCK,
          5,
          availableStock
        )
      }
      
      // 판매 속도 분석 (최근 7일)
      const salesVelocity = await this.calculateSalesVelocity(product.id)
      
      // 높은 수요 알림
      if (salesVelocity > 10 && availableStock < salesVelocity * 3) {
        await this.createAlert(
          product.id,
          AlertType.HIGH_DEMAND,
          salesVelocity * 3,
          availableStock,
          { sales_velocity: salesVelocity }
        )
      }
      
      // 재고 회전율이 낮은 제품 알림
      if (salesVelocity < 0.5 && availableStock > 50) {
        await this.createAlert(
          product.id,
          AlertType.SLOW_MOVING,
          50,
          availableStock,
          { sales_velocity: salesVelocity }
        )
      }
    }
  }
  
  // 판매 속도 계산
  private async calculateSalesVelocity(productId: string): Promise<number> {
    const result = await query(`
      SELECT COUNT(*) as sales_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE oi.product_id = $1
      AND o.created_at >= NOW() - INTERVAL '7 days'
      AND o.status NOT IN ('cancelled', 'refunded')
    `, [productId])
    
    const salesCount = parseInt(result.rows[0].sales_count)
    return salesCount / 7 // 일평균 판매량
  }
  
  // 활성 알림 조회
  private async getActiveAlert(
    productId: string,
    alertType: AlertType
  ): Promise<StockAlert | null> {
    const result = await query(`
      SELECT * FROM stock_alerts
      WHERE product_id = $1
      AND alert_type = $2
      AND status IN ('pending', 'notified')
      AND created_at >= NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC
      LIMIT 1
    `, [productId, alertType])
    
    return result.rows[0] || null
  }
  
  // 실시간 대시보드 브로드캐스트
  private async broadcastStockUpdate(productId: string, currentStock: number) {
    const update = {
      product_id: productId,
      current_stock: currentStock,
      timestamp: new Date()
    }
    
    // WebSocket 또는 SSE로 브로드캐스트
    await pubClient.publish('stock-updates', JSON.stringify(update))
  }
  
  // 알림 메시지 생성
  private generateAlertMessage(alert: StockAlert): string {
    switch (alert.alert_type) {
      case AlertType.OUT_OF_STOCK:
        return `🚨 품절: ${alert.product_name}이(가) 품절되었습니다.`
      case AlertType.LOW_STOCK:
        return `⚠️ 재고 부족: ${alert.product_name}의 재고가 ${alert.current_stock}개 남았습니다.`
      case AlertType.RESTOCK:
        return `✅ 재입고: ${alert.product_name}이(가) 재입고되었습니다.`
      case AlertType.HIGH_DEMAND:
        return `🔥 높은 수요: ${alert.product_name}의 판매가 급증하고 있습니다.`
      case AlertType.SLOW_MOVING:
        return `📊 재고 회전 저조: ${alert.product_name}의 재고 회전율이 낮습니다.`
      default:
        return `재고 알림: ${alert.product_name}`
    }
  }
  
  // 알림 발송 메서드들
  private async sendEmailNotification(
    email: string,
    productName: string,
    alertType: AlertType
  ) {
    console.log(`이메일 발송: ${email} - ${productName} (${alertType})`)
    // TODO: 실제 이메일 발송 구현
  }
  
  private async sendSMSNotification(
    phone: string,
    productName: string,
    alertType: AlertType
  ) {
    console.log(`SMS 발송: ${phone} - ${productName} (${alertType})`)
    // TODO: 실제 SMS 발송 구현
  }
  
  private async sendPushNotification(
    userId: string,
    productName: string,
    alertType: AlertType
  ) {
    console.log(`푸시 알림: ${userId} - ${productName} (${alertType})`)
    // TODO: 실제 푸시 알림 구현
  }
  
  private async createInAppNotification(
    userId: string,
    productId: string,
    alertType: AlertType
  ) {
    const notificationId = uuidv4()
    
    await query(`
      INSERT INTO notifications (
        id, user_id, type, title, message,
        data, read, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, false, NOW())
    `, [
      notificationId,
      userId,
      'stock_alert',
      `재고 알림`,
      this.generateAlertMessage({ 
        product_id: productId, 
        alert_type: alertType 
      } as StockAlert),
      JSON.stringify({ product_id: productId, alert_type: alertType })
    ])
  }
  
  private async sendRestockEmail(
    email: string,
    userName: string,
    product: any
  ) {

    // TODO: 실제 이메일 템플릿 구현
  }
  
  private async sendAdminAlert(
    email: string,
    name: string,
    alert: StockAlert,
    message: string
  ) {

    // TODO: 실제 관리자 알림 구현
  }
  
  // 알림 통계
  async getAlertStats(startDate?: Date, endDate?: Date): Promise<unknown> {
    const dateFilter = startDate && endDate
      ? `WHERE created_at BETWEEN $1 AND $2`
      : ''
    
    const params = startDate && endDate ? [startDate, endDate] : []
    
    const result = await query(`
      SELECT 
        alert_type,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_resolution_hours
      FROM stock_alerts
      ${dateFilter}
      GROUP BY alert_type
    `, params)
    
    return result.rows
  }
}

// Export singleton instance
export const stockAlertService = new StockAlertService()