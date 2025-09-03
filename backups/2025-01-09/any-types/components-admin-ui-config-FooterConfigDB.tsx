'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Layers, Link, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface FooterSection {
  id: string;
  title: string;
  titleKey: string;
  links: Array<{
    id: string;
    label: string;
    labelKey: string;
    href: string;
  }>;
  order: number;
  visible: boolean;
}

export function FooterConfigDB() {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('/');
  const { t } = useLanguage();

  // 푸터 섹션 로드
  const loadSections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ui-menus?type=footer');
      
      if (response.ok) {
        const data = await response.json();
        const formattedSections = data.menus.map((menu: any) => ({
          id: menu.id,
          title: menu.content?.title || '',
          titleKey: menu.content?.titleKey || menu.sectionId,
          links: menu.content?.links || [],
          order: menu.order,
          visible: menu.visible
        }));
        setSections(formattedSections);
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) {
      alert('섹션 제목을 입력해주세요.');
      return;
    }

    try {
      const sectionKey = `footer.section.${newSectionTitle.toLowerCase().replace(/\s+/g, '_')}`;
      
      const response = await fetch('/api/admin/ui-menus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          type: 'footer',
          name: newSectionTitle,
          href: '#',
          autoTranslate: true,
          content: {
            title: newSectionTitle,
            titleKey: sectionKey,
            links: []
          }
        })
      });

      if (response.ok) {
        await loadSections();
        setNewSectionTitle('');
        setIsAddingSection(false);
        alert('섹션이 추가되고 자동 번역되었습니다.');
      }
    } catch (error) {

      alert('섹션 추가 중 오류가 발생했습니다.');
    }
  };

  const handleAddLink = async (sectionId: string) => {
    if (!newLinkName.trim()) {
      alert('링크 이름을 입력해주세요.');
      return;
    }

    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return;

      const linkKey = `footer.link.${newLinkName.toLowerCase().replace(/\s+/g, '_')}`;
      const newLink = {
        id: `link-${Date.now()}`,
        label: newLinkName,
        labelKey: linkKey,
        href: newLinkUrl || '/'
      };

      const updatedLinks = [...section.links, newLink];

      // 언어팩에 추가
      await fetch('/api/admin/language-packs/auto-translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          key: linkKey,
          ko: newLinkName,
          category: 'footer',
          autoTranslate: true
        })
      });

      // 섹션 업데이트
      const response = await fetch('/api/admin/ui-menus', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          id: sectionId,
          content: {
            ...section,
            links: updatedLinks
          }
        })
      });

      if (response.ok) {
        await loadSections();
        setNewLinkName('');
        setNewLinkUrl('/');
        setIsAddingLink(null);
        alert('링크가 추가되고 자동 번역되었습니다.');
      }
    } catch (error) {

      alert('링크 추가 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('이 섹션을 삭제하시겠습니까?')) {
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
        await loadSections();
        alert('섹션이 삭제되었습니다.');
      }
    } catch (error) {

      alert('섹션 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteLink = async (sectionId: string, linkId: string) => {
    if (!confirm('이 링크를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return;

      const updatedLinks = section.links.filter(link => link.id !== linkId);

      const response = await fetch('/api/admin/ui-menus', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          id: sectionId,
          content: {
            ...section,
            links: updatedLinks
          }
        })
      });

      if (response.ok) {
        await loadSections();
        alert('링크가 삭제되었습니다.');
      }
    } catch (error) {

      alert('링크 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleToggleVisibility = async (id: string, visible: boolean) => {
    try {
      const response = await fetch('/api/admin/ui-menus', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          id,
          visible: !visible
        })
      });

      if (response.ok) {
        await loadSections();
      }
    } catch (error) {

    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-sm text-muted-foreground">푸터 설정을 불러오는 중...</p>
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
            <CardTitle>푸터 섹션 설정</CardTitle>
            <CardDescription>웹사이트 하단 푸터의 섹션과 링크를 관리합니다.</CardDescription>
          </div>
          <Button onClick={() => setIsAddingSection(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            섹션 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent>

        {/* 새 섹션 추가 폼 */}
        {isAddingSection && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">새 섹션 추가</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="섹션 제목 (예: 고객 지원)"
                  />
                </div>
                <Button onClick={handleAddSection} size="sm">
                  추가
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingSection(false);
                    setNewSectionTitle('');
                  }}
                >
                  취소
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                섹션 제목은 자동으로 영어와 일본어로 번역됩니다.
              </p>
            </CardContent>
          </Card>
        )}

        {/* 섹션 목록 */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                  <span className="text-xs text-gray-500">({section.titleKey})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVisibility(section.id, section.visible)}
                    className={`px-3 py-1 rounded-md text-xs font-medium ${
                      section.visible
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {section.visible ? '표시' : '숨김'}
                  </button>
                  <button
                    onClick={() => setIsAddingLink(section.id)}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium hover:bg-blue-100"
                  >
                    + 링크
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="px-3 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium hover:bg-red-100"
                  >
                    삭제
                  </button>
                </div>
              </div>

              {/* 링크 추가 폼 */}
              {isAddingLink === section.id && (
                <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newLinkName}
                      onChange={(e) => setNewLinkName(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="링크 이름"
                    />
                    <input
                      type="text"
                      value={newLinkUrl}
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="URL"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddLink(section.id)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                      >
                        추가
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingLink(null);
                          setNewLinkName('');
                          setNewLinkUrl('/');
                        }}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 링크 목록 */}
              <div className="space-y-1">
                {section.links.map((link) => (
                  <div key={link.id} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-md">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-900">{link.label}</span>
                      <span className="text-xs text-gray-500">({link.labelKey})</span>
                      <span className="text-xs text-blue-600">{link.href}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteLink(section.id, link.id)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      삭제
                    </button>
                  </div>
                ))}
                {section.links.length === 0 && (
                  <p className="text-sm text-gray-500 py-2 px-3">링크가 없습니다.</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {sections.length === 0 && (
          <div className="text-center py-12">
            <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">푸터 섹션이 없습니다</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              위의 "섹션 추가" 버튼을 클릭하여 섹션을 추가하세요.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}