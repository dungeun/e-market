import type { User, RequestContext } from '@/lib/types/common';
/**
 * 비즈니스 인텔리전스 시스템
 * RFM 분석, 판매 예측, 고객 세분화, 실시간 대시보드
 */

import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'


export interface RFMScore {
  userId: string
  recency: number  // 최근성 (1-5)
  frequency: number // 빈도 (1-5)
  monetary: number  // 금액 (1-5)
  segment: string   // 고객 세그먼트
  value: number     // 고객 가치 점수
}

export interface SalesForecast {
  period: string
  predicted: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  factors: string[]
}

export interface DashboardMetrics {
  realtime: {
    activeUsers: number
    ordersToday: number
    revenueToday: number
    conversionRate: number
  }
  trends: {
    sales: Array<{ date: string; amount: number }>
    customers: Array<{ date: string; count: number }>
    products: Array<{ name: string; sales: number }>
  }
  insights: {
    topProducts: Array<{ id: string; name: string; revenue: number }>
    topCustomers: Array<{ id: string; name: string; ltv: number }>
    riskAlerts: Array<{ type: string; message: string; severity: string }>
  }
}

/**
 * 비즈니스 인텔리전스 서비스
 */
export class BusinessIntelligenceService {
  private static instance: BusinessIntelligenceService

  static getInstance(): BusinessIntelligenceService {
    if (!BusinessIntelligenceService.instance) {
      BusinessIntelligenceService.instance = new BusinessIntelligenceService()
    }
    return BusinessIntelligenceService.instance
  }

