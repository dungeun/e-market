'use client';

import React from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect } from 'react';
import type { MenuItem } from '@/lib/stores/ui-config.store';

interface SortableMenuItemProps {
  menu: any; // ui_menus 테이블의 데이터
  onUpdate: (id: string, updates: Partial<any>) => void;
  onDelete: (id: string) => void;
}

interface Language {
  code: string;
  name: string;
  native_name: string;
  enabled: boolean;
}

interface LanguagePackData {
  [key: string]: string; // 동적 언어 코드 지원
}

export function SortableMenuItemImproved({ menu, onUpdate, onDelete }: SortableMenuItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [enabledLanguages, setEnabledLanguages] = useState<Language[]>([]);
  
  // 활성화된 언어 목록 로드
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/admin/i18n/settings');
        if (response.ok) {
          const data = await response.json();
          const enabled = data.languages?.filter((lang: Language) => lang.enabled) || [];
          setEnabledLanguages(enabled);
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
        // 기본값으로 한국어, 영어 설정
        setEnabledLanguages([
          { code: 'ko', name: 'Korean', native_name: '한국어', enabled: true },
          { code: 'en', name: 'English', native_name: 'English', enabled: true }
        ]);
      }
    };
    fetchLanguages();
  }, []);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEditName = async () => {
    if (!editedName.trim()) {
      alert('메뉴 이름을 입력해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth-token');
      if (!token) {
        alert('인증이 필요합니다.');
        return;
      }

      // ui_menus 테이블의 content JSONB 필드 업데이트 (활성화된 언어로 자동 번역)
      const response = await fetch('/api/admin/ui-menus', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: menu.id,
          name: editedName,
          autoTranslate: true, // 활성화된 모든 언어로 자동 번역
          targetLanguages: enabledLanguages.map(lang => lang.code)
        }),
      });

      if (!response.ok) {
        throw new Error('메뉴 이름 업데이트 실패');
      }

      const data = await response.json();
      
      // 상위 컴포넌트에 업데이트 알림
      onUpdate(menu.id, { 
        label: editedName,
        content: data.menu.content 
      });
      
      setIsEditing(false);
      alert('메뉴 이름이 업데이트되고 자동 번역되었습니다.');
    } catch (error) {
      console.error('Error updating menu name:', error);
      alert('메뉴 이름 업데이트 중 오류가 발생했습니다.');
    }
  };

  // content JSONB와 언어팩에서 메뉴 이름 가져오기
  const menuContent = menu.content || {};
  const translations = menu.translations || {};
  
  // 기본 언어(한국어) 이름 가져오기
  const defaultLanguage = enabledLanguages.find(lang => lang.code === 'ko') || enabledLanguages[0];
  const displayName = translations[defaultLanguage?.code] || menuContent.label || menuContent.name || menu.label || '메뉴';
  
  // 활성화된 언어별 번역 생성 (기본 언어 제외)
  const otherLanguageTranslations = enabledLanguages
    .filter(lang => lang.code !== (defaultLanguage?.code || 'ko'))
    .map(lang => ({
      code: lang.code,
      name: lang.native_name,
      translation: translations[lang.code] || menuContent[`label_${lang.code}`] || displayName
    }))
    .filter(item => item.translation && item.translation !== displayName); // 기본 이름과 다른 번역만 표시

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border ${isDragging ? 'shadow-lg border-blue-500' : 'border-gray-200'}`}
    >
      <div className="grid grid-cols-12 gap-2 items-center p-4">
        {/* 드래그 핸들 */}
        <div
          {...attributes}
          {...listeners}
          className="col-span-1 cursor-move text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>

        {/* 메뉴 이름 (표시용) */}
        <div className="col-span-3">
          {isEditing ? (
            <div className="flex space-x-1">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="flex-1 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="메뉴 이름"
                autoFocus
              />
              <button
                onClick={handleEditName}
                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedName('');
                }}
                className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
              >
                취소
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="font-medium">{displayName}</span>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditedName(displayName);
                }}
                className="text-gray-400 hover:text-gray-600"
                title="이름 편집"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}
          {otherLanguageTranslations.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {otherLanguageTranslations.map((trans, index) => (
                <span key={trans.code}>
                  {index > 0 && ' | '}
                  <span className="uppercase">{trans.code}</span>: {trans.translation}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 언어팩 키 (내부용) */}
        <div className="col-span-3">
          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
            {menuContent.languagePackKey || menu.sectionId || menu.label}
          </code>
        </div>

        {/* 링크 URL */}
        <div className="col-span-3">
          <input
            type="text"
            value={menuContent.href || menu.href || '/'}
            onChange={(e) => onUpdate(menu.id, { href: e.target.value })}
            className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="링크 URL"
          />
        </div>

        {/* 작업 버튼 */}
        <div className="col-span-2 flex items-center justify-center space-x-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={menu.visible}
              onChange={(e) => onUpdate(menu.id, { visible: e.target.checked })}
              className="mr-1"
            />
            <span className="text-sm">표시</span>
          </label>
          <button
            onClick={() => onDelete(menu.id)}
            className="text-red-500 hover:text-red-700"
            title="삭제"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}