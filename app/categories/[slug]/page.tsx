'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronDown,
  Star,
  Heart,
  ShoppingCart,
  MapPin,
  Calendar,
  ArrowLeft,
  SlidersHorizontal
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  productCount: number
  children?: Category[]
  parent?: Category
}

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviewCount: number
  category: string
  brand: string
  condition: string
  isLiked: boolean
  location: string
  createdAt: string
  description?: string
}

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'iPhone 14 Pro 128GB (A급)',
    price: 950000,
    originalPrice: 1200000,
    image: '/api/placeholder/300/300',
    rating: 4.8,
    reviewCount: 24,
    category: '스마트폰',
    brand: 'Apple',
    condition: 'A',
    isLiked: false,
    location: '서울 강남구',
    createdAt: '2024-01-15',
    description: '사용감이 거의 없는 아이폰 14 프로입니다. 배터리 효율 95% 이상'
  },
  {
    id: 'prod-2',
    name: '삼성 갤럭시 S24 Ultra (새제품)',
    price: 1100000,
    originalPrice: 1400000,
    image: '/api/placeholder/300/300',
    rating: 4.9,
    reviewCount: 18,
    category: '스마트폰',
    brand: 'Samsung',
    condition: 'S',
    isLiked: true,
    location: '서울 송파구',
    createdAt: '2024-01-12',
    description: '미개봉 새제품입니다. 1년 무료 A/S 가능'
  },
  {
    id: 'prod-3',
    name: 'LG 그램 17인치 노트북 (A급)',
    price: 800000,
    originalPrice: 1200000,
    image: '/api/placeholder/300/300',
    rating: 4.6,
    reviewCount: 12,
    category: '노트북',
    brand: 'LG',
    condition: 'A',
    isLiked: false,
    location: '인천 남동구',
    createdAt: '2024-01-10',
    description: '가벼운 17인치 노트북. 사무작업용으로 최적'
  }
]

const brands = ['Apple', 'Samsung', 'LG', 'Xiaomi', '소니', 'HP', 'Dell']
const conditions = [
  { id: 'S', label: '새제품' },
  { id: 'A', label: 'A급' },
  { id: 'B', label: 'B급' },
  { id: 'C', label: 'C급' }
]

