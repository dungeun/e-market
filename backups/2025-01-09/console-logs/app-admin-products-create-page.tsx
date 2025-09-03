'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  ArrowRight,
  Check, 
  Save, 
  Eye,
  FileText,
  Image as ImageIcon,
  Package,
  Settings,
  Upload,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import ImageUploadWebp from '@/components/admin/ImageUploadWebp'
import ProductTemplateManager, { ProductTemplate } from '@/components/admin/ProductTemplateManager'

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

interface ProductForm {
  name: string
  description: string
  price: string
  originalPrice: string
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
  category: string
  stock: string
  images: UploadedImage[]
  featured: boolean
  isNew: boolean
  autoTranslate: boolean
}

const STEPS = [
  { id: 1, name: '템플릿', icon: FileText, description: '템플릿 선택' },
  { id: 2, name: '기본정보', icon: Package, description: '상품 기본 정보' },
  { id: 3, name: '이미지', icon: ImageIcon, description: '상품 이미지' },
  { id: 4, name: '설정', icon: Settings, description: '추가 설정' }
]

export default function CreateProductPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    condition: 'GOOD',
    category: '',
    stock: '1',
    images: [],
    featured: false,
    isNew: true,
    autoTranslate: true
  })

  const conditions = [
    { value: 'EXCELLENT', label: '최상', color: 'bg-green-100 text-green-800' },
    { value: 'GOOD', label: '양호', color: 'bg-blue-100 text-blue-800' },
    { value: 'FAIR', label: '보통', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'POOR', label: '하급', color: 'bg-red-100 text-red-800' }
  ]

  // 카테고리 데이터 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await fetch('/api/admin/categories')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // 중분류 포함한 카테고리 리스트 생성
            const allCategories: any[] = []
            data.categories.forEach((category: any) => {
              // 대분류 추가
              allCategories.push({
                id: category.id,
                name: category.name,
                slug: category.slug,
                level: 1,
                icon: category.icon
              })
              // 중분류 추가
              if (category.children && category.children.length > 0) {
                category.children.forEach((child: any) => {
                  allCategories.push({
                    id: child.id,
                    name: `${category.name} > ${child.name}`,
                    slug: `${category.slug}/${child.name.toLowerCase()}`,
                    level: 2,
                    parentName: category.name
                  })
                })
              }
            })
            setCategories(allCategories)
          }
        }
      } catch (error) {
        console.error('카테고리 로드 실패:', error)
        // 기본 카테고리 설정
        setCategories([
          { id: 'default-1', name: '전자제품', slug: 'electronics', level: 1 },
          { id: 'default-2', name: '가구', slug: 'furniture', level: 1 },
          { id: 'default-3', name: '주방용품', slug: 'kitchen', level: 1 },
          { id: 'default-4', name: '생활용품', slug: 'household', level: 1 },
          { id: 'default-5', name: '기타', slug: 'others', level: 1 }
        ])
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // 할인율 계산
  const calculateDiscountRate = () => {
    if (!formData.originalPrice || !formData.price) return 0
    const original = parseFloat(formData.originalPrice)
    const current = parseFloat(formData.price)
    if (original <= 0 || current <= 0) return 0
    return Math.round(((original - current) / original) * 100)
  }

  // 폼 입력 핸들러
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 이미지 변경 핸들러
  const handleImagesChange = (images: UploadedImage[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }))
  }

  // 템플릿 로드 핸들러
  const handleTemplateLoad = (template: ProductTemplate) => {
    setFormData(prev => ({
      ...prev,
      name: template.name || prev.name,
      description: template.description || prev.description,
      category: template.category || prev.category,
      condition: template.condition || prev.condition,
      price: template.priceRange ? Math.floor((template.priceRange.min + template.priceRange.max) / 2).toString() : prev.price,
      originalPrice: template.priceRange ? template.priceRange.max.toString() : prev.originalPrice,
      featured: template.featured,
      autoTranslate: template.autoTranslate
    }))
  }

  // 미리보기
  const handlePreview = () => {
    if (!formData.name || !formData.price) {
      toast.error('상품명과 가격은 필수입니다.')
      return
    }
    
    const previewData = {
      ...formData,
      discountRate: calculateDiscountRate(),
      status: parseInt(formData.stock) === 0 ? '품절' : 
               parseInt(formData.stock) < 5 ? '재고부족' : '판매중'
    }
    
    console.log('상품 미리보기:', previewData)
    toast.success('브라우저 콘솔에서 미리보기를 확인하세요.')
  }

  // 상품 등록
  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.stock) {
      toast.error('상품명, 가격, 재고는 필수입니다.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          stock: parseInt(formData.stock)
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message || '중고 상품이 성공적으로 등록되었습니다.')
        
        // 캐시 무효화를 위해 timestamp 쿼리 파라미터 추가
        const timestamp = new Date().getTime()
        
        // 1초 후 리다이렉트 (토스트 메시지를 보여주기 위함)
        setTimeout(() => {
          router.push(`/admin/products?refresh=${timestamp}`)
          // 추가적으로 브라우저 새로고침 강제
          window.location.href = `/admin/products?refresh=${timestamp}`
        }, 1000)
      } else {
        toast.error(result.error || '상품 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to create product:', error)
      toast.error('상품 등록 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const discountRate = calculateDiscountRate()

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">중고 상품 등록</h2>
          <p className="text-muted-foreground">새로운 중고 상품을 등록합니다.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 메인 폼 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 템플릿 관리 */}
          <ProductTemplateManager 
            onTemplateLoad={handleTemplateLoad}
            currentFormData={formData}
          />
          
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>상품의 기본 정보를 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">상품명 *</Label>
                <Input
                  id="name"
                  placeholder="중고 상품명을 입력하세요"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">상품 설명</Label>
                <Textarea
                  id="description"
                  placeholder="상품에 대한 자세한 설명을 입력하세요"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                  disabled={loadingCategories}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCategories ? "카테고리 로딩 중..." : "카테고리를 선택하세요"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        <div className="flex items-center gap-2">
                          {category.icon && <span>{category.icon}</span>}
                          <span className={category.level === 2 ? 'text-sm text-muted-foreground' : ''}>
                            {category.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 가격 및 상태 */}
          <Card>
            <CardHeader>
              <CardTitle>가격 및 상태</CardTitle>
              <CardDescription>중고 상품의 가격과 상태 정보를 입력하세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">현재 가격 * (원)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice">원가 (원)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    placeholder="0"
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                  />
                  {discountRate > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {discountRate}% 할인
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>상품 컨디션 *</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value: any) => handleInputChange('condition', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          <Badge className={condition.color}>
                            {condition.label}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">재고 수량 *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 이미지 */}
          <Card>
            <CardHeader>
              <CardTitle>상품 이미지</CardTitle>
              <CardDescription>썸네일 이미지 3장, 상세페이지 이미지 3장을 업로드할 수 있습니다. WebP 형식으로 자동 변환됩니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploadWebp
                images={formData.images}
                onImagesChange={handleImagesChange}
                thumbnailLimit={3}
                detailLimit={3}
                mode="both"
                maxSize={5}
              />
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 상품 옵션 */}
          <Card>
            <CardHeader>
              <CardTitle>상품 옵션</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">추천 상품</Label>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="new">신상품 표시</Label>
                <Switch
                  id="new"
                  checked={formData.isNew}
                  onCheckedChange={(checked) => handleInputChange('isNew', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoTranslate">자동 번역</Label>
                <Switch
                  id="autoTranslate"
                  checked={formData.autoTranslate}
                  onCheckedChange={(checked) => handleInputChange('autoTranslate', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 미리보기 */}
          <Card>
            <CardHeader>
              <CardTitle>미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">상품명:</span> {formData.name || '미입력'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">가격:</span> ₩{formData.price ? parseInt(formData.price).toLocaleString() : '0'}
                </div>
                {formData.originalPrice && (
                  <div className="text-sm">
                    <span className="font-medium">원가:</span> ₩{parseInt(formData.originalPrice).toLocaleString()}
                  </div>
                )}
                <div className="text-sm">
                  <span className="font-medium">컨디션:</span> 
                  <Badge className={`ml-2 ${conditions.find(c => c.value === formData.condition)?.color || ''}`}>
                    {conditions.find(c => c.value === formData.condition)?.label}
                  </Badge>
                </div>
                <div className="text-sm">
                  <span className="font-medium">재고:</span> {formData.stock}개
                </div>
                {discountRate > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">할인율:</span>
                    <Badge variant="destructive" className="ml-2">
                      {discountRate}% 할인
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className="space-y-3">
            <Button
              onClick={handlePreview}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              <Eye className="mr-2 h-4 w-4" />
              미리보기
            </Button>
            
            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={loading}
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? '등록 중...' : '상품 등록'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}