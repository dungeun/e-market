/**
 * 홈페이지 섹션 관리 서비스
 * 어드민에서 섹션을 관리하고 홈페이지에서 렌더링
 */

import { CustomSection, UIConfig } from '@/lib/stores/ui-config.store'

// Prisma 싱글톤 패턴
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export class SectionService {
  private static readonly CACHE_KEY = 'home:sections'
  private static readonly CACHE_TTL = 300 // 5분

  /**
   * 활성화된 섹션 목록 조회 (어드민에서 설정한 UI 컨피그 사용)
   */
  static async getActiveSections(): Promise<CustomSection[]> {
    try {

      // DB에서 UI 설정 조회
      const uiConfigRecord = await query({
        where: { key: 'product-sections-config' }
      })

      let config: UIConfig
      
      if (uiConfigRecord) {
        config = JSON.parse(uiConfigRecord.value)

      } else {

        // 기본 API 응답에서 기본 설정 가져오기
        const defaultResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/ui-config`)
        const defaultData = await defaultResponse.json()
        config = defaultData.config
      }

      // 활성화된 섹션만 필터링하고 순서대로 정렬
      const activeSections = config.mainPage.customSections
        .filter(section => section.visible)
        .sort((a, b) => a.order - b.order)

      console.log(`📋 Returning ${activeSections.length} active sections:`, activeSections.map(s => s.title))
      return activeSections
    } catch (error) {

      // 에러 발생시 기본 섹션 반환

      const defaultSections = [
        {
          id: 'hero',
          title: '히어로 섹션',
          subtitle: '메인 배너',
          type: 'manual' as const,
          visible: true,
          order: 1,
          layout: 'grid' as const,
          columns: 1,
          rows: 1
        },
        {
          id: 'featured',
          title: '추천 상품',
          subtitle: '큐레이션된 추천 상품',
          type: 'auto' as const,
          visible: true,
          order: 2,
          layout: 'grid' as const,
          columns: 4,
          rows: 2
        }
      ]
      return defaultSections
    }
  }

  /**
   * 섹션별 데이터 조회 (어드민 UI 컨피그 섹션 타입 지원)
   */
  static async getSectionData(section: CustomSection, userId?: string): Promise<unknown> {
    try {
      // CustomSection에서는 type이 'manual' | 'auto'이므로 
      // id나 title을 기반으로 섹션 유형을 결정
      const sectionType = section.id || section.title.toLowerCase()
      
      switch (sectionType) {
        case 'hero':
          return this.getHeroBannerData(section.filter)
        
        case 'featured':
          return this.getFeaturedProducts(section.filter)
        
        case 'flash-sale':
          return this.getFlashSaleProducts(section.filter)
        
        case 'categories':
          return this.getCategoryData(section.filter)
        
        case 'bestsellers':
          return this.getBestSellers(section.filter)
        
        case 'new-arrivals':
          return this.getNewArrivals(section.filter)
        
        case 'recommended':
          return this.getRecommendedProducts(userId, section.filter)
        
        case 'brand-spotlight':
          return this.getBrandData(section.filter)
        
        case 'trending':
          return this.getTrendingProducts(section.filter)
        
        case 'special-offers':
          return this.getSpecialOffers(section.filter)
        
        case 'newsletter':
          return this.getNewsletterData(section.filter)
        
        case 'testimonial':
          return this.getTestimonialData(section.filter)
        
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

  private static async getRecentlyViewed(userId?: string, config?: unknown) {
    if (!userId) return { products: [] }
    
    const mockProducts = [
      {
        id: 'recent1',
        name: '최근 본 상품 1',
        slug: 'recently-viewed-1',
        price: 55000,
        images: [{ url: '/images/products/recent1.jpg', alt: 'Recently Viewed 1' }]
      }
    ]
    return { products: mockProducts.slice(0, config?.limit || 6) }
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

  private static async getSeasonalCollection(config: unknown) {
    const mockProducts = [
      {
        id: 'season1',
        name: '겨울 컬렉션 1',
        slug: 'winter-collection-1',
        price: 125000,
        season: '겨울',
        images: [{ url: '/images/products/season1.jpg', alt: 'Winter Collection 1' }]
      }
    ]
    return mockProducts.slice(0, config?.limit || 8)
  }

  private static async getTestimonials(config: unknown) {
    return {
      reviews: [
        {
          id: 1,
          rating: 5,
          comment: '정말 만족스러운 쇼핑이었습니다!',
          userName: '김**',
          productName: '프리미엄 상품',
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          rating: 5, 
          comment: '품질이 정말 좋아요!',
          userName: '이**',
          productName: '베스트 상품',
          createdAt: '2024-01-14'
        }
      ]
    }
  }

  private static async getVideoData(config: unknown) {
    return {
      videos: [
        {
          id: 1,
          title: '제품 소개 영상',
          thumbnail: '/images/videos/video1-thumb.jpg',
          videoUrl: '/videos/product-intro.mp4',
          duration: '2:30'
        },
        {
          id: 2,
          title: '브랜드 스토리',
          thumbnail: '/images/videos/video2-thumb.jpg', 
          videoUrl: '/videos/brand-story.mp4',
          duration: '3:15'
        }
      ]
    }
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

  private static async getInstagramData(config: unknown) {
    return {
      posts: [
        {
          id: 1,
          image: '/images/instagram/1.jpg',
          likes: 324,
          comments: 12,
          caption: '새로운 컬렉션 출시!'
        },
        {
          id: 2,
          image: '/images/instagram/2.jpg', 
          likes: 512,
          comments: 23,
          caption: '오늘의 스타일링'
        },
        {
          id: 3,
          image: '/images/instagram/3.jpg',
          likes: 287,
          comments: 8,
          caption: '베스트 아이템'
        },
        {
          id: 4,
          image: '/images/instagram/4.jpg',
          likes: 892,
          comments: 45,
          caption: '고객님 후기'
        }
      ]
    }
  }

  private static async getBannerData(config: unknown) {
    return {
      banners: [
        {
          id: 1,
          image: '/images/banners/banner1.jpg',
          link: '/sale/winter',
          alt: '겨울 세일 배너'
        },
        {
          id: 2,
          image: '/images/banners/banner2.jpg',
          link: '/collections/new',
          alt: '신상품 배너'
        },
        {
          id: 3,
          image: '/images/banners/banner3.jpg',
          link: '/brands/featured',
          alt: '브랜드 특집 배너'
        },
        {
          id: 4,
          image: '/images/banners/banner4.jpg',
          link: '/events/special',
          alt: '특별 이벤트 배너'
        }
      ]
    }
  }
}