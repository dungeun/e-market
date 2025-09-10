'use client';

import React from 'react';

import Image from 'next/image'
import Link from 'next/link'

interface Category {
  id: number | string
  name: string
  image: string
  link: string
}

interface CategoryShowcaseProps {
  config?: any
  data?: any
}

const CategoryShowcase = React.memo(function CategoryShowcase({ config, data }: CategoryShowcaseProps) {
  const categories = data?.categories || config?.categories || [
    { id: 1, name: '패션', image: '/images/categories/fashion.jpg', link: '/category/fashion' },
    { id: 2, name: '전자제품', image: '/images/categories/electronics.jpg', link: '/category/electronics' },
    { id: 3, name: '홈&리빙', image: '/images/categories/home.jpg', link: '/category/home' },
    { id: 4, name: '스포츠', image: '/images/categories/sports.jpg', link: '/category/sports' },
    { id: 5, name: '뷰티', image: '/images/categories/beauty.jpg', link: '/category/beauty' },
    { id: 6, name: '식품', image: '/images/categories/food.jpg', link: '/category/food' }
  ]

  const title = config?.title || '카테고리'
  const subtitle = config?.subtitle || '원하는 상품을 카테고리별로 찾아보세요'

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-600">
              {subtitle}
            </p>
          )}
        </div>

        {/* 카테고리 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.slice(0, config?.limit || 6).map((category: Category) => (
            <Link
              key={category.id}
              href={category.link || `/categories/${category.id}`}
              className="group text-center"
            >
              <div className="relative aspect-square mb-3 overflow-hidden rounded-full bg-white shadow-md group-hover:shadow-lg transition-shadow">
                <Image
                  src={category.image || '/placeholder.png'}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
    )
});

export default CategoryShowcase;