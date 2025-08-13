'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BannerSlide {
  id: string
  title: string
  subtitle?: string
  image: string
  link?: string
  buttonText?: string
}

interface AutoSlideBannerProps {
  slides: BannerSlide[]
  autoplay?: boolean
  interval?: number
  height?: string
}

export default function AutoSlideBanner({ 
  slides, 
  autoplay = true,
  interval = 5000,
  height = '600px'
}: AutoSlideBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // 자동 슬라이드
  useEffect(() => {
    if (!autoplay || isPaused || slides.length <= 1) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, interval)

    return () => clearInterval(timer)
  }, [currentSlide, isPaused, slides.length, interval, autoplay])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  if (slides.length === 0) {
    return null
  }

  const currentSlideData = slides[currentSlide]

  return (
    <div 
      className="relative w-full overflow-hidden"
      style={{ height }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 배너 이미지 */}
      <div className="relative h-full w-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative h-full w-full">
              <Image
                src={slide.image || '/images/banner-placeholder.jpg'}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4 md:px-6">
                  <div className="max-w-2xl space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                      {slide.title}
                    </h1>
                    {slide.subtitle && (
                      <p className="text-lg md:text-xl text-white/90">
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.link && slide.buttonText && (
                      <Link 
                        href={slide.link}
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-black bg-white rounded-full hover:bg-gray-100 transition-colors"
                      >
                        {slide.buttonText}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 좌우 네비게이션 버튼 */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all"
            aria-label="이전 슬라이드"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all"
            aria-label="다음 슬라이드"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* 인디케이터 */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 w-2 hover:bg-white/70'
              }`}
              aria-label={`슬라이드 ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}