'use client';

import React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Package, Search, Star, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface RankingItem {
  id: string;
  rank: number;
  title: string;
  description?: string;
  price?: string;
  originalPrice?: string;
  image?: string;
  link: string;
  badge?: string;
  rating?: number;
  stock?: number;
}

interface RankingSectionProps {
  data?: unknown;
  sectionId?: string;
  className?: string;
}

const RankingSection = React.memo(function RankingSection({ data, sectionId = 'ranking', className = '' }: RankingSectionProps) {
  const [rankings, setRankings] = useState<{
    popular: RankingItem[];
    lowStock: RankingItem[];
    search: RankingItem[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'popular' | 'lowStock' | 'search'>('popular');
  const [loading, setLoading] = useState(!data);
  const [isVisible, setIsVisible] = useState(true);
  const [title, setTitle] = useState('실시간 랭킹');
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    // 실제 상품 데이터를 로드
    loadRankingData();
  
  }, [data, sectionId, currentLanguage]);

  const loadRankingData = async () => {
    try {
      setLoading(true);
      
      // 실제 상품 데이터를 가져오기
      const [popularRes, newRes, saleRes] = await Promise.all([
        fetch('/api/products?sort=popular&limit=5'),
        fetch('/api/products?sort=newest&limit=5'),
        fetch('/api/products?category=sale&limit=5')
      ]);
      
      const popularData = popularRes.ok ? await popularRes.json() : { products: [] };
      const newData = newRes.ok ? await newRes.json() : { products: [] };
      const saleData = saleRes.ok ? await saleRes.json() : { products: [] };
      
      // 상품 데이터를 랭킹 형식으로 변환
      const formatProducts = (products: any[], startRank = 1) => {
        return products.map((p, index) => ({
          id: p.id,
          rank: startRank + index,
          title: p.name,
          description: p.description || '',
          price: `${p.price?.toLocaleString()}원`,
          originalPrice: p.originalPrice ? `${p.originalPrice.toLocaleString()}원` : undefined,
          image: p.image || '/placeholder.png',
          link: `/products/${p.slug}`,
          badge: p.stock < 5 ? '품절임박' : undefined,
          rating: p.rating,
          stock: p.stock
        }));
      };
      
      setRankings({
        popular: formatProducts(popularData.products || []),
        lowStock: formatProducts(saleData.products || []),
        search: formatProducts(newData.products || [])
      });
      
      // data prop에서 제목 가져오기
      if (data && typeof data === 'object' && 'title' in data) {
        setTitle(data.title || '실시간 인기 상품');
      }
      
      setIsVisible(true);
    } catch (error) {
      console.error('Failed to load ranking data:', error);
      
      // 에러 시 샘플 데이터
      setRankings({
        popular: [
          { id: '1', rank: 1, title: '인기 상품 1', price: '29,900원', link: '/products/1', rating: 4.5, stock: 10 },
          { id: '2', rank: 2, title: '인기 상품 2', price: '39,900원', link: '/products/2', rating: 4.3, stock: 5 },
          { id: '3', rank: 3, title: '인기 상품 3', price: '19,900원', link: '/products/3', rating: 4.8, stock: 15 }
        ],
        lowStock: [
          { id: '4', rank: 1, title: '품절임박 1', price: '49,900원', link: '/products/4', badge: '품절임박', stock: 2 },
          { id: '5', rank: 2, title: '품절임박 2', price: '24,900원', link: '/products/5', badge: '품절임박', stock: 3 }
        ],
        search: [
          { id: '6', rank: 1, title: '신상품 1', price: '34,900원', link: '/products/6', badge: 'NEW', rating: 5.0 },
          { id: '7', rank: 2, title: '신상품 2', price: '44,900원', link: '/products/7', badge: 'NEW', rating: 4.7 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  // rankings가 null이면 아직 로딩 중이므로 로딩 스켈레톤 표시
  if (!rankings) {
    return (
      <div className={`w-full py-12 ${className}`}>
        <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-48" />
              <div className="flex gap-4">
                <div className="h-10 bg-gray-200 rounded w-24" />
                <div className="h-10 bg-gray-200 rounded w-24" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 랜킹 데이터가 없어도 섹션 표시
  // if (!isVisible || (rankings.popular?.length === 0 && rankings.lowStock?.length === 0 && rankings.search?.length === 0)) {
  //   return null;
  // }

  const currentRankings = rankings[activeTab] || [];

  return (
    <section className={`w-full py-12 ${className}`}>
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
            >
              전체 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 탭 - 가운데 정렬 */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setActiveTab('popular')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'popular'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              인기 TOP 10
            </button>
            <button
              onClick={() => setActiveTab('lowStock')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'lowStock'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Package className="w-4 h-4" />
              재고 1개 남음
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'search'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Search className="w-4 h-4" />
              검색 랭킹
            </button>
          </div>

          {/* 랭킹 목록 - 2열 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(currentRankings || []).slice(0, 10).map((item, index) => (
              <Link
                key={item.id}
                href={item.link}
                className="group block"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  {/* 순위 */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>

                  {/* 이미지 */}
                  {item.image && item.image !== "" && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-sm">
                      {item.title}
                    </h3>
                    {(item.badge || (activeTab === 'lowStock' && item.stock === 1)) && (
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                        activeTab === 'lowStock' 
                          ? 'bg-red-100 text-red-800' 
                          : activeTab === 'search'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {activeTab === 'lowStock' && item.stock === 1 ? '재고 1개' : item.badge}
                      </span>
                    )}
                    {item.price && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-sm text-gray-900">{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-xs text-gray-500 line-through">{item.originalPrice}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
});

export default RankingSection;