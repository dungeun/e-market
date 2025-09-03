'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
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
  Star,
  Heart,
  ShoppingCart,
  X,
  MapPin,
  Calendar,
  Package
} from 'lucide-react'

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
    description: '상태 매우 좋은 아이폰 14 Pro입니다. 케이스 사용으로 스크래치 없음'
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
    description: '미개봉 새제품, 256GB 티타늄 그레이'
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
    description: 'Intel i7, 16GB RAM, 512GB SSD, 상태 매우 양호'
  },
  {
    id: 'prod-4',
    name: '맥북 에어 M2 13인치 (A급)',
    price: 1200000,
    originalPrice: 1590000,
    image: '/api/placeholder/300/300',
    rating: 4.9,
    reviewCount: 31,
    category: '노트북',
    brand: 'Apple',
    condition: 'A',
    isLiked: true,
    location: '서울 마포구',
    createdAt: '2024-01-08',
    description: '8GB RAM, 256GB SSD, 미드나이트 색상'
  },
  {
    id: 'prod-5',
    name: 'Sony WH-1000XM5 무선헤드폰',
    price: 280000,
    originalPrice: 450000,
    image: '/api/placeholder/300/300',
    rating: 4.7,
    reviewCount: 45,
    category: '이어폰/헤드폰',
    brand: 'Sony',
    condition: 'A',
    isLiked: false,
    location: '경기 성남시',
    createdAt: '2024-01-05',
    description: '노이즈캔슬링 기능 완벽, 케이스 포함'
  },
  {
    id: 'prod-6',
    name: 'iPad Pro 11인치 (B급)',
    price: 650000,
    originalPrice: 950000,
    image: '/api/placeholder/300/300',
    rating: 4.4,
    reviewCount: 19,
    category: '태블릿',
    brand: 'Apple',
    condition: 'B',
    isLiked: false,
    location: '부산 해운대구',
    createdAt: '2024-01-03',
    description: '화면에 미세한 스크래치 있으나 사용에 문제없음'
  },
  {
    id: 'prod-7',
    name: '삼성 55인치 QLED TV',
    price: 800000,
    originalPrice: 1200000,
    image: '/api/placeholder/300/300',
    rating: 4.6,
    reviewCount: 8,
    category: 'TV/모니터',
    brand: 'Samsung',
    condition: 'A',
    isLiked: false,
    location: '대구 중구',
    createdAt: '2024-01-02',
    description: '2023년 모델, 벽걸이 브라켓 포함'
  },
  {
    id: 'prod-8',
    name: '다이슨 V15 무선청소기',
    price: 450000,
    originalPrice: 700000,
    image: '/api/placeholder/300/300',
    rating: 4.8,
    reviewCount: 22,
    category: '청소기',
    brand: 'Dyson',
    condition: 'A',
    isLiked: true,
    location: '서울 강서구',
    createdAt: '2024-01-01',
    description: '추가 브러시 5개 포함, 완전무결'
  }
]

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 검색 상태
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('relevance')
  
  // 필터 상태
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 2000000])
  const [showFilters, setShowFilters] = useState(false)
  
  // 검색 결과
  const [isSearching, setIsSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  // 필터 옵션 추출
  const categories = useMemo(() => 
    [...new Set(mockProducts.map(p => p.category))].sort()
  , [])
  
  const brands = useMemo(() => 
    [...new Set(mockProducts.map(p => p.brand))].sort()
  , [])

  const conditions = [
    { value: 'S', label: '새제품', color: 'bg-green-100 text-green-800' },
    { value: 'A', label: 'A급', color: 'bg-blue-100 text-blue-800' },
    { value: 'B', label: 'B급', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'C', label: 'C급', color: 'bg-orange-100 text-orange-800' }
  ]

  // URL에서 검색어 가져오기
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setSearchQuery(q)
      performSearch(q)
    }
  }, [searchParams])

  // 검색 실행
  const performSearch = async (query: string) => {
    setIsSearching(true)
    
    // 검색 히스토리에 추가
    if (query && !searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 4)])
    }

    // 실제 API 호출 대신 로컬 필터링
    await new Promise(resolve => setTimeout(resolve, 500)) // 검색 딜레이 시뮬레이션
    
    let filteredProducts = mockProducts

    // 검색어로 필터링
    if (query) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase())
      )
    }

    // 카테고리 필터
    if (selectedCategories.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        selectedCategories.includes(product.category)
      )
    }

    // 브랜드 필터
    if (selectedBrands.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        selectedBrands.includes(product.brand)
      )
    }

    // 상태 필터
    if (selectedConditions.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        selectedConditions.includes(product.condition)
      )
    }

    // 가격 필터
    filteredProducts = filteredProducts.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )

    // 정렬
    filteredProducts.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'latest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'rating':
          return b.rating - a.rating
        case 'popular':
          return b.reviewCount - a.reviewCount
        default: // relevance
          return 0
      }
    })

    setProducts(filteredProducts)
    setIsSearching(false)
  }

  // 검색어 변경 처리
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (value.trim()) {
      const newUrl = `/search?q=${encodeURIComponent(value.trim())}`
      router.push(newUrl, { scroll: false })
    }
  }

  // 검색 실행
  const handleSearch = () => {
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim())
    }
  }

  // 필터 변경 핸들러들
  const handleCategoryFilter = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, category])
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== category))
    }
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

  // 필터 초기화
  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setSelectedConditions([])
    setPriceRange([0, 2000000])
  }

  // 상품 클릭 처리
  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`)
  }

  // 좋아요 토글
  const toggleLike = (productId: string) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, isLiked: !product.isLiked }
        : product
    ))
  }

  // 필터 적용할 때마다 검색 재실행
  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery)
    }
  }, [selectedCategories, selectedBrands, selectedConditions, priceRange, sortBy])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  const getConditionBadge = (condition: string) => {
    const conditionData = conditions.find(c => c.value === condition) || conditions[1]
    return <Badge className={`text-xs ${conditionData.color}`}>{conditionData.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-[1450px] mx-auto px-4 sm:px-6 py-6">
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="상품명, 브랜드, 카테고리를 검색하세요"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              검색
            </button>
          </form>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              {query && (
                <>
                  <span className="font-medium">"{query}"</span>에 대한 검색 결과 
                </>
              )}
              <span className="font-medium text-blue-600">{filteredProducts.length}개</span>의 상품
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                필터
              </button>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">필터</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">카테고리</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={filters.category === ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="mr-2"
                    />
                    전체
                  </label>
                  {categories.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={filters.category === category}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="mr-2"
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">가격대</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="10000"
                    value={filters.priceRange.max}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      priceRange: { ...prev.priceRange, max: parseInt(e.target.value) }
                    }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>0원</span>
                    <span>{formatPrice(filters.priceRange.max)}원</span>
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">브랜드</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="brand"
                      value=""
                      checked={filters.brand === ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                      className="mr-2"
                    />
                    전체
                  </label>
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="radio"
                        name="brand"
                        value={brand}
                        checked={filters.brand === brand}
                        onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                        className="mr-2"
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">정렬</h4>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as unknown }))}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">관련도순</option>
                  <option value="price_low">낮은 가격순</option>
                  <option value="price_high">높은 가격순</option>
                  <option value="rating">평점순</option>
                  <option value="newest">최신순</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                <p className="text-gray-500">다른 검색어를 시도해보세요.</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {filteredProducts.map(product => (
                  <div key={product.id} className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}>
                    <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        width={300}
                        height={300}
                        className={`object-cover ${
                          viewMode === 'list' ? 'w-full h-48' : 'w-full h-64'
                        }`}
                      />
                    </div>
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-yellow-400 text-sm">
                          {'★'.repeat(Math.floor(product.rating))}
                          {'☆'.repeat(5 - Math.floor(product.rating))}
                        </div>
                        <span className="text-sm text-gray-500">({product.reviewCount})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          {product.discountPrice ? (
                            <>
                              <span className="text-lg font-bold text-blue-600">
                                {formatPrice(product.discountPrice)}원
                              </span>
                              <span className="text-sm text-gray-400 line-through ml-2">
                                {formatPrice(product.price)}원
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(product.price)}원
                            </span>
                          )}
                        </div>
                        <Link
                          href={`/products/${product.id}`}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          상세보기
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}