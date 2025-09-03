/**
 * 홈페이지 섹션 관리 서비스
 * 어드민에서 섹션을 관리하고 홈페이지에서 렌더링
 */

import { prisma } from '@/lib/db'

export interface ProductSection {
  id: string
  type: 'hero' | 'featured' | 'flash-sale' | 'categories' | 'bestsellers' | 'new-arrivals' | 
        'recommended' | 'brand-spotlight' | 'trending' | 'special-offers' | 'newsletter' | 'testimonial'
  name: string
  description: string
  enabled: boolean
  order: number
  config: any
}

export interface UIConfig {
  sections: ProductSection[]
}

export class SectionService {
  private static readonly CACHE_KEY = 'home:sections'
  private static readonly CACHE_TTL = 300 // 5분

  /**
   * 활성화된 섹션 목록 조회 (어드민에서 설정한 UI 컨피그 사용)
   */
  static async getActiveSections(): Promise<ProductSection[]> {
    try {

      // DB에서 UI 설정 조회
      const uiConfigRecord = await query({
        where: { key: 'product-sections-config' }
      })

      let config: UIConfig
      
      if (uiConfigRecord) {
        config = JSON.parse(uiConfigRecord.value)

      } else {

        // 기본 설정 반환
        config = this.getDefaultConfig()
      }

      // 활성화된 섹션만 필터링하고 순서대로 정렬
      const activeSections = config.sections
        .filter(section => section.enabled)
        .sort((a, b) => a.order - b.order)

      console.log(`📋 Returning ${activeSections.length} active sections:`, activeSections.map(s => s.name))
      return activeSections
    } catch (error) {

      // 에러 발생시 기본 섹션 반환

      return this.getDefaultConfig().sections.filter(s => s.enabled)
    }
  }

  /**
   * 기본 UI 설정
   */
  private static getDefaultConfig(): UIConfig {
    return {
      sections: [
        {
          id: 'hero',
          type: 'hero' as const,
          name: '히어로 섹션',
          description: '메인 배너',
          enabled: true,
          order: 1,
          config: {
            slides: [{
              id: 'slide-1',
              title: '특별한 할인 혜택',
              subtitle: '최대 70% 할인된 상품을 만나보세요',
              image: '/images/hero/slide1.svg',
              link: '/products',
              buttonText: '지금 쇼핑하기'
            }],
            autoplay: true,
            interval: 5000,
            height: '600px'
          }
        },
        {
          id: 'featured',
          type: 'featured' as const,
          name: '추천 상품',
          description: '큐레이션된 추천 상품',
          enabled: true,
          order: 2,
          config: {
            title: '추천 상품',
            subtitle: '엄선된 상품을 만나보세요',
            limit: 8,
            columns: 4
          }
        }
      ]
    }
  }

  /**
   * 섹션별 데이터 조회 (어드민 UI 컨피그 섹션 타입 지원)
   */
  static async getSectionData(section: ProductSection, userId?: string): Promise<unknown> {
    try {
      switch (section.type) {
        case 'hero':
          return this.getHeroBannerData(section.config)
        
        case 'featured':
          return this.getFeaturedProducts(section.config)
        
        case 'flash-sale':
          return this.getFlashSaleProducts(section.config)
        
        case 'categories':
          return this.getCategoryData(section.config)
        
        case 'bestsellers':
          return this.getBestSellers(section.config)
        
        case 'new-arrivals':
          return this.getNewArrivals(section.config)
        
        case 'recommended':
          return this.getRecommendedProducts(userId, section.config)
        
        case 'brand-spotlight':
          return this.getBrandData(section.config)
        
        case 'trending':
          return this.getTrendingProducts(section.config)
        
        case 'special-offers':
          return this.getSpecialOffers(section.config)
        
        case 'newsletter':
          return this.getNewsletterData(section.config)
        
        case 'testimonial':
          return this.getTestimonialData(section.config)
        
        default:

          return null
      }
    } catch (error) {

      return null
    }
  }

  // Mock 데이터 메서드들
  private static async getHeroBannerData(config: unknown) {
    return {
      slides: [
        {
          id: 1,
          title: "새로운 컬렉션",
          subtitle: "2024 겨울 신상품",
          image: "/images/hero/slide1.jpg",
          link: "/collections/winter-2024"
        },
        {
          id: 2,
          title: "특별 할인",
          subtitle: "최대 50% 할인",
          image: "/images/hero/slide2.jpg", 
          link: "/sale"
        }
      ]
    }
  }

  private static async getFeaturedProducts(config: unknown) {
    const mockProducts = [
      {
        id: 'featured1',
        name: '추천 상품 1',
        slug: 'featured-product-1',
        price: 89000,
        images: [{ url: '/placeholder.svg', alt: 'Featured 1' }]
      },
      {
        id: 'featured2',
        name: '추천 상품 2', 
        slug: 'featured-product-2',
        price: 125000,
        images: [{ url: '/placeholder.svg', alt: 'Featured 2' }]
      },
      {
        id: 'featured3',
        name: '추천 상품 3',
        slug: 'featured-product-3', 
        price: 67000,
        images: [{ url: '/placeholder.svg', alt: 'Featured 3' }]
      },
      {
        id: 'featured4',
        name: '추천 상품 4',
        slug: 'featured-product-4',
        price: 98000,
        images: [{ url: '/placeholder.svg', alt: 'Featured 4' }]
      }
    ]
    return mockProducts.slice(0, config?.limit || 4)
  }

