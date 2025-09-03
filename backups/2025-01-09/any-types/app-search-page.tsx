'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, Grid, List } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/hooks/useLanguage';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl: string;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
}

interface SearchFilters {
  category: string;
  priceRange: { min: number; max: number };
  brand: string;
  rating: number;
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest';
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { t } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(query);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    priceRange: { min: 0, max: 100000 },
    brand: '',
    rating: 0,
    sortBy: 'relevance'
  });

  // Mock data - in real app this would come from API
  const mockProducts: Product[] = [
    {
      id: '1',
      title: '프리미엄 무선 이어폰',
      description: '고음질 음악 감상을 위한 무선 이어폰',
      price: 89000,
      discountPrice: 69000,
      imageUrl: '/api/placeholder/300/300',
      category: '전자제품',
      brand: '사운드테크',
      rating: 4.5,
      reviewCount: 128
    },
    {
      id: '2',
      title: '스마트워치 프로',
      description: '건강 관리와 피트니스 추적이 가능한 스마트워치',
      price: 149000,
      imageUrl: '/api/placeholder/300/300',
      category: '전자제품',
      brand: '스마트기어',
      rating: 4.3,
      reviewCount: 89
    },
    {
      id: '3',
      title: '휴대용 블루투스 스피커',
      description: '어디서나 즐기는 고품질 사운드',
      price: 45000,
      discountPrice: 35000,
      imageUrl: '/api/placeholder/300/300',
      category: '전자제품',
      brand: '오디오플러스',
      rating: 4.7,
      reviewCount: 203
    }
  ];

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    // Apply filters and search
    let filtered = products;

    // Search by query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    if (filters.brand) {
      filtered = filtered.filter(product => product.brand === filters.brand);
    }

    if (filters.rating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.rating);
    }

    filtered = filtered.filter(product => {
      const price = product.discountPrice || product.price;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Sort results
    switch (filters.sortBy) {
      case 'price_low':
        filtered = filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price_high':
        filtered = filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'rating':
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // For demo, just reverse order
        filtered = [...filtered].reverse();
        break;
      default:
        // relevance - no specific sorting for demo
        break;
    }

    setFilteredProducts(filtered);
  }, [searchQuery, products, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with new search query
    const url = new URL(window.location.href);
    url.searchParams.set('q', searchQuery);
    window.history.pushState(null, '', url.toString());
  };

  const categories = Array.from(new Set(products.map(p => p.category)));
  const brands = Array.from(new Set(products.map(p => p.brand)));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">검색 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
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
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
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