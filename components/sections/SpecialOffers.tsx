'use client';

import React, { useState, useEffect } from 'react';

import ProductCard from './ProductCard'
import SectionLayout from '../ui/SectionLayout'
import { Tag, Percent } from 'lucide-react'

interface SpecialOffersProps {
  config?: {
    title?: string
    subtitle?: string
    minDiscount?: number
    limit?: number
    showOriginalPrice?: boolean
    showDiscountPercentage?: boolean
    highlightColor?: string
  }
  products?: unknown[]
  data?: unknown
  sectionId?: string
}

const SpecialOffers = React.memo(function SpecialOffers({ config: propsConfig, products: propsProducts = [], data, sectionId }: SpecialOffersProps) {
  const [products, setProducts] = useState<unknown[]>(propsProducts);
  const [loading, setLoading] = useState(false);
  
  // data에서 config 추출 (data가 config를 포함하는 경우)
  const config = propsConfig || data || {};

  useEffect(() => {
    // props로 상품이 없는 경우 API에서 가져오기
    if (products.length === 0) {
      loadProducts();
    }
  }, [sectionId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // 특가 상품 조회 API 호출
      const response = await fetch('/api/products/special-offers?limit=6');
      if (response.ok) {
        const data = await response.json();
        // Transform products to match ProductCard interface
        const transformedProducts = (data.products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          original_price: p.originalPrice,
          stock: p.stock || 10,
          images: [{ url: p.image || '/images/product-placeholder.png' }],
          rating: p.rating,
          review_count: 0,
          featured: false,
          new: false
        }));
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Failed to load special-offers:', error);
      // 에러 시 샘플 데이터
      setProducts([
        {
          id: 'so-1',
          name: '특별 할인 상품 1',
          slug: 'special-1',
          price: 19900,
          original_price: 39900,
          stock: 10,
          images: [{ url: '/images/product-placeholder.png' }],
          rating: 0,
          review_count: 0,
          featured: false,
          new: false
        },
        {
          id: 'so-2',
          name: '특별 할인 상품 2',
          slug: 'special-2',
          price: 29900,
          original_price: 49900,
          stock: 10,
          images: [{ url: '/images/product-placeholder.png' }],
          rating: 0,
          review_count: 0,
          featured: false,
          new: false
        },
        {
          id: 'so-3',
          name: '특별 할인 상품 3',
          slug: 'special-3',
          price: 39900,
          original_price: 59900,
          stock: 10,
          images: [{ url: '/images/product-placeholder.png' }],
          rating: 0,
          review_count: 0,
          featured: false,
          new: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SectionLayout
      theme="dark"
      layout="grid"
      columns={3}
      responsive={{
        mobile: 2,
        tablet: 3,
        desktop: 3
      }}
      header={{
        title: config?.title || '특가 상품',
        subtitle: config?.subtitle,
        icon: Tag,
        secondaryIcon: Percent,
        centerAlign: true,
        badge: config?.minDiscount ? {
          text: `${config.minDiscount}% 이상 할인!`,
          color: config?.highlightColor || '#ef4444'
        } : undefined
      }}
      loading={loading}
      empty={!loading && products.length === 0}
      emptyState={{
        message: '특가 상품이 없습니다.',
        description: '할인 상품이 곧 업데이트될 예정입니다.'
      }}
      skeleton={{
        count: 3,
        height: '300px',
        showHeader: true
      }}
      cta={{
        text: '특가 상품 모두 보기',
        href: '/products/special-offers',
        variant: 'primary'
      }}
      section={{
        'aria-label': '특가 상품 목록'
      }}
    >
      {products.slice(0, config?.limit || 6).map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          showBadge={true}
          badgeText="특가"
        />
      ))}
    </SectionLayout>
    )
});

export default SpecialOffers;