  private static async getFlashSaleProducts(config: unknown) {
    const mockProducts = [
      {
        id: 'flash1',
        name: '플래시 세일 상품 1',
        slug: 'flash-sale-1',
        price: 50000,
        originalPrice: 100000,
        discount: 50,
        images: [{ url: '/images/products/flash1.jpg', alt: 'Flash Sale 1' }]
      },
      {
        id: 'flash2',
        name: '플래시 세일 상품 2',
        slug: 'flash-sale-2', 
        price: 30000,
        originalPrice: 60000,
        discount: 50,
        images: [{ url: '/images/products/flash2.jpg', alt: 'Flash Sale 2' }]
      }
    ]
    return mockProducts.slice(0, config?.limit || 4)
  }

  private static async getCategoryData(config: unknown) {
    return {
      categories: [
        { id: 1, name: '패션', image: '/images/categories/fashion.jpg', link: '/category/fashion' },
        { id: 2, name: '전자제품', image: '/images/categories/electronics.jpg', link: '/category/electronics' },
        { id: 3, name: '홈&리빙', image: '/images/categories/home.jpg', link: '/category/home' },
        { id: 4, name: '스포츠', image: '/images/categories/sports.jpg', link: '/category/sports' }
      ]
    }
  }

  private static async getBestSellers(config: unknown) {
    const mockProducts = [
      {
        id: 'best1',
        name: '베스트셀러 1',
        slug: 'bestseller-1',
        price: 75000,
        ranking: 1,
        images: [{ url: '/images/products/best1.jpg', alt: 'Bestseller 1' }]
      },
      {
        id: 'best2', 
        name: '베스트셀러 2',
        slug: 'bestseller-2',
        price: 89000,
        ranking: 2,
        images: [{ url: '/images/products/best2.jpg', alt: 'Bestseller 2' }]
      }
    ]
    return mockProducts.slice(0, config?.limit || 8)
  }

  private static async getNewArrivals(config: unknown) {
    const mockProducts = [
      {
        id: 'new1',
        name: '신상품 1',
        slug: 'new-arrival-1',
        price: 65000,
        isNew: true,
        images: [{ url: '/images/products/new1.jpg', alt: 'New Arrival 1' }]
      },
      {
        id: 'new2',
        name: '신상품 2',
        slug: 'new-arrival-2',
        price: 78000,
        isNew: true,
        images: [{ url: '/images/products/new2.jpg', alt: 'New Arrival 2' }]
      }
    ]
    return mockProducts.slice(0, config?.limit || 8)
  }

  private static async getRecommendedProducts(userId?: string, config?: unknown) {
    const mockProducts = [
      {
        id: 'rec1',
        name: '추천 상품 A',
        slug: 'recommended-a',
        price: 95000,
        rating: 4.8,
        images: [{ url: '/images/products/rec1.jpg', alt: 'Recommended A' }]
      }
    ]
    return mockProducts.slice(0, config?.limit || 8)
  }

  private static async getBrandData(config: unknown) {
    return {
      brands: [
        { id: 1, name: 'Brand A', logo: '/images/brands/brand-a.jpg', link: '/brands/brand-a' },
        { id: 2, name: 'Brand B', logo: '/images/brands/brand-b.jpg', link: '/brands/brand-b' }
      ]
    }
  }

  private static async getTrendingProducts(config: unknown) {
    const mockProducts = [
      {
        id: 'trend1',
        name: '트렌딩 상품 1',
        slug: 'trending-1', 
        price: 85000,
        trendScore: 98,
        images: [{ url: '/images/products/trend1.jpg', alt: 'Trending 1' }]
      }
    ]
    return mockProducts.slice(0, config?.limit || 8)
  }

  private static async getSpecialOffers(config: unknown) {
    const mockProducts = [
      {
        id: 'offer1',
        name: '특가 상품 1',
        slug: 'special-offer-1',
        price: 45000,
        originalPrice: 90000,
        discount: 50,
        images: [{ url: '/images/products/offer1.jpg', alt: 'Special Offer 1' }]
      }
    ]
    return mockProducts.slice(0, config?.limit || 6)
  }

  private static async getNewsletterData(config: unknown) {
    return {
      title: '특별 혜택을 받아보세요',
      subtitle: '신상품 소식과 할인 쿠폰을 이메일로 받아보세요',
      placeholder: '이메일 주소를 입력하세요',
      buttonText: '구독하기',
      benefits: [
        '신상품 출시 소식 우선 전달',
        '회원 전용 할인 쿠폰 제공',
        '특별 이벤트 초대'
      ]
    }
  }

  private static async getTestimonialData(config: unknown) {
    return {
      testimonials: [
        {
          id: '1',
          rating: 5,
          content: '정말 만족스러운 쇼핑이었습니다! 품질도 좋고 배송도 빨라서 너무 좋았어요.',
          author: {
            name: '김민지',
            role: '디자이너',
            avatar: '/placeholder.svg'
          }
        },
        {
          id: '2',
          rating: 5,
          content: '가격 대비 품질이 정말 훌륭합니다. 다음에도 또 구매하고 싶어요!',
          author: {
            name: '이준호',
            role: '개발자',
            avatar: '/placeholder.svg'
          }
        },
        {
          id: '3',
          rating: 5,
          content: '고객 서비스가 정말 친절하고 전문적이었습니다. 강력 추천합니다!',
          author: {
            name: '박서연',
            role: '마케터',
            avatar: '/placeholder.svg'
          }
        }
      ],
      overallRating: config?.overallRating || 4.9,
      totalReviews: config?.totalReviews || 3500
    }
  }
}