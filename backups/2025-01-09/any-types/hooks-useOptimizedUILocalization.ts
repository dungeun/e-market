/**
 * 최적화된 UI 국제화 훅
 * React Query를 사용한 효율적인 언어별 데이터 로딩 및 캐싱
 */

import { useQuery } from '@tanstack/react-query';
import { useContext, useMemo } from 'react';
import { LanguageContext } from '@/contexts/LanguageContext';
import { JsonLanguageData, LanguageCode } from '@/lib/services/json-language.service';

export interface UISection {
  id: string;
  type: string;
  visible: boolean;
  data: any;
}

export interface UILocalizationData {
  version: string;
  lastUpdated: string;
  language: LanguageCode;
  sectionOrder: string[];
  sections: Record<string, UISection>;
}

export interface UseOptimizedUILocalizationOptions {
  fallbackLanguage?: LanguageCode;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}

export interface UseOptimizedUILocalizationReturn {
  data: UILocalizationData | undefined;
  sections: UISection[];
  sectionOrder: string[];
  getSection: (sectionId: string) => UISection | undefined;
  getSectionData: (sectionId: string) => any;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
}

/**
 * 언어별 섹션 데이터 fetcher
 */
const fetchLanguageSections = async (language: LanguageCode): Promise<UILocalizationData> => {
  try {
    const response = await fetch(`/i18n/${language}/sections.json?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${language} sections: ${response.status} ${response.statusText}`);
    }

    const rawData: JsonLanguageData = await response.json();

    // UISection 형태로 변환
    const sections: Record<string, UISection> = {};
    Object.entries(rawData.sections).forEach(([sectionId, sectionData]: [string, any]) => {
      sections[sectionId] = {
        id: sectionId,
        type: sectionData.type || sectionId,
        visible: sectionData.visible !== false,
        data: sectionData.data || {}
      };
    });

    const result: UILocalizationData = {
      version: rawData.version,
      lastUpdated: rawData.lastUpdated,
      language: rawData.language,
      sectionOrder: rawData.sectionOrder || [],
      sections
    };

    return result;
  } catch (error) {

    throw error;
  }
};

/**
 * 최적화된 UI 국제화 훅
 */
export function useOptimizedUILocalization(
  options: UseOptimizedUILocalizationOptions = {}
): UseOptimizedUILocalizationReturn {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useOptimizedUILocalization must be used within a LanguageProvider');
  }
  const { currentLanguage } = context;
  // undefined일 때는 항상 기본값 사용
  const language = currentLanguage && ['ko', 'en', 'jp'].includes(currentLanguage) ? currentLanguage : 'ko';
  const {
    fallbackLanguage = 'ko',
    refetchOnWindowFocus = false,
    refetchOnReconnect = true,
    refetchInterval = 0,
    staleTime = 5 * 60 * 1000 // 5분
  } = options;

  // React Query 설정
  const queryKey = ['ui-sections', language];
  
  const {
    data,
    error,
    isLoading,
    refetch
  } = useQuery<UILocalizationData, Error>({
    queryKey,
    queryFn: () => fetchLanguageSections(language),
    refetchOnWindowFocus,
    refetchOnReconnect,
    refetchInterval,
    staleTime,
    retry: 3,
    retryDelay: 1000
  });

  // 폴백 언어 데이터 (필요한 경우)
  const {
    data: fallbackData,
    error: fallbackError
  } = useQuery<UILocalizationData, Error>({
    queryKey: ['ui-sections', fallbackLanguage],
    queryFn: () => fetchLanguageSections(fallbackLanguage),
    enabled: language !== fallbackLanguage && (isLoading || !!error),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime,
    retry: 2
  });

  // 최종 데이터 결정 (메인 또는 폴백)
  const finalData = useMemo(() => {
    if (data) return data;
    if (error && fallbackData && language !== fallbackLanguage) {

      return fallbackData;
    }
    return undefined;
  }, [data, fallbackData, error, language, fallbackLanguage]);

  // 섹션 배열 생성 (순서대로 정렬)
  const sections = useMemo(() => {
    if (!finalData) return [];
    
    return finalData.sectionOrder
      .map(sectionId => finalData.sections[sectionId])
      .filter((section): section is UISection => 
        section !== undefined && section.visible
      );
  }, [finalData]);

  // 섹션 순서 배열
  const sectionOrder = useMemo(() => {
    return finalData?.sectionOrder || [];
  }, [finalData]);

  // 개별 섹션 조회 함수
  const getSection = useMemo(() => {
    return (sectionId: string): UISection | undefined => {
      return finalData?.sections[sectionId];
    };
  }, [finalData]);

  // 섹션 데이터만 조회하는 함수
  const getSectionData = useMemo(() => {
    return (sectionId: string): any => {
      return finalData?.sections[sectionId]?.data;
    };
  }, [finalData]);

  // 최종 에러 상태 (폴백 포함)
  const finalError = useMemo(() => {
    if (error && (!fallbackData || language === fallbackLanguage)) {
      return error;
    }
    return null;
  }, [error, fallbackData, fallbackError, language, fallbackLanguage]);

  return {
    data: finalData,
    sections,
    sectionOrder,
    getSection,
    getSectionData,
    isLoading: isLoading && !finalData,
    isError: !!finalError,
    error: finalError,
    refetch: async () => {
      return await refetch();
    }
  };
}

/**
 * 특정 섹션만 로드하는 최적화된 훅
 */
export function useOptimizedSectionData(
  sectionId: string,
  options: UseOptimizedUILocalizationOptions = {}
): {
  section: UISection | undefined;
  sectionData: any;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} {
  const { 
    data, 
    getSection, 
    getSectionData, 
    isLoading, 
    isError, 
    error 
  } = useOptimizedUILocalization(options);

  const section = useMemo(() => getSection(sectionId), [getSection, sectionId]);
  const sectionData = useMemo(() => getSectionData(sectionId), [getSectionData, sectionId]);

  return {
    section,
    sectionData,
    isLoading,
    isError,
    error
  };
}

/**
 * 섹션 순서만 필요한 경우를 위한 경량 훅
 */
export function useOptimizedSectionOrder(
  options: UseOptimizedUILocalizationOptions = {}
): {
  sectionOrder: string[];
  isLoading: boolean;
  isError: boolean;
} {
  const { sectionOrder, isLoading, isError } = useOptimizedUILocalization(options);

  return {
    sectionOrder,
    isLoading,
    isError
  };
}

/**
 * 관리자용 실시간 업데이트 훅
 */
export function useOptimizedUILocalizationAdmin(
  options: UseOptimizedUILocalizationOptions = {}
): UseOptimizedUILocalizationReturn & {
  refreshData: () => Promise<void>;
  invalidateCache: () => void;
} {
  const result = useOptimizedUILocalization({
    ...options,
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // 10초마다 체크
    staleTime: 1000 // 1초 stale time
  });

  const refreshData = async () => {
    try {
      await result.refetch();

    } catch (error) {

    }
  };

  const invalidateCache = () => {
    // React Query 캐시 무효화는 QueryClient를 통해 해야 하므로 여기서는 refetch 호출
    result.refetch();

  };

  return {
    ...result,
    refreshData,
    invalidateCache
  };
}