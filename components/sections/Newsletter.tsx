'use client';

import React from 'react';

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

interface NewsletterProps {
  config?: any
  data?: any
}

const Newsletter = React.memo(function Newsletter({ config, data }: NewsletterProps) {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const newsletterData = data || config || {
    title: '특별 혜택을 받아보세요',
    subtitle: '신상품 소식과 할인 쿠폰을 이메일로 받아보세요',
    placeholder: '이메일 주소를 입력하세요',
    buttonText: '구독하기',
    benefits: [
      '신상품 출시 소식 우선 전달',
      '회원 전용 할인 쿠폰 제공',
      '특별 이벤트 초대'
    ]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // TODO: 실제 구독 API 호출
      setIsSubscribed(true)
      setTimeout(() => setIsSubscribed(false), 3000)
      setEmail('')
    }
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {newsletterData.title}
            </h2>
            <p className="text-lg text-gray-600">
              {newsletterData.subtitle}
            </p>
          </div>

          {/* 혜택 리스트 */}
          {newsletterData.benefits && (
            <div className="mb-8 flex flex-wrap justify-center gap-4">
              {newsletterData.benefits.map((benefit: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          )}

          {/* 구독 폼 */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={newsletterData.placeholder}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {newsletterData.buttonText}
              </button>
            </div>
          </form>

          {/* 성공 메시지 */}
          {isSubscribed && (
            <div className="mt-4 text-center text-green-600 font-medium">
              구독이 완료되었습니다! 감사합니다.
            </div>
          )}

          {/* 개인정보 보호 안내 */}
          <p className="mt-6 text-center text-sm text-gray-500">
            이메일 주소는 안전하게 보관되며 마케팅 목적으로만 사용됩니다.
          </p>
        </div>
      </div>
    </section>
    )
});

export default Newsletter;