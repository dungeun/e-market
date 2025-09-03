'use client';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableMenuItemWithLanguagePack } from '@/components/admin/SortableMenuItemWithLanguagePack';
import { useUIConfigStore } from '@/lib/stores/ui-config.store';
import type { MenuItem } from '@/lib/stores/ui-config.store';

export function HeaderConfigTab() {
  const { config, updateHeaderMenus } = useUIConfigStore();
  
  // Ensure config and header exist with default values
  const headerMenus = config?.header?.menus || [];
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleHeaderDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id && headerMenus.length > 0) {
      const oldIndex = headerMenus.findIndex((item: any) => item.id === active.id);
      const newIndex = headerMenus.findIndex((item: any) => item.id === over.id);
      
      const newMenus = arrayMove(headerMenus, oldIndex, newIndex).map((item: any, index: number) => ({
        ...item,
        order: index + 1,
      }));
      
      updateHeaderMenus(newMenus);
    }
  };

  const handleMenuUpdate = (id: string, updates: Partial<MenuItem>) => {
    const newMenus = headerMenus.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    updateHeaderMenus(newMenus);
  };

  const handleAddMenu = () => {
    const newMenu: MenuItem = {
      id: `menu-${Date.now()}`,
      label: '새 메뉴',
      href: '#',
      order: headerMenus.length + 1,
      visible: true,
    };
    updateHeaderMenus([...headerMenus, newMenu]);
  };

  const handleDeleteMenu = (id: string) => {
    updateHeaderMenus(headerMenus.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* 메뉴 설정 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">메뉴 설정</h2>
          <button
            onClick={handleAddMenu}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            메뉴 추가
          </button>
        </div>
        
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleHeaderDragEnd}>
          <SortableContext items={headerMenus} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {headerMenus.map((menu) => (
                <SortableMenuItemWithLanguagePack
                  key={menu.id}
                  menu={menu}
                  onUpdate={handleMenuUpdate}
                  onDelete={handleDeleteMenu}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

    </div>
  );
}