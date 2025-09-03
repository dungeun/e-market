'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableMenuItemImproved } from './SortableMenuItemImproved';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Menu } from 'lucide-react';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  label: string;
  name: string;
  href: string;
  icon?: string | null;
  visible: boolean;
  order: number;
}

export function HeaderConfigDB() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingMenu, setIsAddingMenu] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuUrl, setNewMenuUrl] = useState('/');
  const [newMenuIcon, setNewMenuIcon] = useState('');
  const { t } = useLanguage();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 메뉴 목록 로드
  const loadMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ui-menus?type=header');
      
      if (response.ok) {
        const data = await response.json();
        const formattedMenus = data.menus.map((menu: any) => ({
          id: menu.id,
          label: menu.content?.label || menu.sectionId,
          name: menu.content?.name || '',
          href: menu.content?.href || '/',
          icon: menu.content?.icon,
          visible: menu.visible,
          order: menu.order
        }));
        setMenus(formattedMenus);
      }
    } catch (error) {
      console.error('Failed to load menus:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = menus.findIndex((item) => item.id === active.id);
      const newIndex = menus.findIndex((item) => item.id === over.id);
      
      const newMenus = arrayMove(menus, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index + 1,
      }));
      
      setMenus(newMenus);

      // 순서 업데이트 API 호출
      for (const menu of newMenus) {
        await fetch('/api/admin/ui-menus', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('auth-token')}`
          },
          body: JSON.stringify({
            id: menu.id,
            order: menu.order
          })
        });
      }
    }
  };

  const handleMenuUpdate = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const response = await fetch('/api/admin/ui-menus', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          id,
          ...updates,
          autoTranslate: true
        })
      });

      if (response.ok) {
        const newMenus = menus.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        );
        setMenus(newMenus);
      }
    } catch (error) {
      console.error('Failed to update menu:', error);
      alert('메뉴 업데이트 실패');
    }
  };

  const handleAddMenu = async () => {
    if (!newMenuName.trim()) {
      alert('메뉴 이름을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/admin/ui-menus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          type: 'header',
          name: newMenuName,
          href: newMenuUrl || '/',
          icon: newMenuIcon || null,
          autoTranslate: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // 메뉴 목록 새로고침
        await loadMenus();
        
        // 입력 필드 초기화
        setNewMenuName('');
        setNewMenuUrl('/');
        setNewMenuIcon('');
        setIsAddingMenu(false);
        
        alert('메뉴가 추가되고 자동 번역되었습니다.');
      } else {
        throw new Error('메뉴 추가 실패');
      }
    } catch (error) {
      console.error('Failed to add menu:', error);
      alert('메뉴 추가 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('이 메뉴를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/ui-menus?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('auth-token')}`
        }
      });

      if (response.ok) {
        setMenus(menus.filter((item) => item.id !== id));
        alert('메뉴가 삭제되었습니다.');
      } else {
        throw new Error('메뉴 삭제 실패');
      }
    } catch (error) {
      console.error('Failed to delete menu:', error);
      alert('메뉴 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-sm text-muted-foreground">메뉴를 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>헤더 메뉴 설정</CardTitle>
            <CardDescription>웹사이트 상단 네비게이션 메뉴를 관리합니다.</CardDescription>
          </div>
          <Button onClick={() => setIsAddingMenu(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            메뉴 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent>

        {/* 새 메뉴 추가 폼 */}
        {isAddingMenu && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">새 메뉴 추가</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="menu-name">메뉴 이름 (한국어)</Label>
                  <Input
                    id="menu-name"
                    value={newMenuName}
                    onChange={(e) => setNewMenuName(e.target.value)}
                    placeholder="예: 이벤트"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="menu-url">링크 URL</Label>
                  <Input
                    id="menu-url"
                    value={newMenuUrl}
                    onChange={(e) => setNewMenuUrl(e.target.value)}
                    placeholder="예: /events"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="menu-icon">아이콘 (선택)</Label>
                  <Input
                    id="menu-icon"
                    value={newMenuIcon}
                    onChange={(e) => setNewMenuIcon(e.target.value)}
                    placeholder="예: 📅"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <Button onClick={handleAddMenu} size="sm">
                    추가
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAddingMenu(false);
                      setNewMenuName('');
                      setNewMenuUrl('/');
                      setNewMenuIcon('');
                    }}
                  >
                    취소
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                메뉴 이름은 자동으로 영어와 일본어로 번역됩니다.
              </p>
            </CardContent>
          </Card>
        )}

        {/* 기존 메뉴 목록 */}
        <div className="overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600 uppercase tracking-wider">
            <div className="col-span-1"></div>
            <div className="col-span-3">메뉴 이름</div>
            <div className="col-span-3">언어팩 키</div>
            <div className="col-span-3">링크 URL</div>
            <div className="col-span-2 text-center">작업</div>
          </div>
          
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={menus} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-gray-200">
                {menus.map((menu) => (
                  <SortableMenuItemImproved
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

        {menus.length === 0 && (
          <div className="text-center py-12">
            <Menu className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">메뉴가 없습니다</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              위의 "메뉴 추가" 버튼을 클릭하여 메뉴를 추가하세요.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}