const priceRanges = [
  { id: 'under-100k', label: '10만원 이하', min: 0, max: 100000 },
  { id: '100k-300k', label: '10만원 - 30만원', min: 100000, max: 300000 },
  { id: '300k-500k', label: '30만원 - 50만원', min: 300000, max: 500000 },
  { id: '500k-1m', label: '50만원 - 100만원', min: 500000, max: 1000000 },
  { id: 'over-1m', label: '100만원 이상', min: 1000000, max: Infinity }
]

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [showFilters, setShowFilters] = useState(false)
  
  // 필터 상태
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('')

  // 카테고리 데이터 로드
  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          const categories = data.categories || []
          
          // 슬러그에 해당하는 카테고리 찾기
          const foundCategory = categories.find((cat: Category) => cat.slug === slug) ||
            categories.find((cat: Category) => 
              cat.children?.some(child => child.slug === slug)
            )?.children?.find((child: Category) => child.slug === slug)
          
          setCategory(foundCategory || null)
        }
      } catch (err) {
        console.error('Failed to load category:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCategory()
  }, [slug])

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  const toggleLike = (productId: string) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, isLiked: !product.isLiked }
        : product
    ))
  }

  const handleBrandFilter = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands(prev => [...prev, brand])
    } else {
      setSelectedBrands(prev => prev.filter(b => b !== brand))
    }
  }

  const handleConditionFilter = (condition: string, checked: boolean) => {
    if (checked) {
      setSelectedConditions(prev => [...prev, condition])
    } else {
      setSelectedConditions(prev => prev.filter(c => c !== condition))
    }
  }

  const clearFilters = () => {
    setSelectedBrands([])
    setSelectedConditions([])
    setSelectedPriceRange('')
    setSearchQuery('')
  }

  const getConditionBadge = (condition: string) => {
    const badges = {
      'S': { label: '새제품', className: 'bg-green-100 text-green-800' },
      'A': { label: 'A급', className: 'bg-blue-100 text-blue-800' },
      'B': { label: 'B급', className: 'bg-yellow-100 text-yellow-800' },
      'C': { label: 'C급', className: 'bg-orange-100 text-orange-800' }
    }
    const badge = badges[condition as keyof typeof badges] || badges['A']
    return <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const ProductCard = ({ product }: { product: Product }) => {
    if (viewMode === 'list') {
      return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleProductClick(product.id)}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg line-clamp-2">{product.name}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLike(product.id)
                    }}
                    className="p-1"
                  >
                    <Heart className={`w-4 h-4 ${product.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  {getConditionBadge(product.condition)}
                  <Badge variant="outline" className="text-xs">{product.brand}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">{product.rating} ({product.reviewCount})</span>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {product.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(product.createdAt)}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="px-3">
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    장바구니
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleProductClick(product.id)}>
        <CardContent className="p-0">
          <div className="relative">
            <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                toggleLike(product.id)
              }}
              className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white"
            >
              <Heart className={`w-4 h-4 ${product.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </Button>
          </div>
          
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {getConditionBadge(product.condition)}
              <Badge variant="outline" className="text-xs">{product.brand}</Badge>
            </div>
            
            <h3 className="font-medium mb-2 line-clamp-2 h-10">{product.name}</h3>
            
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">{product.rating} ({product.reviewCount})</span>
            </div>
            
            <div className="flex flex-col gap-1 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{product.location}</span>
                <span>{formatDate(product.createdAt)}</span>
              </div>
            </div>
            
            <Button size="sm" className="w-full">
              <ShoppingCart className="w-3 h-3 mr-1" />
              장바구니 담기
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">상품을 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">카테고리를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-6">요청하신 카테고리가 존재하지 않습니다.</p>
          <Button onClick={() => router.push('/categories')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            카테고리 목록으로
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 브레드크럼 */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">홈</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/categories">카테고리</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{category.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 카테고리 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">{category.icon || '📦'}</div>
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline">{category.productCount}개 상품</Badge>
          {category.children && category.children.length > 0 && (
            <Badge variant="outline">{category.children.length}개 하위 카테고리</Badge>
          )}
        </div>
      </div>

      {/* 하위 카테고리 */}
      {category.children && category.children.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">하위 카테고리</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {category.children.map((subCategory) => (
              <Button
                key={subCategory.id}
                variant="outline"
                className="h-auto p-3 flex flex-col items-center"
                onClick={() => router.push(`/categories/${subCategory.slug}`)}
              >
                <span className="text-lg mb-1">{subCategory.icon || '📦'}</span>
                <span className="text-xs text-center">{subCategory.name}</span>
                <span className="text-xs text-muted-foreground">({subCategory.productCount})</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      <Separator className="my-8" />

      {/* 상품 목록 헤더 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 필터 사이드바 */}
        <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">필터</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  초기화
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 브랜드 필터 */}
              <div>
                <h3 className="font-medium mb-3">브랜드</h3>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={(checked) => handleBrandFilter(brand, !!checked)}
                      />
                      <label
                        htmlFor={`brand-${brand}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 상품 상태 필터 */}
              <div>
                <h3 className="font-medium mb-3">상품 상태</h3>
                <div className="space-y-2">
                  {conditions.map((condition) => (
                    <div key={condition.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`condition-${condition.id}`}
                        checked={selectedConditions.includes(condition.id)}
                        onCheckedChange={(checked) => handleConditionFilter(condition.id, !!checked)}
                      />
                      <label
                        htmlFor={`condition-${condition.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {condition.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 가격 범위 필터 */}
              <div>
                <h3 className="font-medium mb-3">가격 범위</h3>
                <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="가격대 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.id} value={range.id}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 메인 상품 영역 */}
        <div className="flex-1">
          {/* 상품 목록 컨트롤 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                필터
              </Button>
              <span className="text-sm text-muted-foreground">
                총 {products.length}개 상품
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* 검색 */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="상품 검색..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* 정렬 */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="price-low">낮은가격순</SelectItem>
                  <SelectItem value="price-high">높은가격순</SelectItem>
                  <SelectItem value="popular">인기순</SelectItem>
                </SelectContent>
              </Select>

              {/* 보기 모드 */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 상품 목록 */}
          <div className={`gap-6 ${viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : 'flex flex-col space-y-4'
          }`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">등록된 상품이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}