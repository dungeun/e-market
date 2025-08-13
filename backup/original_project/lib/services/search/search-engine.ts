/**
 * 고급 검색 엔진 서비스
 * Elasticsearch 기반 상품 검색, 필터링, 자동완성
 */

import { PrismaClient } from '@prisma/client'
import Redis from 'ioredis'

const prisma = new PrismaClient()
const redis = new Redis(process.env.REDIS_URL!)

export interface SearchQuery {
  query?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  ratings?: number
  tags?: string[]
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
  page?: number
  limit?: number
}

export interface SearchFilters {
  categories: Array<{ id: string; name: string; count: number }>
  brands: Array<{ id: string; name: string; count: number }>
  priceRanges: Array<{ min: number; max: number; count: number }>
  tags: Array<{ name: string; count: number }>
}

export interface SearchResult {
  products: any[]
  total: number
  filters: SearchFilters
  suggestions: string[]
  took: number // 검색 시간 (ms)
}

export class SearchEngineService {
  private readonly CACHE_TTL = 300 // 5분

  /**
   * 상품 검색
   */
  async search(params: SearchQuery): Promise<SearchResult> {
    const startTime = Date.now()
    
    // 캐시 키 생성
    const cacheKey = `search:${JSON.stringify(params)}`
    const cached = await redis.get(cacheKey)
    
    if (cached) {
      return JSON.parse(cached)
    }

    const {
      query = '',
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      ratings,
      tags = [],
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = params

    // 기본 검색 조건 구성
    const where: any = {
      status: 'ACTIVE'
    }

    // 텍스트 검색
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: query.split(' ') } },
        { sku: { contains: query, mode: 'insensitive' } }
      ]
    }

    // 카테고리 필터
    if (category) {
      where.categoryId = category
    }

    // 브랜드 필터 (assuming brand field exists)
    if (brand) {
      where.brand = brand
    }

    // 가격 범위
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    // 재고 필터
    if (inStock) {
      where.stock = { gt: 0 }
    }

    // 태그 필터
    if (tags.length > 0) {
      where.tags = { hasSome: tags }
    }

    // 정렬 조건
    const orderBy = this.buildOrderBy(sortBy, query)

    // 상품 검색 실행
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: true,
          reviews: {
            select: {
              rating: true
            }
          },
          _count: {
            select: {
              reviews: true,
              orderItems: true
            }
          }
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    // 검색 결과 정보 보강
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

    // 필터 정보 생성
    const filters = await this.generateFilters(where, query)

    // 검색 추천어 생성
    const suggestions = await this.generateSuggestions(query)

    const result: SearchResult = {
      products: enrichedProducts,
      total: totalCount,
      filters,
      suggestions,
      took: Date.now() - startTime
    }

    // 결과 캐싱
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result))

    // 검색 로그 저장
    await this.logSearch(query, totalCount, Date.now() - startTime)

    return result
  }

  /**
   * 자동완성 검색
   */
  async autocomplete(query: string, limit = 10): Promise<string[]> {
    if (!query || query.length < 2) return []

    const cacheKey = `autocomplete:${query}:${limit}`
    const cached = await redis.get(cacheKey)
    
    if (cached) {
      return JSON.parse(cached)
    }

    // 상품명에서 자동완성 후보 추출
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        name: true,
        tags: true
      },
      take: limit * 2
    })

    // 중복 제거하고 관련성 순으로 정렬
    const suggestions = new Set<string>()
    
    products.forEach(product => {
      // 상품명 전체
      suggestions.add(product.name)
      
      // 상품명의 단어들
      product.name.split(' ').forEach(word => {
        if (word.toLowerCase().includes(query.toLowerCase()) && word.length > 2) {
          suggestions.add(word)
        }
      })
      
      // 관련 태그
      product.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query.toLowerCase()) && tag.length > 2) {
          suggestions.add(tag)
        }
      })
    })

    const result = Array.from(suggestions)
      .slice(0, limit)
      .sort((a, b) => {
        // 정확히 일치하는 것을 우선
        const aExact = a.toLowerCase().startsWith(query.toLowerCase())
        const bExact = b.toLowerCase().startsWith(query.toLowerCase())
        
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        
        // 길이 순 정렬
        return a.length - b.length
      })

    // 결과 캐싱 (1분)
    await redis.setex(cacheKey, 60, JSON.stringify(result))

    return result
  }

  /**
   * 인기 검색어 조회
   */
  async getPopularSearches(limit = 10): Promise<Array<{ query: string; count: number }>> {
    const cacheKey = `popular_searches:${limit}`
    const cached = await redis.get(cacheKey)
    
    if (cached) {
      return JSON.parse(cached)
    }

    // Redis에서 검색 빈도 조회
    const searches = await redis.zrevrange('search_frequency', 0, limit - 1, 'WITHSCORES')
    
    const result: any[] = []
    for (let i = 0; i < searches.length; i += 2) {
      result.push({
        query: searches[i],
        count: parseInt(searches[i + 1])
      })
    }

    // 10분간 캐싱
    await redis.setex(cacheKey, 600, JSON.stringify(result))

    return result
  }

  /**
   * 검색 필터 생성
   */
  private async generateFilters(baseWhere: any, query?: string): Promise<SearchFilters> {
    // 카테고리 필터
    const categories = await prisma.product.groupBy({
      by: ['categoryId'],
      where: baseWhere,
      _count: {
        id: true
      }
    })

    const categoryDetails = await prisma.category.findMany({
      where: {
        id: { in: categories.map(c => c.categoryId).filter((id): id is string => id !== null) }
      }
    })

    // 가격 범위 분석
    const priceStats = await prisma.product.aggregate({
      where: baseWhere,
      _min: { price: true },
      _max: { price: true }
    })

    const priceRanges = this.generatePriceRanges(
      priceStats._min.price || 0,
      priceStats._max.price || 0
    )

    // 태그 분석
    const products = await prisma.product.findMany({
      where: baseWhere,
      select: { tags: true }
    })

    const tagCounts = new Map<string, number>()
    products.forEach(product => {
      product.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })

    return {
      categories: categoryDetails.map(cat => ({
        id: cat.id,
        name: cat.name,
        count: categories.find(c => c.categoryId === cat.id)?._count.id || 0
      })),
      brands: [], // TODO: 브랜드 필터 구현
      priceRanges,
      tags: Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([name, count]) => ({ name, count }))
    }
  }

  /**
   * 검색 추천어 생성
   */
  private async generateSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return []

    // 유사한 검색어 찾기
    const similarQueries = await redis.zrevrange('search_frequency', 0, 100)
    
    return similarQueries
      .filter(q => 
        q.toLowerCase().includes(query.toLowerCase()) && 
        q.toLowerCase() !== query.toLowerCase()
      )
      .slice(0, 5)
  }

  /**
   * 정렬 조건 구성
   */
  private buildOrderBy(sortBy: string, query?: string): any {
    switch (sortBy) {
      case 'price_asc':
        return { price: 'asc' }
      case 'price_desc':
        return { price: 'desc' }
      case 'rating':
        return [
          { reviews: { _count: 'desc' } },
          { updatedAt: 'desc' }
        ]
      case 'newest':
        return { createdAt: 'desc' }
      case 'relevance':
      default:
        // 텍스트 검색인 경우 관련성 순, 아니면 인기도 순
        return query
          ? [
              { orderItems: { _count: 'desc' } }, // 판매량
              { updatedAt: 'desc' }
            ]
          : [
              { orderItems: { _count: 'desc' } }, // 인기도
              { reviews: { _count: 'desc' } },   // 리뷰 수
              { updatedAt: 'desc' }              // 최신순
            ]
    }
  }

  /**
   * 가격 범위 생성
   */
  private generatePriceRanges(minPrice: number, maxPrice: number) {
    if (maxPrice - minPrice <= 0) return []

    const ranges: any[] = []
    const step = Math.ceil((maxPrice - minPrice) / 5)
    
    for (let i = 0; i < 5; i++) {
      const min = minPrice + (step * i)
      const max = i === 4 ? maxPrice : minPrice + (step * (i + 1)) - 1
      
      ranges.push({
        min,
        max,
        count: 0 // TODO: 각 범위별 실제 상품 수 계산
      })
    }

    return ranges
  }

  /**
   * 검색 로그 저장
   */
  private async logSearch(query: string, resultCount: number, duration: number) {
    if (!query) return

    // Redis에 검색 빈도 저장
    await redis.zincrby('search_frequency', 1, query.toLowerCase())

    // 검색 통계 저장 (옵션)
    const today = new Date().toISOString().split('T')[0]
    await redis.hincrby(`search_stats:${today}`, 'total_searches', 1)
    await redis.hincrby(`search_stats:${today}`, 'total_results', resultCount)
    await redis.hincrbyfloat(`search_stats:${today}`, 'total_duration', duration)
  }

  /**
   * 검색 인덱스 재구성 (관리자용)
   */
  async rebuildSearchIndex(): Promise<void> {
    // 상품별 검색 가중치 업데이트
    const products = await prisma.product.findMany({
      include: {
        _count: {
          select: {
            reviews: true,
            orderItems: true,
            wishlistItems: true
          }
        }
      }
    })

    for (const product of products) {
      const searchWeight = this.calculateSearchWeight(product)
      
      // 검색 가중치를 Redis에 저장
      await redis.zadd('product_search_weight', searchWeight, product.id)
    }
  }

  /**
   * 상품 검색 가중치 계산
   */
  private calculateSearchWeight(product: any): number {
    let weight = 0
    
    // 판매량 가중치 (50%)
    weight += (product._count.orderItems || 0) * 0.5
    
    // 리뷰 수 가중치 (20%)
    weight += (product._count.reviews || 0) * 0.2
    
    // 위시리스트 가중치 (10%)
    weight += (product._count.wishlistItems || 0) * 0.1
    
    // 최신성 가중치 (20%)
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    weight += Math.max(0, 100 - daysSinceCreated) * 0.2
    
    return weight
  }
}

export const searchEngineService = new SearchEngineService()