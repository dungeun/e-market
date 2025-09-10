'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface SlideData {
  id: number | string;
  title: string | { ko?: string; en?: string; jp?: string; [key: string]: string | undefined };
  subtitle: string | { ko?: string; en?: string; jp?: string; [key: string]: string | undefined };
  tag?: string | { ko?: string; en?: string; jp?: string; [key: string]: string | undefined };
  link?: string;
  bgColor?: string;
  textColor?: string;
  backgroundImage?: string;
  useFullImage?: boolean;
  fullImageUrl?: string;
  fullImageUrlEn?: string;
  fullImageUrlJp?: string;
  fullImageWidth?: number;
  fullImageHeight?: number;
  visible?: boolean;
  order?: number;
  // 동적 언어 지원을 위한 인덱스 시그니처
  [key: string]: any;
}

interface HeroSectionProps {
  data?: {
    slides?: SlideData[];
    autoPlay?: boolean;
    autoPlayInterval?: number;
  };
  sectionId?: string;
  className?: string;
}

const HeroSection = React.memo(function HeroSection({ data, sectionId = 'hero', className = '' }: HeroSectionProps) {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentLanguage } = useLanguage();

  // 다국어 텍스트 처리 헬퍼 함수
  const getLocalizedText = (text: string | { ko?: string; en?: string; jp?: string; [key: string]: string | undefined } | undefined): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    // 현재 선택된 언어의 텍스트 반환, 없으면 한국어 또는 첫 번째 값
    return text[currentLanguage] || text.ko || text.en || text.jp || Object.values(text).find(v => v) || '';
  };

  // 언어별 이미지 URL 가져오기 (언어팩 기반)
  const getLocalizedImageUrl = (slide: SlideData): string | undefined => {
    if (!slide.useFullImage) return undefined;
    
    // 현재 언어에 맞는 이미지 URL 반환
    if (currentLanguage === 'ko' && slide.fullImageUrl) {
      return slide.fullImageUrl; // 기본 이미지 (한국어)
    } else if (currentLanguage === 'en' && slide.fullImageUrlEn) {
      return slide.fullImageUrlEn;
    } else if (currentLanguage === 'ja' && slide.fullImageUrlJp) {
      return slide.fullImageUrlJp;
    } else {
      // 추가 언어 지원을 위한 동적 필드 확인
      const fieldName = `fullImageUrl${currentLanguage.charAt(0).toUpperCase() + currentLanguage.slice(1)}`;
      const dynamicUrl = (slide as any)[fieldName];
      if (dynamicUrl) return dynamicUrl;
      
      // 폴백: 기본 이미지 (한국어)
      return slide.fullImageUrl;
    }
  };

  // DB에서 데이터 로드 또는 props 데이터 사용
  useEffect(() => {
    if (data?.slides && Array.isArray(data.slides) && data.slides.length > 0) {
      setSlides(data.slides);
      setLoading(false);
    } else {
      loadHeroData();
    }
  }, [data, sectionId, currentLanguage]);

  const loadHeroData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ui-sections/${sectionId}`, {
        headers: {
          'Accept-Language': currentLanguage
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.section?.data?.slides) {
          setSlides(result.section.data.slides);
        } else if (result.section?.config?.slides) {
          setSlides(result.section.config.slides);
        }
      }
    } catch (error) {
      console.error('Error loading hero data:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoPlay = data?.autoPlay !== false;
  const autoPlayInterval = data?.autoPlayInterval || 5000;

  // 다음 슬라이드로 이동 (2개씩)
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 2;
      return nextIndex >= slides.length ? 0 : nextIndex;
    });
  };

  // 이전 슬라이드로 이동 (2개씩)
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const prevIdx = prevIndex - 2;
      return prevIdx < 0 ? Math.max(0, slides.length - 2) : prevIdx;
    });
  };

  // 자동 재생
  useEffect(() => {
    if (autoPlay && !isPaused && slides.length > 2) {
      const interval = setInterval(nextSlide, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [currentIndex, autoPlay, isPaused, slides.length, autoPlayInterval]);

  if (loading) {
    return (
      <div className={`w-full py-4 ${className}`}>
        <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-[280px] lg:h-[320px] bg-gray-200 animate-pulse rounded-2xl" />
            <div className="h-[280px] lg:h-[320px] bg-gray-200 animate-pulse rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // 슬라이드가 없을 때 기본 슬라이드 표시
  if (!slides || slides.length === 0) {
    slides = [
      {
        id: 'default-1',
        title: '특별 할인 이벤트',
        subtitle: '최대 70% 할인',
        buttonText: '쇼핑하기',
        link: '/products',
        bgColor: 'bg-gradient-to-br from-blue-600 to-purple-600'
      },
      {
        id: 'default-2',
        title: '신상품 출시',
        subtitle: '새로운 제품을 만나보세요',
        buttonText: '구경하기',
        link: '/products',
        bgColor: 'bg-gradient-to-br from-green-600 to-teal-600'
      }
    ];
  }

  // 현재 표시할 2개의 슬라이드
  const visibleSlides = [
    slides[currentIndex],
    slides[currentIndex + 1] || slides[0]
  ];

  // 인디케이터 개수 계산 (2개씩 그룹)
  const indicatorCount = Math.ceil(slides.length / 2);

  return (
    <section 
      className={`relative w-full py-4 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="w-full">
        {/* 슬라이드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleSlides.map((slide, index) => {
            const fullImageUrl = getLocalizedImageUrl(slide);
            
            return (
              <div
                key={`${slide.id}-${index}`}
                className={`relative rounded-2xl overflow-hidden ${
                  fullImageUrl 
                    ? 'bg-gray-100' 
                    : `bg-gradient-to-br ${slide.bgColor || 'from-gray-700 to-gray-900'} ${slide.textColor || 'text-white'} p-8 lg:p-12`
                } min-h-[280px] lg:min-h-[320px] flex flex-col justify-between group transition-transform hover:scale-[1.02] cursor-pointer`}
                onClick={() => slide.link && (window.location.href = slide.link)}
                style={{
                  backgroundImage: !fullImageUrl && slide.backgroundImage ? `url(${slide.backgroundImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {fullImageUrl ? (
                  /* 전체 이미지 모드 */
                  <div className="absolute inset-0">
                    <img 
                      src={fullImageUrl} 
                      alt={getLocalizedText(slide.title)}
                      className="w-full h-full object-cover"
                      style={{
                        width: slide.fullImageWidth ? `${slide.fullImageWidth}px` : undefined,
                        height: slide.fullImageHeight ? `${slide.fullImageHeight}px` : undefined,
                      }}
                    />
                  </div>
                ) : (
                  <>
                    {/* 배경 패턴 (텍스트 모드) */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                      }}></div>
                    </div>

                    {/* 텍스트 컨텐츠 */}
                    <div className="relative z-10">
                      {slide.tag && (
                        <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium mb-4">
                          {getLocalizedText(slide.tag)}
                        </span>
                      )}
                      <h2 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight whitespace-pre-line">
                        {getLocalizedText(slide.title)}
                      </h2>
                      <p className="text-base lg:text-lg opacity-90">
                        {getLocalizedText(slide.subtitle)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* 네비게이션 및 인디케이터 */}
        {slides.length > 2 && (
          <div className="flex items-center justify-center mt-6 gap-4">
            {/* 이전 버튼 */}
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              aria-label="Previous slides"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            {/* 인디케이터 */}
            <div className="flex gap-2">
              {Array.from({ length: indicatorCount }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * 2)}
                  className={`h-2 transition-all rounded-full ${
                    Math.floor(currentIndex / 2) === index 
                      ? 'w-8 bg-gray-800' 
                      : 'w-2 bg-gray-400'
                  }`}
                  aria-label={`Go to slide group ${index + 1}`}
                />
              ))}
            </div>

            {/* 다음 버튼 */}
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              aria-label="Next slides"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
});

export default HeroSection;