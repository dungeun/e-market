'use client';

import React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Heart, ArrowRight, Clock } from 'lucide-react';

interface RecommendedItem {
  id: string;
  title: string;
  description?: string;
  price: string;
  originalPrice?: string;
  image: string;
  link: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  isNew?: boolean;
  isSale?: boolean;
}

interface RecommendedSectionProps {
  data?: unknown;
  sectionId?: string;
  className?: string;
}

const RecommendedSection = React.memo(function RecommendedSection({ data, sectionId = 'recommended', className = '' }: RecommendedSectionProps) {
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
  const [loading, setLoading] = useState(!data);
  const [isVisible, setIsVisible] = useState(true);
  const [title, setTitle] = useState('추천 상품');
  const [subtitle, setSubtitle] = useState('선별된 인기 상품을 만나보세요');

  useEffect(() => {
    // 실제 추천 상품 데이터를 로드
    loadRecommendedData();
  }, [data, sectionId]);

  const loadRecommendedData = async () => {
    try {
      setLoading(true);
      
      // 추천 상품 가져오기 (예: 평점 높은 상품)
      const response = await fetch('/api/products?sort=rating&limit=8');
      
      if (response.ok) {
        const result = await response.json();
        const products = (result.products || []).map((p: any) => ({
          id: p.id,
          title: p.name,
          description: p.description || '',
          price: p.price,
          originalPrice: p.originalPrice,
          image: p.image || '/placeholder.png',
          link: `/products/${p.slug}`,
          badge: p.stock < 5 ? '품절임박' : p.new ? 'NEW' : undefined,
          rating: p.rating,
          reviewCount: p.review_count
        }));
        
        setRecommendations(products);
      }
      
      // data prop에서 제목과 부제목 가져오기
      if (data && typeof data === 'object') {
        setTitle(data.title || '추천 상품');
        setSubtitle(data.subtitle || '고객님을 위한 맞춤 추천');
      }
      
      setIsVisible(true);
    } catch (error) {
      console.error('Failed to load recommended products:', error);
      
      // 에러 시 샘플 데이터
      setRecommendations([
        {
          id: 'rec-1',
          title: '추천 상품 1',
          description: '인기 상품입니다',
          price: 29900,
          image: '/placeholder.png',
          link: '/products/1',
          rating: 4.8,
          reviewCount: 124
        },
        {
          id: 'rec-2',
          title: '추천 상품 2',
          description: '베스트셀러',
          price: 39900,
          originalPrice: 49900,
          image: '/placeholder.png',
          link: '/products/2',
          badge: 'SALE',
          rating: 4.6,
          reviewCount: 89
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`w-full py-12 ${className}`}>
        <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="w-full h-48 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 추천 데이터가 없어도 섹션 표시
  // if (!isVisible || recommendations.length === 0) {
  //   return null;
  // }

  return (
    <section className={`w-full py-12 bg-gray-50 ${className}`}>
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 mb-4">{subtitle}</p>
          <Link
            href="/products/recommended"
            className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
          >
            더 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.slice(0, 8).map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className="group block"
            >
              <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
                {/* 이미지 */}
                <div className="relative w-full h-48 overflow-hidden">
                  {item.image && item.image !== "" ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  
                  {/* 배지 */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    {item.isNew && (
                      <span className="bg-green-500 text-white px-2 py-1 text-xs font-medium rounded">
                        NEW
                      </span>
                    )}
                    {item.isSale && (
                      <span className="bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
                        SALE
                      </span>
                    )}
                    {item.badge && (
                      <span className="bg-blue-500 text-white px-2 py-1 text-xs font-medium rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* 찜하기 버튼 */}
                  <button className="absolute top-2 right-2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors">
                    <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                  </button>
                </div>

                {/* 정보 */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  {/* 평점 */}
                  {item.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(item.rating!)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {item.rating.toFixed(1)}
                      </span>
                      {item.reviewCount && (
                        <span className="text-xs text-gray-500">
                          ({item.reviewCount})
                        </span>
                      )}
                    </div>
                  )}

                  {/* 가격 */}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {item.price}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {item.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
});
export default RecommendedSection;