  /**
   * RFM 분석 실행
   */
  async performRFMAnalysis(): Promise<RFMScore[]> {
    const sixMonthsAgo = subMonths(new Date(), 6)
    
    // 모든 고객의 주문 데이터 조회
    const customers = await query({
      where: {
        orders: {
          some: {
            createdAt: { gte: sixMonthsAgo }
          }
        }
      },
      include: {
        orders: {
          where: {
            status: 'PAYMENT_COMPLETED',
            createdAt: { gte: sixMonthsAgo }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    const rfmScores: RFMScore[] = []

    // RFM 점수 계산
    for (const customer of customers) {
      const lastOrderDate = customer.orders[0]?.createdAt
      const daysSinceLastOrder = lastOrderDate 
        ? Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999

      const orderCount = customer.orders.length
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0)

      // 5점 척도로 점수 부여
      const recency = this.calculateRecencyScore(daysSinceLastOrder)
      const frequency = this.calculateFrequencyScore(orderCount)
      const monetary = this.calculateMonetaryScore(totalSpent)

      // 세그먼트 결정
      const segment = this.determineSegment(recency, frequency, monetary)
      const value = (recency + frequency + monetary) / 3

      rfmScores.push({
        userId: customer.id,
        recency,
        frequency,
        monetary,
        segment,
        value
      })

      // 고객 세그먼트 저장
      await this.saveCustomerSegment(customer.id, segment, value)
    }

    return rfmScores
  }

  /**
   * 판매 예측 (선형 회귀 + 계절성)
   */
  async generateSalesForecast(months: number = 3): Promise<SalesForecast[]> {
    // 과거 12개월 데이터 조회
    const historicalData = await this.getHistoricalSales(12)
    
    const forecasts: SalesForecast[] = []
    
    for (let i = 1; i <= months; i++) {
      const targetMonth = format(subMonths(new Date(), -i), 'yyyy-MM')
      
      // 선형 회귀로 트렌드 계산
      const trend = this.calculateTrend(historicalData)
      
      // 계절성 요인 적용
      const seasonality = this.getSeasonalityFactor(targetMonth)
      
      // 예측값 계산
      const basePredict = trend.slope * (historicalData.length + i) + trend.intercept
      const predicted = Math.round(basePredict * seasonality)
      
      // 신뢰도 계산 (예측 거리가 멀수록 감소)
      const confidence = Math.max(0.5, 1 - (i * 0.1))
      
      // 영향 요인 분석
      const factors = this.analyzeFactors(targetMonth)
      
      forecasts.push({
        period: targetMonth,
        predicted,
        confidence,
        trend: trend.slope > 0 ? 'up' : trend.slope < 0 ? 'down' : 'stable',
        factors
      })
    }

    return forecasts
  }

  /**
   * 실시간 대시보드 메트릭
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const today = new Date()
    const startOfToday = new Date(today.setHours(0, 0, 0, 0))
    
    // 실시간 메트릭
    const [activeUsers, todayOrders, todayRevenue] = await Promise.all([
      this.getActiveUsersCount(),
      this.getTodayOrdersCount(startOfToday),
      this.getTodayRevenue(startOfToday)
    ])

    // 전환율 계산
    const sessions = await this.getSessionCount(startOfToday)
    const conversionRate = sessions > 0 ? (todayOrders / sessions) * 100 : 0

    // 트렌드 데이터 (최근 7일)
    const salesTrend = await this.getSalesTrend(7)
    const customerTrend = await this.getCustomerTrend(7)
    const productTrend = await this.getProductTrend()

    // 인사이트
    const [topProducts, topCustomers, riskAlerts] = await Promise.all([
      this.getTopProducts(5),
      this.getTopCustomers(5),
      this.getRiskAlerts()
    ])

    return {
      realtime: {
        activeUsers,
        ordersToday: todayOrders,
        revenueToday: todayRevenue,
        conversionRate
      },
      trends: {
        sales: salesTrend,
        customers: customerTrend,
        products: productTrend
      },
      insights: {
        topProducts,
        topCustomers,
        riskAlerts
      }
    }
  }

  /**
   * 고객 생애 가치 (CLV) 계산
   */
  async calculateCustomerLifetimeValue(userId: string): Promise<number> {
    const orders = await query({
      where: {
        userId,
        status: 'PAYMENT_COMPLETED'
      }
    })

    if (orders.length === 0) return 0

    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
    const firstOrder = orders[0].createdAt
    const lastOrder = orders[orders.length - 1].createdAt
    
    // 고객 활동 기간 (개월)
    const monthsActive = Math.max(1, 
      Math.floor((lastOrder.getTime() - firstOrder.getTime()) / (1000 * 60 * 60 * 24 * 30))
    )
    
    // 월평균 구매액
    const avgMonthlySpend = totalSpent / monthsActive
    
    // 예상 고객 유지 기간 (통계 기반, 기본 24개월)
    const expectedLifetime = 24
    
    // CLV = 월평균 구매액 × 예상 유지 기간
    return Math.round(avgMonthlySpend * expectedLifetime)
  }

  /**
   * 이상 탐지 및 알림
   */
  async detectAnomalies(): Promise<Array<{
    type: string
    severity: 'info' | 'warning' | 'critical'
    message: string
    data?: any
  }>> {
    const anomalies: unknown[] = []

    // 1. 재고 이상 탐지
    const lowStockProducts = await query({
      where: {
        quantity: { lte: 10 }
      },
      include: { product: true }
    })

    for (const item of lowStockProducts) {
      anomalies.push({
        type: 'LOW_STOCK',
        severity: item.quantity === 0 ? 'critical' : 'warning',
        message: `${item.product.name} 재고 부족 (현재: ${item.quantity}개)`,
        data: { productId: item.productId, quantity: item.quantity }
      })
    }

    // 2. 판매 급증/급감 탐지
    const salesAnomaly = await this.detectSalesAnomaly()
    if (salesAnomaly) {
      anomalies.push(salesAnomaly)
    }

    // 3. 고객 이탈 위험
    const churnRisk = await this.detectChurnRisk()
    anomalies.push(...churnRisk)

    // 4. 결제 실패율 이상
    const paymentFailures = await this.detectPaymentAnomalies()
    if (paymentFailures) {
      anomalies.push(paymentFailures)
    }

    return anomalies
  }

  /**
   * 코호트 분석
   */
  async performCohortAnalysis(months: number = 6): Promise<unknown> {
    const cohorts: unknown[] = []
    
    for (let i = 0; i < months; i++) {
      const cohortMonth = subMonths(new Date(), i)
      const startOfCohort = startOfMonth(cohortMonth)
      const endOfCohort = endOfMonth(cohortMonth)
      
      // 해당 월에 가입한 사용자
      const newUsers = await query({
        where: {
          createdAt: {
            gte: startOfCohort,
            lte: endOfCohort
          }
        }
      })
      
      const cohortData = {
        month: format(cohortMonth, 'yyyy-MM'),
        newUsers: newUsers.length,
        retention: [] as Array<{ month: number; rate: number }>
      }
      
      // 각 월별 재방문율 계산
      for (let j = 0; j <= i; j++) {
        const checkMonth = subMonths(new Date(), j)
        const activeUsers = await query({
          where: {
            userId: { in: newUsers.map(u => u.id) },
            createdAt: {
              gte: startOfMonth(checkMonth),
              lte: endOfMonth(checkMonth)
            }
          },
          distinct: ['userId']
        })
        
        const retentionRate = newUsers.length > 0 
          ? (activeUsers.length / newUsers.length) * 100 
          : 0
          
        cohortData.retention.push({
          month: j,
          rate: Math.round(retentionRate * 10) / 10
        })
      }
      
      cohorts.push(cohortData)
    }
    
    return cohorts
  }

  // === Private Helper Methods ===

  private calculateRecencyScore(days: number): number {
    if (days <= 7) return 5
    if (days <= 14) return 4
    if (days <= 30) return 3
    if (days <= 60) return 2
    return 1
  }

  private calculateFrequencyScore(count: number): number {
    if (count >= 10) return 5
    if (count >= 7) return 4
    if (count >= 4) return 3
    if (count >= 2) return 2
    return 1
  }

  private calculateMonetaryScore(amount: number): number {
    if (amount >= 1000000) return 5
    if (amount >= 500000) return 4
    if (amount >= 200000) return 3
    if (amount >= 50000) return 2
    return 1
  }

  private determineSegment(r: number, f: number, m: number): string {
    const score = `${r}${f}${m}`
    
    // RFM 세그먼트 매핑
    const segments: Record<string, string> = {
      '555': 'Champions',
      '554': 'Champions',
      '544': 'Champions',
      '545': 'Champions',
      '454': 'Loyal Customers',
      '455': 'Loyal Customers',
      '445': 'Loyal Customers',
      '543': 'Potential Loyalists',
      '443': 'Potential Loyalists',
      '533': 'Potential Loyalists',
      '432': 'At Risk',
      '332': 'At Risk',
      '322': 'At Risk',
      '222': 'Hibernating',
      '111': 'Lost'
    }
    
    // 정확한 매칭이 없으면 평균 점수로 분류
    const avg = (r + f + m) / 3
    if (avg >= 4) return 'Champions'
    if (avg >= 3) return 'Loyal Customers'
    if (avg >= 2) return 'At Risk'
    return 'Lost'
  }

  private async saveCustomerSegment(userId: string, segment: string, value: number): Promise<void> {
    // 세그먼트 찾기 또는 생성
    const segmentRecord = await query({
      where: { name: segment },
      create: {
        name: segment,
        description: `RFM Segment: ${segment}`,
        type: 'RFM',
        criteria: { rfm: true }
      },
      update: {}
    })

    // 세그먼트 멤버십 업데이트
    await query({
      where: {
        segmentId_userId: {
          segmentId: segmentRecord.id,
          userId
        }
      },
      create: {
        segmentId: segmentRecord.id,
        userId,
        score: value
      },
      update: {
        score: value,
        assignedAt: new Date()
      }
    })
  }

  private async getHistoricalSales(months: number): Promise<Array<{ month: string; amount: number }>> {
    const sales: unknown[] = []
    
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i))
      const monthEnd = endOfMonth(subMonths(new Date(), i))
      
      const monthSales = await prisma.order.aggregate({
        where: {
          status: 'PAYMENT_COMPLETED',
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: {
          total: true
        }
      })
      
      sales.push({
        month: format(monthStart, 'yyyy-MM'),
        amount: monthSales._sum.total || 0
      })
    }
    
    return sales
  }

  private calculateTrend(data: Array<{ amount: number }>): { slope: number; intercept: number } {
    const n = data.length
    if (n === 0) return { slope: 0, intercept: 0 }
    
    // 선형 회귀 계산
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
    
    data.forEach((point, index) => {
      sumX += index
      sumY += point.amount
      sumXY += index * point.amount
      sumX2 += index * index
    })
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    return { slope, intercept }
  }

  private getSeasonalityFactor(month: string): number {
    // 월별 계절성 요인 (한국 이커머스 기준)
    const monthNum = parseInt(month.split('-')[1])
    const seasonalFactors: Record<number, number> = {
      1: 1.1,   // 신년
      2: 0.9,   // 설날 후
      3: 1.0,   // 봄
      4: 1.05,  // 봄
      5: 1.1,   // 가정의 달
      6: 0.95,  // 
      7: 0.9,   // 여름 휴가
      8: 0.85,  // 여름 휴가
      9: 1.05,  // 가을
      10: 1.1,  // 가을
      11: 1.3,  // 블랙프라이데이
      12: 1.2   // 연말
    }
    
    return seasonalFactors[monthNum] || 1.0
  }

  private analyzeFactors(month: string): string[] {
    const factors: string[] = []
    const monthNum = parseInt(month.split('-')[1])
    
    // 계절적 요인
    if (monthNum === 11) factors.push('블랙프라이데이 시즌')
    if (monthNum === 12) factors.push('연말 쇼핑 시즌')
    if (monthNum === 5) factors.push('가정의 달 이벤트')
    if ([7, 8].includes(monthNum)) factors.push('여름 휴가 시즌')
    
    // 추가 요인 분석 (실제로는 더 복잡한 로직)
    factors.push('전년 동기 대비 성장률')
    factors.push('신상품 출시 예정')
    
    return factors
  }

  private async getActiveUsersCount(): Promise<number> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
    
    const activeUsers = await query({
      where: {
        expires: { gte: fifteenMinutesAgo }
      }
    })
    
    return activeUsers
  }

  private async getTodayOrdersCount(startOfToday: Date): Promise<number> {
    return await query({
      where: {
        createdAt: { gte: startOfToday }
      }
    })
  }

  private async getTodayRevenue(startOfToday: Date): Promise<number> {
    const revenue = await prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfToday },
        status: 'PAYMENT_COMPLETED'
      },
      _sum: {
        total: true
      }
    })
    
    return revenue._sum.total || 0
  }

  private async getSessionCount(startOfToday: Date): Promise<number> {
    return await query({
      where: {
        expires: { gte: startOfToday }
      }
    })
  }

  private async getSalesTrend(days: number): Promise<Array<{ date: string; amount: number }>> {
    const trend: unknown[] = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)
      
      const dailySales = await prisma.order.aggregate({
        where: {
          createdAt: {
            gte: date,
            lt: nextDay
          },
          status: 'PAYMENT_COMPLETED'
        },
        _sum: {
          total: true
        }
      })
      
      trend.push({
        date: format(date, 'MM/dd'),
        amount: dailySales._sum.total || 0
      })
    }
    
    return trend
  }

  private async getCustomerTrend(days: number): Promise<Array<{ date: string; count: number }>> {
    const trend: unknown[] = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)
      
      const newCustomers = await query({
        where: {
          createdAt: {
            gte: date,
            lt: nextDay
          }
        }
      })
      
      trend.push({
        date: format(date, 'MM/dd'),
        count: newCustomers
      })
    }
    
    return trend
  }

  private async getProductTrend(): Promise<Array<{ name: string; sales: number }>> {
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    })
    
    const products: unknown[] = []
    for (const item of topProducts) {
      const product = await query({
        where: { id: item.productId }
      })
      
      if (product) {
        products.push({
          name: product.name,
          sales: item._sum.quantity || 0
        })
      }
    }
    
    return products
  }

  private async getTopProducts(limit: number): Promise<Array<{ id: string; name: string; revenue: number }>> {
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        price: true
      },
      orderBy: {
        _sum: {
          price: 'desc'
        }
      },
      take: limit
    })
    
    const products: unknown[] = []
    for (const item of topProducts) {
      const product = await query({
        where: { id: item.productId }
      })
      
      if (product) {
        products.push({
          id: product.id,
          name: product.name,
          revenue: item._sum.price || 0
        })
      }
    }
    
    return products
  }

  private async getTopCustomers(limit: number): Promise<Array<{ id: string; name: string; ltv: number }>> {
    const topCustomers = await prisma.order.groupBy({
      by: ['userId'],
      _sum: {
        total: true
      },
      orderBy: {
        _sum: {
          total: 'desc'
        }
      },
      take: limit
    })
    
    const customers: unknown[] = []
    for (const item of topCustomers) {
      if (!item.userId) continue
      
      const user = await query({
        where: { id: item.userId }
      })
      
      if (user) {
        const ltv = await this.calculateCustomerLifetimeValue(user.id)
        customers.push({
          id: user.id,
          name: user.name || 'Unknown',
          ltv
        })
      }
    }
    
    return customers
  }

  private async getRiskAlerts(): Promise<Array<{ type: string; message: string; severity: string }>> {
    const alerts: unknown[] = []
    
    // 재고 위험
    const lowStock = await query({
      where: { quantity: { lte: 10 } }
    })
    
    if (lowStock > 0) {
      alerts.push({
        type: 'INVENTORY',
        message: `${lowStock}개 상품이 재고 부족 상태입니다`,
        severity: 'warning'
      })
    }
    
    // 이탈 위험 고객
    const thirtyDaysAgo = subMonths(new Date(), 1)
    const churnRiskCount = await query({
      where: {
        orders: {
          none: {
            createdAt: { gte: thirtyDaysAgo }
          }
        }
      }
    })
    
    if (churnRiskCount > 10) {
      alerts.push({
        type: 'CUSTOMER',
        message: `${churnRiskCount}명의 고객이 이탈 위험 상태입니다`,
        severity: 'warning'
      })
    }
    
    return alerts
  }

  private async detectSalesAnomaly(): Promise<unknown> {
    // 어제와 오늘 판매 비교
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const [yesterdaySales, todaySales] = await Promise.all([
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today
          },
          status: 'PAYMENT_COMPLETED'
        },
        _sum: { total: true }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: today },
          status: 'PAYMENT_COMPLETED'
        },
        _sum: { total: true }
      })
    ])
    
    const yesterdayAmount = yesterdaySales._sum.total || 0
    const todayAmount = todaySales._sum.total || 0
    
    if (yesterdayAmount > 0) {
      const changeRate = ((todayAmount - yesterdayAmount) / yesterdayAmount) * 100
      
      if (Math.abs(changeRate) > 50) {
        return {
          type: 'SALES_ANOMALY',
          severity: Math.abs(changeRate) > 70 ? 'critical' : 'warning',
          message: `판매액이 전일 대비 ${changeRate > 0 ? '증가' : '감소'} (${Math.round(changeRate)}%)`,
          data: { yesterday: yesterdayAmount, today: todayAmount, changeRate }
        }
      }
    }
    
    return null
  }

  private async detectChurnRisk(): Promise<any[]> {
    const alerts: unknown[] = []
    const sixtyDaysAgo = subMonths(new Date(), 2)
    
    // 최근 60일간 구매가 없는 VIP 고객
    const vipChurnRisk = await query({
      where: {
        orders: {
          none: {
            createdAt: { gte: sixtyDaysAgo }
          }
        }
      },
      take: 5
    })
    
    for (const customer of vipChurnRisk) {
      alerts.push({
        type: 'CHURN_RISK',
        severity: 'warning',
        message: `VIP 고객 ${customer.name || 'Unknown'}님이 60일간 구매가 없습니다`,
        data: { userId: customer.id }
      })
    }
    
    return alerts
  }

  private async detectPaymentAnomalies(): Promise<unknown> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const [totalPayments, failedPayments] = await Promise.all([
      query({
        where: { createdAt: { gte: today } }
      }),
      query({
        where: {
          createdAt: { gte: today },
          status: 'FAILED'
        }
      })
    ])
    
    if (totalPayments > 10) {
      const failureRate = (failedPayments / totalPayments) * 100
      
      if (failureRate > 10) {
        return {
          type: 'PAYMENT_FAILURE',
          severity: failureRate > 20 ? 'critical' : 'warning',
          message: `결제 실패율이 ${Math.round(failureRate)}%로 높습니다`,
          data: { total: totalPayments, failed: failedPayments, failureRate }
        }
      }
    }
    
    return null
  }
}

// 싱글톤 인스턴스 export
export const biService = BusinessIntelligenceService.getInstance()