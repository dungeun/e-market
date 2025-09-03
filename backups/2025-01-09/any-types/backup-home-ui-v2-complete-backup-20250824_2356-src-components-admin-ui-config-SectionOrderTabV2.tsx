"use client";

import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff } from "lucide-react";
// import { useUIConfigStore } from "@/lib/stores/ui-config.store"; // 제거

interface Section {
  id: string;
  name: string;
  description: string;
  visible: boolean;
  fixed?: boolean;
  order: number;
  type:
    | "hero"
    | "category"
    | "quicklinks"
    | "promo"
    | "ranking"
    | "custom"
    | "recommended"
    | "activeCampaigns";
}

interface SortableSectionItemProps {
  section: Section;
  onToggleVisibility: (id: string) => void;
}

function SortableSectionItem({
  section,
  onToggleVisibility,
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    disabled: section.fixed,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-4 bg-white border rounded-lg ${
        section.fixed ? "opacity-60" : ""
      } ${isDragging ? "shadow-lg" : "hover:shadow-md"} transition-shadow`}
    >
      <div
        {...attributes}
        {...listeners}
        className={`mr-4 text-gray-400 ${section.fixed ? "cursor-not-allowed" : "cursor-move"}`}
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex-1">
        <div className="font-medium text-gray-900">
          {section.name}
          {section.fixed && (
            <span className="ml-2 text-xs text-gray-500">(고정)</span>
          )}
        </div>
        <div className="text-sm text-gray-600">{section.description}</div>
      </div>

      <button
        onClick={() => onToggleVisibility(section.id)}
        className={`ml-4 p-2 rounded ${
          section.visible
            ? "text-green-600 hover:bg-green-50"
            : "text-gray-400 hover:bg-gray-50"
        }`}
        disabled={section.fixed}
      >
        {section.visible ? (
          <Eye className="w-5 h-5" />
        ) : (
          <EyeOff className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}

export function SectionOrderTabV2() {
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [jsonSectionOrder, setJsonSectionOrder] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 섹션 기본 정보 매핑
  const sectionInfo: Record<
    string,
    { name: string; description: string; fixed?: boolean }
  > = {
    hero: {
      name: "히어로 배너",
      description: "메인 배너 슬라이드",
    },
    category: {
      name: "카테고리 메뉴",
      description: "카테고리별 아이콘 그리드",
    },
    quicklinks: {
      name: "바로가기 링크",
      description: "빠른 접근 링크",
    },
    promo: {
      name: "프로모션 배너",
      description: "이벤트 및 공지 배너",
    },
    ranking: {
      name: "실시간 랭킹",
      description: "인기/마감임박 캠페인",
    },
    recommended: {
      name: "추천 캠페인",
      description: "큐레이션된 캠페인 목록",
    },
    activeCampaigns: {
      name: "진행 중인 캠페인",
      description: "현재 진행 중인 캠페인 목록",
    },
    cta: {
      name: "하단 CTA",
      description: "회원가입 유도 영역",
      fixed: true,
    },
  };

  // Store에서 섹션 순서 가져와서 Section 형태로 변환
  const [sections, setSections] = useState<Section[]>([]);

  // JSON에서 실제 섹션 순서와 섹션 데이터 가져오기
  const [homepageData, setHomepageData] = useState<any>(null);
  
  // Store 사용 제거하고 직접 API 호출로 대체
  // const { config, updateSectionOrder, updateMainPageCustomSections } = useUIConfigStore();
  
  const loadSectionOrderFromJSON = async () => {
    try {
      setIsLoading(true);
      const { getApiUrl } = await import("@/lib/utils/api-url");
      const apiUrl = getApiUrl();

      const response = await fetch(`${apiUrl}/api/admin/homepage-sections`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();

        // JSON 데이터 전체를 저장
        if (data.homepage) {

          setHomepageData(data.homepage);
          setJsonSectionOrder(data.homepage.sectionOrder || []);
        } else {

        }
      } else {

      }
    } catch (error) {

    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트시 JSON에서 데이터 로드
  useEffect(() => {
    loadSectionOrderFromJSON();
  }, []);

  // JSON 섹션 순서로부터 섹션 배열 생성
  useEffect(() => {
    if (jsonSectionOrder.length === 0 || !homepageData) return;
    
    const convertedSections = jsonSectionOrder.map((sectionId, index) => {
      // homepageData.sections에서 해당 섹션의 visible 상태 가져오기
      const sectionData = homepageData.sections?.[sectionId];
      const isVisible = sectionData?.visible !== undefined ? sectionData.visible : true;
      
      return {
        id: sectionId,
        type: sectionId as any, // 타입을 section ID와 동일하게 설정
        name: sectionInfo[sectionId]?.name || sectionId,
        description: sectionInfo[sectionId]?.description || "",
        visible: isVisible, // JSON에서 실제 visible 값 사용
        fixed: sectionInfo[sectionId]?.fixed || false,
        order: index + 1,
      };
    });

    setSections(convertedSections);
    
    if (process.env.NODE_ENV === "development") {

    }
  }, [jsonSectionOrder, homepageData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const newSections = await new Promise<Section[]>((resolve) => {
        setSections((items) => {
          const oldIndex = items.findIndex(
            (item) => item.id === String(active.id),
          );
          const newIndex = items.findIndex(
            (item) => item.id === String(over.id),
          );

          const newItems = arrayMove(items, oldIndex, newIndex);

          // 순서 재정렬
          const reorderedItems = newItems.map((item, index) => ({
            ...item,
            order: index + 1,
          }));

          resolve(reorderedItems);
          return reorderedItems;
        });
      });

      // Store 업데이트 제거하고 직접 API로 저장
      const sectionOrder = newSections.map((section) => ({
        id: section.id,
        type: section.type,
        order: section.order,
        visible: section.visible,
      }));

      // API 호출하여 즉시 저장
      try {
        const { getApiUrl } = await import("@/lib/utils/api-url");
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/api/admin/homepage-sections`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sectionOrder }),
        });

        if (response.ok) {
          setSaveMessage({
            type: "success",
            message: "섹션 순서가 저장되었습니다.",
          });
          setTimeout(() => setSaveMessage(null), 3000);
          
          // 성공 후 JSON 데이터 새로고침
          loadSectionOrderFromJSON();
        } else {
          throw new Error("저장 실패");
        }
      } catch (error) {

        setSaveMessage({
          type: "error",
          message: "섹션 순서 저장에 실패했습니다.",
        });
        setTimeout(() => setSaveMessage(null), 3000);
      }
    }
  };

  const handleToggleVisibility = async (id: string) => {
    const updatedSections = sections.map((section) =>
      section.id === id && !section.fixed
        ? { ...section, visible: !section.visible }
        : section,
    );

    setSections(updatedSections);

    // Store 업데이트 제거하고 직접 API로 저장
    const sectionOrder = updatedSections.map((section) => ({
      id: section.id,
      type: section.type,
      order: section.order,
      visible: section.visible,
    }));

    // API 호출하여 즉시 저장
    try {
      const { getApiUrl } = await import("@/lib/utils/api-url");
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/admin/homepage-sections`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sectionOrder }),
      });

      if (response.ok) {
        setSaveMessage({
          type: "success",
          message: "섹션 표시 상태가 저장되었습니다.",
        });
        setTimeout(() => setSaveMessage(null), 3000);
        
        // 성공 후 JSON 데이터 새로고침
        loadSectionOrderFromJSON();
      } else {
        throw new Error("저장 실패");
      }
    } catch (error) {

      setSaveMessage({
        type: "error",
        message: "섹션 표시 상태 저장에 실패했습니다.",
      });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // 중복 섹션 정리 함수
  const cleanupDuplicateSections = async () => {
    // 기본 섹션만 유지 (중복 제거)
    const defaultSectionOrder = [
      { id: "hero", type: "hero" as const, order: 1, visible: true },
      { id: "category", type: "category" as const, order: 2, visible: true },
      {
        id: "quicklinks",
        type: "quicklinks" as const,
        order: 3,
        visible: true,
      },
      { id: "promo", type: "promo" as const, order: 4, visible: true },
      { id: "ranking", type: "ranking" as const, order: 5, visible: true },
      {
        id: "recommended",
        type: "recommended" as const,
        order: 6,
        visible: true,
      },
      {
        id: "activeCampaigns",
        type: "activeCampaigns" as const,
        order: 7,
        visible: true,
      },
    ];

    // 커스텀 섹션은 현재 JSON 데이터에서 가져오기
    const existingCustomSections = homepageData?.customSections || [];
    const seenCustomIds = new Set<string>();
    const cleanedCustomSections = existingCustomSections.filter(
      (section: any) => {
        if (seenCustomIds.has(section.id)) {
          return false;
        }
        seenCustomIds.add(section.id);
        return true;
      },
    );

    try {
      const { getApiUrl } = await import("@/lib/utils/api-url");
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/admin/homepage-sections`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          sectionOrder: defaultSectionOrder,
          customSections: cleanedCustomSections
        }),
      });

      if (response.ok) {
        setSaveMessage({
          type: "success",
          message: "중복 섹션이 정리되었습니다. 새로고침합니다...",
        });

        // localStorage 정리
        localStorage.removeItem("ui-config-storage");

        // 2초 후 페이지 새로고침
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error("API 호출 실패");
      }
    } catch (error) {
      setSaveMessage({
        type: "error",
        message: "정리 중 오류가 발생했습니다.",
      });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 저장 메시지 */}
      {saveMessage && (
        <div
          className={`p-4 rounded-lg ${
            saveMessage.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {saveMessage.message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold mb-2">섹션 순서 관리</h2>
            <p className="text-sm text-gray-600 mb-2">
              드래그하여 홈페이지에 표시될 섹션 순서를 변경할 수 있습니다. 눈
              아이콘을 클릭하여 섹션 표시 여부를 설정하세요.
            </p>
            <p className="text-xs text-blue-600">
              ※ 변경사항은 자동으로 저장됩니다. {isLoading && "(로딩 중...)"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadSectionOrderFromJSON}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
              disabled={isLoading}
            >
              새로고침
            </button>
          </div>
          {/* 중복 정리 버튼 */}
          {sections.length !== new Set(sections.map((s) => s.id)).size && (
            <button
              onClick={cleanupDuplicateSections}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
            >
              중복 섹션 정리
            </button>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-500">섹션 데이터를 불러오는 중...</div>
                </div>
              ) : (
                sections.map((section) => (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    onToggleVisibility={handleToggleVisibility}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* 미리보기 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">홈페이지 구조 미리보기</h3>
        <div className="space-y-2">
          {sections
            .filter((section) => section.visible)
            .sort((a, b) => a.order - b.order)
            .map((section, index) => (
              <div
                key={section.id}
                className="flex items-center p-3 bg-gray-50 rounded border border-gray-200"
              >
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  {index + 1}
                </span>
                <span className="font-medium">{section.name}</span>
                {section.fixed && (
                  <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    고정
                  </span>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
