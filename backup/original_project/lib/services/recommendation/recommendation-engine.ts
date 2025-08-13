/**
 * AI 추천 엔진 서비스
 * 협업 필터링, 컨텐츠 기반 필터링, 하이브리드 추천
 */

import { PrismaClient } from '@prisma/client'
import Redis from 'ioredis'

const prisma = new PrismaClient()
const redis = new Redis(process.env.REDIS_URL!)

export interface RecommendationOptions {
  userId?: string
  productId?: string
  limit?: number
  type?: 'collaborative' | 'content' | 'hybrid' | 'trending'
  includeViewed?: boolean
  categoryFilter?: string[]
}

export interface RecommendationResult {
  products: any[]
  algorithm: string
  confidence: number
  reason?: string
}

export class RecommendationEngineService {
  private readonly CACHE_TTL = 1800 // 30분

  /**
   * 사용자 맞춤 상품 추천
   */
  async getPersonalizedRecommendations(
    userId: string, 
    options: RecommendationOptions = {}
  ): Promise<RecommendationResult> {
    const { limit = 10, type = 'hybrid', includeViewed = false } = options

    const cacheKey = `rec:user:${userId}:${type}:${limit}:${includeViewed}`
    const cached = await redis.get(cacheKey)
    
    if (cached) {
      return JSON.parse(cached)
    }

    let result: RecommendationResult

    switch (type) {
      case 'collaborative':
        result = await this.collaborativeFiltering(userId, options)
        break
      case 'content':
        result = await this.contentBasedFiltering(userId, options)
        break
      case 'trending':
        result = await this.getTrendingProducts(options)
        break
      case 'hybrid':
      default:
        result = await this.hybridRecommendation(userId, options)
        break
    }

    // 결과 캐싱
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result))

    return result
  }

  /**
   * 상품 기반 추천 (연관 상품)
   */
  async getItemBasedRecommendations(
    productId: string,
    options: RecommendationOptions = {}
  ): Promise<RecommendationResult> {
    const { limit = 10, userId } = options

    const cacheKey = `rec:item:${productId}:${limit}:${userId || 'anonymous'}`
    const cached = await redis.get(cacheKey)
    
    if (cached) {
      return JSON.parse(cached)
    }

    // 현재 상품 정보 조회
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true }
    })

    if (!currentProduct) {
      return {
        products: [],
        algorithm: 'item-based',
        confidence: 0,
        reason: 'Product not found'
      }
    }

    // 1. 함께 구매한 상품 (가중치: 40%)
    const coBoughtProducts = await this.getFrequentlyBoughtTogether(productId)
    
    // 2. 같은 카테고리 인기 상품 (가중치: 30%)
    const categoryProducts = await this.getSameCategoryProducts(currentProduct.categoryId!, limit)
    
    // 3. 비슷한 태그를 가진 상품 (가중치: 20%)
    const similarTagProducts = await this.getSimilarTagProducts(currentProduct.tags, limit)
    
    // 4. 같은 가격대 상품 (가중치: 10%)
    const similarPriceProducts = await this.getSimilarPriceProducts(currentProduct.price, limit)

    // 상품 점수 계산 및 병합
    const productScores = new Map<string, number>()

    // 함께 구매한 상품 점수
    coBoughtProducts.forEach((product, index) => {
      const score = (coBoughtProducts.length - index) * 0.4
      productScores.set(product.id, (productScores.get(product.id) || 0) + score)
    })

    // 같은 카테고리 상품 점수
    categoryProducts.forEach((product, index) => {
      const score = (categoryProducts.length - index) * 0.3
      productScores.set(product.id, (productScores.get(product.id) || 0) + score)
    })

    // 비슷한 태그 상품 점수
    similarTagProducts.forEach((product, index) => {
      const score = (similarTagProducts.length - index) * 0.2
      productScores.set(product.id, (productScores.get(product.id) || 0) + score)
    })

    // 비슷한 가격대 상품 점수
    similarPriceProducts.forEach((product, index) => {
      const score = (similarPriceProducts.length - index) * 0.1
      productScores.set(product.id, (productScores.get(product.id) || 0) + score)
    })

    // 현재 상품 제외
    productScores.delete(productId)

    // 점수 순으로 정렬
    const sortedProducts = Array.from(productScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)

    // 상품 정보 조회
    const recommendedProducts = await prisma.product.findMany({
      where: {
        id: { in: sortedProducts.map(([id]) => id) },
        status: 'ACTIVE'
      },
      include: {
        images: true,
        category: true,
        reviews: {
          select: { rating: true }
        },
        _count: {
          select: { reviews: true, orderItems: true }
        }
      }
    })

    // 순서 복원 및 정보 보강
    const orderedProducts = sortedProducts
      .map(([id, score]) => {
        const product = recommendedProducts.find(p => p.id === id)
        if (!product) return null

        const avgRating = product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
          : 0

        return {
          ...product,
          avgRating,
          reviewCount: product._count.reviews,
          salesCount: product._count.orderItems,
          mainImage: product.images[0]?.url,
          recommendationScore: score
        }
      })
      .filter(Boolean)

    const result: RecommendationResult = {
      products: orderedProducts,
      algorithm: 'item-based',
      confidence: Math.min(orderedProducts.length / limit, 1) * 100,
      reason: '이 상품과 함께 구매하거나 유사한 상품들입니다'
    }

    // 결과 캐싱
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result))

    return result
  }

  /**
   * 협업 필터링 (Collaborative Filtering)
   */
  private async collaborativeFiltering(
    userId: string, 
    options: RecommendationOptions
  ): Promise<RecommendationResult> {
    const { limit = 10 } = options

    // 사용자의 구매/평점 이력 조회
    const userHistory = await prisma.order.findMany({
      where: {
        userId,
        status: { in: ['DELIVERED', 'PAYMENT_COMPLETED'] }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (userHistory.length === 0) {
      return this.getTrendingProducts(options)
    }

    // 사용자가 구매한 상품 ID 목록
    const userProductIds = new Set(
      userHistory.flatMap(order => order.items.map(item => item.productId))
    )

    // 비슷한 취향을 가진 사용자들 찾기
    const similarUsers = await this.findSimilarUsers(userId, userProductIds)

    // 유사 사용자들이 구매한 상품 중 현재 사용자가 구매하지 않은 상품들
    const recommendations = new Map<string, number>()

    for (const { userId: similarUserId, similarity } of similarUsers) {
      const similarUserOrders = await prisma.order.findMany({
        where: {
          userId: similarUserId,
          status: { in: ['DELIVERED', 'PAYMENT_COMPLETED'] }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      })

      similarUserOrders.forEach(order => {
        order.items.forEach(item => {
          if (!userProductIds.has(item.productId)) {
            const currentScore = recommendations.get(item.productId) || 0
            recommendations.set(item.productId, currentScore + similarity)
          }
        })
      })
    }

    // 점수 순으로 정렬하여 상품 조회
    const sortedRecommendations = Array.from(recommendations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)

    const products = await this.getProductDetails(
      sortedRecommendations.map(([id]) => id)
    )

    return {
      products,
      algorithm: 'collaborative-filtering',
      confidence: Math.min(similarUsers.length / 5, 1) * 100,
      reason: '비슷한 취향의 고객들이 구매한 상품들입니다'
    }
  }

  /**
   * 컨텐츠 기반 필터링
   */
  private async contentBasedFiltering(
    userId: string,
    options: RecommendationOptions
  ): Promise<RecommendationResult> {
    const { limit = 10 } = options

    // 사용자 선호도 분석
    const userPreferences = await this.analyzeUserPreferences(userId)

    if (!userPreferences) {
      return this.getTrendingProducts(options)
    }

    // 선호도 기반 상품 검색
    const where: any = {
      status: 'ACTIVE'
    }

    // 선호 카테고리 필터
    if (userPreferences.preferredCategories.length > 0) {
      where.categoryId = { in: userPreferences.preferredCategories }
    }

    // 선호 가격대 필터
    if (userPreferences.avgPriceRange) {
      where.price = {
        gte: userPreferences.avgPriceRange.min,
        lte: userPreferences.avgPriceRange.max
      }
    }

    // 선호 태그 필터
    if (userPreferences.preferredTags.length > 0) {
      where.tags = { hasSome: userPreferences.preferredTags }
    }

    // 이미 구매한 상품 제외
    if (!options.includeViewed && userPreferences.purchasedProductIds.length > 0) {
      where.id = { notIn: userPreferences.purchasedProductIds }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        images: true,
        category: true,
        reviews: {
          select: { rating: true }
        },
        _count: {
          select: { reviews: true, orderItems: true }
        }
      },
      orderBy: [
        { orderItems: { _count: 'desc' } },
        { reviews: { _count: 'desc' } },
        { updatedAt: 'desc' }
      ],
      take: limit
    })

    const enrichedProducts = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0

      return {
        ...product,
        avgRating,
        reviewCount: product._count.reviews,
        salesCount: product._count.orderItems,
        mainImage: product.images[0]?.url
      }
    })

    return {
      products: enrichedProducts,
      algorithm: 'content-based',
      confidence: Math.min(userPreferences.orderCount / 3, 1) * 100,
      reason: '고객님의 구매 패턴을 분석한 맞춤 추천입니다'
    }
  }

  /**
   * 하이브리드 추천 (협업 + 컨텐츠 기반)
   */
  private async hybridRecommendation(
    userId: string,
    options: RecommendationOptions
  ): Promise<RecommendationResult> {
    const { limit = 10 } = options

    // 두 알고리즘의 결과를 가져와서 병합
    const [collaborative, contentBased] = await Promise.all([
      this.collaborativeFiltering(userId, { ...options, limit: limit * 2 }),
      this.contentBasedFiltering(userId, { ...options, limit: limit * 2 })
    ])

    // 점수 기반 병합
    const productScores = new Map<string, { product: any; score: number }>()

    // 협업 필터링 결과 (가중치 60%)
    collaborative.products.forEach((product, index) => {
      const score = (collaborative.products.length - index) * 0.6
      productScores.set(product.id, {
        product,
        score: (productScores.get(product.id)?.score || 0) + score
      })
    })

    // 컨텐츠 기반 결과 (가중치 40%)
    contentBased.products.forEach((product, index) => {
      const score = (contentBased.products.length - index) * 0.4
      const existing = productScores.get(product.id)
      productScores.set(product.id, {
        product: existing?.product || product,
        score: (existing?.score || 0) + score
      })
    })

    // 점수 순으로 정렬
    const sortedProducts = Array.from(productScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ product }) => product)

    return {
      products: sortedProducts,
      algorithm: 'hybrid',
      confidence: Math.max(collaborative.confidence, contentBased.confidence),
      reason: '개인화된 AI 추천 상품입니다'
    }
  }

  /**
   * 트렌딩 상품 (신규 사용자용)
   */
  private async getTrendingProducts(options: RecommendationOptions): Promise<RecommendationResult> {
    const { limit = 10, categoryFilter } = options

    const where: any = { status: 'ACTIVE' }
    
    if (categoryFilter && categoryFilter.length > 0) {
      where.categoryId = { in: categoryFilter }
    }

    // 최근 30일 베스트셀러
    const products = await prisma.product.findMany({
      where,
      include: {
        images: true,
        category: true,
        reviews: {
          select: { rating: true }
        },
        _count: {
          select: { 
            reviews: true,
            orderItems: {
              where: {
                order: {
                  createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { orderItems: { _count: 'desc' } },
        { reviews: { _count: 'desc' } },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    const enrichedProducts = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0

      return {
        ...product,
        avgRating,
        reviewCount: product._count.reviews,
        salesCount: product._count.orderItems,
        mainImage: product.images[0]?.url
      }
    })

    return {
      products: enrichedProducts,
      algorithm: 'trending',
      confidence: 85,
      reason: '지금 가장 인기있는 상품들입니다'
    }
  }

  /**
   * 비슷한 사용자 찾기
   */
  private async findSimilarUsers(userId: string, userProductIds: Set<string>) {
    // 간단한 자카드 유사도 계산
    const otherUsers = await prisma.order.findMany({
      where: {
        userId: { not: userId },
        status: { in: ['DELIVERED', 'PAYMENT_COMPLETED'] }
      },
      include: {
        items: {
          select: { productId: true }
        }
      },
      distinct: ['userId']
    })

    const similarities: any[] = []

    for (const order of otherUsers) {
      const otherUserProducts = new Set(order.items.map(item => item.productId))
      const intersection = new Set([...userProductIds].filter(id => otherUserProducts.has(id)))
      const union = new Set([...userProductIds, ...otherUserProducts])
      
      const similarity = intersection.size / union.size
      
      if (similarity > 0.1) { // 최소 10% 유사도
        similarities.push({
          userId: order.userId,
          similarity
        })
      }
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10) // 상위 10명
  }

  /**
   * 사용자 선호도 분석
   */
  private async analyzeUserPreferences(userId: string) {
    const orders = await prisma.order.findMany({
      where: {
        userId,
        status: { in: ['DELIVERED', 'PAYMENT_COMPLETED'] }
      },
      include: {
        items: {
          include: {
            product: {
              include: { category: true }
            }
          }
        }
      }
    })

    if (orders.length === 0) return null

    const categoryCount = new Map<string, number>()
    const tagCount = new Map<string, number>()
    const prices: number[] = []
    const purchasedProductIds: string[] = []

    orders.forEach(order => {
      order.items.forEach(item => {
        purchasedProductIds.push(item.productId)
        
        if (item.product.categoryId) {
          categoryCount.set(
            item.product.categoryId, 
            (categoryCount.get(item.product.categoryId) || 0) + 1
          )
        }

        item.product.tags.forEach(tag => {
          tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
        })

        prices.push(item.product.price)
      })
    })

    // 선호 카테고리 (상위 3개)
    const preferredCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([categoryId]) => categoryId)

    // 선호 태그 (상위 5개)
    const preferredTags = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag)

    // 평균 가격대
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const priceStdDev = Math.sqrt(
      prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length
    )

    return {
      orderCount: orders.length,
      preferredCategories,
      preferredTags,
      avgPriceRange: {
        min: Math.max(0, avgPrice - priceStdDev),
        max: avgPrice + priceStdDev
      },
      purchasedProductIds
    }
  }

  /**
   * 함께 구매한 상품 조회
   */
  private async getFrequentlyBoughtTogether(productId: string) {
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: { productId }
        }
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    })

    const coBoughtCount = new Map<string, number>()

    orders.forEach(order => {
      const hasTargetProduct = order.items.some(item => item.productId === productId)
      if (hasTargetProduct) {
        order.items.forEach(item => {
          if (item.productId !== productId) {
            coBoughtCount.set(
              item.productId,
              (coBoughtCount.get(item.productId) || 0) + 1
            )
          }
        })
      }
    })

    return Array.from(coBoughtCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => ({ id }))
  }

  /**
   * 같은 카테고리 인기 상품
   */
  private async getSameCategoryProducts(categoryId: string, limit: number) {
    return prisma.product.findMany({
      where: {
        categoryId,
        status: 'ACTIVE'
      },
      orderBy: {
        orderItems: { _count: 'desc' }
      },
      take: limit,
      select: { id: true }
    })
  }

  /**
   * 비슷한 태그 상품
   */
  private async getSimilarTagProducts(tags: string[], limit: number) {
    return prisma.product.findMany({
      where: {
        tags: { hasSome: tags },
        status: 'ACTIVE'
      },
      orderBy: {
        reviews: { _count: 'desc' }
      },
      take: limit,
      select: { id: true }
    })
  }

  /**
   * 비슷한 가격대 상품
   */
  private async getSimilarPriceProducts(price: number, limit: number) {
    const priceRange = price * 0.3 // ±30%
    
    return prisma.product.findMany({
      where: {
        price: {
          gte: price - priceRange,
          lte: price + priceRange
        },
        status: 'ACTIVE'
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: limit,
      select: { id: true }
    })
  }

  /**
   * 상품 상세 정보 조회
   */
  private async getProductDetails(productIds: string[]) {
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'ACTIVE'
      },
      include: {
        images: true,
        category: true,
        reviews: {
          select: { rating: true }
        },
        _count: {
          select: { reviews: true, orderItems: true }
        }
      }
    })

    return products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0

      return {
        ...product,
        avgRating,
        reviewCount: product._count.reviews,
        salesCount: product._count.orderItems,
        mainImage: product.images[0]?.url
      }
    })
  }

  /**
   * 추천 성능 분석 (A/B 테스트용)
   */
  async trackRecommendationClick(userId: string, productId: string, algorithm: string) {
    await redis.hincrby(`rec_performance:${algorithm}`, 'clicks', 1)
    await redis.hincrby(`rec_performance:${algorithm}:${userId}`, 'clicks', 1)
  }

  async trackRecommendationPurchase(userId: string, productId: string, algorithm: string) {
    await redis.hincrby(`rec_performance:${algorithm}`, 'purchases', 1)
    await redis.hincrby(`rec_performance:${algorithm}:${userId}`, 'purchases', 1)
  }
}

export const recommendationEngineService = new RecommendationEngineService()