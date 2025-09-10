'use client';

import React from 'react';

import ProductCard from './ProductCard'
import SectionLayout from '../ui/SectionLayout'
import { Sparkles } from 'lucide-react'

interface NewArrivalsProps {
  config: {
    title?: string
    subtitle?: string
    daysLimit?: number
    limit?: number
    sortBy?: string
    layout?: 'carousel' | 'grid'
    showArrivalDate?: boolean
  }
  products: unknown[]
}

const NewArrivals = React.memo(function NewArrivals({ config = {}, products = [] }: NewArrivalsProps) {
  return (
    <SectionLayout
      theme="light"
      layout="grid"
      columns={6}
      responsive={{
        mobile: 2,
        tablet: 4,
        desktop: 6
      }}
      header={{
        title: config?.title || '신상품',
        subtitle: config?.subtitle,
        icon: Sparkles,
        secondaryIcon: Sparkles,
        centerAlign: true
      }}
      empty={products.length === 0}
      emptyState={{
        message: '신상품이 없습니다.',
        description: '새로운 상품이 곧 출시될 예정입니다.'
      }}
      cta={{
        text: '신상품 더보기',
        href: '/products?sort=newest',
        variant: 'outline'
      }}
      section={{
        'aria-label': '신상품 목록'
      }}
    >
      {products.slice(0, config?.limit || 12).map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          showBadge={true}
          badgeText="NEW"
        />
      ))}
    </SectionLayout>
    )
});

export default NewArrivals;