'use client'

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
      <div className="max-w-7xl mx-auto">
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
  section: SectionType
  data?: any
}

export default function DynamicSection({ section, data }: DynamicSectionProps) {
  const Component = sectionComponents[section.type]

  if (!Component) {
    console.warn(`Section component not found for type: ${section.type}`)
    return null
  }

  // config의 layout이 'list'인 경우 'grid'로 변환
  const adjustedConfig = {
    ...section.config,
    layout: section.config?.layout === 'list' ? 'grid' : section.config?.layout
  }

  return (
    <div id={`section-${section.id}`} className="section-wrapper">
      <Component config={adjustedConfig} products={data} data={data} />
    </div>
  )
}