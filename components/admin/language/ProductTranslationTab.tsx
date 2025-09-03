'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Globe, Package } from 'lucide-react';

interface ProductTranslationTabProps {
  isActive: boolean;
}

export default function ProductTranslationTab({ isActive }: ProductTranslationTabProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  useEffect(() => {
    if (isActive) {
      fetchProducts();
    }
  }, [isActive]);

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

  const filteredProducts = products.filter(product =>
    productSearchTerm === '' ||
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.translated_name?.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  if (!isActive) return null;

  return (
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

                    <div className="border rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🇯🇵</span>
                        <span className="font-medium">日本語</span>
                        {product.translations?.find((t: any) => t.language_code === 'ja') ? (
                          <Badge variant="outline" className="text-green-600">번역됨</Badge>
                        ) : (
                          <Badge variant="secondary">번역 없음</Badge>
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
  );
}