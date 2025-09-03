"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Globe,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";

interface UISection {
  id: string;
  key: string;
  type: string;
  title: string;
  subtitle?: string;
  isActive: boolean;
  order: number;
  data?: any;
  translations?: any;
}

const sectionTypes = [
  { value: "hero", label: "히어로 배너", description: "메인 배너 슬라이드" },
  { value: "category", label: "카테고리 메뉴", description: "카테고리 아이콘 그리드" },
  { value: "quicklinks", label: "바로가기 링크", description: "빠른 접근 링크" },
  { value: "promo", label: "프로모션 배너", description: "이벤트 및 공지" },
  { value: "ranking", label: "실시간 랭킹", description: "인기 콘텐츠 목록" },
  { value: "recommended", label: "추천 콘텐츠", description: "큐레이션된 콘텐츠" },
  { value: "active-campaigns", label: "진행중인 캠페인", description: "활성 캠페인 목록" },
];

export function SectionManagerTab() {
  const router = useRouter();
  const [sections, setSections] = useState<UISection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/ui-sections");

      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
      } else {
        toast.error("섹션 데이터를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("Error loading sections:", error);
      toast.error("섹션 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    const newSection: UISection = {
      id: `new-${Date.now()}`,
      key: `section-${Date.now()}`,
      type: "hero",
      title: "새 섹션",
      isActive: true,
      order: sections.length + 1,
      data: {},
    };
    setSections([...sections, newSection]);
  };

  const handleUpdateSection = (id: string, updates: Partial<UISection>) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, ...updates } : section
      )
    );
  };

  const handleDeleteSection = async (id: string) => {
    if (confirm("정말 이 섹션을 삭제하시겠습니까?")) {
      // 새로 추가된 섹션이면 바로 삭제
      if (id.startsWith('new-')) {
        setSections(sections.filter((section) => section.id !== id));
        return;
      }

      // 기존 섹션이면 DB에서 삭제
      try {
        const response = await fetch(`/api/admin/ui-sections?id=${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setSections(sections.filter((section) => section.id !== id));
          toast.success("섹션이 삭제되었습니다.");
        } else {
          toast.error("섹션 삭제에 실패했습니다.");
        }
      } catch (error) {
        console.error("Error deleting section:", error);
        toast.error("섹션 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [
      newSections[index],
      newSections[index - 1],
    ];

    // 순서 재정렬
    const reorderedSections = newSections.map((section, idx) => ({
      ...section,
      order: idx + 1,
    }));
    setSections(reorderedSections);
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [
      newSections[index + 1],
      newSections[index],
    ];

    // 순서 재정렬
    const reorderedSections = newSections.map((section, idx) => ({
      ...section,
      order: idx + 1,
    }));
    setSections(reorderedSections);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // 섹션 순서 업데이트
      const response = await fetch('/api/admin/ui-sections/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections: sections.map(s => ({
            key: s.key,
            order: s.order,
            isActive: s.isActive
          }))
        }),
      });

      if (response.ok) {
        toast.success("섹션 설정이 저장되었습니다.");
        
        // 홈페이지 캐시 무효화
        await fetch('/api/cache/invalidate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type: 'homepage' }),
        });
        
        await loadSections(); // 리로드
      } else {
        toast.error("섹션 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error saving sections:", error);
      toast.error("섹션 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const getEditUrl = (section: UISection) => {
    // 섹션 편집 페이지 URL 반환
    const typeMap: Record<string, string> = {
      hero: "/admin/ui-config/sections/hero",
      category: "/admin/ui-config/sections/category",
      quicklinks: "/admin/ui-config/sections/quicklinks",
      promo: "/admin/ui-config/sections/promo",
      ranking: "/admin/ui-config/sections/ranking",
      recommended: "/admin/ui-config/sections/recommended",
      'active-campaigns': "/admin/ui-config/sections/active-campaigns",
    };
    return typeMap[section.type] || "#";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 상단 액션 바 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">홈페이지 섹션 관리</h2>
          <p className="text-sm text-gray-600 mt-1">
            홈페이지에 표시되는 섹션들의 순서와 표시 여부를 관리합니다.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAddSection}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            섹션 추가
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "저장 중..." : "모두 저장"}
          </button>
        </div>
      </div>

      {/* 섹션 목록 */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">활성 섹션 ({sections.length}개)</h3>
        </div>
        
        <div className="divide-y">
          {sections
            .sort((a, b) => a.order - b.order)
            .map((section, index) => (
              <div
                key={section.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* 순서 조절 */}
                    <div className="flex items-center gap-1">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === sections.length - 1}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* 섹션 정보 */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-8">
                        #{index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {section.title || sectionTypes.find(t => t.value === section.type)?.label || section.type}
                          </h4>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              section.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {section.isActive ? "표시" : "숨김"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          타입: {sectionTypes.find(t => t.value === section.type)?.label || section.type}
                          {section.key && ` | Key: ${section.key}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-2">
                    {/* 표시/숨김 토글 */}
                    <button
                      onClick={() =>
                        handleUpdateSection(section.id, {
                          isActive: !section.isActive,
                        })
                      }
                      className={`p-2 rounded-lg transition-colors ${
                        section.isActive
                          ? "text-green-600 hover:bg-green-50"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                      title={section.isActive ? "숨기기" : "표시하기"}
                    >
                      {section.isActive ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>

                    {/* 편집 버튼 */}
                    <button
                      onClick={() => router.push(getEditUrl(section))}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      편집
                    </button>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {sections.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p>아직 추가된 섹션이 없습니다.</p>
            <p className="text-sm mt-2">
              위의 "섹션 추가" 버튼을 클릭하여 새 섹션을 추가하세요.
            </p>
          </div>
        )}
      </div>

      {/* 안내 메시지 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 팁:</strong> 섹션 순서를 변경한 후 "모두 저장" 버튼을 클릭해야 변경사항이 홈페이지에 반영됩니다.
          각 섹션의 "편집" 버튼을 클릭하면 섹션별 세부 설정을 변경할 수 있습니다.
        </p>
      </div>
    </div>
  );
}