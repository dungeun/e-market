import type { User, RequestContext } from '@/lib/types/common';
/**
 * 상품 진열 템플릿 관리 서비스
 * 한국형 커머스 스타일의 다양한 진열 방식 지원
 */

import { PrismaClient } from '@/lib/db'


export type DisplayTemplateType = 
  | 'GRID'           // 그리드형
  | 'LIST'           // 리스트형
  | 'CAROUSEL'       // 캐러셀
  | 'BANNER_GRID'    // 배너+그리드 조합
  | 'MAGAZINE'       // 매거진 스타일
  | 'CARD'           // 카드형
  | 'TIMELINE'       // 타임라인형
  | 'MASONRY'        // 매이슨리
  | 'SPOTLIGHT'      // 스포트라이트
  | 'HERO_PRODUCTS'  // 히어로 상품

export type DisplayPosition = 
  | 'HOME_MAIN'      // 홈 메인
  | 'HOME_SUB'       // 홈 서브
  | 'CATEGORY_TOP'   // 카테고리 상단
  | 'CATEGORY_MID'   // 카테고리 중간
  | 'SEARCH_RESULT'  // 검색 결과
  | 'RECOMMENDATION' // 추천 영역
  | 'EVENT'          // 이벤트 페이지
  | 'BRAND_SHOP'     // 브랜드샵

export interface DisplayTemplate {
  id: string
  name: string
  type: DisplayTemplateType
  position: DisplayPosition
  config: DisplayConfig
  isActive: boolean
  priority: number
  schedule?: DisplaySchedule
  targeting?: DisplayTargeting
  performance?: DisplayPerformance
}

export interface DisplayConfig {
  // 레이아웃 설정
  layout: {
    columns?: number        // 컬럼 수
    rows?: number          // 행 수
    gap?: number           // 간격
    aspectRatio?: string   // 비율
    responsive?: boolean   // 반응형 여부
  }
  
  // 상품 표시 설정
  product: {
    showTitle?: boolean
    showPrice?: boolean
    showDiscount?: boolean
    showRating?: boolean
    showReviews?: boolean
    showBadges?: boolean
    showQuickView?: boolean
    showWishlist?: boolean
    imageHover?: 'zoom' | 'slide' | 'fade' | 'none'
  }
  
  // 스타일 설정
  style: {
    borderRadius?: number
    shadow?: boolean
    background?: string
    textColor?: string
    accentColor?: string
  }
  
  // 애니메이션 설정
  animation: {
    enabled?: boolean
    type?: 'fade' | 'slide' | 'zoom' | 'flip'
    duration?: number
    delay?: number
  }
}

export interface DisplaySchedule {
  startDate?: Date
  endDate?: Date
  timeSlots?: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
  }>
  recurring?: boolean
}

export interface DisplayTargeting {
  userSegments?: string[]      // 사용자 세그먼트
  deviceTypes?: string[]       // 디바이스 타입
  locations?: string[]         // 지역
  minOrderCount?: number       // 최소 구매 횟수
  memberTiers?: string[]       // 회원 등급
}

export interface DisplayPerformance {
  impressions: number
  clicks: number
  conversions: number
  ctr: number  // Click-through rate
  cvr: number  // Conversion rate
  revenue: number
}

/**
 * 상품 진열 템플릿 서비스
 */
export class DisplayTemplateService {
  private static instance: DisplayTemplateService

  static getInstance(): DisplayTemplateService {
    if (!DisplayTemplateService.instance) {
      DisplayTemplateService.instance = new DisplayTemplateService()
    }
    return DisplayTemplateService.instance
  }

  /**
   * 템플릿 생성
   */
  async createTemplate(data: {
    name: string
    type: DisplayTemplateType
    position: DisplayPosition
    config: DisplayConfig
    schedule?: DisplaySchedule
    targeting?: DisplayTargeting
  }): Promise<DisplayTemplate> {
    const template = await query({
      data: {
        name: data.name,
        type: data.type,
        position: data.position,
        config: data.config as unknown,
        schedule: (data.schedule || {}) as unknown,
        targeting: (data.targeting || {}) as unknown,
        isActive: true,
        priority: 0
      }
    })

    return this.mapToDisplayTemplate(template)
  }

