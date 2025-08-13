import { useState, useEffect, useCallback } from 'react';

type Language = 'ko' | 'en';

interface Translations {
  [key: string]: {
    ko: string;
    en: string;
  };
}

const translations: Translations = {
  'admin.menu.dashboard': { ko: '대시보드', en: 'Dashboard' },
  'admin.menu.users': { ko: '사용자 관리', en: 'User Management' },
  'admin.menu.campaigns': { ko: '캠페인 관리', en: 'Campaign Management' },
  'admin.menu.payments': { ko: '결제 관리', en: 'Payment Management' },
  'admin.menu.settlements': { ko: '정산 관리', en: 'Settlement Management' },
  'admin.menu.revenue': { ko: '매출 관리', en: 'Revenue Management' },
  'admin.menu.analytics': { ko: '통계 분석', en: 'Analytics' },
  'admin.menu.content': { ko: '콘텐츠 관리', en: 'Content Management' },
  'admin.menu.translations': { ko: '언어팩', en: 'Language Pack' },
  'admin.menu.settings': { ko: '시스템 설정', en: 'System Settings' },
  'admin.menu.ui_config': { ko: 'UI 설정', en: 'UI Configuration' },
  'admin.menu.reports': { ko: '신고 관리', en: 'Report Management' },
  'admin.loading': { ko: '로딩 중...', en: 'Loading...' },
  'admin.label.admin': { ko: '관리자', en: 'Administrator' },
  'admin.action.logout': { ko: '로그아웃', en: 'Logout' },
};

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('ko');

  useEffect(() => {
    // Load saved language preference
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'ko' || savedLang === 'en')) {
      setLanguage(savedLang);
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('ko')) {
        setLanguage('ko');
      } else {
        setLanguage('en');
      }
    }
  }, []);

  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  }, []);

  const t = useCallback((key: string, fallback?: string) => {
    const translation = translations[key];
    if (translation) {
      return translation[language];
    }
    return fallback || key;
  }, [language]);

  return {
    language,
    changeLanguage,
    t,
  };
}