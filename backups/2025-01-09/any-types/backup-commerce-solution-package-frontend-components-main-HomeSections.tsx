'use client'

import { ReactNode } from 'react'
import { useUIConfigStore } from '@/lib/stores/ui-config.store'

interface HomeSectionsProps {
  children: {
    hero?: ReactNode
    featured?: ReactNode
    categories?: ReactNode
    bestsellers?: ReactNode
    newArrivals?: ReactNode
    flashSale?: ReactNode
    recommended?: ReactNode
    trending?: ReactNode
    brandSpotlight?: ReactNode
    specialOffers?: ReactNode
    newsletter?: ReactNode
  }
}

export function HomeSections({ children }: HomeSectionsProps) {
  const { config } = useUIConfigStore()
  
  // 활성화된 섹션만 필터링하고 순서대로 정렬 (임시 비활성화)
  const visibleSections: any[] = []
  
  // 각 섹션 렌더링
  return (
    <div className="bg-white">
      {visibleSections.map((section) => {
        const sectionKey = section.type.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
        return (
          <div key={section.id} className="section-container">
            {children[sectionKey as keyof typeof children] || null}
          </div>
        )
      })}
    </div>
  )
}