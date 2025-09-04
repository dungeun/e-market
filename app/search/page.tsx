'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
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
import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
    image: '/placeholder.svg',
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
    image: '/placeholder.svg',
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
    image: '/placeholder.svg',
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
    image: '/placeholder.svg',
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
    image: '/placeholder.svg',
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
    image: '/placeholder.svg',
    rating: 4.4,
    reviewCount: 19,
    category: '태블릿',
    brand: 'Apple',
    condition: 'B',
    isLiked: false,
    location: '부산 해운대구',
    createdAt: '2024-01-03',
    description: '화면에 미세한 스크래치 있으나 사용에 문제없음'
  }
]

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 검색 상태
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts)
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

  // 상품 필터링
  const filterProducts = useMemo(() => {
    let filtered = mockProducts

    // 검색어로 필터링
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 카테고리 필터
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.category)
      )
    }

    // 브랜드 필터
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        selectedBrands.includes(product.brand)
      )
    }

    // 상태 필터
    if (selectedConditions.length > 0) {
      filtered = filtered.filter(product =>
        selectedConditions.includes(product.condition)
      )
    }

    // 가격 필터
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )

    // 정렬
    filtered.sort((a, b) => {
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

    return filtered
  }, [searchQuery, selectedCategories, selectedBrands, selectedConditions, priceRange, sortBy])

  // URL에서 검색어 가져오기
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setSearchQuery(decodeURIComponent(q))
    }
  }, [searchParams])

  // 검색어 변경 처리
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  // 검색 실행
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const newUrl = `/search?q=${encodeURIComponent(searchQuery.trim())}`
      router.push(newUrl)
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

  // 좋아요 토글
  const toggleLike = (productId: string) => {
    // TODO: 실제 API 호출
    console.log('Toggle like for product:', productId)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원'
  }

  const getConditionBadge = (condition: string) => {
    const conditionData = conditions.find(c => c.value === condition) || conditions[1]
    return (
      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${conditionData.color}`}>
        {conditionData.label}
      </span>
    )
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
                onChange={(e) => handleSearchChange(e.target.value)}
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
              {searchQuery && (
                <>
                  <span className="font-medium">"{searchQuery}"</span>에 대한 검색 결과 
                </>
              )}
              <span className="font-medium text-blue-600">{filterProducts.length}개</span>의 상품
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
                  <Grid3X3 className="w-4 h-4" />
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">필터</h3>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  초기화
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">카테고리</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={(e) => handleCategoryFilter(category, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 mr-2"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">브랜드</h4>
                <div className="space-y-2">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={(e) => handleBrandFilter(brand, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 mr-2"
                      />
                      <span className="text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Condition Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">상품 상태</h4>
                <div className="space-y-2">
                  {conditions.map(condition => (
                    <label key={condition.value} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedConditions.includes(condition.value)}
                        onChange={(e) => handleConditionFilter(condition.value, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 mr-2"
                      />
                      <span className="text-sm text-gray-700">{condition.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">정렬</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="relevance">관련도순</option>
                  <option value="price-low">낮은 가격순</option>
                  <option value="price-high">높은 가격순</option>
                  <option value="rating">평점순</option>
                  <option value="popular">인기순</option>
                  <option value="latest">최신순</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {filterProducts.length === 0 ? (
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
                {filterProducts.map(product => (
                  <div key={product.id} className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}>
                    <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={300}
                        height={300}
                        className={`object-cover ${
                          viewMode === 'list' ? 'w-full h-48' : 'w-full h-64'
                        }`}
                      />
                    </div>
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2 flex-1">
                          {product.name}
                        </h3>
                        <button 
                          onClick={() => toggleLike(product.id)}
                          className="ml-2 p-1"
                        >
                          <Heart className={`w-5 h-5 ${product.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-yellow-400 text-sm">
                          {Array.from({length: 5}, (_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">({product.reviewCount})</span>
                        {getConditionBadge(product.condition)}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        {product.location}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          {product.originalPrice && product.originalPrice > product.price ? (
                            <>
                              <span className="text-lg font-bold text-blue-600">
                                {formatPrice(product.price)}
                              </span>
                              <span className="text-sm text-gray-400 line-through ml-2">
                                {formatPrice(product.originalPrice)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(product.price)}
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
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}