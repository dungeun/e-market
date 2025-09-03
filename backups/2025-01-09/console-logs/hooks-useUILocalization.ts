'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface UISection {
  [key: string]: any;
}

interface LocalizedSections {
  [sectionKey: string]: UISection;
}

/**
 * UI 섹션별 다국어 데이터 로딩 훅
 */
export function useUILocalization() {
  const { currentLanguage } = useLanguage();
  const [sections, setSections] = useState<LocalizedSections>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // JSON 파일에서 언어별 데이터 로딩
  const loadUILocalization = async (language: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔧 Loading UI localization for language:', language);

      // 정적 JSON 파일에서 로딩 (빠른 응답)
      const response = await fetch(`/locales/ui-sections.json?lang=${language}&t=${Date.now()}`, {
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`Failed to load UI localization: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔧 Raw JSON data keys:', Object.keys(data));
      console.log('🔧 Hero section raw data:', data.hero);
      
      // 현재 언어에 맞는 섹션 데이터 추출
      const localizedSections: LocalizedSections = {};
      
      Object.keys(data).forEach(sectionKey => {
        const sectionData = data[sectionKey];
        
        // sectionOrder는 언어별이 아닌 공통 데이터이므로 바로 저장
        if (sectionKey === 'sectionOrder') {
          localizedSections[sectionKey] = sectionData;
          console.log('🔧 Added sectionOrder:', sectionData);
        } else if (sectionData && sectionData[language]) {
          localizedSections[sectionKey] = sectionData[language];
          console.log(`🔧 Added ${sectionKey} for ${language}:`, sectionData[language]);
        } else {
          console.log(`🔧 Skipped ${sectionKey} - no data for ${language}`, sectionData);
        }
      });

      console.log('🔧 Final localized sections:', localizedSections);
      console.log('🔧 Hero slides in final sections:', localizedSections.hero?.slides);
      setSections(localizedSections);
    } catch (err) {
      console.error('Failed to load UI localization:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // 에러 시 기본값 설정
      setSections({});
    } finally {
      setLoading(false);
    }
  };

  // 언어 변경 시 데이터 재로딩
  useEffect(() => {
    loadUILocalization(currentLanguage);
  }, [currentLanguage]);

  // 섹션별 데이터 접근 헬퍼 함수들
  const getSectionData = (sectionKey: string): UISection | null => {
    return sections[sectionKey] || null;
  };

  const getQuickLinks = () => {
    const quicklinksData = getSectionData('quicklinks');
    return quicklinksData?.links || [];
  };

  const getPromoData = () => {
    return getSectionData('promo') || null;
  };

  const getCategoriesData = () => {
    const categoriesData = getSectionData('categories');
    return categoriesData?.items || [];
  };

  const getHeroData = () => {
    const heroData = getSectionData('hero');
    return heroData?.slides || [];
  };

  // 메모화된 섹션별 데이터
  const memoizedData = useMemo(() => ({
    quicklinks: getQuickLinks(),
    promo: getPromoData(), 
    categories: getCategoriesData(),
    hero: getHeroData(),
    all: sections
  }), [sections]);

  return {
    // 기본 상태
    loading,
    error,
    sections,
    currentLanguage,
    
    // 헬퍼 함수들
    getSectionData,
    getQuickLinks,
    getPromoData,
    getCategoriesData,
    getHeroData,
    
    // 메모화된 데이터
    data: memoizedData,
    
    // 새로고침 함수
    refresh: () => loadUILocalization(currentLanguage)
  };
}

/**
 * 특정 섹션만 로딩하는 경량화된 훅
 */
export function useSectionLocalization(sectionKey: string) {
  const { currentLanguage } = useLanguage();
  const [sectionData, setSectionData] = useState<UISection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSection = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/locales/ui-sections.json?t=${Date.now()}`);
        const data = await response.json();
        
        const section = data[sectionKey]?.[currentLanguage] || null;
        setSectionData(section);
      } catch (error) {
        console.error(`Failed to load section ${sectionKey}:`, error);
        setSectionData(null);
      } finally {
        setLoading(false);
      }
    };

    loadSection();
  }, [sectionKey, currentLanguage]);

  return { sectionData, loading, currentLanguage };
}

export default useUILocalization;