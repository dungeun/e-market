import React from 'react';
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, RefreshCw, Eye } from 'lucide-react';
import MultiLanguageEditor from '@/components/admin/MultiLanguageEditor';

interface QuicklinksData {
  ko: {
    title: string;
    links: Array<{
      id: string;
      icon: string;
      title: string;
      link: string;
    }>;
  };
  en: {
    title: string;
    links: Array<{
      id: string;
      icon: string;
      title: string;
      link: string;
    }>;
  };
  jp: {
    title: string;
    links: Array<{
      id: string;
      icon: string;
      title: string;
      link: string;
    }>;
  };
}

const QuickLinksImprovedEditPage = React.memo(function QuickLinksImprovedEditPage() {
  const router = useRouter();
  const [quicklinksData, setQuicklinksData] = useState<QuicklinksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(true);

  // JSON 파일에서 데이터 로드
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/locales/ui-sections.json');
      const data = await response.json();
      
      if (data.quicklinks) {
        setQuicklinksData(data.quicklinks);
      } else {
        // 기본 데이터로 초기화
        setQuicklinksData({
          ko: {
            title: '바로가기',
            links: [
              { id: 'quick-1', icon: '🎉', title: '이벤트', link: '/events' },
              { id: 'quick-2', icon: '🎫', title: '쿠폰', link: '/coupons' },
              { id: 'quick-3', icon: '🏆', title: '랭킹', link: '/ranking' }
            ]
          },
          en: {
            title: 'Quick Links',
            links: [
              { id: 'quick-1', icon: '🎉', title: 'Events', link: '/events' },
              { id: 'quick-2', icon: '🎫', title: 'Coupons', link: '/coupons' },
              { id: 'quick-3', icon: '🏆', title: 'Ranking', link: '/ranking' }
            ]
          },
          jp: {
            title: 'クイックリンク',
            links: [
              { id: 'quick-1', icon: '🎉', title: 'イベント', link: '/events' },
              { id: 'quick-2', icon: '🎫', title: 'クーポン', link: '/coupons' },
              { id: 'quick-3', icon: '🏆', title: 'ランキング', link: '/ranking' }
            ]
          }
        });
      }
    } catch (error) {
      console.error('Error loading quicklinks data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // JSON 파일에 직접 저장 + DB 업데이트
  const handleSave = async () => {
    if (!quicklinksData) return;

    setSaving(true);
    try {
      // 1. JSON 파일 업데이트 API 호출
      const jsonResponse = await fetch('/api/admin/update-ui-localization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionKey: 'quicklinks',
          data: quicklinksData
        })
      });

      if (!jsonResponse.ok) {
        throw new Error('Failed to update JSON file');
      }

      // 2. DB에도 저장 (기존 API 활용)
      const dbResponse = await fetch('/api/admin/ui-sections/quicklinks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: quicklinksData,
          visible: sectionVisible,
          autoTranslate: false // JSON에서 직접 관리하므로 비활성화
        })
      });

      if (!dbResponse.ok) {
        throw new Error('Failed to update database');
      }

      // 3. 메인 페이지 캐시 무효화
      await fetch('/api/admin/invalidate-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ui-sections' })
      });

      alert('✅ 저장 완료! 메인 페이지에 즉시 반영됩니다.');
      
    } catch (error) {
      console.error('Error saving quicklinks:', error);
      alert('❌ 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 미리보기 새 탭에서 열기
  const handlePreview = () => {
    window.open('/', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 개선된 헤더 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/ui-config?tab=sections')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">바로가기 링크 관리 (개선)</h1>
                <p className="text-sm text-gray-600 mt-1">
                  🌐 다국어 동시 편집으로 메인 페이지와 실시간 연동
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* 섹션 표시 토글 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sectionVisible}
                  onChange={(e) => setSectionVisible(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${
                  sectionVisible ? 'bg-green-600' : 'bg-gray-300'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 ${
                    sectionVisible ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </div>
                <span className="flex items-center gap-1 text-sm text-gray-700">
                  <Eye className="w-4 h-4" />
                  섹션 표시
                </span>
              </label>

              {/* 미리보기 버튼 */}
              <button
                onClick={handlePreview}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                미리보기
              </button>

              {/* 새로고침 버튼 */}
              <button
                onClick={loadData}
                disabled={loading}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* 저장 버튼 */}
              <button
                onClick={handleSave}
                disabled={saving || !quicklinksData}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? '저장 중...' : '💾 저장'}
              </button>
            </div>
          </div>
        </div>

        {/* 다국어 편집기 */}
        {quicklinksData && (
          <MultiLanguageEditor
            sectionKey="quicklinks"
            value={quicklinksData}
            onChange={(newData) => setQuicklinksData(newData)}
            languages={[
              { code: 'ko', name: '한국어', flag: '🇰🇷' },
              { code: 'en', name: 'English', flag: '🇺🇸' },
              { code: 'jp', name: '日本語', flag: '🇯🇵' }
            ]}
          />
        )}

        {/* 실시간 연동 안내 */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-start gap-4">
            <div className="text-2xl">🚀</div>
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">실시간 메인 페이지 연동</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>✅ 저장 즉시 메인 페이지에 반영</p>
                <p>✅ 언어 전환 시 즉시 번역 표시</p>
                <p>✅ JSON 파일 기반으로 빠른 로딩</p>
                <p>✅ 캐시 자동 무효화로 일관성 보장</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}