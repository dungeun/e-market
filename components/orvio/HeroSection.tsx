'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

interface HeroSlide {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  link: string
  buttonText: string
}

interface OrvioHeroProps {
  slides?: HeroSlide[]
}

export default function OrvioHeroSection({ slides }: OrvioHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const defaultSlides = [
    {
      id: '1',
      title: 'Premium Collection',
      subtitle: 'NEW ARRIVAL',
      description: 'Discover our latest collection of premium products with exclusive designs',
      image: '/images/hero/orvio-hero-1.jpg',
      link: '/products',
      buttonText: 'Shop Now'
    },
    {
      id: '2',
      title: 'Summer Sale',
      subtitle: 'UP TO 50% OFF',
      description: 'Get amazing deals on selected items for a limited time only',
      image: '/images/hero/orvio-hero-2.jpg',
      link: '/sale',
      buttonText: 'View Deals'
    }
  ]

  const heroSlides = slides || defaultSlides

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto h-full">
        <div className="relative h-full">
          {/* Slides */}
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-1000 ${
                index === currentSlide 
                  ? 'opacity-100 translate-x-0' 
                  : index < currentSlide 
                  ? 'opacity-0 -translate-x-full' 
                  : 'opacity-0 translate-x-full'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full px-4 md:px-0">
                {/* Content */}
                <div className="order-2 md:order-1 space-y-6">
                  <div className="space-y-4">
                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-full">
                      {slide.subtitle}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-md">
                      {slide.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href={slide.link}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                    >
                      {slide.buttonText}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-gray-400 transition-all duration-300"
                    >
                      View All
                    </Link>
                  </div>
                </div>

                {/* Image */}
                <div className="order-1 md:order-2 relative h-[300px] md:h-[500px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-blue-200 rounded-3xl opacity-20 transform rotate-6"></div>
                  <div className="relative h-full rounded-3xl overflow-hidden">
                    <Image
                      src={slide.image || '/placeholder.svg'}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full opacity-60"></div>
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-400 rounded-full opacity-40"></div>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-shadow z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-shadow z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-12 h-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full'
                    : 'w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}