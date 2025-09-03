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

interface LanguagePack {
  id: string;
  key: string;
  ko: string;
  en: string;
  ja: string;
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
  const [formData, setFormData] = useState({
    key: '',
    ko: '',
    en: '',
    ja: '',
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
    if (activeTab === 'ui-texts') {
      fetchLanguagePacks();
    } else if (activeTab === 'products') {
      fetchProducts();
    }
    fetchApiSettings();
  }, [selectedCategory, activeTab]);

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
        ko: formData.ko,
        en: formData.en,
        ja: formData.ja,
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
      ko: pack.ko,
      en: pack.en,
      ja: pack.ja,
      category: pack.category,
      description: pack.description || '',
      autoTranslate: false
    });
    setIsAddDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      key: '',
      ko: '',
      en: '',
      ja: '',
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

  const filteredPacks = languagePacks.filter(pack => 
    searchTerm === '' || 
    pack.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pack.ko.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pack.en.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

              <div className="space-y-2">
                <Label htmlFor="ko">한국어</Label>
                <Input
                  id="ko"
                  value={formData.ko}
                  onChange={(e) => setFormData({...formData, ko: e.target.value})}
                  placeholder="한국어 텍스트"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="en">영어</Label>
                <Input
                  id="en"
                  value={formData.en}
                  onChange={(e) => setFormData({...formData, en: e.target.value})}
                  placeholder="English text (자동 번역 가능)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ja">일본어</Label>
                <Input
                  id="ja"
                  value={formData.ja}
                  onChange={(e) => setFormData({...formData, ja: e.target.value})}
                  placeholder="日本語テキスト (자동 번역 가능)"
                />
              </div>

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
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">한국어, 영어, 일본어</p>
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
                  <TableHead>한국어</TableHead>
                  <TableHead>영어</TableHead>
                  <TableHead>일본어</TableHead>
                  <TableHead className="text-right">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
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
                      <TableCell className="max-w-[200px] truncate">{pack.ko}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{pack.en}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{pack.ja}</TableCell>
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
                              {product.translations?.find((t: any) => t.language_code === 'en') ? (
                                <Badge variant="outline" className="text-green-600">번역됨</Badge>
                              ) : (
                                <Badge variant="secondary">번역 없음</Badge>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-sm font-medium mb-1">Product Name</label>
                                <Input
                                  value={product.translations?.find((t: any) => t.language_code === 'en')?.name || ''}
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
                                  value={product.translations?.find((t: any) => t.language_code === 'en')?.description || ''}
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
                              {product.translations?.find((t: any) => t.language_code === 'ja') ? (
                                <Badge variant="outline" className="text-green-600">번역됨</Badge>
                              ) : (
                                <Badge variant="secondary">番訳なし</Badge>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div>
                                <label className="block text-sm font-medium mb-1">製品名</label>
                                <Input
                                  value={product.translations?.find((t: any) => t.language_code === 'ja')?.name || ''}
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
                                  value={product.translations?.find((t: any) => t.language_code === 'ja')?.description || ''}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                언어 설정 관리
              </CardTitle>
              <CardDescription>
                다국어 지원 설정 및 관리 도구
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 활성 언어 정보 */}
              <div>
                <h3 className="font-medium mb-3">활성 언어</h3>
                <div className="text-sm text-gray-600 mb-3">
                  현재 시스템에서 지원하는 언어들입니다. 최대 3개의 언어까지 활성화할 수 있습니다.
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded border">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🇰🇷</span>
                      <div>
                        <span className="font-medium">한국어 (Korean)</span>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800">기본 언어</Badge>
                        </div>
                      </div>
                    </div>
                    <span className="text-green-600 font-medium">활성</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded border">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🇺🇸</span>
                      <div>
                        <span className="font-medium">영어 (English)</span>
                      </div>
                    </div>
                    <span className="text-green-600 font-medium">활성</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded border">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🇯🇵</span>
                      <div>
                        <span className="font-medium">일본어 (Japanese)</span>
                      </div>
                    </div>
                    <span className="text-green-600 font-medium">활성</span>
                  </div>
                </div>
              </div>

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
                    <div className="text-2xl font-bold text-purple-600">3</div>
                    <div className="text-sm text-purple-800">지원 언어</div>
                    <div className="text-xs text-gray-600">활성화된 언어</div>
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
                  
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                       onClick={() => window.open('/admin/languages/settings', '_blank')}>
                    <div>
                      <div className="font-medium">언어 활성화/비활성화</div>
                      <div className="text-sm text-gray-600">지원 언어를 추가하거나 제거합니다</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                       onClick={() => window.open('/admin/languages/replace', '_blank')}>
                    <div>
                      <div className="font-medium">언어 교체</div>
                      <div className="text-sm text-gray-600">한 언어를 다른 언어로 완전 교체합니다</div>
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