'use client';

import React from 'react';

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

interface Testimonial {
  id: string
  rating: number
  content: string
  author: {
    name: string
    role: string
    avatar: string
  }
}

interface TestimonialProps {
  testimonials?: Testimonial[]
  overallRating?: number
  totalReviews?: number
}

const OrvioTestimonialSection = React.memo(function OrvioTestimonialSection({ 
  testimonials, 
  overallRating = 4.9,
  totalReviews = 3500 
}: TestimonialProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  const defaultTestimonials: Testimonial[] = [
    {
      id: '1',
      rating: 5,
      content: "Orvio creative in making strategy, design, and technology. They're experts with an efficient process that delivers smoothly. Their kindness makes them an excellent partner, which I whole-heartedly recommend.",
      author: {
        name: 'Amelia Dyer',
        role: 'Graphics Designer',
        avatar: '/placeholder.svg'
      }
    },
    {
      id: '2',
      rating: 5,
      content: "The quality exceeded my expectations! Fast shipping, excellent customer service, and the product is exactly as described. I've already recommended this store to my friends and family.",
      author: {
        name: 'John Smith',
        role: 'Software Engineer',
        avatar: '/placeholder.svg'
      }
    },
    {
      id: '3',
      rating: 5,
      content: "Absolutely love my purchase! The attention to detail is remarkable and the user experience is seamless. This is my third purchase and I keep coming back for the quality and service.",
      author: {
        name: 'Sarah Johnson',
        role: 'Product Manager',
        avatar: '/placeholder.svg'
      }
    },
    {
      id: '4',
      rating: 5,
      content: "Outstanding quality and service! The team went above and beyond to ensure my satisfaction. The product arrived quickly and was even better than expected. Highly recommend!",
      author: {
        name: 'Michael Chen',
        role: 'Business Owner',
        avatar: '/placeholder.svg'
      }
    }
  ]

  const displayTestimonials = testimonials || defaultTestimonials

  useEffect(() => {
    if (!isAutoPlay) return
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayTestimonials.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isAutoPlay, displayTestimonials.length])

  const nextSlide = () => {
    setIsAutoPlay(false)
    setCurrentSlide((prev) => (prev + 1) % displayTestimonials.length)
  }

  const prevSlide = () => {
    setIsAutoPlay(false)
    setCurrentSlide((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-4">
            <div className="text-center lg:text-left">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-600 text-sm font-semibold rounded-full mb-4">
                Our Testimonials
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Explore customer reviews
              </h2>

              {/* Rating Circle */}
              <div className="relative inline-block mb-8">
                <div className="w-40 h-40 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-4xl font-bold">{overallRating}</div>
                    <div className="flex gap-1 justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-white text-white" />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Rotating Text */}
                <svg className="absolute inset-0 w-40 h-40 animate-spin-slow" style={{ animationDuration: '20s' }}>
                  <defs>
                    <path id="circle" d="M 80,80 m -60,0 a 60,60 0 1,1 120,0 a 60,60 0 1,1 -120,0" />
                  </defs>
                  <text className="text-xs fill-purple-600 uppercase tracking-wider">
                    <textPath href="#circle">
                      • Customer Reviews • Overall Rating • 
                    </textPath>
                  </text>
                </svg>
              </div>

              <p className="text-gray-600 mb-6">
                Overall ratings from our world-wide clients over {(totalReviews / 1000).toFixed(1)}k around successful projects.
              </p>

              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                <span>Discover All</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Right Content - Testimonial Slider */}
          <div className="lg:col-span-8">
            <div className="relative">
              {/* Testimonial Cards */}
              <div className="relative h-[400px] overflow-hidden">
                {displayTestimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.id}
                    className={`absolute inset-0 transition-all duration-500 ${
                      index === currentSlide 
                        ? 'opacity-100 translate-x-0' 
                        : index < currentSlide 
                        ? 'opacity-0 -translate-x-full' 
                        : 'opacity-0 translate-x-full'
                    }`}
                  >
                    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 h-full flex flex-col justify-between">
                      {/* Rating Stars */}
                      <div>
                        <div className="flex gap-1 mb-6">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < testimonial.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Testimonial Content */}
                        <p className="text-lg text-gray-700 leading-relaxed mb-8">
                          "{testimonial.content}"
                        </p>
                      </div>

                      {/* Author */}
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16">
                          <Image
                            src={testimonial.author.avatar || '/placeholder.svg'}
                            alt={testimonial.author.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <h6 className="text-lg font-semibold text-gray-900">
                            {testimonial.author.name}
                          </h6>
                          <span className="text-sm text-gray-600">
                            {testimonial.author.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4 justify-center lg:justify-start mt-8">
                <button
                  onClick={prevSlide}
                  className="w-12 h-12 bg-white shadow-md rounded-full flex items-center justify-center hover:shadow-lg transition-shadow group"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700 group-hover:text-purple-600 transition-colors" />
                </button>
                <button
                  onClick={nextSlide}
                  className="w-12 h-12 bg-white shadow-md rounded-full flex items-center justify-center hover:shadow-lg transition-shadow group"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-purple-600 transition-colors" />
                </button>
              </div>

              {/* Slide Indicators */}
              <div className="flex gap-2 justify-center lg:justify-start mt-4">
                {displayTestimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAutoPlay(false)
                      setCurrentSlide(index)
                    }}
                    className={`transition-all duration-300 ${
                      index === currentSlide
                        ? 'w-8 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full'
                        : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
});

export default OrvioTestimonialSection;