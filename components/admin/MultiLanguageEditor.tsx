'use client';

import React from 'react';

import { useState } from 'react';
import { Globe, Languages } from 'lucide-react';

interface MultiLanguageEditorProps {
  sectionKey: string;
  value: unknown;
  onChange: (value: unknown) => void;
  languages: Array<{ code: string; name: string; flag: string }>;
}

interface LanguageContent {
  [key: string]: unknown;
}

export function MultiLanguageEditor({ 
  sectionKey, 
  value, 
  onChange, 
  languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'jp', name: '日本語', flag: '🇯🇵' }
  ]
}: MultiLanguageEditorProps) {
  const [activeLanguage, setActiveLanguage] = useState('ko');
  const [content, setContent] = useState<Record<string, LanguageContent>>(
    value || languages.reduce((acc, lang) => ({ ...acc, [lang.code]: {} }), {})
  );

  const handleContentChange = (langCode: string, newContent: unknown) => {
    const updatedContent = {
      ...content,
      [langCode]: newContent
    };
    setContent(updatedContent);
    onChange(updatedContent);
  };

  const autoTranslate = async (sourceLang: string, targetLang: string) => {
    try {
      const sourceContent = content[sourceLang];
      const response = await fetch('/api/admin/translate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: sourceContent,
          from: sourceLang,
          to: targetLang,
          sectionType: sectionKey
        })
      });
      
      if (response.ok) {
        const translated = await response.json();
        handleContentChange(targetLang, translated.content);
      }
    } catch (error) {

    }
  };

  const renderSectionEditor = (langCode: string) => {
    const langContent = content[langCode] || {};

    switch (sectionKey) {
      case 'quicklinks':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="섹션 제목"
              value={langContent.title || ''}
              onChange={(e) => handleContentChange(langCode, {
                ...langContent,
                title: e.target.value
              })}
              className="w-full px-4 py-2 border rounded-lg"
            />
            
            <div className="space-y-3">
              {(langContent.links || []).map((link: unknown, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="아이콘"
                    value={link.icon || ''}
                    className="w-16 px-2 py-1 border rounded text-center"
                    onChange={(e) => {
                      const newLinks = [...(langContent.links || [])];
                      newLinks[index] = { ...link, icon: e.target.value };
                      handleContentChange(langCode, {
                        ...langContent,
                        links: newLinks
                      });
                    }}
                  />
                  <input
                    type="text"
                    placeholder="제목"
                    value={link.title || ''}
                    className="flex-1 px-3 py-1 border rounded"
                    onChange={(e) => {
                      const newLinks = [...(langContent.links || [])];
                      newLinks[index] = { ...link, title: e.target.value };
                      handleContentChange(langCode, {
                        ...langContent,
                        links: newLinks
                      });
                    }}
                  />
                  <input
                    type="text"
                    placeholder="링크"
                    value={link.link || ''}
                    className="w-32 px-3 py-1 border rounded"
                    onChange={(e) => {
                      const newLinks = [...(langContent.links || [])];
                      newLinks[index] = { ...link, link: e.target.value };
                      handleContentChange(langCode, {
                        ...langContent,
                        links: newLinks
                      });
                    }}
                  />
                </div>
              ))}
              
              <button
                onClick={() => {
                  const newLinks = [
                    ...(langContent.links || []),
                    { id: `quick-${(langContent.links || []).length + 1}`, icon: '🔗', title: '', link: '/' }
                  ];
                  handleContentChange(langCode, {
                    ...langContent,
                    links: newLinks
                  });
                }}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 text-gray-500"
              >
                + 링크 추가
              </button>
            </div>
          </div>
        );

      case 'promo':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="제목"
              value={langContent.title || ''}
              onChange={(e) => handleContentChange(langCode, {
                ...langContent,
                title: e.target.value
              })}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="부제목"
              value={langContent.subtitle || ''}
              onChange={(e) => handleContentChange(langCode, {
                ...langContent,
                subtitle: e.target.value
              })}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="아이콘"
                value={langContent.icon || ''}
                onChange={(e) => handleContentChange(langCode, {
                  ...langContent,
                  icon: e.target.value
                })}
                className="px-4 py-2 border rounded-lg text-center"
              />
              <input
                type="text"
                placeholder="링크"
                value={langContent.link || ''}
                onChange={(e) => handleContentChange(langCode, {
                  ...langContent,
                  link: e.target.value
                })}
                className="px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="p-8 text-center text-gray-500">
            {sectionKey} 섹션 에디터를 구현해주세요
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* 언어 탭 */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-1">
            <Languages className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">다국어 설정</span>
          </div>
          
          <div className="flex gap-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setActiveLanguage(lang.code)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                  activeLanguage === lang.code
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 자동 번역 버튼 */}
        {activeLanguage !== 'ko' && (
          <div className="px-4 pb-3">
            <button
              onClick={() => autoTranslate('ko', activeLanguage)}
              className="flex items-center gap-2 px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
            >
              <Globe className="w-3 h-3" />
              한국어에서 자동 번역
            </button>
          </div>
        )}
      </div>

      {/* 언어별 컨텐츠 에디터 */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>{languages.find(l => l.code === activeLanguage)?.flag}</span>
            <span>{languages.find(l => l.code === activeLanguage)?.name} 설정</span>
          </h3>
        </div>
        
        {renderSectionEditor(activeLanguage)}
      </div>

      {/* 미리보기 */}
      <div className="border-t bg-gray-50 p-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">미리보기</h4>
        <div className="bg-white rounded-lg p-4 border">
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(content[activeLanguage], null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default MultiLanguageEditor;