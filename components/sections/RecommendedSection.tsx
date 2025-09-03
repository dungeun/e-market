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
    if (data) {
      // JSON 데이터가 있는 경우 직접 사용
      setRecommendations(data.items || []);
      setTitle(data.title || '추천 상품');
      setSubtitle(data.subtitle || '선별된 인기 상품을 만나보세요');
      setLoading(false);
      setIsVisible(true);
    } else {
      // Fallback: API 호출 (하위 호환성)
      loadRecommendedData();
    }
  }, [data, sectionId]);

  const loadRecommendedData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ui-sections/${sectionId}`);
      
      if (response.ok) {
        const apiData = await response.json();
        if (apiData.section) {
          setRecommendations(apiData.section.content?.items || []);
          setIsVisible(apiData.section.isActive !== false);
        }
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`w-full py-12 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

  if (!isVisible || recommendations.length === 0) {
    return null;
  }

  return (
    <section className={`w-full py-12 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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