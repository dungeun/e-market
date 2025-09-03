'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Package, Search, Star, ArrowRight } from 'lucide-react';

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
  data?: any;
  sectionId?: string;
  className?: string;
}

export default function RankingSection({ data, sectionId = 'ranking', className = '' }: RankingSectionProps) {
  const [rankings, setRankings] = useState<{
    popular: RankingItem[];
    lowStock: RankingItem[];
    search: RankingItem[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'popular' | 'lowStock' | 'search'>('popular');
  const [loading, setLoading] = useState(!data);
  const [isVisible, setIsVisible] = useState(true);
  const [title, setTitle] = useState('실시간 랭킹');

  useEffect(() => {
    console.log('🔥 RankingSection useEffect - data:', data, 'type:', typeof data);
    if (data) {
      // JSON 데이터가 있는 경우 직접 사용
      console.log('🔥 Setting rankings from data:', data);
      setRankings({
        popular: data.popular || [],
        lowStock: data.lowStock || data.urgent || [],
        search: data.search || []
      });
      setTitle(data.title || '실시간 랭킹');
      setLoading(false);
      setIsVisible(true);
    } else {
      console.log('🔥 No data provided, falling back to API');
      // Fallback: API 호출 (하위 호환성)
      loadRankingData();
    }
  }, [data, sectionId]);

  const loadRankingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ui-sections/${sectionId}`);
      
      if (response.ok) {
        const apiData = await response.json();
        if (apiData.section) {
          const content = apiData.section.content?.rankings || {};
          setRankings({
            popular: content.popular || [],
            lowStock: content.lowStock || content.urgent || [],
            search: content.search || []
          });
          setIsVisible(apiData.section.isActive !== false);
        }
      } else {
        // API 실패 시 기본값 설정
        setRankings({ popular: [], lowStock: [], search: [] });
      }
    } catch (error) {
      console.error('Error loading ranking section:', error);
      // 에러 시에도 기본값 설정하여 렌더링 에러 방지
      setRankings({ popular: [], lowStock: [], search: [] });
    } finally {
      setLoading(false);
    }
  };


  // rankings가 null이면 아직 로딩 중이므로 로딩 스켈레톤 표시
  if (!rankings) {
    return (
      <div className={`w-full py-12 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

  if (!isVisible || (rankings.popular?.length === 0 && rankings.lowStock?.length === 0 && rankings.search?.length === 0)) {
    return null;
  }

  const currentRankings = rankings[activeTab] || [];
  console.log('🔥 currentRankings:', currentRankings, 'activeTab:', activeTab, 'rankings:', rankings);

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
  );
}