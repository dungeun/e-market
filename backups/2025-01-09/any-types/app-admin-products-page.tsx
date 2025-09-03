'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Eye,
  Filter,
  Download,
  Upload,
  Copy,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface UploadedImage {
  id: string
  url: string
  fileName: string
  size: number
  webpUrl?: string
  isConverting?: boolean
  error?: string
  type: 'thumbnail' | 'detail'
  order: number
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  images: UploadedImage[] | string[]; // 새로운 형식과 기존 형식 모두 지원
  category: string | null;
  rating: number;
  reviewCount: number;
  stock: number;
  featured: boolean;
  new: boolean;
  status: string;
  condition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  originalPrice?: string | number;
  discountRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 데이터 로드
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      
      if (response.ok) {
        // 상품 데이터를 중고 상품 형태로 변환
        const transformedProducts = data.products.map((product: any) => ({
          ...product,
          status: getProductStatus(product.stock, product.status),
          condition: product.condition || 'GOOD',
          originalPrice: product.originalPrice || (parseFloat(product.price) * 1.2).toString(),
          discountRate: product.discountRate || calculateDiscountRate(product.originalPrice, product.price)
        }));
        
        setProducts(transformedProducts);
        
        // 카테고리 목록 생성
        const uniqueCategories = [...new Set(transformedProducts.map((p: Product) => p.category).filter(Boolean))];
        setCategories(uniqueCategories as string[]);
      }
    } catch (error) {

      toast.error('상품 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getProductStatus = (stock: number, currentStatus?: string) => {
    if (currentStatus && currentStatus !== 'ACTIVE') return '판매중지';
    if (stock === 0) return '품절';
    if (stock < 5) return '재고부족';
    return '판매중';
  };

  const calculateDiscountRate = (originalPrice?: string, currentPrice?: string) => {
    if (!originalPrice || !currentPrice) return 0;
    const original = parseFloat(originalPrice);
    const current = parseFloat(currentPrice);
    return Math.round(((original - current) / original) * 100);
  };

  const formatPrice = (price: string | number) => {
    const priceNum = typeof price === 'string' ? parseInt(price) : price;
    return `₩${priceNum.toLocaleString()}`;
  };

  const getConditionBadge = (condition: string) => {
    const conditionMap = {
      'EXCELLENT': { label: '최상', class: 'bg-green-100 text-green-800' },
      'GOOD': { label: '양호', class: 'bg-blue-100 text-blue-800' },
      'FAIR': { label: '보통', class: 'bg-yellow-100 text-yellow-800' },
      'POOR': { label: '하급', class: 'bg-red-100 text-red-800' }
    };
    const conditionInfo = conditionMap[condition as keyof typeof conditionMap] || conditionMap.GOOD;
    return <Badge className={conditionInfo.class}>{conditionInfo.label}</Badge>;
  };

  const handleViewDetail = (product: Product) => {
    // 새 창으로 상품 페이지 열기
    window.open(`/products/${product.slug}`, '_blank');
  };

  const handleEditProduct = (product: Product) => {
    // 수정 페이지로 이동
    window.location.href = `/admin/products/edit/${product.id}`;
  };

  const handleCopyProduct = async (product: Product) => {
    try {
      const copyData = {
        ...product,
        name: `${product.name} (복사)`,
        id: undefined, // 새로운 ID 생성
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copyData)
      });

      if (response.ok) {
        toast.success(`${product.name} 상품이 복사되었습니다.`);
        loadProducts(); // 목록 새로고침
      } else {
        throw new Error('복사 실패');
      }
    } catch (error) {
      toast.error('상품 복사에 실패했습니다.');
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`"${product.name}" 상품을 임시 삭제하시겠습니까?\n\n휴지통에서 복구할 수 있습니다.`)) return;
    
    try {
      const response = await fetch(`/api/admin/products?id=${product.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success(`${product.name} 상품이 휴지통으로 이동되었습니다.`);
          loadProducts(); // 목록 새로고침
        } else {
          throw new Error(result.error || '삭제 실패');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || '삭제 실패');
      }
    } catch (error) {
      toast.error('상품 삭제에 실패했습니다.');

    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '판매중':
        return <Badge className="bg-green-100 text-green-800">판매중</Badge>
      case '품절':
        return <Badge className="bg-red-100 text-red-800">품절</Badge>
      case '재고부족':
        return <Badge className="bg-yellow-100 text-yellow-800">재고부족</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600'
    if (stock < 20) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">중고 상품 관리</h2>
          <p className="text-muted-foreground">총 {products.length}개의 중고 상품이 등록되어 있습니다.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info('상품 가져오기')}>
            <Upload className="mr-2 h-4 w-4" />
            가져오기
          </Button>
          <Button variant="outline" onClick={() => toast.info('상품 내보내기')}>
            <Download className="mr-2 h-4 w-4" />
            내보내기
          </Button>
          <Button onClick={() => window.location.href = '/admin/products/create'}>
            <Plus className="mr-2 h-4 w-4" />
            중고상품 등록
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">전체 상품</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : products.length}</div>
            <p className="text-xs text-muted-foreground">등록된 중고상품 수</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">판매 중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? '...' : products.filter(p => p.status === '판매중').length}
            </div>
            <p className="text-xs text-muted-foreground">활성 상품</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">재고 부족</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? '...' : products.filter(p => p.status === '재고부족').length}
            </div>
            <p className="text-xs text-muted-foreground">재입고 필요</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">품절</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loading ? '...' : products.filter(p => p.status === '품절').length}
            </div>
            <p className="text-xs text-muted-foreground">재고 없음</p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>상품 목록</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="중고상품 검색..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">이미지</TableHead>
                <TableHead>상품명</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>현재가격</TableHead>
                <TableHead>원가</TableHead>
                <TableHead>할인율</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>컨디션</TableHead>
                <TableHead>재고</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <div className="animate-pulse">상품 목록을 불러오는 중...</div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    등록된 상품이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                products.filter(product => 
                  product.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative h-10 w-10 overflow-hidden rounded bg-gray-100 flex items-center justify-center">
                        {(() => {
                          const getImageSrc = (product: Product) => {
                            if (!product.images || product.images.length === 0) return null;
                            
                            const firstImage = product.images[0];
                            // 새로운 형식 (객체)
                            if (typeof firstImage === 'object' && firstImage.url) {
                              return firstImage.webpUrl || firstImage.url;
                            }
                            // 기존 형식 (문자열)
                            if (typeof firstImage === 'string') {
                              return firstImage;
                            }
                            return null;
                          };
                          
                          const imageSrc = getImageSrc(product);
                          
                          return imageSrc && (imageSrc.startsWith('http') || imageSrc.startsWith('/') || imageSrc.startsWith('data:') || imageSrc.startsWith('blob:')) ? (
                            <Image
                              src={imageSrc}
                              alt={product.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                          ) : (
                            <Image
                              src="/placeholder.svg"
                              alt="상품 이미지 없음"
                              fill
                              className="object-cover"
                            />
                          );
                        })()} 
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {product.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category || '미분류'}</TableCell>
                    <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.originalPrice ? formatPrice(product.originalPrice) : '-'}
                    </TableCell>
                    <TableCell>
                      {product.discountRate && product.discountRate > 0 ? (
                        <Badge variant="destructive">{product.discountRate}% 할인</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell>{getConditionBadge(product.condition || 'GOOD')}</TableCell>
                    <TableCell className={getStockColor(product.stock)}>
                      {product.stock}개
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewDetail(product)}
                          className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          title="미리보기 (새 창)"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditProduct(product)}
                          className="h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-50"
                          title="수정"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleCopyProduct(product)}
                          className="h-8 w-8 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                          title="복제"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteProduct(product)}
                          className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                          title="임시 삭제"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 상품 상세보기 모달 */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              상품 상세 정보
            </DialogTitle>
            <DialogDescription>
              등록된 상품의 상세 정보를 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 이미지 섹션 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">상품 이미지</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      selectedProduct.images.slice(0, 4).map((image, index) => {
                        const getImageSrc = (img: any) => {
                          if (typeof img === 'object' && img.url) {
                            return img.webpUrl || img.url;
                          }
                          if (typeof img === 'string') {
                            return img;
                          }
                          return null;
                        };
                        
                        const imageSrc = getImageSrc(image);
                        
                        return (
                          <div key={index} className="relative aspect-square rounded-lg border overflow-hidden bg-gray-100">
                            {imageSrc && (imageSrc.startsWith('http') || imageSrc.startsWith('/') || imageSrc.startsWith('data:') || imageSrc.startsWith('blob:')) ? (
                              <Image
                                src={imageSrc}
                                alt={`${selectedProduct.name} 이미지 ${index + 1}`}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder.svg';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-gray-400 text-sm">이미지 없음</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-2 aspect-square rounded-lg border bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">등록된 이미지가 없습니다</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 상품 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">기본 정보</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">상품명</label>
                      <p className="text-lg font-semibold">{selectedProduct.name}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">설명</label>
                      <p className="text-sm text-gray-700">{selectedProduct.description || '설명이 없습니다'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">현재 가격</label>
                        <p className="text-xl font-bold text-blue-600">{formatPrice(selectedProduct.price)}</p>
                      </div>
                      
                      {selectedProduct.originalPrice && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">원가</label>
                          <p className="text-lg text-gray-500 line-through">{formatPrice(selectedProduct.originalPrice)}</p>
                        </div>
                      )}
                    </div>

                    {selectedProduct.discountRate && selectedProduct.discountRate > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">할인율</label>
                        <div className="mt-1">
                          <Badge variant="destructive">{selectedProduct.discountRate}% 할인</Badge>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">카테고리</label>
                        <p className="text-sm">{selectedProduct.category || '미분류'}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600">상품 상태</label>
                        <div className="mt-1">
                          {getConditionBadge(selectedProduct.condition || 'GOOD')}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">재고</label>
                        <p className={`text-sm font-medium ${getStockColor(selectedProduct.stock)}`}>
                          {selectedProduct.stock}개
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600">판매 상태</label>
                        <div className="mt-1">
                          {getStatusBadge(selectedProduct.status)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">추천 상품</label>
                        <p className="text-sm">{selectedProduct.featured ? '예' : '아니요'}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600">신상품</label>
                        <p className="text-sm">{selectedProduct.new ? '예' : '아니요'}</p>
                      </div>
                    </div>

                    {selectedProduct.createdAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">등록일</label>
                        <p className="text-sm">{new Date(selectedProduct.createdAt).toLocaleDateString('ko-KR')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                >
                  닫기
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEditProduct(selectedProduct);
                  }}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  수정하기
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleCopyProduct(selectedProduct);
                  }}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  복제하기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}