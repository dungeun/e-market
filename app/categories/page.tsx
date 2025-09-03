'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronRight,
  Star,
  Heart,
  ShoppingCart
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  productCount: number
  children?: Category[]
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
    createdAt: '2024-01-15'
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
    createdAt: '2024-01-12'
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
    createdAt: '2024-01-10'
  }
]

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // 카테고리 데이터 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (err) {
        console.error('Failed to load categories:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  const handleCategoryClick = (categoryId: string, categorySlug: string) => {
    router.push(`/categories/${categorySlug}`)
  }

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

  const ProductCard = ({ product }: { product: Product }) => {
    if (viewMode === 'list') {
      return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleProductClick(product.id)}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg line-clamp-1">{product.name}</h3>
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
                
                <div className="flex items-center gap-2 mb-2">
                  {getConditionBadge(product.condition)}
                  <Badge variant="outline" className="text-xs">{product.brand}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">{product.rating} ({product.reviewCount})</span>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{product.location}</p>
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
              <p className="text-xs text-gray-500">{product.location}</p>
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
            <p className="mt-4 text-muted-foreground">카테고리를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">전체 카테고리</h1>
        <p className="text-muted-foreground">원하는 카테고리를 선택하여 상품을 둘러보세요</p>
      </div>

      {/* 카테고리 그리드 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">카테고리 목록</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card 
              key={category.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCategoryClick(category.id, category.slug)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">{category.icon || '📦'}</div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category.productCount}개 상품</span>
                  {category.children && category.children.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {category.children.length}개 하위
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator className="my-8" />

      {/* 최신 상품 */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">최신 등록 상품</h2>
          
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
          ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
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
  )
}