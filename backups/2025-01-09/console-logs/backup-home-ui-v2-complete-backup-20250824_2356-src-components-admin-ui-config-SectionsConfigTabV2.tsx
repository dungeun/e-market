"use client";

import { useState, useEffect } from "react";

interface Section {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "fixed";
  editUrl: string;
}

// 섹션 정보 매핑
const sectionInfo: Record<string, { name: string; description: string }> = {
  hero: { name: "히어로 배너", description: "메인 배너 슬라이드 (2단 구성)" },
  category: { name: "카테고리 메뉴", description: "카테고리별 아이콘 그리드 (DB 연동)" },
  quicklinks: { name: "바로가기 링크", description: "빠른 접근 링크 3개" },
  promo: { name: "프로모션 배너", description: "이벤트 및 공지 배너" },
  ranking: { name: "실시간 랭킹", description: "인기/마감임박 캠페인 TOP 4" },
  "active-campaigns": { name: "진행 중인 캠페인", description: "지금 참여할 수 있는 캠페인 목록" },
  recommended: { name: "추천 캠페인", description: "큐레이션된 캠페인 목록" },
  cta: { name: "하단 CTA", description: "회원가입 유도 영역" },
};

export function SectionsConfigTabV2() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  // JSON에서 실제 섹션 목록 로드
  useEffect(() => {
    loadSectionsFromJSON();
  }, []);

  const loadSectionsFromJSON = async () => {
    try {
      setLoading(true);
      const { getApiUrl } = await import("@/lib/utils/api-url");
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/admin/homepage-sections`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.homepage?.sections) {
          // JSON의 실제 섹션들을 기반으로 리스트 생성
          const sectionsFromJSON = Object.keys(data.homepage.sections)
            .filter(sectionId => sectionInfo[sectionId]) // 정의된 섹션만 포함
            .map(sectionId => {
              const sectionData = data.homepage.sections[sectionId];
              const info = sectionInfo[sectionId];
              
              return {
                id: sectionId,
                name: info.name,
                description: info.description,
                status: sectionData.visible ? "active" as const : "inactive" as const,
                editUrl: `/admin/ui-config-v2/sections/${sectionId}`,
              };
            });
            
          setSections(sectionsFromJSON);
        }
      }
    } catch (error) {
      console.error('Failed to load sections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">섹션 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 섹션 목록 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">홈페이지 섹션 관리</h2>
          <button
            onClick={() =>
              (window.location.href = "/admin/ui-config-v2/sections/new")
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            새 섹션 추가
          </button>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {section.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {section.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {section.status === "active" && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      활성
                    </span>
                  )}
                  {section.status === "inactive" && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      비활성
                    </span>
                  )}
                  {section.status === "fixed" && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      고정
                    </span>
                  )}
                  <button
                    onClick={() => (window.location.href = section.editUrl)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    편집
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          💡 섹션 순서는 '섹션 순서' 탭에서 드래그 앤 드롭으로 변경할 수 있습니다.
        </p>
        <p className="text-sm text-yellow-800 mt-2">
          ✨ 현재 표시되는 섹션은 JSON 파일의 실제 데이터를 기반으로 동적으로 로드됩니다.
        </p>
      </div>
    </div>
  );
}