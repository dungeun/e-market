'use client'

import AutoSlideBanner from '@/components/main/AutoSlideBanner'

interface HeroSectionProps {
  config?: any
  data?: any
}

export default function HeroSection({ config, data }: HeroSectionProps) {
  const slides = config?.slides || data?.slides || [
    {
      id: '1',
      title: '새로운 컬렉션',
      subtitle: '2024 겨울 신상품을 만나보세요',
      image: '/images/hero/slide1.svg',
      link: '/collections/winter-2024',
      buttonText: '지금 쇼핑하기'
    },
    {
      id: '2',
      title: '특별 할인',
      subtitle: '최대 50% 할인된 상품을 만나보세요',
      image: '/images/hero/slide2.svg',
      link: '/sale',
      buttonText: '할인 상품 보기'
    }
  ]

  return (
    <AutoSlideBanner
      slides={slides}
      autoplay={config?.autoplay !== false}
      interval={config?.interval || 5000}
      height={config?.height || '600px'}
    />
  )
}