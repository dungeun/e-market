'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/useSocket';

// 동적 언어 타입 - 하드코딩 제거
type Language = string;

interface LanguagePack {
  id: string;
  key: string;
  [languageCode: string]: any; // 동적 언어 지원
  category: string;
  description?: string;
}

interface AvailableLanguage {
  code: string;
  name: string;
  nativeName?: string;
  flag?: string;
  shortName?: string;
  isDefault?: boolean;
}

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  translateDynamic: (text: string) => Promise<string>;
  languages: AvailableLanguage[];
  isLoading: boolean;
  availableLanguages: AvailableLanguage[];
  refreshLanguages: () => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 브라우저에서만 localStorage 접근
const getStoredLanguage = (): Language => {
  if (typeof window === 'undefined') return 'ko';
  
  const stored = localStorage.getItem('language');
  if (stored) {
    return stored as Language;
  }
  
  // 브라우저 언어 감지 (기본값은 한국어)
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ko')) return 'ko';
  if (browserLang.startsWith('ja')) return 'jp';
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
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();
  
  // 클라이언트에서만 실제 언어 설정 적용
  useEffect(() => {
    const storedLang = getStoredLanguage();
    if (storedLang !== 'ko') {
      setCurrentLanguageState(storedLang);
    }
  }, []);

  // 동적 언어 목록 로드
  const [languages, setLanguages] = useState<AvailableLanguage[]>([]);

  // 언어팩 로드
  const loadLanguagePacks = useCallback(async () => {
    // 이미 언어팩이 있으면 로드하지 않음
    if (Object.keys(languagePacks).length > 0) {
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/public/language-packs');
      if (response.ok) {
        const packs: LanguagePack[] = await response.json();
        const packMap = packs.reduce((acc, pack) => {
          acc[pack.key] = pack;
          return acc;
        }, {} as Record<string, LanguagePack>);
        setLanguagePacks(packMap);
      }
    } catch (error) {

    } finally {
      setIsLoading(false);
    }
  }, [languagePacks]);

  // 동적 언어 목록 로드 함수
  const loadAvailableLanguages = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/i18n/settings');
      if (response.ok) {
        const data = await response.json();
        // 새로운 API 응답 구조: { success: true, languages: [...] }
        const languageSettings = data.languages || [];
        const enabledLanguages = Array.isArray(languageSettings)
          ? languageSettings
              .filter(lang => lang.enabled)
              .map(lang => ({
                code: lang.code,
                name: lang.name,
                nativeName: lang.native_name || lang.name,
                flag: lang.flag_emoji,
                isDefault: lang.is_default
              }))
          : [];
        setLanguages(enabledLanguages);
        
        // 기본 언어가 설정되어 있으면 현재 언어를 기본값으로 설정
        const defaultLang = enabledLanguages.find(lang => lang.isDefault);
        if (defaultLang && currentLanguage === 'ko') {
          setCurrentLanguageState(defaultLang.code);
        }
      }
    } catch (error) {
      console.error('언어 설정 로드 실패:', error);
      // 폴백으로 한국어만 설정
      setLanguages([{
        code: 'ko',
        name: 'Korean',
        nativeName: '한국어',
        isDefault: true
      }]);
    }
  }, [currentLanguage]);

  useEffect(() => {
    // 초기화 시 언어 목록 로드
    loadAvailableLanguages();
    
    // 초기 언어팩이 없을 때만 로드
    if (Object.keys(languagePacks).length === 0) {
      loadLanguagePacks();
    }
  }, [loadLanguagePacks, loadAvailableLanguages]);

  // Socket.io 실시간 언어 변경 감지
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleLanguageChanged = (data: { language: Language; userId?: string }) => {
      console.log('언어 변경 감지:', data);
      // 다른 사용자의 언어 변경이면 현재 언어 업데이트
      if (data.language && data.language !== currentLanguage) {
        setCurrentLanguageState(data.language);
        // 언어팩도 다시 로드
        loadLanguagePacks();
        loadAvailableLanguages();
      }
    };

    const handleLanguagePackUpdated = (data: { key: string; translations: Record<string, string> }) => {
      console.log('언어팩 업데이트 감지:', data);
      // 언어팩 업데이트 시 캐시 새로고침
      setLanguagePacks(prev => ({
        ...prev,
        [data.key]: {
          ...prev[data.key],
          ...data.translations
        } as LanguagePack
      }));
    };

    socket.on('language:changed', handleLanguageChanged);
    socket.on('languagePack:updated', handleLanguagePackUpdated);

    return () => {
      socket.off('language:changed', handleLanguageChanged);
      socket.off('languagePack:updated', handleLanguagePackUpdated);
    };
  }, [socket, isConnected, currentLanguage, loadLanguagePacks, loadAvailableLanguages]);

  // 언어 설정 함수
  const setLanguage = useCallback((lang: Language) => {
    setCurrentLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      // HTML lang 속성 업데이트
      document.documentElement.lang = lang;
      // 커스텀 이벤트 발생 (다른 컴포넌트에서 감지 가능)
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
      // 언어팩 재로드 (캐시 갱신)
      loadLanguagePacks();
      // React Query 캐시 무효화 - 모든 쿼리 재실행
      queryClient.invalidateQueries();
      
      // Socket.io를 통한 실시간 언어 변경 알림
      if (socket && isConnected) {
        socket.emit('language:changed', {
          language: lang,
          timestamp: new Date().toISOString(),
          userId: 'current-user' // 실제로는 사용자 ID 사용
        });
      }
    }
  }, [loadLanguagePacks, queryClient, socket, isConnected]);

  // 언어 목록 새로고침 함수 (언어팩 관리에서 사용)
  const refreshLanguages = useCallback(async () => {
    await loadAvailableLanguages();
  }, [loadAvailableLanguages]);

  // 번역 함수
  const t = useCallback((key: string, fallback?: string): string => {
    const pack = languagePacks[key];
    if (!pack) {
      // 언어팩이 없으면 fallback 또는 key 반환
      return fallback || key;
    }
    
    // 현재 언어에 맞는 텍스트 반환
    return pack[currentLanguage] || pack.ko || fallback || key;
  }, [languagePacks, currentLanguage]);

  // 동적 텍스트 번역 (Google Translate API 사용)
  const translateDynamic = useCallback(async (text: string): Promise<string> => {
    if (currentLanguage === 'ko' || !text.trim()) {
      return text; // 한국어는 번역 불필요
    }

    try {
      // Google Translate API를 통한 번역
      const response = await fetch('/api/admin/translate/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          targetLanguage: currentLanguage,
          sourceLanguage: 'ko'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.translatedText) {
          return data.translatedText;
        }
      } else {
        console.warn('번역 API 호출 실패:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('번역 중 오류 발생:', error);
    }

    return text; // 번역 실패 시 원본 반환
  }, [currentLanguage]);

  const value = {
    currentLanguage,
    setLanguage,
    t,
    translateDynamic,
    languages,
    isLoading,
    availableLanguages: languages,
    refreshLanguages
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
  data: unknown,
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