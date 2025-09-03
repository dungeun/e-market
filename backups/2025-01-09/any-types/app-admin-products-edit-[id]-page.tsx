'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
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

interface Category {
  id: string
  name: string
  slug: string
  children: Array<{ id: string; name: string }>
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: string
  originalPrice?: number
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
  category: string
  stock: number
  images: UploadedImage[]
  rating?: number
  reviewCount?: number
  featured: boolean
  new: boolean
  status?: string
  discountRate?: number
  createdAt: string
  updatedAt: string
}

const conditions = [
  { value: 'EXCELLENT', label: '최상급 (새제품 수준)' },
  { value: 'GOOD', label: '양호 (사용감 약간)' },
  { value: 'FAIR', label: '보통 (사용감 있음)' },
  { value: 'POOR', label: '하급 (수리 필요)' }
]

export default function ProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  
  // 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    condition: 'GOOD' as 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR',
    category: '',
    stock: 1,
    featured: false,
    new: true
  })

  const [images, setImages] = useState<UploadedImage[]>([])

  // 카테고리 로드
  useEffect(() => {
    loadCategories()
  }, [])

  // 상품 데이터 로드
  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.categories)
      } else {
        // 기본 카테고리 사용
        setCategories([
          { id: 'CAT-001', name: '중고 가전제품', slug: 'used-appliances', children: [] },
          { id: 'CAT-002', name: '중고 가구', slug: 'used-furniture', children: [] },
          { id: 'CAT-003', name: '주방용품', slug: 'kitchen-items', children: [] },
          { id: 'CAT-004', name: '생활용품', slug: 'household-items', children: [] },
          { id: 'CAT-005', name: '기타', slug: 'others', children: [] },
          { id: 'CAT-006', name: '전자기기', slug: 'electronics', children: [] }
        ])
      }
    } catch (error) {

    }
  }

  const loadProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/products')
      const data = await response.json()
      
      if (data.success && data.products) {
        const foundProduct = data.products.find((p: Product) => p.id === productId)
        
        if (foundProduct) {
          setProduct(foundProduct)
          setFormData({
            name: foundProduct.name,
            description: foundProduct.description,
            price: foundProduct.price?.toString() || '',
            originalPrice: foundProduct.originalPrice?.toString() || '',
            condition: foundProduct.condition,
            category: foundProduct.category,
            stock: foundProduct.stock,
            featured: foundProduct.featured,
            new: foundProduct.new
          })
          setImages(foundProduct.images || [])
        } else {
          toast.error('상품을 찾을 수 없습니다.')
          router.push('/admin/products')
        }
      }
    } catch (error) {

      toast.error('상품 로드에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTemplateLoad = (template: ProductTemplate) => {
    setFormData(prev => ({
      ...prev,
      category: template.category,
      condition: template.condition,
      description: template.description,
      featured: template.featured
    }))
    
    if (template.priceRange.min > 0) {
      setFormData(prev => ({
        ...prev,
        price: template.priceRange.min.toString()
      }))
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('상품명을 입력해주세요.')
      return false
    }
    if (!formData.description.trim()) {
      toast.error('상품 설명을 입력해주세요.')
      return false
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('올바른 가격을 입력해주세요.')
      return false
    }
    if (!formData.category) {
      toast.error('카테고리를 선택해주세요.')
      return false
    }
    if (formData.stock < 0) {
      toast.error('재고는 0개 이상이어야 합니다.')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return
    if (!product) return

    try {
      setSaving(true)

      const originalPrice = formData.originalPrice ? parseFloat(formData.originalPrice) : undefined
      const currentPrice = parseFloat(formData.price)
      const discountRate = originalPrice && originalPrice > currentPrice 
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
        : 0

      const updatedProduct = {
        ...product,
        name: formData.name.trim(),
        slug: formData.name.trim().toLowerCase().replace(/[^a-zA-Z0-9가-힣\s]/g, '').replace(/\s+/g, '-'),
        description: formData.description.trim(),
        price: formData.price,
        originalPrice: originalPrice,
        condition: formData.condition,
        category: formData.category,
        stock: formData.stock,
        images: images,
        featured: formData.featured,
        new: formData.new,
        discountRate: discountRate,
        updatedAt: new Date().toISOString()
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProduct)
      })

      if (response.ok) {
        toast.success('상품이 성공적으로 수정되었습니다!')
        router.push('/admin/products')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || '상품 수정에 실패했습니다.')
      }
    } catch (error) {

      toast.error('상품 수정 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">상품 정보를 불러오는 중...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">상품을 찾을 수 없습니다</h1>
          <Button onClick={() => router.push('/admin/products')}>
            상품 목록으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/admin/products')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Button>
        <div>
          <h1 className="text-2xl font-bold">상품 수정</h1>
          <p className="text-muted-foreground">{product.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 폼 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">상품명 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="상품명을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">상품 설명 *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="상품에 대한 자세한 설명을 입력하세요"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리 *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">상품 상태 *</Label>
                  <Select value={formData.condition} onValueChange={(value: any) => handleInputChange('condition', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="상품 상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 가격 및 재고 */}
          <Card>
            <CardHeader>
              <CardTitle>가격 및 재고</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">판매가격 *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalPrice">원래가격</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">재고수량</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    placeholder="1"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
                <Label htmlFor="new">신상품</Label>
                <Switch
                  id="new"
                  checked={formData.new}
                  onCheckedChange={(checked) => handleInputChange('new', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 상품 이미지 */}
          <Card>
            <CardHeader>
              <CardTitle>상품 이미지</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploadWebp 
                images={images}
                onImagesChange={setImages}
              />
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 템플릿 관리자 */}
          <ProductTemplateManager
            onTemplateLoad={handleTemplateLoad}
            currentFormData={formData}
          />

          {/* 저장 버튼 */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="w-full"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      수정 완료
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/admin/products')}
                  className="w-full"
                >
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}