'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SectionImageUpload } from '@/components/admin/ui-config/SectionImageUpload';

export default function NewSectionPage() {
  const router = useRouter();
  const [sectionImages, setSectionImages] = useState<{ [key: string]: string }>({});
  const [supportedLanguages, setSupportedLanguages] = useState<any[]>([]);
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
    sortBy: 'popularity'
  });

  const sectionTypes = [
    // 핵심 상품 섹션 (Primary Product Sections)
    { value: 'best-sellers', label: '베스트셀러', description: '가장 인기 있는 상품들을 표시', category: 'product' },
    { value: 'new-arrivals', label: '신상품', description: '최근 추가된 새로운 상품들', category: 'product' },
    { value: 'flash-sale', label: '플래시 세일', description: '한정 시간 특가 상품 섹션', category: 'product' },
    { value: 'featured-products', label: '추천 상품', description: '관리자가 선별한 추천 상품들', category: 'product' },
    { value: 'trending-products', label: '트렌딩 상품', description: '현재 트렌드인 인기 상품들', category: 'product' },
    
    // 카테고리 기반 섹션 (Category-Based Sections)
    { value: 'category-showcase', label: '카테고리 쇼케이스', description: '특정 카테고리의 상품 컬렉션', category: 'product' },
    { value: 'seasonal-collection', label: '시즌 컬렉션', description: '계절별 특별 상품 모음', category: 'product' },
    { value: 'special-offers', label: '특별 할인', description: '할인 중인 상품들의 모음', category: 'product' },
    
    // 개인화 섹션 (Personalized Sections)
    { value: 'recommended', label: '맞춤 추천', description: '사용자 맞춤 추천 상품', category: 'product' },
    { value: 'recently-viewed', label: '최근 본 상품', description: '사용자가 최근 조회한 상품들', category: 'product' },
    
    // 브랜드 & 콘텐츠 섹션 (Brand & Content Sections)
    { value: 'brand-spotlight', label: '브랜드 스포트라이트', description: '특정 브랜드 제품 집중 소개', category: 'brand' },
    { value: 'video-showcase', label: '영상 쇼케이스', description: '상품 소개 영상이 포함된 섹션', category: 'content' },
    { value: 'banner-grid', label: '배너 그리드', description: '다양한 프로모션 배너 그리드', category: 'content' },
    
    // 기본 섹션 (Basic Sections)
    { value: 'hero', label: '히어로 배너', description: '메인 비주얼과 CTA가 있는 대형 배너', category: 'basic' },
    { value: 'newsletter', label: '뉴스레터', description: '이메일 구독 신청 섹션', category: 'basic' },
    { value: 'testimonials', label: '고객 후기', description: '고객의 추천사나 리뷰 표시', category: 'basic' },
    { value: 'instagram-feed', label: '인스타그램 피드', description: '인스타그램 게시물 표시', category: 'basic' }
  ];

  const layoutOptions = [
    { value: 'grid', label: '그리드 레이아웃' },
    { value: 'carousel', label: '캐러셀 (슬라이더)' },
    { value: 'list', label: '리스트 형태' },
    { value: 'masonry', label: '메이슨리 (Pinterest 스타일)' },
    { value: 'featured', label: '피처드 (큰 이미지 + 작은 이미지들)' }
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

  // 언어 목록 로드
  useEffect(() => {
    loadLanguages();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/ui-config/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          images: sectionImages
        })
      });

      if (response.ok) {
        router.push('/admin/ui-config?tab=sections');
      } else {
        alert('섹션 생성에 실패했습니다.');
      }
    } catch (error) {

      alert('섹션 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로 가기
        </button>
        <h1 className="text-2xl font-bold text-gray-900">새 섹션 생성</h1>
        <p className="text-gray-600 mt-2">홈페이지에 표시될 새로운 섹션을 만듭니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 섹션 타입 선택 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">섹션 타입</h2>
          
          {/* 상품 섹션 */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-blue-600 mb-3">🛍️ 상품 섹션</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {sectionTypes.filter(type => type.category === 'product').map((type) => (
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

          {/* 브랜드 & 콘텐츠 섹션 */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-green-600 mb-3">🎨 브랜드 & 콘텐츠 섹션</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {sectionTypes.filter(type => type.category === 'brand' || type.category === 'content').map((type) => (
                <label
                  key={type.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    formData.type === type.value
                      ? 'border-green-500 bg-green-50'
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

          {/* 기본 섹션 */}
          <div>
            <h3 className="text-md font-medium text-gray-600 mb-3">⚙️ 기본 섹션</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {sectionTypes.filter(type => type.category === 'basic').map((type) => (
                <label
                  key={type.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    formData.type === type.value
                      ? 'border-gray-500 bg-gray-50'
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
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4">기본 정보</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              부제목
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="부제목을 입력하세요 (선택사항)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="섹션 내용을 입력하세요"
            />
          </div>
        </div>

        {/* 상품 섹션 설정 */}
        {['best-sellers', 'new-arrivals', 'flash-sale', 'featured-products', 'trending-products', 
          'category-showcase', 'seasonal-collection', 'special-offers', 'recommended', 'recently-viewed'].includes(formData.type) && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">상품 설정</h2>
            
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
                카테고리 필터 (선택사항)
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
                  checked={formData.autoSlide}
                  onChange={(e) => setFormData({ ...formData, autoSlide: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">자동 슬라이드</span>
              </label>
            </div>

            {formData.autoSlide && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  슬라이드 지속시간 (밀리초)
                </label>
                <input
                  type="number"
                  value={formData.slideDuration}
                  onChange={(e) => setFormData({ ...formData, slideDuration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1000"
                  max="10000"
                  step="500"
                />
              </div>
            )}
          </div>
        )}

        {/* CTA 버튼 설정 */}
        {(formData.type === 'hero' || formData.type === 'newsletter') && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4">CTA 버튼</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                버튼 텍스트
              </label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="예: 지금 시작하기"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                버튼 링크
              </label>
              <input
                type="text"
                value={formData.buttonLink}
                onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="/register"
              />
            </div>
          </div>
        )}

        {/* 디자인 설정 */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4">디자인 설정</h2>
          
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

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                배경색
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                텍스트색
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={formData.textColor}
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 이미지 업로드 섹션 */}
          <div className="mt-6">
            <SectionImageUpload
              sectionKey="new-section"
              languages={supportedLanguages}
              images={sectionImages}
              onUpdate={setSectionImages}
              title="섹션 이미지"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.visible}
                onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">섹션 표시</span>
            </label>
          </div>
        </div>

        {/* 미리보기 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">미리보기</h2>
          <div 
            className="border rounded-lg p-8"
            style={{ 
              backgroundColor: formData.backgroundColor, 
              color: formData.textColor
            }}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{formData.title || `${sectionTypes.find(t => t.value === formData.type)?.label || '제목'} 섹션`}</h3>
              {formData.subtitle && <p className="text-lg mb-4">{formData.subtitle}</p>}
              {formData.content && <p className="mb-4">{formData.content}</p>}
            </div>

            {/* 상품 섹션 미리보기 */}
            {['best-sellers', 'new-arrivals', 'flash-sale', 'featured-products', 'trending-products', 
              'category-showcase', 'seasonal-collection', 'special-offers', 'recommended', 'recently-viewed'].includes(formData.type) && (
              <div>
                <div className={`grid gap-4 ${
                  formData.layout === 'carousel' ? 'grid-cols-1 overflow-x-auto' :
                  formData.layout === 'list' ? 'grid-cols-1' :
                  'grid-cols-2 md:grid-cols-4'
                }`}>
                  {[...Array(Math.min(formData.productCount, 4))].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 bg-white text-gray-800">
                      <div className="w-full h-32 bg-gray-200 rounded mb-3 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">상품 이미지</span>
                      </div>
                      
                      {formData.showBadge && (
                        <span className="inline-block px-2 py-1 bg-red-500 text-white text-xs rounded mb-2">
                          {formData.type === 'best-sellers' ? 'BEST' :
                           formData.type === 'new-arrivals' ? 'NEW' :
                           formData.type === 'flash-sale' ? '특가' : 'HOT'}
                        </span>
                      )}
                      
                      <h4 className="font-semibold text-sm mb-1">샘플 상품 {i + 1}</h4>
                      
                      {formData.showPrice && (
                        <p className="text-sm font-bold text-blue-600 mb-1">₩{(29900 + i * 10000).toLocaleString()}</p>
                      )}
                      
                      {formData.showRating && (
                        <div className="flex items-center text-xs text-gray-600">
                          <span>⭐⭐⭐⭐⭐</span>
                          <span className="ml-1">(4.{5 + i})</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600 mb-2">
                    설정: {formData.productCount}개 상품 · {sortOptions.find(s => s.value === formData.sortBy)?.label} · 
                    {formData.categoryFilter ? categoryOptions.find(c => c.value === formData.categoryFilter)?.label : '모든 카테고리'}
                  </p>
                </div>
              </div>
            )}

            {/* 일반 섹션 미리보기 */}
            {!['best-sellers', 'new-arrivals', 'flash-sale', 'featured-products', 'trending-products', 
              'category-showcase', 'seasonal-collection', 'special-offers', 'recommended', 'recently-viewed'].includes(formData.type) && (
              <div className="text-center">
                <p className="mb-4 text-gray-600">
                  {formData.type === 'hero' ? '대형 히어로 배너 영역' :
                   formData.type === 'newsletter' ? '이메일 구독 신청 폼' :
                   formData.type === 'testimonials' ? '고객 후기 카드들' :
                   formData.type === 'instagram-feed' ? '인스타그램 게시물 그리드' :
                   formData.type === 'banner-grid' ? '프로모션 배너들' :
                   formData.type === 'video-showcase' ? '상품 소개 영상' :
                   formData.type === 'brand-spotlight' ? '브랜드 소개 영역' :
                   '섹션 콘텐츠 영역'}
                </p>
              </div>
            )}

            {formData.buttonText && (
              <div className="text-center mt-6">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {formData.buttonText}
                </button>
              </div>
            )}
          </div>
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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            섹션 생성
          </button>
        </div>
      </form>
    </div>
  );
}