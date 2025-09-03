'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Languages, Plus, Search, Edit2, Trash2, Globe, Settings, Key, CheckCircle, XCircle, TestTube, Package, ShoppingBag, LayoutTemplate } from 'lucide-react';
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
  category: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function LanguagePacksPage() {
  const [languagePacks, setLanguagePacks] = useState<LanguagePack[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('ui-texts');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<LanguagePack | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([]);
  const [formData, setFormData] = useState<{
    key: string;
    translations: { [key: string]: string };
    category: string;
    description: string;
    autoTranslate: boolean;
  }>({
    key: '',
    translations: {},
    category: '',
    description: '',
    autoTranslate: true
  });
  const [apiSettings, setApiSettings] = useState({
    api_key: '',
    enabled: false,
    configured: false,
    masked_key: '',
    status: 'inactive'
  });
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{ success: boolean; message: string; sample_translation?: string; error_details?: string } | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [allLanguages, setAllLanguages] = useState<Language[]>([]);

  const categories = [
    'all',
    'common',
    'header',
    'footer',
    'hero',
    'category',
    'homepage',
    'admin',
    'auth',
    'business',
    'influencer',
    'campaign',
    'action',
    'error',
    'status'
  ];

  useEffect(() => {
    fetchSelectedLanguages();
    if (activeTab === 'ui-texts') {
      fetchLanguagePacks();
    } else if (activeTab === 'products') {
      fetchProducts();
    }
    fetchApiSettings();
  }, [selectedCategory, activeTab]);

  const fetchSelectedLanguages = async () => {
    try {
      const response = await fetch('/api/admin/i18n/settings');
      const data = await response.json();
      if (data.languages) {
        setSelectedLanguages(data.languages.filter((lang: Language) => lang.enabled));
        // 폼 데이터 초기화
        const initialTranslations: { [key: string]: string } = {};
        data.languages
          .filter((lang: Language) => lang.enabled)
          .forEach((lang: Language) => {
            initialTranslations[lang.code] = '';
          });
        setFormData(prev => ({ ...prev, translations: initialTranslations }));
      }
    } catch (error) {
      console.error('Error fetching selected languages:', error);
      // 폴백: 기본 언어 설정
      setSelectedLanguages([
        { code: 'ko', name: '한국어', enabled: true, is_default: true },
        { code: 'en', name: 'English', enabled: true },
        { code: 'ja', name: '日本語', enabled: true }
      ]);
      setFormData(prev => ({ 
        ...prev, 
        translations: { ko: '', en: '', ja: '' }
      }));
    }
  };

  const fetchApiSettings = async () => {
    try {
      const response = await fetch('/api/admin/translate-settings');
      const data = await response.json();
      setApiSettings({
        api_key: '',
        enabled: data.settings.google_translate_enabled || false,
        configured: data.settings.google_translate_api_key_configured || false,
        masked_key: data.settings.google_translate_api_key_masked || '',
        status: data.status || 'inactive'
      });
    } catch (error) {

    }
  };

  const fetchLanguagePacks = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/admin/language-packs?${params}`);
      const data = await response.json();
      
      // API 응답이 배열인지 확인
      if (Array.isArray(data)) {
        setLanguagePacks(data);
      } else if (data.error) {

        toast.error(data.error);
        setLanguagePacks([]);
      } else {

        setLanguagePacks([]);
      }
    } catch (error) {

      toast.error('언어팩을 불러오는데 실패했습니다.');
      setLanguagePacks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('includeTranslations', 'true');
      if (productSearchTerm) {
        params.append('search', productSearchTerm);
      }

      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();
      
      if (data.success && data.products) {
        setProducts(data.products);
      } else {

        toast.error('상품 데이터를 불러오는데 실패했습니다.');
        setProducts([]);
      }
    } catch (error) {

      toast.error('상품 데이터를 불러오는데 실패했습니다.');
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // namespace:key 형식 파싱
      let namespace = 'common';
      let key = formData.key;
      
      if (formData.key.includes(':')) {
        const parts = formData.key.split(':');
        namespace = parts[0];
        key = parts[1];
      }

      const requestData = {
        namespace,
        key,
        translations: formData.translations,
        category: formData.category,
        description: formData.description,
        autoTranslate: formData.autoTranslate
      };

      const method = editingPack ? 'PUT' : 'POST';
      const url = editingPack 
        ? `/api/admin/language-packs/${encodeURIComponent(editingPack.id || editingPack.key)}`
        : '/api/admin/language-packs';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        toast.success(editingPack ? '언어팩이 수정되었습니다.' : '언어팩이 추가되었습니다.');
        setIsAddDialogOpen(false);
        setEditingPack(null);
        resetForm();
        fetchLanguagePacks();
      } else {
        const error = await response.json();
        toast.error(error.error || '언어팩 저장에 실패했습니다.');
      }
    } catch (error) {

      toast.error('언어팩 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const encodedKey = encodeURIComponent(key);
      const response = await fetch(`/api/admin/language-packs/${encodedKey}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('언어팩이 삭제되었습니다.');
        fetchLanguagePacks();
      }
    } catch (error) {

      toast.error('언어팩 삭제에 실패했습니다.');
    }
  };

  const handleEdit = (pack: LanguagePack) => {
    setEditingPack(pack);
    const [namespace, key] = pack.key.includes(':') ? pack.key.split(':') : ['common', pack.key];
    setFormData({
      key: `${namespace}:${key}`,
      translations: pack.translations,
      category: pack.category,
      description: pack.description || '',
      autoTranslate: false
    });
    setIsAddDialogOpen(true);
  };

  const resetForm = () => {
    const initialTranslations: { [key: string]: string } = {};
    selectedLanguages.forEach((lang) => {
      initialTranslations[lang.code] = '';
    });
    
    setFormData({
      key: '',
      translations: initialTranslations,
      category: '',
      description: '',
      autoTranslate: true
    });
    setEditingPack(null);
  };

  const handleApiSettingsSave = async () => {
    try {
      const response = await fetch('/api/admin/translate-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiSettings.api_key,
          enabled: apiSettings.enabled
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Google Translate API 설정이 저장되었습니다.');
        setApiTestResult(data.test_result);
        fetchApiSettings();
        setApiSettings(prev => ({ ...prev, api_key: '' })); // Clear the key input
      } else {
        const error = await response.json();
        toast.error(error.error || 'API 설정 저장에 실패했습니다.');
      }
    } catch (error) {

      toast.error('API 설정 저장에 실패했습니다.');
    }
  };

  const handleApiTest = async () => {
    if (!apiSettings.api_key) {
      toast.error('테스트할 API 키를 입력하세요.');
      return;
    }

    try {
      const response = await fetch('/api/admin/translate-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_key: apiSettings.api_key
        })
      });

      const data = await response.json();
      setApiTestResult(data);
      
      if (data.success) {
        toast.success('API 키가 정상적으로 작동합니다.');
      } else {
        toast.error(data.message || 'API 키 테스트에 실패했습니다.');
      }
    } catch (error) {

      toast.error('API 키 테스트에 실패했습니다.');
    }
  };

  const handleApiDisable = async () => {
    try {
      const response = await fetch('/api/admin/translate-settings', {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Google Translate API가 비활성화되었습니다.');
        fetchApiSettings();
        setApiTestResult(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'API 비활성화에 실패했습니다.');
      }
    } catch (error) {

      toast.error('API 비활성화에 실패했습니다.');
    }
  };

  const handleProductTranslationUpdate = async (productId: string, languageCode: string, field: string, value: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/translations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          languageCode,
          [field]: value
        })
      });

      if (response.ok) {
        toast.success('상품 번역이 업데이트되었습니다.');
        fetchProducts();
      } else {
        const error = await response.json();
        toast.error(error.error || '번역 업데이트에 실패했습니다.');
      }
    } catch (error) {

      toast.error('번역 업데이트에 실패했습니다.');
    }
  };

  const handleProductRetranslate = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/translations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLanguage: 'ko'
        })
      });

      if (response.ok) {
        toast.success('상품이 재번역되었습니다.');
        fetchProducts();
      } else {
        const error = await response.json();
        toast.error(error.error || '재번역에 실패했습니다.');
      }
    } catch (error) {

      toast.error('재번역에 실패했습니다.');
    }
  };

  const handleLanguageDisable = async (code: string) => {
    if (!confirm('정말로 이 언어를 비활성화하시겠습니까?')) return;

    try {
      const response = await fetch('/api/admin/i18n/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          updates: { enabled: false }
        })
      });

      if (response.ok) {
        toast.success('언어가 비활성화되었습니다.');
        fetchSelectedLanguages();
      } else {
        const error = await response.json();
        toast.error(error.error || '언어 비활성화에 실패했습니다.');
      }
    } catch (error) {
      toast.error('언어 비활성화에 실패했습니다.');
    }
  };

  const filteredPacks = languagePacks.filter(pack => {
    if (searchTerm === '') return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // 키로 검색
    if (pack.key.toLowerCase().includes(searchLower)) return true;
    
    // 모든 번역에서 검색
    return selectedLanguages.some(lang => 
      pack.translations[lang.code]?.toLowerCase().includes(searchLower)
    );
  });

  const filteredProducts = products.filter(product =>
    productSearchTerm === '' ||
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.translated_name?.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Languages className="h-6 w-6" />
            언어팩 관리
          </h2>
          <p className="text-muted-foreground">
            UI 텍스트 및 상품 다국어 지원을 관리합니다.
          </p>
        </div>
        {activeTab === 'ui-texts' && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                언어팩 추가
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingPack ? '언어팩 수정' : '새 언어팩 추가'}
              </DialogTitle>
              <DialogDescription>
                언어팩 정보를 입력하세요. 자동 번역 옵션을 사용하면 한국어를 기준으로 자동 번역됩니다.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="key">키 (Key)</Label>
                  <Input
                    id="key"
                    value={formData.key}
                    onChange={(e) => setFormData({...formData, key: e.target.value})}
                    placeholder="예: common:homepage.title"
                    required
                    disabled={!!editingPack}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== 'all').map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 동적 언어 입력 필드 */}
              {selectedLanguages.map((language, index) => (
                <div key={language.code} className="space-y-2">
                  <Label htmlFor={language.code}>
                    {language.flag_emoji && <span className="mr-1">{language.flag_emoji}</span>}
                    {language.native_name || language.name} ({language.code.toUpperCase()})
                    {language.is_default && <span className="text-blue-600 ml-1">*</span>}
                  </Label>
                  <Input
                    id={language.code}
                    value={formData.translations[language.code] || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      translations: {
                        ...formData.translations,
                        [language.code]: e.target.value
                      }
                    })}
                    placeholder={
                      language.is_default 
                        ? `${language.native_name || language.name} 텍스트 (필수)`
                        : `${language.native_name || language.name} (자동 번역 가능)`
                    }
                    required={language.is_default}
                  />
                </div>
              ))}

              <div className="space-y-2">
                <Label htmlFor="description">설명 (선택)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="이 언어팩의 용도를 설명하세요"
                />
              </div>

              {!editingPack && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoTranslate"
                    checked={formData.autoTranslate}
                    onChange={(e) => setFormData({...formData, autoTranslate: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="autoTranslate">
                    한국어를 기준으로 자동 번역 (Google Translate)
                  </Label>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}>
                  취소
                </Button>
                <Button type="submit">
                  {editingPack ? '수정' : '추가'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">UI 언어팩</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{languagePacks.length}</div>
            <p className="text-xs text-muted-foreground">등록된 언어팩 수</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">상품 번역</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">번역된 상품 수</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">지원 언어</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedLanguages.length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedLanguages.map(lang => lang.native_name || lang.name).join(', ')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">자동 번역</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              <Globe className="h-4 w-4" />
              {apiSettings.status === 'active' ? '활성' : '비활성'}
            </div>
            <p className="text-xs text-muted-foreground">Google Translate API</p>
          </CardContent>
        </Card>
      </div>

      {/* 탭 메뉴 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ui-texts" className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" />
            UI 텍스트
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            상품 번역
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            설정
          </TabsTrigger>
        </TabsList>

        {/* UI 텍스트 관리 탭 */}
        <TabsContent value="ui-texts" className="space-y-6 mt-6">
          {/* Google Translate API 설정 */}
          <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Google Translate API 설정
              </CardTitle>
              <CardDescription>
                자동 번역을 위한 Google Translate API 키를 설정합니다.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={apiSettings.status === 'active' ? 'default' : 'secondary'}>
                {apiSettings.status === 'active' ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    활성
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    비활성
                  </>
                )}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsApiSettingsOpen(!isApiSettingsOpen)}
              >
                {isApiSettingsOpen ? '접기' : '설정'}
              </Button>
            </div>
          </div>
        </CardHeader>
        {isApiSettingsOpen && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="api_key">API 키</Label>
                <Input
                  id="api_key"
                  type="password"
                  value={apiSettings.api_key}
                  onChange={(e) => setApiSettings(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder={apiSettings.configured ? `설정됨: ${apiSettings.masked_key}` : 'Google Translate API 키를 입력하세요'}
                />
              </div>
              <div className="space-y-2">
                <Label>상태</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="api_enabled"
                    checked={apiSettings.enabled}
                    onChange={(e) => setApiSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="api_enabled">
                    API 활성화
                  </Label>
                </div>
              </div>
            </div>

            {apiTestResult && (
              <div className={`p-4 rounded-md ${apiTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2">
                  {apiTestResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={apiTestResult.success ? 'text-green-800' : 'text-red-800'}>
                    {apiTestResult.message}
                  </span>
                </div>
                {apiTestResult.sample_translation && (
                  <p className="mt-2 text-sm text-gray-600">
                    테스트 번역: "Hello World" → "{apiTestResult.sample_translation}"
                  </p>
                )}
                {apiTestResult.error_details && (
                  <p className="mt-2 text-sm text-red-600">
                    오류 세부사항: {apiTestResult.error_details}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleApiTest}
                disabled={!apiSettings.api_key}
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                API 키 테스트
              </Button>
              <div className="flex gap-2">
                {apiSettings.configured && (
                  <Button
                    variant="destructive"
                    onClick={handleApiDisable}
                    size="sm"
                  >
                    비활성화
                  </Button>
                )}
                <Button onClick={handleApiSettingsSave}>
                  설정 저장
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>언어팩 목록</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? '전체' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>키</TableHead>
                  <TableHead>카테고리</TableHead>
                  {selectedLanguages.map((language) => (
                    <TableHead key={language.code}>
                      {language.flag_emoji && <span className="mr-1">{language.flag_emoji}</span>}
                      {language.native_name || language.name}
                      {language.is_default && <span className="text-blue-600 ml-1">*</span>}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3 + selectedLanguages.length} className="text-center text-muted-foreground">
                      언어팩이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPacks.map((pack) => (
                    <TableRow key={pack.id}>
                      <TableCell className="font-mono text-sm">{pack.key}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{pack.category}</Badge>
                      </TableCell>
                      {selectedLanguages.map((language) => (
                        <TableCell key={language.code} className="max-w-[200px] truncate">
                          {pack.translations[language.code] || '-'}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    상품 번역 관리
                  </CardTitle>
                  <CardDescription>
                    등록된 상품의 다국어 번역을 관리합니다.
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="상품 검색..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Button
                    onClick={() => fetchProducts()}
                    disabled={productsLoading}
                    variant="outline"
                  >
                    {productsLoading ? '로딩 중...' : '새로고침'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">상품 목록을 불러오는 중...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {products.length === 0 ? '등록된 상품이 없습니다.' : '검색 결과가 없습니다.'}
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div key={product.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-lg">{product.name}</h3>
                            <p className="text-sm text-gray-500">ID: {product.id}</p>
                            <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                          </div>
                          <Button
                            onClick={() => handleProductRetranslate(product.id)}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Globe className="h-4 w-4" />
                            자동 번역
                          </Button>
                        </div>

                        <div className="grid gap-4">
                          {/* 한국어 (기본) */}
                          <div className="border rounded p-3 bg-blue-50">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">🇰🇷</span>
                              <span className="font-medium">한국어 (기본)</span>
                              <Badge variant="default">원본</Badge>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-sm font-medium mb-1">상품명</label>
                                <div className="w-full px-3 py-2 bg-white border rounded-md text-gray-700">
                                  {product.name}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">설명</label>
                                <div className="w-full px-3 py-2 bg-white border rounded-md text-gray-700 min-h-[60px]">
                                  {product.description}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 영어 번역 */}
                          <div className="border rounded p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">🇺🇸</span>
                              <span className="font-medium">English</span>
                              {product.translations?.find((t: unknown) => t.language_code === 'en') ? (
                                <Badge variant="outline" className="text-green-600">번역됨</Badge>
                              ) : (
                                <Badge variant="secondary">번역 없음</Badge>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-sm font-medium mb-1">Product Name</label>
                                <Input
                                  value={product.translations?.find((t: unknown) => t.language_code === 'en')?.name || ''}
                                  onChange={(e) => handleProductTranslationUpdate(
                                    product.id, 
                                    'en', 
                                    'name', 
                                    e.target.value
                                  )}
                                  placeholder="English product name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                  value={product.translations?.find((t: unknown) => t.language_code === 'en')?.description || ''}
                                  onChange={(e) => handleProductTranslationUpdate(
                                    product.id, 
                                    'en', 
                                    'description', 
                                    e.target.value
                                  )}
                                  rows={3}
                                  className="w-full px-3 py-2 border rounded-md"
                                  placeholder="English description"
                                />
                              </div>
                            </div>
                          </div>

                          {/* 일본어 번역 */}
                          <div className="border rounded p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">🇯🇵</span>
                              <span className="font-medium">日本語</span>
                              {product.translations?.find((t: unknown) => t.language_code === 'ja') ? (
                                <Badge variant="outline" className="text-green-600">번역됨</Badge>
                              ) : (
                                <Badge variant="secondary">番訳なし</Badge>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-sm font-medium mb-1">製品名</label>
                                <Input
                                  value={product.translations?.find((t: unknown) => t.language_code === 'ja')?.name || ''}
                                  onChange={(e) => handleProductTranslationUpdate(
                                    product.id, 
                                    'ja', 
                                    'name', 
                                    e.target.value
                                  )}
                                  placeholder="日本語の製品名"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">説明</label>
                                <textarea
                                  value={product.translations?.find((t: unknown) => t.language_code === 'ja')?.description || ''}
                                  onChange={(e) => handleProductTranslationUpdate(
                                    product.id, 
                                    'ja', 
                                    'description', 
                                    e.target.value
                                  )}
                                  rows={3}
                                  className="w-full px-3 py-2 border rounded-md"
                                  placeholder="日本語での説明"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 설정 탭 */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          {/* Google Translate API 설정 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Google Translate API 설정
                  </CardTitle>
                  <CardDescription>
                    자동 번역을 위한 Google Translate API 키를 설정합니다.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={apiSettings.status === 'active' ? 'default' : 'secondary'}>
                    {apiSettings.status === 'active' ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        활성
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        비활성
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api_key">API 키</Label>
                  <Input
                    id="api_key"
                    type="password"
                    value={apiSettings.api_key}
                    onChange={(e) => setApiSettings(prev => ({ ...prev, api_key: e.target.value }))}
                    placeholder={apiSettings.configured ? `설정됨: ${apiSettings.masked_key}` : 'Google Translate API 키를 입력하세요'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>상태</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="api_enabled"
                      checked={apiSettings.enabled}
                      onChange={(e) => setApiSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="api_enabled">
                      API 활성화
                    </Label>
                  </div>
                </div>
              </div>

              {apiTestResult && (
                <div className={`p-4 rounded-md ${apiTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {apiTestResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={apiTestResult.success ? 'text-green-800' : 'text-red-800'}>
                      {apiTestResult.message}
                    </span>
                  </div>
                  {apiTestResult.sample_translation && (
                    <p className="mt-2 text-sm text-gray-600">
                      테스트 번역: "Hello World" → "{apiTestResult.sample_translation}"
                    </p>
                  )}
                  {apiTestResult.error_details && (
                    <p className="mt-2 text-sm text-red-600">
                      오류 세부사항: {apiTestResult.error_details}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleApiTest}
                  disabled={!apiSettings.api_key}
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  API 키 테스트
                </Button>
                <div className="flex gap-2">
                  {apiSettings.configured && (
                    <Button
                      variant="destructive"
                      onClick={handleApiDisable}
                      size="sm"
                    >
                      비활성화
                    </Button>
                  )}
                  <Button onClick={handleApiSettingsSave}>
                    설정 저장
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 언어 관리 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    언어 추가 및 관리
                  </CardTitle>
                  <CardDescription>
                    새로운 언어를 추가하거나 기존 언어를 관리합니다. 최대 3개의 언어까지 활성화할 수 있습니다.
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      언어 추가
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>새 언어 추가</DialogTitle>
                      <DialogDescription>
                        새로운 언어를 시스템에 추가합니다. Google Translate API가 설정되어 있어야 자동 번역이 가능합니다.
                      </DialogDescription>
                    </DialogHeader>
                    <LanguageAddForm 
                      onSuccess={() => {
                        fetchSelectedLanguages();
                        toast.success('새 언어가 추가되었습니다.');
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 활성 언어 목록 */}
              <div>
                <h3 className="font-medium mb-3">활성 언어</h3>
                <div className="space-y-2">
                  {selectedLanguages.map((language) => (
                    <div
                      key={language.code}
                      className={`flex items-center justify-between p-3 rounded border ${
                        language.is_default ? 'bg-blue-50' : 'bg-green-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{language.flag_emoji || '🌐'}</span>
                        <div>
                          <span className="font-medium">
                            {language.native_name || language.name} ({language.name})
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {language.code.toUpperCase()}
                            </Badge>
                            {language.is_default && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">기본 언어</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-medium text-sm">활성</span>
                        {!language.is_default && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLanguageDisable(language.code)}
                            className="text-red-600 hover:text-red-700"
                          >
                            비활성화
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 번역 통계 및 도구 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                번역 통계 및 도구
              </CardTitle>
              <CardDescription>
                번역 현황과 관리 도구
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 번역 통계 */}
              <div>
                <h3 className="font-medium mb-3">번역 통계</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{languagePacks.length}</div>
                    <div className="text-sm text-blue-800">UI 언어팩</div>
                    <div className="text-xs text-gray-600">등록된 UI 텍스트</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{products.length}</div>
                    <div className="text-sm text-green-800">번역된 상품</div>
                    <div className="text-xs text-gray-600">다국어 지원 상품</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedLanguages.length}</div>
                    <div className="text-sm text-purple-800">활성 언어</div>
                    <div className="text-xs text-gray-600">현재 사용 중인 언어</div>
                  </div>
                </div>
              </div>

              {/* 번역 도구 */}
              <div>
                <h3 className="font-medium mb-3">번역 관리 도구</h3>
                <div className="grid gap-3">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Google Translate API</div>
                        <div className="text-sm text-gray-600">자동 번역 서비스 설정</div>
                      </div>
                      <Badge variant={apiSettings.status === 'active' ? 'default' : 'secondary'}>
                        {apiSettings.status === 'active' ? '활성' : '비활성'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-medium">언어팩 내보내기/가져오기</div>
                      <div className="text-sm text-gray-600">언어팩을 JSON 파일로 내보내거나 가져올 수 있습니다</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-medium">번역 완성도 분석</div>
                      <div className="text-sm text-gray-600">각 언어별 번역 완성도와 누락된 번역을 확인합니다</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 심플한 언어 추가 폼 - 한국어 검색 기반
function LanguageAddForm({ onSuccess }: { onSuccess: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  // 한국어 기준 언어 목록 (검색용)
  const koreanLanguageMap = {
    '스페인어': { code: 'es', name: 'Spanish', nativeName: 'Español', googleCode: 'es', flag: '🇪🇸' },
    '스페인': { code: 'es', name: 'Spanish', nativeName: 'Español', googleCode: 'es', flag: '🇪🇸' },
    '프랑스어': { code: 'fr', name: 'French', nativeName: 'Français', googleCode: 'fr', flag: '🇫🇷' },
    '프랑스': { code: 'fr', name: 'French', nativeName: 'Français', googleCode: 'fr', flag: '🇫🇷' },
    '독일어': { code: 'de', name: 'German', nativeName: 'Deutsch', googleCode: 'de', flag: '🇩🇪' },
    '독일': { code: 'de', name: 'German', nativeName: 'Deutsch', googleCode: 'de', flag: '🇩🇪' },
    '이탈리아어': { code: 'it', name: 'Italian', nativeName: 'Italiano', googleCode: 'it', flag: '🇮🇹' },
    '이탈리아': { code: 'it', name: 'Italian', nativeName: 'Italiano', googleCode: 'it', flag: '🇮🇹' },
    '포르투갈어': { code: 'pt', name: 'Portuguese', nativeName: 'Português', googleCode: 'pt', flag: '🇵🇹' },
    '포르투갈': { code: 'pt', name: 'Portuguese', nativeName: 'Português', googleCode: 'pt', flag: '🇵🇹' },
    '러시아어': { code: 'ru', name: 'Russian', nativeName: 'Русский', googleCode: 'ru', flag: '🇷🇺' },
    '러시아': { code: 'ru', name: 'Russian', nativeName: 'Русский', googleCode: 'ru', flag: '🇷🇺' },
    '중국어': { code: 'zh', name: 'Chinese', nativeName: '中文', googleCode: 'zh', flag: '🇨🇳' },
    '중국': { code: 'zh', name: 'Chinese', nativeName: '中文', googleCode: 'zh', flag: '🇨🇳' },
    '아랍어': { code: 'ar', name: 'Arabic', nativeName: 'العربية', googleCode: 'ar', flag: '🇸🇦', direction: 'rtl' },
    '아랍': { code: 'ar', name: 'Arabic', nativeName: 'العربية', googleCode: 'ar', flag: '🇸🇦', direction: 'rtl' },
    '힌디어': { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', googleCode: 'hi', flag: '🇮🇳' },
    '인도': { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', googleCode: 'hi', flag: '🇮🇳' },
    '태국어': { code: 'th', name: 'Thai', nativeName: 'ไทย', googleCode: 'th', flag: '🇹🇭' },
    '태국': { code: 'th', name: 'Thai', nativeName: 'ไทย', googleCode: 'th', flag: '🇹🇭' },
    '베트남어': { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', googleCode: 'vi', flag: '🇻🇳' },
    '베트남': { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', googleCode: 'vi', flag: '🇻🇳' },
    '네덜란드어': { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', googleCode: 'nl', flag: '🇳🇱' },
    '네덜란드': { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', googleCode: 'nl', flag: '🇳🇱' },
    '스웨덴어': { code: 'sv', name: 'Swedish', nativeName: 'Svenska', googleCode: 'sv', flag: '🇸🇪' },
    '스웨덴': { code: 'sv', name: 'Swedish', nativeName: 'Svenska', googleCode: 'sv', flag: '🇸🇪' },
    '폴란드어': { code: 'pl', name: 'Polish', nativeName: 'Polski', googleCode: 'pl', flag: '🇵🇱' },
    '폴란드': { code: 'pl', name: 'Polish', nativeName: 'Polski', googleCode: 'pl', flag: '🇵🇱' },
    '터키어': { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', googleCode: 'tr', flag: '🇹🇷' },
    '터키': { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', googleCode: 'tr', flag: '🇹🇷' },
    '일본어': { code: 'ja', name: 'Japanese', nativeName: '日本語', googleCode: 'ja', flag: '🇯🇵' },
    '일본': { code: 'ja', name: 'Japanese', nativeName: '日本語', googleCode: 'ja', flag: '🇯🇵' },
    '영어': { code: 'en', name: 'English', nativeName: 'English', googleCode: 'en', flag: '🇺🇸' },
    '미국': { code: 'en', name: 'English', nativeName: 'English', googleCode: 'en', flag: '🇺🇸' }
  };

  // 검색 결과 필터링
  const searchResults = Object.entries(koreanLanguageMap)
    .filter(([korean, _]) => korean.includes(searchTerm))
    .slice(0, 10); // 최대 10개까지만 표시

  // 기본으로 선택된 언어들 (한국어 + 2개)
  const defaultSelectedLanguages = ['ko', 'en', 'ja'];

  const handleLanguageToggle = (code: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(code)) {
        // 한국어는 제거할 수 없음 (기본 언어)
        if (code === 'ko') {
          toast.error('한국어는 기본 언어로 제거할 수 없습니다.');
          return prev;
        }
        return prev.filter(lang => lang !== code);
      } else {
        // 최대 3개까지만 선택 가능
        if (prev.length >= 3) {
          toast.error('최대 3개 언어까지 활성화할 수 있습니다.');
          return prev;
        }
        return [...prev, code];
      }
    });
  };

  const handleLanguageAdd = async (korean: string, langData: any) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/admin/i18n/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: langData.code,
          name: langData.name,
          nativeName: langData.nativeName,
          googleCode: langData.googleCode,
          flagEmoji: langData.flag,
          enabled: true,
          direction: langData.direction || 'ltr'
        })
      });

      if (response.ok) {
        toast.success(`${korean} 언어가 추가되었습니다.`);
        onSuccess();
        setSearchTerm('');
      } else {
        const error = await response.json();
        toast.error(error.error || '언어 추가에 실패했습니다.');
      }
    } catch (error) {
      toast.error('언어 추가에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 초기 선택 언어 설정
  useEffect(() => {
    setSelectedLanguages(defaultSelectedLanguages);
  }, []);

  return (
    <div className="space-y-6">
      {/* 현재 선택된 언어 (3개) */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-3">현재 선택된 언어 (3개)</h3>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg">
            <span className="text-lg">🇰🇷</span>
            <span className="font-medium">한국어</span>
            <span className="text-xs text-blue-600">(기본)</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <span className="text-lg">🇺🇸</span>
            <span className="font-medium">영어</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <span className="text-lg">🇯🇵</span>
            <span className="font-medium">일본어</span>
          </div>
        </div>
      </div>

      {/* 한국어 검색 */}
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium">추가할 언어를 한국어로 검색하세요</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="예: 스페인어, 프랑스어, 독일어..."
              className="pl-10"
            />
          </div>
        </div>

        {/* 검색 결과 */}
        {searchTerm && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">검색 결과</Label>
            <div className="grid gap-2">
              {searchResults.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  '{searchTerm}' 검색 결과가 없습니다.
                </div>
              ) : (
                searchResults.map(([korean, langData]) => (
                  <Button
                    key={langData.code}
                    type="button"
                    variant="outline"
                    className="justify-start h-auto p-3"
                    onClick={() => handleLanguageAdd(korean, langData)}
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-lg">{langData.flag}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{korean}</div>
                        <div className="text-sm text-muted-foreground">
                          {langData.nativeName} ({langData.code.toUpperCase()})
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        추가하기
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 인기 언어 빠른 추가 */}
      {!searchTerm && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">인기 언어 빠른 추가</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['스페인어', koreanLanguageMap['스페인어']],
              ['프랑스어', koreanLanguageMap['프랑스어']],
              ['독일어', koreanLanguageMap['독일어']],
              ['중국어', koreanLanguageMap['중국어']],
              ['러시아어', koreanLanguageMap['러시아어']],
              ['아랍어', koreanLanguageMap['아랍어']]
            ].map(([korean, langData]: any) => (
              <Button
                key={langData.code}
                type="button"
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => handleLanguageAdd(korean, langData)}
                disabled={isSubmitting}
              >
                <span className="mr-2">{langData.flag}</span>
                {korean}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}