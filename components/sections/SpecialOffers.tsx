'use client';

import React, { useState, useEffect } from 'react';

import ProductCard from './ProductCard'
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
    <section className="py-12 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Tag className="w-6 h-6" style={{ color: config?.highlightColor || '#ff0000' }} />
            {config?.title && (
              <h2 className="text-3xl font-bold text-white">
                {config?.title}
              </h2>
            )}
            <Percent className="w-6 h-6" style={{ color: config?.highlightColor || '#ff0000' }} />
          </div>
          {config?.subtitle && (
            <p className="text-gray-300">
              {config?.subtitle}
            </p>
          )}
          {config?.minDiscount && (
            <div className="mt-2 inline-block bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {config?.minDiscount}% 이상 할인!
            </div>
          )}
        </div>

        {/* 상품 그리드 */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-800 rounded-lg h-64"></div>
                <div className="mt-2 h-4 bg-gray-800 rounded w-3/4"></div>
                <div className="mt-1 h-4 bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {products.slice(0, config?.limit || 6).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showBadge={true}
                badgeText="특가"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            특가 상품이 없습니다.
          </div>
        )}

        {/* 더보기 */}
        <div className="text-center mt-8">
          <a
            href="/products/special-offers"
            className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            특가 상품 모두 보기
          </a>
        </div>
      </div>
    </section>
    )
});

export default SpecialOffers;