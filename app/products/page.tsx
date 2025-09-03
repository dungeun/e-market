'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/sections/ProductCard'
import { Slider } from '@/components/ui/slider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compareAt?: number
  images: { url: string; alt?: string }[]
  rating: number
  reviewCount: number
  category?: { id: string; name: string }
}

interface Category {
  id: string
  name: string
  productCount: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, sortBy, sortOrder, page, searchQuery])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sort: sortBy,
        order: sortOrder,
      })

      if (selectedCategory) {
        params.append('category', selectedCategory)
      }

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      
      setProducts(data.products)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  const filteredProducts = products.filter(
    product => product.price >= priceRange[0] && product.price <= priceRange[1]
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">전체 상품</h1>
          <p className="mt-2 text-gray-600">원하시는 상품을 찾아보세요</p>
        </div>

        <div className="flex gap-8">
          {/* 필터 사이드바 */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {/* 검색 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">검색</h3>
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="상품명 검색..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </form>
              </div>

              {/* 카테고리 필터 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">카테고리</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === ''}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value)
                        setPage(1)
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">전체</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={selectedCategory === category.id}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value)
                          setPage(1)
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        {category.name} ({category.productCount})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 가격 필터 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">가격</h3>
                <div className="space-y-4">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000000}
                    step={10000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₩{priceRange[0].toLocaleString()}</span>
                    <span>₩{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 정렬 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">정렬</h3>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-')
                    setSortBy(sort)
                    setSortOrder(order)
                    setPage(1)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="createdAt-desc">최신순</option>
                  <option value="price-asc">가격 낮은순</option>
                  <option value="price-desc">가격 높은순</option>
                  <option value="name-asc">이름순</option>
                </select>
              </div>
            </div>
          </div>

          {/* 상품 그리드 */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">검색 결과가 없습니다.</p>
                  </div>
                )}

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      이전
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`px-4 py-2 border rounded-md ${
                          page === i + 1
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      다음
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}