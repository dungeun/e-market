'use client';

import React from 'react';

import ProductCard from './ProductCard'
import SectionLayout from '../ui/SectionLayout'
import { TrendingUp, Flame } from 'lucide-react'

interface TrendingProductsProps {
  config: {
    title?: string
    subtitle?: string
    algorithm?: string
    timeWindow?: number
    limit?: number
    showTrendingScore?: boolean
    updateInterval?: number
  }
  products: unknown[]
}

const TrendingProducts = React.memo(function TrendingProducts({ config = {}, products = [] }: TrendingProductsProps) {
  const safeProducts = products && Array.isArray(products) ? products : [];
  
  return (
    <SectionLayout
      theme="dark"
      layout="grid"
      columns={4}
      responsive={{
        mobile: 2,
        tablet: 4,
        desktop: 4
      }}
      header={{
        title: config?.title || '트렌딩 상품',
        subtitle: config?.subtitle,
        icon: Flame,
        secondaryIcon: TrendingUp,
        centerAlign: true
      }}
      empty={safeProducts.length === 0}
      emptyState={{
        message: '트렌딩 상품이 없습니다.',
        description: '인기 상품이 곧 업데이트될 예정입니다.'
      }}
      cta={{
        text: '트렌딩 상품 더보기',
        href: '/products/trending',
        variant: 'outline'
      }}
      section={{
        'aria-label': '트렌딩 상품 목록'
      }}
    >
      {safeProducts.slice(0, config?.limit || 8).map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          showBadge={true}
          badgeText={`HOT #${index + 1}`}
          showViewCount={config?.showTrendingScore}
        />
      ))}
    </SectionLayout>
    )
});

export default TrendingProducts;