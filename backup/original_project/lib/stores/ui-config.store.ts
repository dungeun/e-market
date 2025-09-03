'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  order: number;
  visible?: boolean;
  children?: MenuItem[];
}

export interface FooterLink {
  id: string;
  label: string;
  href: string;
  order: number;
  visible?: boolean;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: MenuItem[];
  order: number;
}

export interface ProductSection {
  id: string;
  type: 'hero' | 'featured' | 'bestsellers' | 'new-arrivals' | 'categories' | 'flash-sale' | 'recommended' | 'trending' | 'brand-spotlight' | 'special-offers' | 'newsletter' | 'testimonial';
  name: string;
  description: string;
  enabled: boolean;
  order: number;
  config: {
    title?: string;
    subtitle?: string;
    limit?: number;
    showBadge?: boolean;
    badgeText?: string;
    layout?: 'grid' | 'carousel' | 'list';
    columns?: number;
    backgroundColor?: string;
    // 히어로 섹션 전용
    slides?: {
      id: string;
      title: string;
      subtitle: string;
      image: string;
      link: string;
      buttonText: string;
    }[];
    // 카테고리 섹션 전용
    categories?: {
      id: string;
      name: string;
      icon: string;
      image: string;
      productCount?: number;
    }[];
    // 기타 섹션별 설정
    [key: string]: unknown;
  };
}

export interface UIConfig {
  sections: ProductSection[];
  globalSettings: {
    theme: {
      primaryColor: string;
      backgroundColor: string;
      textColor: string;
    };
    layout: {
      maxWidth: string;
      spacing: string;
    };
  };
  footer?: unknown;
  header?: unknown;
  mainPageCustomSections?: unknown[];
  mainPage?: unknown;
}

interface UIConfigStore {
  config: UIConfig;
  updateSection: (sectionId: string, updates: Partial<ProductSection>) => void;
  updateSectionConfig: (sectionId: string, config: Partial<ProductSection['config']>) => void;
  toggleSection: (sectionId: string) => void;
  reorderSections: (sections: ProductSection[]) => void;
  addCustomSection: (section: ProductSection) => void;
  removeSection: (sectionId: string) => void;
  loadSettingsFromAPI: () => Promise<void>;
  resetToDefault: () => void;
  setConfig: (config: UIConfig) => void;
  updateFooter: (footer: unknown) => void;
  updateFooterColumns: (columns: unknown[]) => void;
  updateCopyright: (copyright: string) => void;
  updateHeaderMenus: (menus: unknown[]) => void;
  updateSectionOrder: (sections: unknown[]) => void;
  updateMainPageCustomSections: (sections: unknown[]) => void;
}

const defaultSections: ProductSection[] = [
  {
    id: 'hero',
    type: 'hero',
    name: '히어로 섹션',
    description: '메인 배너 슬라이드',
    enabled: true,
    order: 1,
    config: {
      slides: [
        {
          id: 'slide-1',
          title: '특별한 할인 혜택',
          subtitle: '최대 70% 할인된 상품을 만나보세요',
          image: '/placeholder-hero-1.jpg',
          link: '/products',
          buttonText: '지금 쇼핑하기'
        }
      ],
      autoplay: true,
      interval: 5000,
      height: '600px'
    }
  },
  {
    id: 'categories',
    type: 'categories',
    name: '카테고리 쇼케이스',
    description: '상품 카테고리 그리드',
    enabled: true,
    order: 2,
    config: {
      title: '카테고리별 쇼핑',
      layout: 'grid',
      showProductCount: true,
      categories: [
        { id: 'electronics', name: '전자제품', icon: '📱', image: '/category-electronics.jpg', productCount: 120 },
        { id: 'fashion', name: '패션', icon: '👕', image: '/category-fashion.jpg', productCount: 200 },
        { id: 'home', name: '홈&리빙', icon: '🏠', image: '/category-home.jpg', productCount: 80 },
        { id: 'beauty', name: '뷰티', icon: '💄', image: '/category-beauty.jpg', productCount: 150 },
        { id: 'sports', name: '스포츠', icon: '⚽', image: '/category-sports.jpg', productCount: 95 },
        { id: 'books', name: '도서', icon: '📚', image: '/category-books.jpg', productCount: 300 }
      ]
    }
  },
  {
    id: 'featured',
    type: 'featured',
    name: '추천 상품',
    description: '큐레이션된 추천 상품 목록',
    enabled: true,
    order: 3,
    config: {
      title: '추천 상품',
      subtitle: '엄선된 상품을 만나보세요',
      limit: 8,
      columns: 4,
      showBadge: true,
      badgeText: '추천'
    }
  },
  {
    id: 'flash-sale',
    type: 'flash-sale',
    name: '플래시 세일',
    description: '한정 시간 특가 상품',
    enabled: true,
    order: 4,
    config: {
      title: '⚡ 플래시 세일',
      subtitle: '지금 놓치면 후회하는 특가!',
      limit: 4,
      showTimer: true,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24시간 후
    }
  },
  {
    id: 'bestsellers',
    type: 'bestsellers',
    name: '베스트셀러',
    description: '인기 상품 랭킹',
    enabled: true,
    order: 5,
    config: {
      title: '🏆 베스트셀러',
      subtitle: '가장 인기있는 상품들',
      limit: 10,
      period: 'month',
      showRanking: true,
      showSalesCount: true
    }
  },
  {
    id: 'new-arrivals',
    type: 'new-arrivals',
    name: '신상품',
    description: '최신 출시 상품',
    enabled: true,
    order: 6,
    config: {
      title: '✨ 신상품',
      subtitle: '따끈따끈한 신제품을 만나보세요',
      limit: 12,
      daysLimit: 30,
      layout: 'grid',
      columns: 6,
      showArrivalDate: true
    }
  },
  {
    id: 'recommended',
    type: 'recommended',
    name: 'AI 추천',
    description: 'AI 기반 개인화 추천',
    enabled: true,
    order: 7,
    config: {
      title: '🤖 당신을 위한 추천',
      subtitle: 'AI가 선택한 맞춤 상품',
      limit: 8,
      algorithm: 'collaborative-filtering',
      personalized: true,
      fallbackToPopular: true
    }
  },
  {
    id: 'trending',
    type: 'trending',
    name: '트렌딩',
    description: '지금 뜨고 있는 상품',
    enabled: true,
    order: 8,
    config: {
      title: '🔥 트렌딩 NOW',
      subtitle: '지금 가장 핫한 상품들',
      limit: 8,
      timeWindow: 7,
      showTrendingScore: true,
      updateInterval: 1
    }
  },
  {
    id: 'brand-spotlight',
    type: 'brand-spotlight',
    name: '브랜드 스포트라이트',
    description: '특별한 브랜드 소개',
    enabled: false,
    order: 9,
    config: {
      title: '🌟 브랜드 스포트라이트',
      brandId: null,
      showBrandStory: true,
      productLimit: 6,
      layout: 'grid'
    }
  },
  {
    id: 'special-offers',
    type: 'special-offers',
    name: '특가 혜택',
    description: '할인 및 프로모션 상품',
    enabled: true,
    order: 10,
    config: {
      title: '💰 특가 혜택',
      subtitle: '놓치면 후회하는 할인가!',
      minDiscount: 20,
      limit: 6,
      showOriginalPrice: true,
      showDiscountPercentage: true,
      highlightColor: '#ff0000'
    }
  },
  {
    id: 'newsletter',
    type: 'newsletter',
    name: '뉴스레터 구독',
    description: '이메일 뉴스레터 가입',
    enabled: true,
    order: 11,
    config: {
      title: '📧 특별한 소식을 받아보세요',
      subtitle: '신상품, 할인 정보를 가장 먼저 알려드립니다',
      placeholder: '이메일 주소를 입력하세요',
      buttonText: '구독하기',
      successMessage: '구독 신청이 완료되었습니다!',
      benefit: '신규 가입시 10% 할인 쿠폰 증정'
    }
  },
  {
    id: 'testimonial',
    type: 'testimonial',
    name: '고객 후기',
    description: '고객 리뷰 및 평가',
    enabled: true,
    order: 7,
    config: {
      title: '고객 리뷰',
      subtitle: '실제 구매 고객님들의 생생한 후기',
      overallRating: 4.9,
      totalReviews: 3500,
      showRatingCircle: true,
      autoPlay: true,
      interval: 5000
    }
  }
];

