'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { SectionImageUpload } from '@/components/admin/ui-config/SectionImageUpload';
import Image from 'next/image';

export default function EditSectionPage() {
  const router = useRouter();
  const params = useParams();
  const sectionId = params.id as string;
  
  const [sectionImages, setSectionImages] = useState<{ [key: string]: string }>({});
  const [supportedLanguages, setSupportedLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    type: 'best-sellers',
    title: '',
    subtitle: '',
    content: '',
    buttonText: '더보기',
    buttonLink: '/products',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    layout: 'grid',
    visible: true,
    productCount: 8,
    showPrice: true,
    showRating: true,
    showBadge: true,
    autoSlide: false,
    slideDuration: 3000,
    categoryFilter: '',
    sortBy: 'popularity',
    // 베스트 상품 선택 조건
    selectionMode: 'auto', // 'auto' or 'manual'
    minSales: 10,
    minRating: 4.0,
    dateRange: 30, // days
    manualProducts: [] as string[]
  });

  const sectionTypes = [
    { value: 'best-sellers', label: '베스트셀러', description: '가장 인기 있는 상품들을 표시', category: 'product' },
    { value: 'new-arrivals', label: '신상품', description: '최근 추가된 새로운 상품들', category: 'product' },
    { value: 'flash-sale', label: '플래시 세일', description: '한정 시간 특가 상품 섹션', category: 'product' },
    { value: 'featured-products', label: '추천 상품', description: '관리자가 선별한 추천 상품들', category: 'product' },
    { value: 'trending-products', label: '트렌딩 상품', description: '현재 트렌드인 인기 상품들', category: 'product' },
  ];

  const layoutOptions = [
    { value: 'grid', label: '그리드 레이아웃' },
    { value: 'carousel', label: '캐러셀 (슬라이더)' },
    { value: 'list', label: '리스트 형태' },
    { value: 'masonry', label: '메이슨리 (Pinterest 스타일)' }
  ];

  const sortOptions = [
    { value: 'popularity', label: '인기순' },
    { value: 'newest', label: '신상품순' },
    { value: 'price-low', label: '가격 낮은 순' },
    { value: 'price-high', label: '가격 높은 순' },
    { value: 'rating', label: '평점 높은 순' },
    { value: 'discount', label: '할인률 높은 순' },
    { value: 'sales', label: '판매량 순' }
  ];

  const categoryOptions = [
    { value: '', label: '모든 카테고리' },
    { value: 'electronics', label: '전자제품' },
    { value: 'fashion', label: '패션' },
    { value: 'home', label: '홈&리빙' },
    { value: 'beauty', label: '뷰티' },
    { value: 'sports', label: '스포츠' },
    { value: 'books', label: '도서' },
    { value: 'food', label: '식품' }
  ];

  // 섹션 데이터 로드
  useEffect(() => {
    loadSection();
    loadLanguages();
    loadProducts();
  }, [sectionId]);

  const loadSection = async () => {
    try {
      const response = await fetch(`/api/admin/ui-config/sections/${sectionId}`);
      if (!response.ok) throw new Error('Section not found');
      
      const data = await response.json();
      if (data.success && data.section) {
        const section = data.section;
        setFormData({
          ...formData,
          type: section.type || 'best-sellers',
          title: section.title || '',
          subtitle: section.subtitle || '',
          content: section.content || '',
          buttonText: section.buttonText || '더보기',
          buttonLink: section.buttonLink || '/products',
          backgroundColor: section.backgroundColor || '#ffffff',
          textColor: section.textColor || '#000000',
          layout: section.layout || 'grid',
          visible: section.visible !== false,
          productCount: section.productCount || 8,
          showPrice: section.showPrice !== false,
          showRating: section.showRating !== false,
          showBadge: section.showBadge !== false,
          autoSlide: section.autoSlide || false,
          slideDuration: section.slideDuration || 3000,
          categoryFilter: section.categoryFilter || '',
          sortBy: section.sortBy || 'popularity',
          selectionMode: section.selectionMode || 'auto',
          minSales: section.minSales || 10,
          minRating: section.minRating || 4.0,
          dateRange: section.dateRange || 30,
          manualProducts: section.manualProducts || []
        });
        setSectionImages(section.images || {});
        setSelectedProducts(section.manualProducts || []);
      }
    } catch (error) {
      console.error('Failed to load section:', error);
      // 새 섹션 생성 모드로 전환
    } finally {
      setLoading(false);
    }
  };

  const loadLanguages = async () => {
    try {
      const response = await fetch('/api/admin/i18n/settings');
      const data = await response.json();
      
      if (data.success && data.settings) {
        const enabledLangs = data.settings.languages
          .filter((lang: any) => lang.enabled)
          .map((lang: any) => ({
            code: lang.code,
            name: lang.name,
            native_name: lang.native_name,
            flag_emoji: lang.flag_emoji
          }));
        setSupportedLanguages(enabledLangs);
      }
    } catch (error) {
      console.error('Failed to load languages:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = sectionId === 'new' ? 'POST' : 'PUT';
      const url = sectionId === 'new' 
        ? '/api/admin/ui-config/sections'
        : `/api/admin/ui-config/sections/${sectionId}`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          images: sectionImages,
          manualProducts: formData.selectionMode === 'manual' ? selectedProducts : []
        })
      });

      if (response.ok) {
        router.push('/admin/ui-config?tab=sections');
      } else {
        alert('섹션 저장에 실패했습니다.');
      }
    } catch (error) {
      alert('섹션 저장 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로 가기
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {sectionId === 'new' ? '새 섹션 생성' : '섹션 수정'}
        </h1>
        <p className="text-gray-600 mt-2">홈페이지에 표시될 섹션을 설정합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 섹션 타입 선택 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">섹션 타입</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {sectionTypes.map((type) => (
              <label
                key={type.value}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  formData.type === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={formData.type === type.value}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="sr-only"
                />
                <div>
                  <p className="font-medium text-gray-900">{type.label}</p>
                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4">기본 정보</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="섹션 제목을 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">부제목</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="부제목을 입력하세요 (선택사항)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="섹션 내용을 입력하세요"
            />
          </div>
        </div>

        {/* 베스트 상품 선택 조건 (베스트셀러 타입일 때만) */}
        {formData.type === 'best-sellers' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">베스트 상품 선택 조건</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">선택 모드</label>
              <select
                value={formData.selectionMode}
                onChange={(e) => setFormData({ ...formData, selectionMode: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="auto">자동 선택 (조건 기반)</option>
                <option value="manual">수동 선택</option>
              </select>
            </div>

            {formData.selectionMode === 'auto' ? (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      최소 판매량
                    </label>
                    <input
                      type="number"
                      value={formData.minSales}
                      onChange={(e) => setFormData({ ...formData, minSales: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      최소 평점
                    </label>
                    <input
                      type="number"
                      value={formData.minRating}
                      onChange={(e) => setFormData({ ...formData, minRating: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="5"
                      step="0.1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기간 (최근 N일)
                  </label>
                  <select
                    value={formData.dateRange}
                    onChange={(e) => setFormData({ ...formData, dateRange: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="7">최근 7일</option>
                    <option value="14">최근 14일</option>
                    <option value="30">최근 30일</option>
                    <option value="60">최근 60일</option>
                    <option value="90">최근 90일</option>
                  </select>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>자동 선택 기준:</strong><br />
                    최근 {formData.dateRange}일 동안 {formData.minSales}개 이상 판매되고, 
                    평점이 {formData.minRating}점 이상인 상품들이 자동으로 선택됩니다.
                  </p>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상품 선택 (최대 {formData.productCount}개)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                  {products.map((product) => (
                    <label
                      key={product.id}
                      className={`border rounded-lg p-2 cursor-pointer transition-all ${
                        selectedProducts.includes(product.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductToggle(product.id)}
                        className="sr-only"
                        disabled={!selectedProducts.includes(product.id) && selectedProducts.length >= formData.productCount}
                      />
                      <div className="space-y-2">
                        {product.images && product.images[0] ? (
                          <div className="relative w-full h-24 bg-gray-100 rounded overflow-hidden">
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">이미지 없음</span>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-600">₩{product.price?.toLocaleString()}</p>
                          {product.rating && (
                            <p className="text-xs text-gray-500">⭐ {product.rating}</p>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  선택된 상품: {selectedProducts.length}/{formData.productCount}개
                </p>
              </div>
            )}
          </div>
        )}

        {/* 상품 표시 설정 */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4">상품 표시 설정</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                표시할 상품 수
              </label>
              <input
                type="number"
                value={formData.productCount}
                onChange={(e) => setFormData({ ...formData, productCount: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                min="1"
                max="20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                정렬 방식
              </label>
              <select
                value={formData.sortBy}
                onChange={(e) => setFormData({ ...formData, sortBy: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 필터
            </label>
            <select
              value={formData.categoryFilter}
              onChange={(e) => setFormData({ ...formData, categoryFilter: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              레이아웃
            </label>
            <select
              value={formData.layout}
              onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {layoutOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.showPrice}
                onChange={(e) => setFormData({ ...formData, showPrice: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">가격 표시</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.showRating}
                onChange={(e) => setFormData({ ...formData, showRating: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">평점 표시</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.showBadge}
                onChange={(e) => setFormData({ ...formData, showBadge: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">배지 표시</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.visible}
                onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">섹션 표시</span>
            </label>
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div className="bg-white rounded-lg shadow p-6">
          <SectionImageUpload
            sectionKey={sectionId}
            languages={supportedLanguages}
            images={sectionImages}
            onUpdate={setSectionImages}
            title="섹션 이미지"
          />
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {sectionId === 'new' ? '섹션 생성' : '섹션 수정'}
          </button>
        </div>
      </form>
    </div>
  );
}