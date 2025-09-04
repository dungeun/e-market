'use client';

import React, { useState, useEffect } from 'react';

import ProductCard from './ProductCard'
import { Trophy, TrendingUp } from 'lucide-react'

interface BestSellersProps {
  config?: {
    title?: string
    subtitle?: string
    period?: 'day' | 'week' | 'month' | 'all'
    limit?: number
    showRanking?: boolean
    showSalesCount?: boolean
    categoryFilter?: string | null
  }
  products?: unknown[]
  data?: unknown
  sectionId?: string
}

const BestSellers = React.memo(function BestSellers({ config: propsConfig, products: propsProducts = [], data, sectionId }: BestSellersProps) {
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
      // 베스트셀러 상품 조회 API 호출
      const response = await fetch('/api/products/best-sellers?limit=10');
      if (response.ok) {
        const data = await response.json();
        // Transform products to match ProductCard interface
        const transformedProducts = (data.products || []).map((p: any) => {
          console.log('API에서 받은 이미지 URL:', p.image);
          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            original_price: p.originalPrice,
            stock: p.stock || 50,
            images: [{ url: p.image || '/images/product-placeholder.png' }],
            rating: p.rating,
            review_count: p.review_count || 0,
            featured: p.featured,
            new: p.new
          };
        });
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Failed to load best-sellers:', error);
      // 에러 시 샘플 데이터
      setProducts([
        {
          id: 'bs-1',
          name: '베스트셀러 상품 1',
          slug: 'best-1',
          price: 29900,
          original_price: 39900,
          stock: 10,
          images: [{ url: '/images/product-placeholder.png' }],
          rating: 4.8,
          review_count: 150,
          featured: true,
          new: false
        },
        {
          id: 'bs-2',
          name: '베스트셀러 상품 2',
          slug: 'best-2',
          price: 39900,
          original_price: 49900,
          stock: 5,
          images: [{ url: '/images/product-placeholder.png' }],
          rating: 4.6,
          review_count: 120,
          featured: true,
          new: true
        },
        {
          id: 'bs-3',
          name: '베스트셀러 상품 3',
          slug: 'best-3',
          price: 49900,
          stock: 15,
          images: [{ url: '/images/product-placeholder.png' }],
          rating: 4.5,
          review_count: 100,
          featured: false,
          new: false
        },
        {
          id: 'bs-4',
          name: '베스트셀러 상품 4',
          slug: 'best-4',
          price: 19900,
          stock: 20,
          images: [{ url: '/images/product-placeholder.png' }],
          rating: 4.3,
          review_count: 80,
          featured: false,
          new: true
        },
        {
          id: 'bs-5',
          name: '베스트셀러 상품 5',
          slug: 'best-5',
          price: 59900,
          stock: 8,
          images: [{ url: '/images/product-placeholder.png' }],
          rating: 4.9,
          review_count: 75,
          featured: true,
          new: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  const getPeriodText = () => {
    switch (config?.period) {
      case 'day': return '오늘'
      case 'week': return '이번 주'
      case 'month': return '이번 달'
      default: return '전체'
    }
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1450px] mx-auto px-0">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-red-500" />
            <h2 className="text-3xl font-bold text-gray-900">
              베스트 상품
            </h2>
          </div>
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {getPeriodText()} 베스트
            </span>
          </div>
        </div>

        {/* 상품 리스트 */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse p-2">
                <div className="bg-gray-200 rounded-lg h-64"></div>
                <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="mt-1 h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {products.slice(0, 4).map((product, index) => (
              <div key={product.id} className="p-2">
                <ProductCard
                  product={product}
                  showRanking={config?.showRanking ? index + 1 : undefined}
                  showSalesCount={config?.showSalesCount}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            베스트셀러 상품이 없습니다.
          </div>
        )}

        {/* 더보기 */}
        <div className="text-center mt-8">
          <a
            href={`/best-sellers?period=${config?.period}`}
            className="inline-block px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
          >
            베스트셀러 전체보기
          </a>
        </div>
      </div>
    </section>
    )
});

export default BestSellers;