  /**
   * 위치별 활성 템플릿 조회
   */
  async getActiveTemplatesForPosition(
    position: DisplayPosition,
    context?: {
      userId?: string
      deviceType?: string
      location?: string
    }
  ): Promise<DisplayTemplate[]> {
    const now = new Date()
    
    const templates = await query({
      where: {
        position,
        isActive: true,
        OR: [
          { schedule: { equals: {} } },
          {
            AND: [
              { 
                schedule: {
                  path: ['startDate'],
                  lte: now.toISOString()
                }
              },
              {
                OR: [
                  { 
                    schedule: {
                      path: ['endDate'],
                      equals: 'null' as unknown
                    }
                  },
                  {
                    schedule: {
                      path: ['endDate'],
                      gte: now.toISOString()
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      orderBy: { priority: 'desc' }
    })

    // 타겟팅 필터링
    const filteredTemplates = await this.filterByTargeting(templates, context)
    
    return filteredTemplates.map(t => this.mapToDisplayTemplate(t))
  }

  /**
   * 템플릿별 상품 배치
   */
  async arrangeProducts(
    templateId: string,
    products: unknown[],
    options?: {
      sortBy?: 'popularity' | 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'discount'
      limit?: number
      personalized?: boolean
      userId?: string
    }
  ): Promise<any[]> {
    const template = await query({
      where: { id: templateId }
    })

    if (!template) {
      throw new Error('Template not found')
    }

    const config = template.config as unknown as DisplayConfig
    
    // 정렬
    let arrangedProducts = this.sortProducts(products, options?.sortBy || 'popularity')
    
    // 개인화
    if (options?.personalized && options.userId) {
      arrangedProducts = await this.personalizeProducts(arrangedProducts, options.userId)
    }
    
    // 템플릿별 특수 배치
    arrangedProducts = this.applyTemplateArrangement(
      arrangedProducts,
      template.type as DisplayTemplateType,
      config
    )
    
    // 제한
    if (options?.limit) {
      arrangedProducts = arrangedProducts.slice(0, options.limit)
    }
    
    // 성능 추적
    await this.trackImpression(templateId, arrangedProducts.length)
    
    return arrangedProducts
  }

  /**
   * 동적 진열 섹션 생성
   */
  async createDynamicSection(data: {
    title: string
    position: DisplayPosition
    rules: ProductSelectionRule[]
    templateType: DisplayTemplateType
    config?: DisplayConfig
  }): Promise<unknown> {
    // 상품 선택 규칙에 따라 상품 조회
    const products = await this.selectProductsByRules(data.rules)
    
    // 템플릿 생성 또는 조회
    const template = await this.createTemplate({
      name: data.title,
      type: data.templateType,
      position: data.position,
      config: data.config || this.getDefaultConfig(data.templateType)
    })
    
    // 상품 배치
    const arrangedProducts = await this.arrangeProducts(template.id, products)
    
    // 섹션 생성
    const section = await query({
      data: {
        title: data.title,
        templateId: template.id,
        products: {
          connect: arrangedProducts.map(p => ({ id: p.id }))
        },
        metadata: {
          rules: data.rules,
          autoUpdate: true
        } as unknown
      }
    })
    
    return {
      section,
      template,
      products: arrangedProducts
    }
  }

  /**
   * A/B 테스트
   */
  async createABTest(data: {
    name: string
    position: DisplayPosition
    variants: Array<{
      name: string
      templateType: DisplayTemplateType
      config: DisplayConfig
      weight: number  // 트래픽 비중
    }>
    duration: number  // 테스트 기간 (일)
  }): Promise<unknown> {
    const test = await query({
      data: {
        name: data.name,
        position: data.position,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + data.duration * 24 * 60 * 60 * 1000),
        variants: {
          create: data.variants.map(v => ({
            name: v.name,
            template: {
              create: {
                name: `${data.name}_${v.name}`,
                type: v.templateType,
                position: data.position,
                config: v.config as unknown,
                isActive: true,
                priority: 100  // A/B 테스트 우선순위
              }
            },
            weight: v.weight,
            metrics: {
              impressions: 0,
              clicks: 0,
              conversions: 0
            } as unknown
          }))
        }
      },
      include: {
        variants: {
          include: {
            template: true
          }
        }
      }
    })
    
    return test
  }

  /**
   * 진열 성능 분석
   */
  async analyzePerformance(
    templateId: string,
    period: { start: Date; end: Date }
  ): Promise<DisplayPerformance> {
    // 노출 수
    const impressions = await query({
      where: {
        templateId,
        type: 'IMPRESSION',
        createdAt: {
          gte: period.start,
          lte: period.end
        }
      }
    })
    
    // 클릭 수
    const clicks = await query({
      where: {
        templateId,
        type: 'CLICK',
        createdAt: {
          gte: period.start,
          lte: period.end
        }
      }
    })
    
    // 전환 수
    const conversions = await query({
      where: {
        templateId,
        type: 'CONVERSION',
        createdAt: {
          gte: period.start,
          lte: period.end
        }
      }
    })
    
    // 매출 (displayTemplateId 필드가 없으므로 주석 처리)
    // TODO: Order 모델에 displayTemplateId 필드 추가 필요
    const revenue = await prisma.order.aggregate({
      where: {
        // displayTemplateId: templateId,
        createdAt: {
          gte: period.start,
          lte: period.end
        }
      },
      _sum: {
        total: true
      }
    })
    
    return {
      impressions,
      clicks,
      conversions,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cvr: clicks > 0 ? (conversions / clicks) * 100 : 0,
      revenue: revenue._sum.total || 0
    }
  }

  // === Private Helper Methods ===

  private mapToDisplayTemplate(data: unknown): DisplayTemplate {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      position: data.position,
      config: data.config,
      isActive: data.isActive,
      priority: data.priority,
      schedule: data.schedule,
      targeting: data.targeting,
      performance: data.performance
    }
  }

  private async filterByTargeting(
    templates: unknown[],
    context?: any
  ): Promise<any[]> {
    if (!context) return templates
    
    return templates.filter(template => {
      const targeting = template.targeting as DisplayTargeting
      
      if (!targeting || Object.keys(targeting).length === 0) {
        return true
      }
      
      // 디바이스 타입 체크
      if (targeting.deviceTypes && context.deviceType) {
        if (!targeting.deviceTypes.includes(context.deviceType)) {
          return false
        }
      }
      
      // 추가 타겟팅 로직...
      
      return true
    })
  }

  private sortProducts(products: unknown[], sortBy: string): unknown[] {
    switch (sortBy) {
      case 'newest':
        return products.sort((a, b) => b.createdAt - a.createdAt)
      case 'price_asc':
        return products.sort((a, b) => a.price - b.price)
      case 'price_desc':
        return products.sort((a, b) => b.price - a.price)
      case 'rating':
        return products.sort((a, b) => b.rating - a.rating)
      case 'discount':
        return products.sort((a, b) => b.discountRate - a.discountRate)
      case 'popularity':
      default:
        return products.sort((a, b) => b.salesCount - a.salesCount)
    }
  }

  private async personalizeProducts(products: unknown[], userId: string): Promise<any[]> {
    // 사용자 선호도 기반 개인화
    const userPreferences = await this.getUserPreferences(userId)
    
    return products.sort((a, b) => {
      const scoreA = this.calculatePersonalizationScore(a, userPreferences)
      const scoreB = this.calculatePersonalizationScore(b, userPreferences)
      return scoreB - scoreA
    })
  }

  private applyTemplateArrangement(
    products: unknown[],
    type: DisplayTemplateType,
    config: DisplayConfig
  ): unknown[] {
    switch (type) {
      case 'SPOTLIGHT':
        // 첫 번째 상품을 강조
        if (products.length > 0) {
          products[0].isSpotlight = true
        }
        break
        
      case 'HERO_PRODUCTS':
        // 상위 3개 상품을 히어로로
        products.slice(0, 3).forEach(p => p.isHero = true)
        break
        
      case 'MAGAZINE':
        // 매거진 스타일 레이아웃
        products.forEach((p, i) => {
          p.layoutSize = i % 3 === 0 ? 'large' : 'small'
        })
        break
    }
    
    return products
  }

  private async trackImpression(templateId: string, productCount: number): Promise<void> {
    await query({
      data: {
        templateId,
        type: 'IMPRESSION',
        metadata: { productCount } as unknown
      }
    })
  }

  private async selectProductsByRules(rules: ProductSelectionRule[]): Promise<any[]> {
    // 규칙에 따른 상품 선택 로직
    const query: unknown = { where: { AND: [] } }
    
    for (const rule of rules) {
      switch (rule.type) {
        case 'CATEGORY':
          query.where.AND.push({ categoryId: { in: rule.values } })
          break
        case 'BRAND':
          // brandId 필드가 없으므로 주석 처리
          // query.where.AND.push({ brandId: { in: rule.values } })
          break
        case 'PRICE_RANGE':
          query.where.AND.push({
            price: {
              gte: rule.min,
              lte: rule.max
            }
          })
          break
        case 'NEW_ARRIVAL':
          const daysAgo = new Date()
          daysAgo.setDate(daysAgo.getDate() - (rule.days || 7))
          query.where.AND.push({ createdAt: { gte: daysAgo } })
          break
        case 'BEST_SELLER':
          query.orderBy = { salesCount: 'desc' }
          query.take = rule.limit || 10
          break
      }
    }
    
    return await query(query)
  }

  private getDefaultConfig(type: DisplayTemplateType): DisplayConfig {
    const configs: Record<DisplayTemplateType, DisplayConfig> = {
      GRID: {
        layout: { columns: 4, rows: 3, gap: 16, responsive: true },
        product: {
          showTitle: true,
          showPrice: true,
          showDiscount: true,
          showRating: true,
          imageHover: 'zoom'
        },
        style: { borderRadius: 8, shadow: true },
        animation: { enabled: false }
      },
      LIST: {
        layout: { columns: 1, gap: 12, responsive: true },
        product: {
          showTitle: true,
          showPrice: true,
          showDiscount: true,
          showRating: true,
          showReviews: true,
          imageHover: 'none'
        },
        style: { borderRadius: 4, shadow: false },
        animation: { enabled: false }
      },
      CAROUSEL: {
        layout: { columns: 5, rows: 1, gap: 20, responsive: true },
        product: {
          showTitle: true,
          showPrice: true,
          showDiscount: true,
          imageHover: 'slide'
        },
        style: { borderRadius: 12, shadow: true },
        animation: {
          enabled: true,
          type: 'slide',
          duration: 300
        }
      },
      BANNER_GRID: {
        layout: { columns: 3, rows: 2, gap: 24, responsive: true },
        product: {
          showTitle: true,
          showPrice: true,
          showDiscount: true,
          showBadges: true,
          imageHover: 'fade'
        },
        style: { borderRadius: 16, shadow: true },
        animation: { enabled: false }
      },
      MAGAZINE: {
        layout: { columns: 3, gap: 32, responsive: true },
        product: {
          showTitle: true,
          showPrice: true,
          showDiscount: true,
          showQuickView: true,
          imageHover: 'zoom'
        },
        style: { borderRadius: 0, shadow: false },
        animation: { enabled: false }
      },
      CARD: {
        layout: { columns: 3, rows: 2, gap: 24, responsive: true },
        product: {
          showTitle: true,
          showPrice: true,
          showDiscount: true,
          showWishlist: true,
          imageHover: 'fade'
        },
        style: { borderRadius: 12, shadow: true },
        animation: { enabled: false }
      },
      TIMELINE: {
        layout: { columns: 1, gap: 40, responsive: true },
        product: {
          showTitle: true,
          showPrice: true,
          showDiscount: true,
          showReviews: true,
          imageHover: 'none'
        },
        style: { borderRadius: 8, shadow: false },
        animation: { enabled: false }
      },
      MASONRY: {
        layout: { columns: 4, gap: 16, responsive: true },
        product: {
          showTitle: true,
          showPrice: true,
          showRating: true,
          imageHover: 'zoom'
        },
        style: { borderRadius: 8, shadow: true },
        animation: { enabled: false }
      },
      SPOTLIGHT: {
        layout: { columns: 1, gap: 0, responsive: true },
        product: {
          showTitle: true,
          showPrice: true,
          showDiscount: true,
          showRating: true,
          showReviews: true,
          showBadges: true,
          imageHover: 'zoom'
        },
        style: { borderRadius: 16, shadow: true },
        animation: {
          enabled: true,
          type: 'fade',
          duration: 500
        }
      },
      HERO_PRODUCTS: {
        layout: { columns: 3, rows: 1, gap: 32, responsive: true },
        product: {
          showTitle: true,
          showPrice: true,
          showDiscount: true,
          showBadges: true,
          showQuickView: true,
          imageHover: 'slide'
        },
        style: { borderRadius: 20, shadow: true },
        animation: {
          enabled: true,
          type: 'zoom',
          duration: 400
        }
      }
    }
    
    return configs[type]
  }

  private async getUserPreferences(userId: string): Promise<unknown> {
    // 사용자 선호도 조회
    const orders = await query({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    const preferences = {
      categories: new Map<string, number>(),
      brands: new Map<string, number>(),
      priceRange: { min: 0, max: 0 },
      attributes: new Map<string, number>()
    }
    
    // 선호도 계산
    orders.forEach(order => {
      order.items.forEach(item => {
        // 카테고리 선호도
        const categoryId = item.product.categoryId
        if (categoryId) {
          preferences.categories.set(
            categoryId,
            (preferences.categories.get(categoryId) || 0) + 1
          )
        }
        
        // 브랜드 선호도 (brandId 필드가 없으므로 주석 처리)
        // if (item.product.brandId) {
        //   preferences.brands.set(
        //     item.product.brandId,
        //     (preferences.brands.get(item.product.brandId) || 0) + 1
        //   )
        // }
        
        // 가격대 선호도
        preferences.priceRange.min = Math.min(preferences.priceRange.min, item.price)
        preferences.priceRange.max = Math.max(preferences.priceRange.max, item.price)
      })
    })
    
    return preferences
  }

  private calculatePersonalizationScore(product: unknown, preferences: unknown): number {
    let score = 0
    
    // 카테고리 매칭
    if (product.categoryId && preferences.categories.has(product.categoryId)) {
      score += preferences.categories.get(product.categoryId) * 10
    }
    
    // 브랜드 매칭 (brandId 필드가 없으므로 주석 처리)
    // if (product.brandId && preferences.brands.has(product.brandId)) {
    //   score += preferences.brands.get(product.brandId) * 8
    // }
    
    // 가격대 매칭
    if (product.price >= preferences.priceRange.min && 
        product.price <= preferences.priceRange.max) {
      score += 5
    }
    
    return score
  }
}

// 상품 선택 규칙 타입
export interface ProductSelectionRule {
  type: 'CATEGORY' | 'BRAND' | 'PRICE_RANGE' | 'NEW_ARRIVAL' | 'BEST_SELLER' | 'CUSTOM'
  values?: string[]
  min?: number
  max?: number
  days?: number
  limit?: number
  customQuery?: any
}

// 싱글톤 인스턴스 export
export const displayTemplateService = DisplayTemplateService.getInstance()