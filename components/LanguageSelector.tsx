'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

interface Language {
  code: string;
  name: string;
  nativeName?: string;
  flag: string;
  shortName: string;
  isDefault?: boolean;
}

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [languages, setLanguages] = useState<Language[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { currentLanguage, setLanguage, t } = useLanguage()

  // 사용 가능한 언어 목록 로드
  useEffect(() => {
    fetch('/api/languages/available')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLanguages(data);
        }
      })
      .catch(err => {
        console.error('Failed to load languages:', err);
      });
  }, [])

  // 하이드레이션 문제 방지를 위해 마운트 상태 추적
  useEffect(() => {
    setMounted(true)
  }, [])

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = (langCode: string) => {
    // 동적 언어 지원 - 타입 캐스팅 제거
    setLanguage(langCode as any)
    setIsOpen(false)
    
    // 페이지 새로고침 (선택사항 - 전체 앱 리렌더링)
    // window.location.reload()
  }

  // 언어 목록이 없으면 렌더링하지 않음
  if (languages.length === 0) {
    return null;
  }

  // 마운트되기 전이나 현재 언어가 없으면 첫 번째 언어 사용
  const displayLang = mounted ? (currentLang || languages[0]) : languages[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        aria-label={t('language.selector.label', '언어 선택')}
      >
        <span className="text-lg">{displayLang.flag}</span>
        <span className="hidden sm:inline">{displayLang.shortName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3
                  ${currentLanguage === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}