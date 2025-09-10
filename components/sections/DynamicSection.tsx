'use client';

import React from 'react';

import dynamic from 'next/dynamic'
// 섹션 타입 정의
interface SectionType {
  id: string
  type: string
  config?: any
}
import { Skeleton } from '@/components/ui/skeleton'

// 동적 임포트로 섹션 컴포넌트 로드 - Orvio 템플릿 우선 사용
const sectionComponents: Record<string, any> = {
  'hero': dynamic(() => import('../orvio/HeroSection'), {
    loading: () => <SectionSkeleton height="600px" />
  }),
  'featured': dynamic(() => import('./FeaturedProducts'), {
    loading: () => <SectionSkeleton />
  }),
  'new-arrivals': dynamic(() => import('./NewArrivals'), {
    loading: () => <SectionSkeleton />
  }),
  'bestsellers': dynamic(() => import('../orvio/BestSellersSection'), {
    loading: () => <SectionSkeleton />
  }),
  'categories': dynamic(() => import('../orvio/CategoriesSection'), {
    loading: () => <SectionSkeleton />
  }),
  'flash-sale': dynamic(() => import('./FlashSale'), {
    loading: () => <SectionSkeleton />
  }),
  'brand-spotlight': dynamic(() => import('./BrandSpotlight'), {
    loading: () => <SectionSkeleton />
  }),
  'recommended': dynamic(() => import('./RecommendedProducts'), {
    loading: () => <SectionSkeleton />
  }),
  'trending': dynamic(() => import('./TrendingProducts'), {
    loading: () => <SectionSkeleton />
  }),
  'special-offers': dynamic(() => import('./SpecialOffers'), {
    loading: () => <SectionSkeleton />
  }),
  'newsletter': dynamic(() => import('./Newsletter'), {
    loading: () => <SectionSkeleton />
  }),
  'testimonial': dynamic(() => import('../orvio/TestimonialSection'), {
    loading: () => <SectionSkeleton />
  })
}

// 스켈레톤 로더
function SectionSkeleton({ height = '400px' }: { height?: string }) {
  return (
    <div className="py-12 px-4">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-64 mx-auto mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

interface DynamicSectionProps {
  section?: SectionType
  data?: any
  sectionId?: string
  className?: string
  config?: any
  props?: any
}

const DynamicSection = React.memo(function DynamicSection({ section, data, sectionId, className, config, props }: DynamicSectionProps) {
  // Handle case where section prop is not provided (when called from DynamicSectionRenderer)
  const sectionType = section?.type || 'dynamic'
  const sectionConfig = section?.config || config || {}
  const sectionData = data || []
  
  const Component = sectionComponents[sectionType]

  if (!Component && sectionType !== 'dynamic') {
    console.warn(`DynamicSection: Unknown section type "${sectionType}"`)
    return null
  }

  // config의 layout이 'list'인 경우 'grid'로 변환
  const adjustedConfig = {
    ...sectionConfig,
    layout: sectionConfig?.layout === 'list' ? 'grid' : sectionConfig?.layout
  }

  // For dynamic sections without specific component, render empty div
  if (!Component) {
    return (
      <div id={`section-${sectionId || section?.id || 'dynamic'}`} className={className || "section-wrapper"}>
        {/* Dynamic section placeholder */}
      </div>
    )
  }
  
  return (
    <div id={`section-${sectionId || section?.id || sectionType}`} className={className || "section-wrapper"}>
      <Component config={adjustedConfig} products={sectionData} data={sectionData} {...props} />
    </div>
    )
});

export default DynamicSection;