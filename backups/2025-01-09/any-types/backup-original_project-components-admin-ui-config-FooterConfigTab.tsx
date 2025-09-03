'use client';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableFooterColumn } from '@/components/admin/SortableFooterColumn';
import { useUIConfigStore } from '@/lib/stores/ui-config.store';
import type { FooterColumn, FooterLink } from '@/lib/stores/ui-config.store';

export function FooterConfigTab() {
  const { config, updateFooterColumns, updateCopyright } = useUIConfigStore();
  
  // Ensure config and footer exist with default values
  const footerColumns = config?.footer?.columns || [];
  const copyright = config?.footer?.copyright || '';
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFooterDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id && footerColumns.length > 0) {
      const oldIndex = footerColumns.findIndex((item: any) => item.id === active.id);
      const newIndex = footerColumns.findIndex((item: any) => item.id === over.id);
      
      const newColumns = arrayMove(footerColumns, oldIndex, newIndex).map((item: any, index: number) => ({
        ...item,
        order: index + 1,
      }));
      
      updateFooterColumns(newColumns);
    }
  };

  const handleAddFooterColumn = () => {
    const newColumn: FooterColumn = {
      id: `column-${Date.now()}`,
      title: '새 컬럼',
      order: footerColumns.length + 1,
      links: []
    };
    updateFooterColumns([...footerColumns, newColumn]);
  };

  const handleFooterColumnUpdate = (columnId: string, updates: Partial<FooterColumn>) => {
    const newColumns = footerColumns.map((col: any) =>
      col.id === columnId ? { ...col, ...updates } : col
    );
    updateFooterColumns(newColumns);
  };

  const handleDeleteFooterColumn = (columnId: string) => {
    updateFooterColumns(footerColumns.filter((col: any) => col.id !== columnId));
  };

  const handleAddFooterLink = (columnId: string) => {
    const newLink: FooterLink = {
      id: `link-${Date.now()}`,
      label: '새 링크',
      href: '#',
      order: 1,
      visible: true
    };
    
    const newColumns = footerColumns.map((col: any) => {
      if (col.id === columnId) {
        return {
          ...col,
          links: [...col.links, { ...newLink, order: col.links.length + 1 }]
        };
      }
      return col;
    });
    
    updateFooterColumns(newColumns);
  };

  return (
    <div className="space-y-6">
      {/* 푸터 컬럼 설정 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">푸터 컬럼 설정</h2>
          <button
            onClick={handleAddFooterColumn}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            컬럼 추가
          </button>
        </div>
        
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFooterDragEnd}>
          <SortableContext items={footerColumns} strategy={horizontalListSortingStrategy}>
            <div className="grid md:grid-cols-3 gap-6">
              {footerColumns
                .sort((a: any, b: any) => a.order - b.order)
                .map((column: any) => (
                  <SortableFooterColumn
                    key={column.id}
                    column={column}
                    onUpdate={handleFooterColumnUpdate}
                    onDelete={handleDeleteFooterColumn}
                    onAddLink={handleAddFooterLink}
                  />
                ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* 저작권 설정 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">저작권 정보</h2>
        <input
          type="text"
          value={copyright}
          onChange={(e) => updateCopyright(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}