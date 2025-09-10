'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Languages, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LanguageAddForm from '@/components/admin/language/LanguageAddForm';
import ProductTranslationTab from '@/components/admin/language/ProductTranslationTab';
import SettingsTab from '@/components/admin/language/SettingsTab';

interface Language {
  code: string;
  name: string;
  native_name?: string;
  enabled: boolean;
  is_default?: boolean;
}

interface LanguagePack {
  id: string;
  key: string;
  translations: { [key: string]: string }; // 동적 언어 지원
}

export default function LanguagePacksPage() {
  const [languagePacks, setLanguagePacks] = useState<LanguagePack[]>([]);
  const [filteredPacks, setFilteredPacks] = useState<LanguagePack[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ui-packs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([]);

  // Edit state
  const [editingPack, setEditingPack] = useState<LanguagePack | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newTranslations, setNewTranslations] = useState<{ [key: string]: string }>({});

  // New pack state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchLanguagePacks();
    fetchSelectedLanguages();
  }, []);

  useEffect(() => {
    if (!languagePacks || !Array.isArray(languagePacks)) {
      setFilteredPacks([]);
      return;
    }
    
    const filtered = languagePacks.filter(pack => {
      if (!pack || !pack.key) return false;
      
      const matchesKey = pack.key.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTranslations = pack.translations && typeof pack.translations === 'object' 
        ? Object.values(pack.translations).some(translation =>
            typeof translation === 'string' && translation.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : false;
      
      return matchesKey || matchesTranslations;
    });
    
    setFilteredPacks(filtered);
  }, [languagePacks, searchTerm]);

  const fetchLanguagePacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/language-packs');
      const data = await response.json();
      
      if (data.success) {
        setLanguagePacks(data.packs || []);
        setFilteredPacks(data.packs || []);
      } else {
        toast.error('언어팩 데이터를 불러오는데 실패했습니다.');
        setLanguagePacks([]);
        setFilteredPacks([]);
      }
    } catch (error) {
      toast.error('언어팩 데이터를 불러오는데 실패했습니다.');
      setLanguagePacks([]);
      setFilteredPacks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedLanguages = async () => {
    try {
      const response = await fetch('/api/admin/i18n/settings');
      const data = await response.json();
      
      if (data.selectedLanguages) {
        setSelectedLanguages(data.selectedLanguages);
        
        // 새 번역 객체 초기화
        const initialTranslations: { [key: string]: string } = {};
        data.selectedLanguages.forEach((lang: Language) => {
          initialTranslations[lang.code] = '';
        });
        setNewTranslations(initialTranslations);
      }
    } catch (error) {
      console.error('활성 언어 목록을 가져오는데 실패:', error);
    }
  };

  const handleCreate = async () => {
    if (!newKey.trim()) {
      toast.error('키를 입력하세요.');
      return;
    }

    // 빈 번역은 제외하고 제출
    const validTranslations = Object.fromEntries(
      Object.entries(newTranslations).filter(([_, value]) => value.trim() !== '')
    );

    if (Object.keys(validTranslations).length === 0) {
      toast.error('최소 하나의 번역을 입력하세요.');
      return;
    }

    try {
      const response = await fetch('/api/admin/language-packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: newKey,
          translations: validTranslations
        })
      });

      if (response.ok) {
        toast.success('언어팩이 생성되었습니다.');
        setNewKey('');
        setNewTranslations(Object.fromEntries(selectedLanguages.map(lang => [lang.code, ''])));
        setIsAddDialogOpen(false);
        fetchLanguagePacks();
      } else {
        const error = await response.json();
        toast.error(error.error || '언어팩 생성에 실패했습니다.');
      }
    } catch (error) {
      toast.error('언어팩 생성에 실패했습니다.');
    }
  };

  const handleEdit = (pack: LanguagePack) => {
    setEditingPack(pack);
    setNewTranslations({ ...pack.translations });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingPack) return;

    try {
      const response = await fetch('/api/admin/language-packs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: editingPack.key,
          translations: newTranslations
        })
      });

      if (response.ok) {
        toast.success('언어팩이 수정되었습니다.');
        setIsEditDialogOpen(false);
        setEditingPack(null);
        fetchLanguagePacks();
      } else {
        const error = await response.json();
        toast.error(error.error || '언어팩 수정에 실패했습니다.');
      }
    } catch (error) {
      toast.error('언어팩 수정에 실패했습니다.');
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('정말로 이 언어팩을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch('/api/admin/language-packs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });

      if (response.ok) {
        toast.success('언어팩이 삭제되었습니다.');
        fetchLanguagePacks();
      } else {
        const error = await response.json();
        toast.error(error.error || '언어팩 삭제에 실패했습니다.');
      }
    } catch (error) {
      toast.error('언어팩 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">다국어 관리</h1>
          <p className="text-muted-foreground">
            UI 언어팩 관리, 상품 번역, 시스템 설정을 통합 관리합니다.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            총 {languagePacks.length}개 언어팩
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ui-packs" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            UI 언어팩
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <span className="text-lg">🛍️</span>
            상품 번역
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <span className="text-lg">⚙️</span>
            설정
          </TabsTrigger>
        </TabsList>

        {/* UI 언어팩 관리 탭 */}
        <TabsContent value="ui-packs" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    UI 텍스트 언어팩 관리
                  </CardTitle>
                  <CardDescription>
                    웹사이트의 모든 UI 텍스트에 대한 다국어 번역을 관리합니다.
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="언어팩 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        언어팩 추가
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>새 언어팩 추가</DialogTitle>
                        <DialogDescription>
                          새로운 UI 텍스트 키와 번역을 추가합니다.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="key">키 (Key)</Label>
                          <Input
                            id="key"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            placeholder="예: common.submit, navbar.home"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label>번역</Label>
                          {selectedLanguages.map((language) => (
                            <div key={language.code} className="grid grid-cols-4 gap-3 items-center">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {language.code === 'ko' && '🇰🇷'}
                                  {language.code === 'en' && '🇺🇸'}
                                  {language.code === 'ja' && '🇯🇵'}
                                  {language.code === 'zh' && '🇨🇳'}
                                  {!['ko', 'en', 'ja', 'zh'].includes(language.code) && '🌐'}
                                </span>
                                <span className="font-medium text-sm">
                                  {language.native_name || language.name}
                                </span>
                              </div>
                              <div className="col-span-3">
                                <Input
                                  value={newTranslations[language.code] || ''}
                                  onChange={(e) => setNewTranslations(prev => ({
                                    ...prev,
                                    [language.code]: e.target.value
                                  }))}
                                  placeholder={`${language.name} 번역`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            취소
                          </Button>
                          <Button onClick={handleCreate}>
                            추가
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">언어팩을 불러오는 중...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">키 (Key)</TableHead>
                      {selectedLanguages.map((language) => (
                        <TableHead key={language.code}>
                          <div className="flex items-center gap-2">
                            <span>
                              {language.code === 'ko' && '🇰🇷'}
                              {language.code === 'en' && '🇺🇸'}
                              {language.code === 'ja' && '🇯🇵'}
                              {language.code === 'zh' && '🇨🇳'}
                              {!['ko', 'en', 'ja', 'zh'].includes(language.code) && '🌐'}
                            </span>
                            {language.native_name || language.name}
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="w-[100px]">액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!filteredPacks || filteredPacks.length === 0 ? (
                      <TableRow>
                        <TableCell 
                          colSpan={(selectedLanguages?.length || 0) + 2} 
                          className="text-center py-8 text-gray-500"
                        >
                          {languagePacks.length === 0 ? '등록된 언어팩이 없습니다.' : '검색 결과가 없습니다.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPacks?.map((pack) => (
                        <TableRow key={pack.id}>
                          <TableCell className="font-mono text-sm">{pack.key}</TableCell>
                          {selectedLanguages.map((language) => (
                            <TableCell key={language.code} className="max-w-xs">
                              <span className="truncate block">
                                {pack.translations[language.code] || '-'}
                              </span>
                            </TableCell>
                          ))}
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(pack)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(pack.key)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 상품 번역 관리 탭 */}
        <TabsContent value="products" className="space-y-6 mt-6">
          <ProductTranslationTab isActive={activeTab === 'products'} />
        </TabsContent>

        {/* 설정 탭 */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          <SettingsTab 
            isActive={activeTab === 'settings'} 
            languagePacksCount={languagePacks.length}
            selectedLanguages={selectedLanguages}
            onLanguageUpdate={fetchSelectedLanguages}
          />
        </TabsContent>
      </Tabs>

      {/* 편집 다이얼로그 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>언어팩 편집</DialogTitle>
            <DialogDescription>
              {editingPack?.key} 키의 번역을 편집합니다.
            </DialogDescription>
          </DialogHeader>
          {editingPack && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>키 (Key)</Label>
                <div className="px-3 py-2 bg-gray-100 rounded font-mono text-sm">
                  {editingPack.key}
                </div>
              </div>
              <div className="space-y-3">
                <Label>번역</Label>
                {selectedLanguages.map((language) => (
                  <div key={language.code} className="grid grid-cols-4 gap-3 items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {language.code === 'ko' && '🇰🇷'}
                        {language.code === 'en' && '🇺🇸'}
                        {language.code === 'ja' && '🇯🇵'}
                        {language.code === 'zh' && '🇨🇳'}
                        {!['ko', 'en', 'ja', 'zh'].includes(language.code) && '🌐'}
                      </span>
                      <span className="font-medium text-sm">
                        {language.native_name || language.name}
                      </span>
                    </div>
                    <div className="col-span-3">
                      <Input
                        value={newTranslations[language.code] || ''}
                        onChange={(e) => setNewTranslations(prev => ({
                          ...prev,
                          [language.code]: e.target.value
                        }))}
                        placeholder={`${language.name} 번역`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleUpdate}>
                  수정
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}