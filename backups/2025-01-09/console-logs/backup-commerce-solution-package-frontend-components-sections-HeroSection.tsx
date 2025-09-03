'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  tag?: string;
  link?: string;
  bgColor: string;
  backgroundImage?: string;
  visible: boolean;
  order: number;
}

interface HeroSectionProps {
  sectionId?: string;
  className?: string;
}

export default function HeroSection({ sectionId = 'hero', className = '' }: HeroSectionProps) {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // 섹션 데이터 로드
  useEffect(() => {
    loadHeroData();
  }, [sectionId]);

  // 자동 슬라이드
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const loadHeroData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ui-sections/${sectionId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.section) {
          const visibleSlides = data.section.content?.slides?.filter((slide: HeroSlide) => slide.visible) || [];
          setSlides(visibleSlides.sort((a: HeroSlide, b: HeroSlide) => a.order - b.order));
          setIsVisible(data.section.isActive !== false);
        }
      }
    } catch (error) {
      console.error('Error loading hero section:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  if (loading) {
    return (
      <div className={`w-full h-96 bg-gray-100 animate-pulse rounded-lg ${className}`} />
    );
  }

  if (!isVisible || slides.length === 0) {
    return null;
  }

  const currentSlideData = slides[currentSlide];

  return (
    <section className={`relative w-full h-[500px] lg:h-[600px] overflow-hidden rounded-lg ${className}`}>
      {/* 메인 슬라이드 */}
      <div className="relative h-full">
        <div 
          className={`${currentSlideData.bgColor} h-full flex items-center justify-center text-white relative`}
          style={{
            backgroundImage: currentSlideData.backgroundImage 
              ? `url(${currentSlideData.backgroundImage})` 
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* 오버레이 (배경 이미지가 있을 때) */}
          {currentSlideData.backgroundImage && (
            <div className="absolute inset-0 bg-black/40" />
          )}

          {/* 콘텐츠 */}
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            {currentSlideData.tag && (
              <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium mb-4">
                {currentSlideData.tag}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 leading-tight">
              {currentSlideData.title.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  {index < currentSlideData.title.split('\n').length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl mb-8 opacity-90">
              {currentSlideData.subtitle}
            </p>
            {currentSlideData.link && (
              <Link
                href={currentSlideData.link}
                className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                자세히 보기
                <ExternalLink className="ml-2 w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* 네비게이션 화살표 */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* 인디케이터 */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 서브 슬라이드 (2단 구성의 하단 부분) */}
      {slides.length > 3 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {slides.slice(1, 4).map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(index + 1)}
                  className={`text-left p-3 rounded-lg transition-colors ${
                    currentSlide === index + 1 
                      ? 'bg-white/20 backdrop-blur' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  {slide.tag && (
                    <span className="text-xs text-white/80 mb-1 block">{slide.tag}</span>
                  )}
                  <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">
                    {slide.title}
                  </h3>
                  <p className="text-white/80 text-xs line-clamp-1">
                    {slide.subtitle}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}