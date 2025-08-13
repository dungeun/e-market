/**
 * 홈페이지 섹션 설정 - 상품 중심 커머스 섹션
 */

export interface HomeSection {
  id: string
  name: string
  type: SectionType
  enabled: boolean
  order: number
  config?: any
}

export enum SectionType {
  HERO_BANNER = 'hero_banner',
  FEATURED_PRODUCTS = 'featured_products',
  NEW_ARRIVALS = 'new_arrivals',
  BEST_SELLERS = 'best_sellers',
  CATEGORY_SHOWCASE = 'category_showcase',
  FLASH_SALE = 'flash_sale',
  BRAND_SPOTLIGHT = 'brand_spotlight',
  RECOMMENDED = 'recommended',
  RECENTLY_VIEWED = 'recently_viewed',
  TRENDING_NOW = 'trending_now',
  SPECIAL_OFFERS = 'special_offers',
  SEASONAL_COLLECTION = 'seasonal_collection',
  VIDEO_SHOWCASE = 'video_showcase',
  TESTIMONIALS = 'testimonials',
  NEWSLETTER = 'newsletter',
  BANNER_GRID = 'banner_grid',
  INSTAGRAM_FEED = 'instagram_feed'
}

// 기본 홈페이지 섹션 구성
export const defaultHomeSections: HomeSection[] = [
  {
    id: 'hero-main',
    name: '메인 히어로 배너',
    type: SectionType.HERO_BANNER,
    enabled: true,
    order: 1,
    config: {
      slides: [
        {
          id: 1,
          title: '겨울 시즌 특별 세일',
          subtitle: '최대 70% 할인',
          image: '/images/hero/winter-sale.jpg',
          link: '/sale/winter',
          buttonText: '지금 쇼핑하기',
          buttonStyle: 'primary',
          textColor: '#ffffff',
          overlayOpacity: 0.4
        },
        {
          id: 2,
          title: '신상품 입고',
          subtitle: '2024 S/S 컬렉션',
          image: '/images/hero/new-collection.jpg',
          link: '/collections/new',
          buttonText: '컬렉션 보기',
          buttonStyle: 'outline',
          textColor: '#000000',
          overlayOpacity: 0.2
        }
      ],
      autoplay: true,
      interval: 5000,
      height: '600px',
      mobileHeight: '400px'
    }
  },
  {
    id: 'flash-sale',
    name: '플래시 세일',
    type: SectionType.FLASH_SALE,
    enabled: true,
    order: 2,
    config: {
      title: '⚡ 오늘의 특가',
      subtitle: '24시간 한정 특별 할인',
      endTime: '2024-12-31T23:59:59',
      productIds: [], // 자동으로 할인율 높은 상품 선택
      limit: 4,
      showTimer: true,
      backgroundColor: '#ff4444',
      textColor: '#ffffff'
    }
  },
  {
    id: 'featured-products',
    name: '추천 상품',
    type: SectionType.FEATURED_PRODUCTS,
    enabled: true,
    order: 3,
    config: {
      title: '이 달의 추천 상품',
      subtitle: 'MD가 엄선한 베스트 아이템',
      productIds: [], // 어드민에서 선택
      limit: 8,
      columns: 4,
      mobileColumns: 2,
      showBadge: true,
      badgeText: 'MD추천'
    }
  },
  {
    id: 'category-showcase',
    name: '카테고리 쇼케이스',
    type: SectionType.CATEGORY_SHOWCASE,
    enabled: true,
    order: 4,
    config: {
      title: '카테고리별 쇼핑',
      categories: [
        { id: 'fashion', name: '패션', icon: '👔', image: '/images/cat/fashion.jpg' },
        { id: 'beauty', name: '뷰티', icon: '💄', image: '/images/cat/beauty.jpg' },
        { id: 'electronics', name: '전자제품', icon: '📱', image: '/images/cat/electronics.jpg' },
        { id: 'home', name: '홈/리빙', icon: '🏠', image: '/images/cat/home.jpg' },
        { id: 'sports', name: '스포츠', icon: '⚽', image: '/images/cat/sports.jpg' },
        { id: 'food', name: '식품', icon: '🍽️', image: '/images/cat/food.jpg' }
      ],
      layout: 'grid', // grid, carousel, list
      showProductCount: true
    }
  },
  {
    id: 'new-arrivals',
    name: '신상품',
    type: SectionType.NEW_ARRIVALS,
    enabled: true,
    order: 5,
    config: {
      title: '새로 들어온 상품',
      subtitle: '이번 주 신상품을 만나보세요',
      daysLimit: 7, // 최근 7일 이내 등록 상품
      limit: 12,
      sortBy: 'createdAt',
      layout: 'carousel',
      showArrivalDate: true
    }
  },
  {
    id: 'best-sellers',
    name: '베스트셀러',
    type: SectionType.BEST_SELLERS,
    enabled: true,
    order: 6,
    config: {
      title: '🔥 베스트셀러',
      subtitle: '가장 많이 팔린 상품',
      period: 'week', // day, week, month, all
      limit: 10,
      showRanking: true,
      showSalesCount: false,
      categoryFilter: null // null = all categories
    }
  },
  {
    id: 'brand-spotlight',
    name: '브랜드 스포트라이트',
    type: SectionType.BRAND_SPOTLIGHT,
    enabled: true,
    order: 7,
    config: {
      title: '이 주의 브랜드',
      brandId: null, // 어드민에서 선택
      showBrandStory: true,
      productLimit: 6,
      layout: 'showcase', // showcase, grid, carousel
      backgroundColor: '#f8f9fa'
    }
  },
  {
    id: 'trending-now',
    name: '트렌딩',
    type: SectionType.TRENDING_NOW,
    enabled: true,
    order: 8,
    config: {
      title: '🔥 지금 뜨는 상품',
      subtitle: '실시간 인기 급상승',
      algorithm: 'views_velocity', // views_velocity, search_velocity, cart_velocity
      timeWindow: 24, // hours
      limit: 8,
      showTrendingScore: true,
      updateInterval: 3600000 // 1시간마다 업데이트
    }
  },
  {
    id: 'seasonal-collection',
    name: '시즌 컬렉션',
    type: SectionType.SEASONAL_COLLECTION,
    enabled: false,
    order: 9,
    config: {
      title: '겨울 컬렉션',
      subtitle: '따뜻한 겨울을 위한 특별한 선택',
      collectionId: null, // 어드민에서 선택
      backgroundImage: '/images/seasonal/winter.jpg',
      layout: 'masonry',
      limit: 12
    }
  },
  {
    id: 'recommended',
    name: 'AI 추천 상품',
    type: SectionType.RECOMMENDED,
    enabled: true,
    order: 10,
    config: {
      title: '당신을 위한 추천',
      subtitle: 'AI가 분석한 맞춤 상품',
      algorithm: 'collaborative_filtering',
      limit: 8,
      personalized: true,
      fallbackToPopular: true // 비로그인 시 인기상품으로 대체
    }
  },
  {
    id: 'special-offers',
    name: '특별 할인',
    type: SectionType.SPECIAL_OFFERS,
    enabled: true,
    order: 11,
    config: {
      title: '특별 할인 상품',
      subtitle: '놓치면 후회하는 특가 찬스',
      minDiscount: 30, // 30% 이상 할인 상품만
      limit: 6,
      showOriginalPrice: true,
      showDiscountPercentage: true,
      highlightColor: '#ff0000'
    }
  },
  {
    id: 'banner-grid',
    name: '배너 그리드',
    type: SectionType.BANNER_GRID,
    enabled: true,
    order: 12,
    config: {
      layout: '2x2', // 2x2, 1x3, 2x1, custom
      banners: [
        {
          id: 1,
          image: '/images/banners/free-shipping.jpg',
          link: '/info/shipping',
          alt: '무료배송'
        },
        {
          id: 2,
          image: '/images/banners/membership.jpg',
          link: '/membership',
          alt: '회원 혜택'
        },
        {
          id: 3,
          image: '/images/banners/gift.jpg',
          link: '/gift',
          alt: '선물하기'
        },
        {
          id: 4,
          image: '/images/banners/coupon.jpg',
          link: '/coupons',
          alt: '쿠폰존'
        }
      ],
      spacing: 10,
      rounded: true
    }
  },
  {
    id: 'recently-viewed',
    name: '최근 본 상품',
    type: SectionType.RECENTLY_VIEWED,
    enabled: true,
    order: 13,
    config: {
      title: '최근 본 상품',
      limit: 6,
      showViewedTime: false,
      layout: 'horizontal-scroll',
      cookieBased: true // 비로그인 사용자도 추적
    }
  },
  {
    id: 'video-showcase',
    name: '비디오 쇼케이스',
    type: SectionType.VIDEO_SHOWCASE,
    enabled: false,
    order: 14,
    config: {
      title: '상품 영상',
      videos: [
        {
          id: 1,
          videoUrl: '/videos/product-demo.mp4',
          thumbnail: '/images/video-thumb.jpg',
          productId: null,
          title: '상품 사용법'
        }
      ],
      autoplay: false,
      muted: true,
      layout: 'grid'
    }
  },
  {
    id: 'testimonials',
    name: '고객 후기',
    type: SectionType.TESTIMONIALS,
    enabled: true,
    order: 15,
    config: {
      title: '고객님들의 생생한 후기',
      subtitle: '실제 구매하신 고객님들의 이야기',
      limit: 6,
      minRating: 4,
      showProductImage: true,
      layout: 'carousel',
      autoplay: true
    }
  },
  {
    id: 'instagram-feed',
    name: '인스타그램 피드',
    type: SectionType.INSTAGRAM_FEED,
    enabled: false,
    order: 16,
    config: {
      title: '📸 Instagram @ourstore',
      username: 'ourstore',
      limit: 8,
      layout: 'grid',
      hashtag: '#ourstore'
    }
  },
  {
    id: 'newsletter',
    name: '뉴스레터',
    type: SectionType.NEWSLETTER,
    enabled: true,
    order: 17,
    config: {
      title: '뉴스레터 구독',
      subtitle: '최신 소식과 특별 할인 정보를 받아보세요',
      placeholder: '이메일 주소를 입력하세요',
      buttonText: '구독하기',
      successMessage: '구독 신청이 완료되었습니다!',
      backgroundColor: '#333333',
      textColor: '#ffffff',
      benefit: '구독자 전용 10% 할인 쿠폰 즉시 발급!'
    }
  }
]

