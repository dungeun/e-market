'use client';

// 간단한 useLanguage hook 구현
export function useLanguage() {
  const t = (key: string, fallback?: string) => {
    return fallback || key;
  };

  return { t };
}

export function getTranslatedField(obj: any, field: string) {
  return obj?.[field] || '';
}