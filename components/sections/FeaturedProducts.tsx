'use client';

import React, { useState, useEffect } from 'react';

import Image from 'next/image'
import Link from 'next/link'
import SectionLayout from '../ui/SectionLayout'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  original_price?: number
  images: { url: string; alt: string }[]
  rating?: number
  review_count?: number
}

interface FeaturedProductsProps {
  config?: any
  products?: Product[]
  data?: any
  sectionId?: string
}

const FeaturedProducts = React.memo(function FeaturedProducts({ config, products: propsProducts, data, sectionId }: FeaturedProductsProps) {
  const [items, setItems] = useState<Product[]>(propsProducts || [])
  const [loading, setLoading] = useState(false)
  
  // API에서 상품 가져오기
  useEffect(() => {
    if (items.length === 0) {
      loadProducts()
    }
  }, [sectionId])
  
  const loadProducts = async () => {
    try {
      setLoading(true)
      // 특별 할인 상품 또는 추천 상품 가져오기
      const response = await fetch('/api/products?featured=true&limit=8')
      if (response.ok) {
        const result = await response.json()
        const products = (result.products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          original_price: p.originalPrice,
          images: p.images?.length > 0 ? p.images : [{ url: p.image || '/placeholder.png', alt: p.name }],
          rating: p.rating,
          review_count: p.review_count
        }))
        setItems(products)
      }
    } catch (error) {
      console.error('Failed to load featured products:', error)
      // 에러 시 샘플 데이터
      setItems([
        {
          id: 'fp-1',
          name: '특가 상품 1',
          slug: 'featured-1',
          price: 19900,
          original_price: 29900,
          images: [{ url: '/placeholder.png', alt: '특가 상품 1' }],
          rating: 4.5,
          review_count: 42
        },
        {
          id: 'fp-2',
          name: '특가 상품 2',
          slug: 'featured-2',
          price: 29900,
          original_price: 39900,
          images: [{ url: '/placeholder.png', alt: '특가 상품 2' }],
          rating: 4.7,
          review_count: 38
        }
      ])
    } finally {
      setLoading(false)
    }
  }
  
  // Extract title and subtitle from data or config
  const title = data?.title || config?.title || '추천 상품'
  const subtitle = data?.subtitle || config?.subtitle || '엄선된 상품을 만나보세요'
  const columns = config?.columns || 4

  // 섹션은 항상 표시되도록 수정 - 빈 상태일 때도 표시
  // if (items.length === 0) {
  //   return null
  // }

  return (
    <SectionLayout
      theme="light"
      layout="grid"
      columns={columns as any}
      responsive={{
        mobile: 2,
        tablet: columns >= 4 ? 4 : columns as any,
        desktop: columns as any
      }}
      header={{
        title,
        subtitle,
        centerAlign: true
      }}
      loading={loading}
      empty={!loading && items.length === 0}
      emptyState={{
        message: '추천 상품이 없습니다.',
        description: '곧 새로운 상품을 준비하겠습니다.'
      }}
      skeleton={{
        count: 8,
        height: '250px',
        showHeader: true
      }}
      cta={{
        text: '모든 상품 보기',
        href: '/products',
        variant: 'primary'
      }}
      containerClassName="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8"
      className="py-16"
      section={{
        'aria-label': '추천 상품 목록'
      }}
    >
      {items.slice(0, data?.itemsPerPage || config?.limit || 8).map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          className="group"
        >
          <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
            {product.original_price && product.original_price > product.price && (
              <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
              </div>
            )}
            <Image
              src={product.images?.[0]?.url || '/placeholder.png'}
              alt={product.images?.[0]?.alt || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h3 className="font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <div className="space-y-1">
            {product.original_price && product.original_price > product.price && (
              <p className="text-sm text-gray-500 line-through">
                {formatPrice(product.original_price)}
              </p>
            )}
            <p className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </p>
            {product.rating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.review_count || 0})
                </span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </SectionLayout>
    )
});

export default FeaturedProducts;