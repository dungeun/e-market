'use client';

import React from 'react';

import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import { Clock, Zap } from 'lucide-react'

interface FlashSaleProps {
  config: {
    title?: string
    subtitle?: string
    endTime?: string
    productIds?: string[]
    limit?: number
    showTimer?: boolean
    backgroundColor?: string
    textColor?: string
  }
  products: unknown[]
}

const FlashSale = React.memo(function FlashSale({ config = {}, products = [] }: FlashSaleProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    if (!config?.showTimer || !config?.endTime) return

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const end = new Date(config?.endTime!).getTime()
      const distance = end - now

      if (distance < 0) {
        clearInterval(timer)
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [config?.endTime, config?.showTimer])

  return (
    <section className="py-12 px-4 bg-white text-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <Zap className="w-8 h-8" />
            <div>
              {config?.title && (
                <h2 className="text-3xl font-bold">
                  {config?.title}
                </h2>
              )}
              {config?.subtitle && (
                <p className="text-sm opacity-90">
                  {config?.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* 타이머 */}
          {config?.showTimer && (
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <div className="flex gap-3">
                <div className="text-center">
                  <div className="bg-white/20 rounded px-3 py-2">
                    <span className="text-2xl font-bold">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-xs">시간</span>
                </div>
                <div className="text-2xl font-bold">:</div>
                <div className="text-center">
                  <div className="bg-white/20 rounded px-3 py-2">
                    <span className="text-2xl font-bold">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-xs">분</span>
                </div>
                <div className="text-2xl font-bold">:</div>
                <div className="text-center">
                  <div className="bg-white/20 rounded px-3 py-2">
                    <span className="text-2xl font-bold">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="text-xs">초</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 상품 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.slice(0, config?.limit || 4).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showBadge={true}
              badgeText="한정특가"
            />
          ))}
        </div>

        {/* 더보기 */}
        <div className="text-center mt-8">
          <a
            href="/flash-sale"
            className="inline-block px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-gray-900 transition-colors font-semibold"
          >
            모든 특가 상품 보기
          </a>
        </div>
      </div>
    </section>
    )
});

export default FlashSale;