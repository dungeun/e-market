'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash, 
  Eye,
  Folder,
  FolderOpen,
  ChevronRight,
  Package,
  Tag,
  Shield,
  ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'
import { adminApiCall } from '@/lib/api/client'
import CategoryModal from '@/components/admin/CategoryModal'
import BrandModal from '@/components/admin/BrandModal'

// 상품 상태 등급 데이터
const conditionGrades = [
  { id: 'S', label: '새제품', labelEn: 'Like New', description: '미개봉 또는 거의 사용하지 않음', color: 'bg-green-100 text-green-800' },
  { id: 'A', label: 'A급', labelEn: 'Grade A', description: '사용감 적음, 작동 완벽', color: 'bg-blue-100 text-blue-800' },
  { id: 'B', label: 'B급', labelEn: 'Grade B', description: '사용감 있음, 작동 정상', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'C', label: 'C급', labelEn: 'Grade C', description: '사용감 많음, 작동 가능', color: 'bg-orange-100 text-orange-800' }
]

// Mock 브랜드 데이터
const mockBrands = [
  { id: 'brand-1', name: '삼성', nameEn: 'Samsung', country: '한국', categories: ['TV/모니터', '냉장고', '세탁기', '스마트폰'], productCount: 45 },
  { id: 'brand-2', name: 'LG', nameEn: 'LG', country: '한국', categories: ['TV/모니터', '냉장고', '세탁기', '노트북'], productCount: 38 },
  { id: 'brand-3', name: '애플', nameEn: 'Apple', country: '미국', categories: ['스마트폰', '태블릿', '노트북'], productCount: 22 },
  { id: 'brand-4', name: '샤오미', nameEn: 'Xiaomi', country: '중국', categories: ['스마트폰', 'TV/모니터', '청소기'], productCount: 15 },
  { id: 'brand-5', name: '이케아', nameEn: 'IKEA', country: '스웨덴', categories: ['침대/매트리스', '책상/의자', '옷장/수납장'], productCount: 28 }
]

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState('categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState(mockBrands)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Modal states
  const [categoryModal, setCategoryModal] = useState({ isOpen: false, mode: 'create' as 'create' | 'edit', category: null as any })
  const [brandModal, setBrandModal] = useState({ isOpen: false, mode: 'create' as 'create' | 'edit', brand: null as any })

  // 카테고리 데이터 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        const result = await adminApiCall('/api/admin/categories', {
          method: 'GET'
        })
        
        if (result.success && result.data) {
          setCategories(result.data.categories || [])
          setError('')
        } else {
          throw new Error(result.error || '카테고리 데이터 로드 실패')
        }
      } catch (err) {
        console.error('Failed to load categories:', err)
        setError(err instanceof Error ? err.message : '알 수 없는 오류')
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleCategoryAction = (action: string, category: any) => {
    switch(action) {
      case 'edit':
        setCategoryModal({ isOpen: true, mode: 'edit', category })
        break
      case 'delete':
        if (confirm(`${category.name} 카테고리를 삭제하시겠습니까?`)) {
          setCategories(prev => prev.filter(c => c.id !== category.id))
          toast.success(`${category.name} 카테고리가 삭제되었습니다.`)
        }
        break
      case 'add-sub':
        setCategoryModal({ 
          isOpen: true, 
          mode: 'create', 
          category: { parentId: category.id } 
        })
        break
    }
  }

  const handleBrandAction = (action: string, brand: any) => {
    switch(action) {
      case 'edit':
        setBrandModal({ isOpen: true, mode: 'edit', brand })
        break
      case 'delete':
        if (confirm(`${brand.name} 브랜드를 삭제하시겠습니까?`)) {
          setBrands(prev => prev.filter(b => b.id !== brand.id))
          toast.success(`${brand.name} 브랜드가 삭제되었습니다.`)
        }
        break
    }
  }

  const handleCategorySave = (categoryData: any) => {
    if (categoryModal.mode === 'create') {
      const newCategory = {
        ...categoryData,
        id: `cat-${Date.now()}`,
        productCount: 0,
        status: 'active',
        subcategories: [],
        children: []
      }
      
      if (categoryData.parentId) {
        // 중분류 추가
        setCategories(prev => prev.map(cat => {
          if (cat.id === categoryData.parentId) {
            return {
              ...cat,
              children: [...(cat.children || []), newCategory],
              subcategories: [...(cat.subcategories || []), newCategory]
            }
          }
          return cat
        }))
      } else {
        // 대분류 추가
        setCategories(prev => [...prev, newCategory])
      }
      
      toast.success('카테고리가 추가되었습니다.')
    } else {
      // 수정
      setCategories(prev => prev.map(cat => 
        cat.id === categoryData.id ? { ...cat, ...categoryData } : cat
      ))
      toast.success('카테고리가 수정되었습니다.')
    }
    
    setCategoryModal({ isOpen: false, mode: 'create', category: null })
  }

  const handleBrandSave = (brandData: any) => {
    if (brandModal.mode === 'create') {
      const newBrand = {
        ...brandData,
        id: `brand-${Date.now()}`,
        productCount: 0
      }
      setBrands(prev => [...prev, newBrand])
      toast.success('브랜드가 추가되었습니다.')
    } else {
      setBrands(prev => prev.map(brand => 
        brand.id === brandData.id ? { ...brand, ...brandData } : brand
      ))
      toast.success('브랜드가 수정되었습니다.')
    }
    
    setBrandModal({ isOpen: false, mode: 'create', brand: null })
  }

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">활성</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">비활성</Badge>
    )
  }

  // 로딩 상태
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">카테고리 관리</h2>
            <p className="text-muted-foreground">카테고리, 브랜드, 상품 상태를 관리합니다.</p>
          </div>
        </div>
        
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">카테고리 관리</h2>
          <p className="text-muted-foreground">카테고리, 브랜드, 상품 상태를 관리합니다.</p>
        </div>
      </div>

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="categories">카테고리</TabsTrigger>
          <TabsTrigger value="brands">브랜드</TabsTrigger>
          <TabsTrigger value="conditions">상품상태</TabsTrigger>
        </TabsList>

        {/* 카테고리 탭 */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>카테고리 목록</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="카테고리 검색..."
                      className="pl-8 w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => setCategoryModal({ isOpen: true, mode: 'create', category: null })}>
                    <Plus className="mr-2 h-4 w-4" />
                    카테고리 추가
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="border rounded-lg">
                    {/* 대분류 */}
                    <div className="flex items-center justify-between p-3 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleCategory(category.id)}
                        >
                          <ChevronDown 
                            className={`h-4 w-4 transition-transform ${
                              expandedCategories.includes(category.id) ? '' : '-rotate-90'
                            }`}
                          />
                        </Button>
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <span className="font-medium">{category.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">({category.productCount || 0}개 상품)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(category.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>작업</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleCategoryAction('edit', category)}>
                              <Edit className="mr-2 h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCategoryAction('add-sub', category)}>
                              <Plus className="mr-2 h-4 w-4" />
                              중분류 추가
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleCategoryAction('delete', category)}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* 중분류 */}
                    {expandedCategories.includes(category.id) && category.children?.length > 0 && (
                      <div className="border-t bg-gray-50">
                        {category.children.map((sub: any) => (
                          <div key={sub.id} className="flex items-center justify-between px-12 py-2 hover:bg-gray-100">
                            <div className="flex items-center gap-2">
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{sub.name}</span>
                              <span className="text-xs text-muted-foreground">({sub.productCount || 0}개)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleCategoryAction('edit', sub)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleCategoryAction('delete', sub)}
                              >
                                <Trash className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 브랜드 탭 */}
        <TabsContent value="brands" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>브랜드 목록</CardTitle>
                <Button onClick={() => setBrandModal({ isOpen: true, mode: 'create', brand: null })}>
                  <Plus className="mr-2 h-4 w-4" />
                  브랜드 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>브랜드명</TableHead>
                    <TableHead>영문명</TableHead>
                    <TableHead>국가</TableHead>
                    <TableHead>적용 카테고리</TableHead>
                    <TableHead>상품 수</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell className="text-muted-foreground">{brand.nameEn}</TableCell>
                      <TableCell>{brand.country}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {brand.categories.slice(0, 3).map((cat: string) => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                          {brand.categories.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{brand.categories.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{brand.productCount}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>작업</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBrandAction('edit', brand)}>
                              <Edit className="mr-2 h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleBrandAction('delete', brand)}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 상품상태 탭 */}
        <TabsContent value="conditions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>상품 상태 등급</CardTitle>
              <CardDescription>
                중고 상품의 상태를 구분하는 등급 기준입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conditionGrades.map((grade) => (
                  <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Badge className={`text-lg px-3 py-1 ${grade.color}`}>
                        {grade.label}
                      </Badge>
                      <div>
                        <p className="font-medium">{grade.labelEn}</p>
                        <p className="text-sm text-muted-foreground">{grade.description}</p>
                      </div>
                    </div>
                    <Shield className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CategoryModal
        isOpen={categoryModal.isOpen}
        onClose={() => setCategoryModal({ isOpen: false, mode: 'create', category: null })}
        category={categoryModal.category}
        parentCategories={categories.filter(c => c.level === 1)}
        onSave={handleCategorySave}
        mode={categoryModal.mode}
      />

      <BrandModal
        isOpen={brandModal.isOpen}
        onClose={() => setBrandModal({ isOpen: false, mode: 'create', brand: null })}
        brand={brandModal.brand}
        onSave={handleBrandSave}
        mode={brandModal.mode}
      />
    </div>
  )
}