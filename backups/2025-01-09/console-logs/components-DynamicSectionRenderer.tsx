import React from 'react';
'use client';

import { useState, useEffect } from 'react';
import HeroSection from '@/components/sections/HeroSection';
import CategorySection from '@/components/sections/CategorySection';
import QuickLinksSection from '@/components/sections/QuickLinksSection';
import PromoSection from '@/components/sections/PromoSection';
import RankingSection from '@/components/sections/RankingSection';
import RecommendedSection from '@/components/sections/RecommendedSection';

interface UISection {
  id: string;
  key: string;
  title: string | null;
  type: string;
  isActive: boolean;
  order: number;
  data: any;
  props: any;
  style: any;
}

interface DynamicSectionRendererProps {
  className?: string;
}

const sectionComponents: { [key: string]: React.ComponentType<any> } = {
  hero: HeroSection,
  category: CategorySection,
  quicklinks: QuickLinksSection,
  promo: PromoSection,
  ranking: RankingSection,
  recommended: RecommendedSection,
};

const DynamicSectionRenderer = React.memo(function DynamicSectionRenderer({ className = '' }: DynamicSectionRendererProps) {
  const [sections, setSections] = useState<UISection[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="space-y-12">
        {sections.map((section) => {
          const SectionComponent = sectionComponents[section.type];
          
          if (!SectionComponent) {
            console.warn(`No component found for section type: ${section.type}`);
            return null;
          }

          return (
            <SectionComponent
              key={section.id}
              sectionId={section.key}
              className={section.style?.className || ''}
              data={section.data || null}
              {...(section.props || {})}
            />
          );
        })}
      </div>
    </div>
  );
})
export default DynamicSectionRenderer;