'use client';

import React, { lazy, Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';

// Lazy load all section components for better performance
const HeroSection = lazy(() => import('@/components/sections/HeroSection'));
const CategorySection = lazy(() => import('@/components/sections/CategorySection'));
const QuickLinksSection = lazy(() => import('@/components/sections/QuickLinksSection'));
const PromoSection = lazy(() => import('@/components/sections/PromoSection'));
const RankingSection = lazy(() => import('@/components/sections/RankingSection'));
const RecommendedSection = lazy(() => import('@/components/sections/RecommendedSection'));
const BestSellers = lazy(() => import('@/components/sections/BestSellers'));
const NewArrivals = lazy(() => import('@/components/sections/NewArrivals'));
const FlashSale = lazy(() => import('@/components/sections/FlashSale'));
const RecentlyViewed = lazy(() => import('@/components/sections/RecentlyViewed'));
const TrendingProducts = lazy(() => import('@/components/sections/TrendingProducts'));
const SpecialOffers = lazy(() => import('@/components/sections/SpecialOffers'));
const SeasonalCollection = lazy(() => import('@/components/sections/SeasonalCollection'));
const BrandSpotlight = lazy(() => import('@/components/sections/BrandSpotlight'));
const FeaturedProducts = lazy(() => import('@/components/sections/FeaturedProducts'));
const CategoryShowcase = lazy(() => import('@/components/sections/CategoryShowcase'));
const BannerGrid = lazy(() => import('@/components/sections/BannerGrid'));
const Newsletter = lazy(() => import('@/components/sections/Newsletter'));
const Testimonials = lazy(() => import('@/components/sections/Testimonials'));
const InstagramFeed = lazy(() => import('@/components/sections/InstagramFeed'));
const VideoShowcase = lazy(() => import('@/components/sections/VideoShowcase'));
const RecommendedProducts = lazy(() => import('@/components/sections/RecommendedProducts'));
const DynamicSection = lazy(() => import('@/components/sections/DynamicSection'));

interface UISection {
  id: string;
  key: string;
  title: string | null;
  type: string;
  isActive: boolean;
  order: number;
  data: unknown;
  props: unknown;
  style: unknown;
}

interface DynamicSectionRendererProps {
  className?: string;
}

// Section loading skeleton component
const SectionSkeleton = () => (
  <div className="w-full py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {[...Array(4)].map((_, j) => (
            <div key={j} className="h-64 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const sectionComponents: { [key: string]: React.ComponentType<unknown> } = {
  // Original 6 sections
  hero: HeroSection,
  category: CategorySection,
  quicklinks: QuickLinksSection,
  promo: PromoSection,
  ranking: RankingSection,
  recommended: RecommendedSection,
  
  // Additional 18 sections (Total: 24)
  'best-sellers': BestSellers,
  'new-arrivals': NewArrivals,
  'flash-sale': FlashSale,
  'recently-viewed': RecentlyViewed,
  'trending-products': TrendingProducts,
  'special-offers': SpecialOffers,
  'seasonal-collection': SeasonalCollection,
  'brand-spotlight': BrandSpotlight,
  'featured-products': FeaturedProducts,
  'product-grid': FeaturedProducts, // Use FeaturedProducts for product-grid
  'category-showcase': CategoryShowcase,
  'banner-grid': BannerGrid,
  newsletter: Newsletter,
  testimonials: Testimonials,
  'instagram-feed': InstagramFeed,
  'video-showcase': VideoShowcase,
  'recommended-products': RecommendedProducts,
  dynamic: DynamicSection,
  
  // Backward compatibility aliases
  bestsellers: BestSellers,
  newarrivals: NewArrivals,
  flashsale: FlashSale,
  
  // Additional mappings for DB types
  categories: CategorySection, // Map 'categories' to CategorySection
  'popular-products': TrendingProducts, // Map to existing TrendingProducts
  'sale-products': SpecialOffers, // Map to existing SpecialOffers
  'used-products': FeaturedProducts, // Map to FeaturedProducts for used products
};

const DynamicSectionRenderer = React.memo(function DynamicSectionRenderer({ className = '' }: DynamicSectionRendererProps) {
  const [sections, setSections] = useState<UISection[]>([]);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useRealTimeUpdates({
    onUIUpdate: (data) => {
      console.log('Real-time section update received:', data);
      
      setSections(prevSections => {
        switch (data.type) {
          case 'create':
            // 새 섹션 추가 (중복 방지)
            if (data.section && !prevSections.find(s => s.id === data.section!.id)) {
              const newSections = [...prevSections, data.section]
                .filter(s => s.isActive)
                .sort((a, b) => a.order - b.order);
              return newSections;
            }
            return prevSections;

          case 'update':
            // 기존 섹션 업데이트
            if (data.section) {
              return prevSections.map(section => 
                section.id === data.section!.id 
                  ? { ...section, ...data.section! }
                  : section
              ).filter(s => s.isActive)
               .sort((a, b) => a.order - b.order);
            }
            return prevSections;

          case 'delete':
            // 섹션 삭제
            if (data.sectionId) {
              return prevSections.filter(s => s.id !== data.sectionId);
            }
            return prevSections;

          case 'reorder':
            // 섹션 순서 변경
            if (data.sections) {
              return data.sections
                .filter(s => s.isActive)
                .sort((a, b) => a.order - b.order);
            }
            return prevSections;

          default:
            return prevSections;
        }
      });
    }
  });

  useEffect(() => {
    loadSections();
  }, []);


  const loadSections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ui-sections');
      
      if (response.ok) {
        const data = await response.json();
        // 활성화된 섹션만 필터링하고 order로 정렬
        const activeSections = data.sections
          .filter((section: UISection) => section.isActive)
          .sort((a: UISection, b: UISection) => a.order - b.order);
        
        console.log('Active sections loaded:', activeSections.map((s: UISection) => ({
          key: s.key,
          type: s.type,
          title: s.title,
          order: s.order
        })));
        console.log('Total active sections count:', activeSections.length);
        
        setSections(activeSections);
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="space-y-12">
          {/* 히어로 섹션 스켈레톤 */}
          <div className="w-full h-[500px] lg:h-[600px] bg-gray-200 animate-pulse rounded-lg" />
          
          {/* 다른 섹션들 스켈레톤 */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
                  <div className="h-4 bg-gray-200 rounded w-96 mx-auto" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-64 bg-gray-200 rounded-xl" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* 실시간 연결 상태 표시 (개발 환경에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className={`fixed top-4 right-4 z-50 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
          isConnected 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {isConnected ? '🔄 SSE 실시간 동기화 활성' : '❌ SSE 동기화 연결 끊김'}
        </div>
      )}
      
      <div className="space-y-12">
        {sections.map((section) => {
          console.log('Rendering section:', section.key, 'type:', section.type);
          // Support both kebab-case and camelCase
          let SectionComponent = sectionComponents[section.type];
          console.log('Found component for', section.type, ':', !!SectionComponent);
          
          // Try camelCase if kebab-case not found
          if (!SectionComponent) {
            const camelCaseType = section.type.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            SectionComponent = sectionComponents[camelCaseType];
          }
          
          // Try kebab-case if camelCase not found
          if (!SectionComponent) {
            const kebabCaseType = section.type.replace(/([A-Z])/g, '-$1').toLowerCase();
            SectionComponent = sectionComponents[kebabCaseType];
          }
          
          if (!SectionComponent) {
            console.warn(`Unknown section type: ${section.type} for section: ${section.key}`);
            // Fallback to DynamicSection for unknown types
            const FallbackComponent = sectionComponents['dynamic'];
            if (FallbackComponent) {
              return (
                <Suspense key={section.id} fallback={<SectionSkeleton />}>
                  <FallbackComponent
                    sectionId={section.key}
                    className={section.style?.className || ''}
                    data={section.data || null}
                    {...(section.props || {})}
                  />
                </Suspense>
              );
            }
            return null;
          }

          return (
            <Suspense key={section.id} fallback={<SectionSkeleton />}>
              <SectionComponent
                sectionId={section.key}
                className={section.style?.className || ''}
                data={section.data || null}
                {...(section.props || {})}
              />
            </Suspense>
          );
        })}
      </div>
    </div>
  );
});
export default DynamicSectionRenderer;