// 섹션 유효성 검사
export function validateHomeSection(section: HomeSection): boolean {
  if (!section.id || !section.name || !section.type) {
    return false
  }
  
  if (!Object.values(SectionType).includes(section.type)) {
    return false
  }
  
  return true
}

// 섹션 순서 정렬
export function sortSectionsByOrder(sections: HomeSection[]): HomeSection[] {
  return [...sections].sort((a, b) => a.order - b.order)
}

// 활성화된 섹션만 필터링
export function getEnabledSections(sections: HomeSection[]): HomeSection[] {
  return sections.filter(section => section.enabled)
}

// 섹션 순서 업데이트
export function updateSectionOrder(
  sections: HomeSection[], 
  fromIndex: number, 
  toIndex: number
): HomeSection[] {
  const result = [...sections]
  const [removed] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, removed)
  
  // 순서 번호 재할당
  return result.map((section, index) => ({
    ...section,
    order: index + 1
  }))
}

// 섹션 타입별 기본 설정 생성
export function createDefaultSectionConfig(type: SectionType): any {
  switch (type) {
    case SectionType.FEATURED_PRODUCTS:
      return {
        title: '추천 상품',
        subtitle: '',
        productIds: [],
        limit: 8,
        columns: 4,
        mobileColumns: 2
      }
    case SectionType.NEW_ARRIVALS:
      return {
        title: '신상품',
        daysLimit: 7,
        limit: 12,
        layout: 'grid'
      }
    case SectionType.BEST_SELLERS:
      return {
        title: '베스트셀러',
        period: 'week',
        limit: 10,
        showRanking: true
      }
    default:
      return {}
  }
}