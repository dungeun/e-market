'use client';

import React from 'react';

import Image from 'next/image'
import Link from 'next/link'

interface BannerGridProps {
  config: {
    layout?: string
    banners?: {
      id: number
      image: string
      link: string
      alt: string
    }[]
    spacing?: number
    rounded?: boolean
  }
}

const BannerGrid = React.memo(function BannerGrid({ config }: BannerGridProps) {
  if (!config?.banners || config?.banners.length === 0) return null

  const getGridClass = () => {
    switch (config?.layout) {
      case '2x2':
        return 'grid-cols-2 grid-rows-2'
      case '1x3':
        return 'grid-cols-3'
      case '2x1':
        return 'grid-cols-1 md:grid-cols-2'
      default:
        return 'grid-cols-2'
    }
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className={`grid ${getGridClass()} gap-${config?.spacing || 4}`}
        >
          {config?.banners.map((banner) => (
            <Link
              key={banner.id}
              href={banner.link}
              className="relative group overflow-hidden"
            >
              <div className={`relative aspect-video bg-gray-100 ${
                config?.rounded ? 'rounded-lg' : ''
              } overflow-hidden`}>
                <Image
                  src={banner.image || '/placeholder.svg'}
                  alt={banner.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
    )
});

export default BannerGrid;