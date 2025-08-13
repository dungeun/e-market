'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Clock, Star, ArrowRight } from 'lucide-react';

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
}

interface RankingSectionProps {
  sectionId?: string;
  className?: string;
}

export default function RankingSection({ sectionId = 'ranking', className = '' }: RankingSectionProps) {
  const [rankings, setRankings] = useState<{
    popular: RankingItem[];
    urgent: RankingItem[];
  }>({ popular: [], urgent: [] });
  const [activeTab, setActiveTab] = useState<'popular' | 'urgent'>('popular');
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    loadRankingData();
  }, [sectionId]);

  const loadRankingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ui-sections/${sectionId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.section) {
          setRankings(data.section.content?.rankings || { popular: [], urgent: [] });
          setIsVisible(data.section.isActive !== false);
        }
      }
    } catch (error) {
      console.error('Error loading ranking section:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  if (!isVisible || (rankings.popular.length === 0 && rankings.urgent.length === 0)) {
    return null;
  }

  const currentRankings = rankings[activeTab] || [];

  return (
    <section className={`w-full py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">실시간 랭킹</h2>
            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              전체 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 탭 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('popular')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'popular'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              인기 TOP 5
            </button>
            <button
              onClick={() => setActiveTab('urgent')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'urgent'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              마감임박 TOP 5
            </button>
          </div>

          {/* 랭킹 목록 */}
          <div className="space-y-4">
            {currentRankings.slice(0, 5).map((item, index) => (
              <Link
                key={item.id}
                href={item.link}
                className="group block"
              >
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  {/* 순위 */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>

                  {/* 이미지 */}
                  {item.image && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      {item.badge && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          activeTab === 'urgent' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-1 line-clamp-1">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      {item.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{item.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {item.price && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{item.price}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">{item.originalPrice}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}