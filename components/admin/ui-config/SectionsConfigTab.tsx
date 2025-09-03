'use client';

import React from 'react';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Settings, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Section {
  id: string;
  key: string;
  type: string;
  title: string;
  subtitle?: string;
  order: number;
  isActive: boolean;
  data?: unknown;
}

interface SortableItemProps {
  section: Section;
  onToggle: (id: string) => void;
  onEdit: (section: Section) => void;
}

function SortableItem({ section, onToggle, onEdit }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 bg-white ${
        isDragging ? 'shadow-lg' : 'hover:shadow-md'
      } transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-move text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {section.title || section.key}
            </h3>
            <p className="text-sm text-gray-600">
              {section.subtitle || getSectionTypeLabel(section.type)}
            </p>
            <p className="text-xs text-gray-400 mt-1">순서: {section.order}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            section.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {section.isActive ? '활성' : '비활성'}
          </span>
          <button 
            onClick={() => onToggle(section.id)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title={section.isActive ? '숨기기' : '표시'}
          >
            {section.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => onEdit(section)}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            title="설정"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function getSectionTypeLabel(type: string): string {
  const types: Record<string, string> = {
    hero: '히어로 배너',
    category: '카테고리 메뉴',
    quicklinks: '바로가기 링크',
    promo: '프로모션 배너',
    ranking: '실시간 랭킹',
    recommended: '추천 콘텐츠',
    'featured-products': '이달의 특가',
    'product-grid': '상품 그리드',
  };
  return types[type] || type;
}

export function SectionsConfigTab() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // DB에서 섹션 데이터 가져오기
  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/admin/ui-sections');
      const data = await response.json();
      
      if (data.success && data.sections) {
        // 섹션이 없으면 기본 섹션 생성
        if (data.sections.length === 0) {
          await createDefaultSections();
        } else {
          setSections(data.sections.sort((a: Section, b: Section) => a.order - b.order));
        }
      }
    } catch (error) {

      toast.error('섹션 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 기본 섹션 생성
  const createDefaultSections = async () => {
    const defaultSections = [
      { key: 'hero', type: 'hero', title: '히어로 배너', order: 1, isActive: true },
      { key: 'category', type: 'category', title: '카테고리 메뉴', order: 2, isActive: true },
      { key: 'quicklinks', type: 'quicklinks', title: '바로가기 링크', order: 3, isActive: true },
      { key: 'promo', type: 'promo', title: '프로모션 배너', order: 4, isActive: true },
      { key: 'ranking', type: 'ranking', title: '실시간 랭킹', order: 5, isActive: true },
      { key: 'recommended', type: 'recommended', title: '추천 콘텐츠', order: 6, isActive: true },
      { key: 'featured-products', type: 'featured-products', title: '이달의 특가', order: 7, isActive: true },
    ];

    for (const section of defaultSections) {
      try {
        await fetch('/api/admin/ui-sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionId: section.key,
            type: section.type,
            title: section.title,
            order: section.order,
            visible: section.isActive
          })
        });
      } catch (error) {

      }
    }
    
    // 다시 로드
    await fetchSections();
  };

  // 드래그 종료 처리
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = sections.findIndex((item) => item.id === active.id);
      const newIndex = sections.findIndex((item) => item.id === over.id);
      
      const newSections = arrayMove(sections, oldIndex, newIndex);
      
      // 순서 재정렬
      const reorderedSections = newSections.map((section, index) => ({
        ...section,
        order: index + 1
      }));
      
      setSections(reorderedSections);
      
      // 서버에 저장
      await saveOrder(reorderedSections);
    }
  };

  // 순서 저장
  const saveOrder = async (orderedSections: Section[]) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/ui-sections/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: orderedSections.map(s => ({
            key: s.key,
            order: s.order,
            isActive: s.isActive
          }))
        })
      });

      if (response.ok) {
        toast.success('섹션 순서가 저장되었습니다.');
      } else {
        toast.error('순서 저장에 실패했습니다.');
      }
    } catch (error) {

      toast.error('순서 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 섹션 상태 토글
  const toggleSectionStatus = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    try {
      const response = await fetch('/api/admin/ui-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sectionId,
          visible: !section.isActive
        })
      });

      if (response.ok) {
        setSections(sections.map(s => 
          s.id === sectionId ? { ...s, isActive: !s.isActive } : s
        ));
        toast.success('섹션 상태가 업데이트되었습니다.');
      }
    } catch (error) {

      toast.error('섹션 업데이트에 실패했습니다.');
    }
  };

  // 섹션 편집 페이지로 이동
  const handleEdit = (section: Section) => {
    const editUrl = getEditUrl(section.type);
    const urlWithId = `${editUrl}?id=${section.id}`;
    router.push(urlWithId);
  };

  const getEditUrl = (type: string): string => {
    const urlMap: Record<string, string> = {
      hero: '/admin/ui-config/sections/hero',
      category: '/admin/ui-config/sections/category',
      quicklinks: '/admin/ui-config/sections/quicklinks',
      promo: '/admin/ui-config/sections/promo',
      ranking: '/admin/ui-config/sections/ranking',
      recommended: '/admin/ui-config/sections/recommended',
      'featured-products': '/admin/ui-config/sections/featured-products',
      'product-grid': '/admin/ui-config/sections/product-grid',
    };
    return urlMap[type] || '/admin/ui-config/sections/new';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">홈페이지 섹션 관리</h2>
            <p className="text-sm text-gray-600 mt-1">
              드래그하여 섹션 순서를 변경할 수 있습니다.
            </p>
          </div>
          <button
            onClick={() => router.push('/admin/ui-config/sections/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            새 섹션 추가
          </button>
        </div>
        
        {/* 섹션 목록 */}
        <div className="space-y-4">
          {sections.length === 0 ? (
            <p className="text-center text-gray-500 py-8">등록된 섹션이 없습니다.</p>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={sections}
                strategy={verticalListSortingStrategy}
              >
                {sections.map((section) => (
                  <SortableItem
                    key={section.id}
                    section={section}
                    onToggle={toggleSectionStatus}
                    onEdit={handleEdit}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {saving && (
          <div className="mt-4 text-center text-sm text-gray-600">
            저장 중...
          </div>
        )}
      </div>

      {/* 안내 메시지 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 팁:</strong> 섹션을 드래그하여 순서를 변경하면 자동으로 저장됩니다. 
          각 섹션의 설정 버튼을 클릭하면 세부 내용을 편집할 수 있습니다.
        </p>
      </div>
    </div>
  );
}