const defaultConfig: UIConfig = {
  sections: defaultSections,
  globalSettings: {
    theme: {
      primaryColor: '#dc2626', // red-600
      backgroundColor: '#000000', // black
      textColor: '#ffffff'
    },
    layout: {
      maxWidth: '7xl',
      spacing: 'normal'
    }
  }
};

export const useUIConfigStore = create<UIConfigStore>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      updateSection: (sectionId, updates) =>
        set((state) => ({
          config: {
            ...state.config,
            sections: state.config.sections.map((section) =>
              section.id === sectionId ? { ...section, ...updates } : section
            ),
          },
        })),
      updateSectionConfig: (sectionId, config) =>
        set((state) => ({
          config: {
            ...state.config,
            sections: state.config.sections.map((section) =>
              section.id === sectionId
                ? { ...section, config: { ...section.config, ...config } }
                : section
            ),
          },
        })),
      toggleSection: (sectionId) =>
        set((state) => ({
          config: {
            ...state.config,
            sections: state.config.sections.map((section) =>
              section.id === sectionId ? { ...section, enabled: !section.enabled } : section
            ),
          },
        })),
      reorderSections: (sections) =>
        set((state) => ({
          config: {
            ...state.config,
            sections: sections.map((section, index) => ({
              ...section,
              order: index + 1
            }))
          },
        })),
      addCustomSection: (section) =>
        set((state) => ({
          config: {
            ...state.config,
            sections: [...state.config.sections, section],
          },
        })),
      removeSection: (sectionId) =>
        set((state) => ({
          config: {
            ...state.config,
            sections: state.config.sections.filter((section) => section.id !== sectionId),
          },
        })),
      loadSettingsFromAPI: async () => {
        try {

          const response = await fetch('/api/admin/ui-config');
          if (response.ok) {
            const data = await response.json();

            if (data.config) {
              set({ config: data.config });
            }
          } else {

          }
        } catch (error) {

        }
      },
      resetToDefault: () => set({ config: defaultConfig }),
      setConfig: (config) => set({ config }),
      updateFooter: (footer) =>
        set((state) => ({
          config: {
            ...state.config,
            footer,
          },
        })),
      updateFooterColumns: (columns) =>
        set((state) => ({
          config: {
            ...state.config,
            footer: {
              ...state.config.footer,
              columns,
            },
          },
        })),
      updateCopyright: (copyright) =>
        set((state) => ({
          config: {
            ...state.config,
            footer: {
              ...state.config.footer,
              copyright,
            },
          },
        })),
      updateHeaderMenus: (menus) =>
        set((state) => ({
          config: {
            ...state.config,
            header: {
              ...state.config.header,
              menus,
            },
          },
        })),
      updateSectionOrder: (sections) =>
        set((state) => ({
          config: {
            ...state.config,
            sections,
          },
        })),
      updateMainPageCustomSections: (sections) =>
        set((state) => ({
          config: {
            ...state.config,
            mainPageCustomSections: sections,
          },
        })),
    }),
    {
      name: 'ui-config-storage',
      version: 1,
    }
  )
);