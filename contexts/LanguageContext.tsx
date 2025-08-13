'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

type Language = 'ko' | 'en' | 'jp';

interface LanguagePack {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
}

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  translateDynamic: (text: string) => Promise<string>;
  languages: Array<{ code: Language; name: string; nativeName: string }>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 브라우저에서만 localStorage 접근
const getStoredLanguage = (): Language => {
  if (typeof window === 'undefined') return 'ko';
  
  const stored = localStorage.getItem('language');
  if (stored && ['ko', 'en', 'jp'].includes(stored)) {
    return stored as Language;
  }
  
  // 브라우저 언어 감지
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ko')) return 'ko';
  if (browserLang.startsWith('jp')) return 'jp';
  if (browserLang.startsWith('en')) return 'en';
  
  return 'ko'; // 기본값
};

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLanguagePacks?: Record<string, LanguagePack>;
}

export function LanguageProvider({ children, initialLanguagePacks = {} }: LanguageProviderProps) {
  // 하이드레이션 문제 방지를 위해 초기값은 'ko'로 설정
  const [currentLanguage, setCurrentLanguageState] = useState<Language>('ko');
  const [languagePacks, setLanguagePacks] = useState<Record<string, LanguagePack>>(initialLanguagePacks);
  const [isLoading, setIsLoading] = useState(!Object.keys(initialLanguagePacks).length);
  const [packVersion, setPackVersion] = useState(0); // Force re-renders when packs change
  const queryClient = useQueryClient();
  
  // 클라이언트에서만 실제 언어 설정 적용
  useEffect(() => {
    const storedLang = getStoredLanguage();
    if (storedLang !== 'ko') {
      setCurrentLanguageState(storedLang);
    }
  }, []);

  // 언어 목록
  const languages = [
    { code: 'ko' as Language, name: 'Korean', nativeName: '한국어' },
    { code: 'en' as Language, name: 'English', nativeName: 'English' },
    { code: 'jp' as Language, name: 'Japanese', nativeName: '日本語' }
  ];

  // 언어팩 로드
  const loadLanguagePacks = useCallback(async (lang: Language = currentLanguage) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/language-packs?lang=${lang}`);
      if (response.ok) {
        const data = await response.json();
        const packs: LanguagePack[] = data.packs || [];
        const packMap = packs.reduce((acc, pack) => {
          acc[pack.key] = pack;
          return acc;
        }, {} as Record<string, LanguagePack>);
        setLanguagePacks(packMap);
        setPackVersion(prev => prev + 1); // Increment version to force re-renders
      } else {
        console.error('Failed to load language packs: HTTP', response.status);
      }
    } catch (error) {
      console.error('Failed to load language packs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove currentLanguage dependency to avoid circular dependency

  useEffect(() => {
    // 언어가 변경되면 해당 언어의 언어팩 로드
    loadLanguagePacks(currentLanguage);
  }, [loadLanguagePacks, currentLanguage]);

  // 언어 설정 함수
  const setLanguage = useCallback((lang: Language) => {
    setCurrentLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      // HTML lang 속성 업데이트
      document.documentElement.lang = lang;
      // 커스텀 이벤트 발생 (다른 컴포넌트에서 감지 가능)
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
      // React Query 캐시 무효화 - 모든 쿼리 재실행
      queryClient.invalidateQueries();
    }
  }, [queryClient]);

  // 번역 함수
  const t = useCallback((key: string, fallback?: string): string => {
    const pack = languagePacks[key];
    if (!pack) {
      // 언어팩이 없으면 fallback 또는 key 반환
      const packsCount = Object.keys(languagePacks).length;
      if (packsCount === 0) {
        // 언어팩이 아직 로딩되지 않았다면 로딩중 표시하지 않고 key 반환
        return fallback || key;
      }
      // Translation key not found
      return fallback || key;
    }
    
    // 새로운 API 형식에서는 value 필드에 현재 언어의 번역이 들어있음
    const result = pack.value || fallback || key;
    // Translation applied successfully
    return result;
  }, [languagePacks, currentLanguage, packVersion]); // Include packVersion to force re-renders

  // 동적 텍스트 번역 (API 호출)
  const translateDynamic = useCallback(async (text: string): Promise<string> => {
    if (currentLanguage === 'ko') {
      return text; // 한국어는 번역 불필요
    }

    try {
      const response = await fetch('/api/admin/language-packs/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [{ text }],
          targetLanguages: [currentLanguage],
          sourceLanguage: 'ko'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.translated && data.translated.length > 0) {
          return data.translated[0].translations[currentLanguage] || text;
        }
      }
    } catch (error) {
      console.error('Dynamic translation failed:', error);
    }

    return text; // 번역 실패 시 원본 반환
  }, [currentLanguage]);

  const value = {
    currentLanguage,
    setLanguage,
    t,
    translateDynamic,
    languages,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// 캠페인 데이터의 번역된 필드 가져오기
export function getTranslatedField(
  data: any,
  fieldName: string,
  language: Language = 'ko'
): string {
  // translations 필드가 있는 경우
  if (data.translations) {
    const translatedFieldName = `${fieldName}_${language}`;
    if (data.translations[translatedFieldName]) {
      return data.translations[translatedFieldName];
    }
  }
  
  // 기본 필드 반환
  return data[fieldName] || '';
}