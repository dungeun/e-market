'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, Upload, Save, Globe } from 'lucide-react';

interface HeroSlide {
  id: string;
  title: string | { ko: string; en: string; jp: string };
  subtitle: string | { ko: string; en: string; jp: string };
  tag?: string | { ko: string; en: string; jp: string };
  link?: string;
  bgColor: string;
  backgroundImage?: string;
  visible: boolean;
  order: number;
  useFullImage?: boolean;
  fullImageUrl?: string;
  fullImageUrlEn?: string;
  fullImageUrlJp?: string;
  fullImageWidth?: number;
  fullImageHeight?: number;
}

export default function HeroSectionEditPage() {
  const router = useRouter();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [sectionVisible, setSectionVisible] = useState(true);
  const [supportedLanguages, setSupportedLanguages] = useState<{code: string; name: string}[]>([]);

  // DB에서 데이터 로드 및 언어 설정 가져오기
  useEffect(() => {
    loadSection();
    loadLanguageSettings();
  }, []);

  const loadLanguageSettings = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth-token');
      const response = await fetch('/api/admin/i18n/settings', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        // 사용자가 선택한 언어 목록 설정
        if (data.languages && Array.isArray(data.languages)) {
          // 활성화된 언어만 필터링
          const enabledLanguages = data.languages
            .filter((lang: any) => lang.enabled)
            .map((lang: any) => ({
              code: lang.code,
              name: lang.name || lang.native_name || lang.code,
              native_name: lang.native_name || lang.name
            }));
          setSupportedLanguages(enabledLanguages);
        } else {
          // 기본 언어 설정
          setSupportedLanguages([
            { code: 'ko', name: '한국어', native_name: '한국어' },
            { code: 'en', name: 'English', native_name: 'English' },
            { code: 'ja', name: '日本語', native_name: '日本語' }
          ]);
        }
      } else {
        // API 실패 시 기본 언어 설정
        setSupportedLanguages([
          { code: 'ko', name: '한국어', native_name: '한국어' },
          { code: 'en', name: 'English', native_name: 'English' },
          { code: 'ja', name: '日本語', native_name: '日本語' }
        ]);
      }
    } catch (error) {
      console.error('Failed to load language settings:', error);
      // 에러 시 기본 언어 설정
      setSupportedLanguages([
        { code: 'ko', name: '한국어', native_name: '한국어' },
        { code: 'en', name: 'English', native_name: 'English' },
        { code: 'ja', name: '日本語', native_name: '日本語' }
      ]);
    }
  };

  const loadSection = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth-token');
      const response = await fetch('/api/admin/ui-sections/hero', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.section) {
          // data.slides 또는 content.slides 데이터를 slides 상태로 설정
          if (data.section.data?.slides) {
            setSlides(data.section.data.slides);
          } else if (data.section.content?.slides) {
            setSlides(data.section.content.slides);
          } else {
            // 기본 슬라이드 데이터 설정
            setSlides([
              {
                id: '1',
                title: '특별한 혜택',
                subtitle: '지금 바로 만나보세요',
                tag: '🔥 HOT',
                link: '/products',
                bgColor: '#4F46E5',
                visible: true,
                order: 1
              }
            ]);
          }
          setSectionVisible(data.section.isActive ?? data.section.visible ?? true);
        } else {
          // hero 섹션이 없으면 기본값 설정
          setSlides([
            {
              id: '1',
              title: '특별한 혜택',
              subtitle: '지금 바로 만나보세요',
              tag: '🔥 HOT',
              link: '/products',
              bgColor: '#4F46E5',
              visible: true,
              order: 1
            }
          ]);
        }
      } else {

        // 에러 시 기본값 설정
        setSlides([
          {
            id: '1',
            title: '특별한 혜택',
            subtitle: '지금 바로 만나보세요',
            tag: '🔥 HOT',
            link: '/products',
            bgColor: '#4F46E5',
            visible: true,
            order: 1
          }
        ]);
      }
    } catch (error) {

      alert('섹션 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: Date.now().toString(),
      title: { ko: '새 슬라이드', en: 'New Slide', jp: '新しいスライド' },
      subtitle: { ko: '부제목을 입력하세요', en: 'Enter subtitle', jp: 'サブタイトルを入力' },
      tag: { ko: 'NEW', en: 'NEW', jp: 'NEW' },
      bgColor: 'bg-gradient-to-br from-blue-600 to-cyan-600',
      visible: true,
      order: slides.length + 1
    };
    setSlides([...slides, newSlide]);
  };

  const handleUpdateSlide = (id: string, updates: Partial<HeroSlide>) => {
    setSlides(slides.map(slide => 
      slide.id === id ? { ...slide, ...updates } : slide
    ));
  };

  const handleImageUpload = async (
    slideId: string, 
    file: File, 
    imageType: 'background' | 'full' | 'fullEn' | 'fullJp' = 'background'
  ) => {
    // 이미지 업로드 로직
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'hero_' + imageType);
    
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth-token');
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // 이미지 타입에 따라 다른 필드 업데이트
        const updates: Partial<HeroSlide> = {};
        
        if (imageType === 'background') {
          updates.backgroundImage = data.url;
        } else if (imageType === 'full') {
          updates.fullImageUrl = data.url;
          // 이미지 크기 정보 저장
          if (data.width) updates.fullImageWidth = data.width;
          if (data.height) updates.fullImageHeight = data.height;
        } else if (imageType.startsWith('full') && imageType !== 'full') {
          // 동적으로 언어별 이미지 URL 필드 설정
          const langCode = imageType.replace('full', '').toLowerCase();
          if (langCode === 'en') {
            updates.fullImageUrlEn = data.url;
          } else if (langCode === 'ja') {
            updates.fullImageUrlJp = data.url;
          } else {
            // 추가 언어 지원을 위한 동적 필드
            (updates as any)[`fullImageUrl${imageType.replace('full', '')}`] = data.url;
          }
        }
        
        handleUpdateSlide(slideId, updates);
        
        // WebP 변환 성공 여부 알림
        if (data.webpConverted) {
          console.log(`이미지가 WebP로 변환되었습니다. 원본: ${data.originalSize}bytes → WebP: ${data.size}bytes`);
        }
      } else {
        const error = await response.json();
        alert(error.error || '이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('이미지 업로드에 실패했습니다.');
    }
  };

  const handleDeleteSlide = (id: string) => {
    if (slides.length <= 1) {
      alert('최소 1개의 슬라이드는 필요합니다.');
      return;
    }
    
    if (confirm('이 슬라이드를 삭제하시겠습니까?')) {
      setSlides(slides.filter(slide => slide.id !== id));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth-token');
      const response = await fetch('/api/admin/ui-sections/hero', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify({
          content: { slides },
          visible: sectionVisible,
          autoTranslate
        })
      });

      if (response.ok) {
        alert('저장되었습니다.');
        // 리다이렉트 제거 - 현재 페이지 유지
        loadSection(); // 데이터 새로고침
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {

      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const presetColors = [
    { name: '인디고-퍼플', value: 'bg-gradient-to-br from-indigo-600 to-purple-600' },
    { name: '핑크-로즈', value: 'bg-gradient-to-br from-pink-500 to-rose-500' },
    { name: '블루-시안', value: 'bg-gradient-to-br from-blue-600 to-cyan-600' },
    { name: '그린-틸', value: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
    { name: '오렌지-레드', value: 'bg-gradient-to-br from-orange-500 to-red-600' },
    { name: '퍼플-핑크', value: 'bg-gradient-to-br from-purple-600 to-pink-600' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/ui-config?tab=sections')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">히어로 배너 관리</h1>
                <p className="text-sm text-gray-600 mt-1">메인 페이지 상단 배너 슬라이드를 관리합니다</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* 자동 번역 토글 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoTranslate}
                  onChange={(e) => setAutoTranslate(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${
                  autoTranslate ? 'bg-blue-600' : 'bg-gray-300'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 ${
                    autoTranslate ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </div>
                <span className="flex items-center gap-1 text-sm text-gray-700">
                  <Globe className="w-4 h-4" />
                  자동 번역
                </span>
              </label>

              {/* 섹션 표시 토글 */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sectionVisible}
                  onChange={(e) => setSectionVisible(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${
                  sectionVisible ? 'bg-green-600' : 'bg-gray-300'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 ${
                    sectionVisible ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </div>
                <span className="flex items-center gap-1 text-sm text-gray-700">
                  {sectionVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  섹션 표시
                </span>
              </label>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>

        {/* 슬라이드 목록 */}
        <div className="space-y-6">
          {slides.map((slide, index) => (
            <div key={slide.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">슬라이드 {index + 1}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateSlide(slide.id, { visible: !slide.visible })}
                    className={`p-2 rounded-lg transition-colors ${
                      slide.visible ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {slide.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                    <textarea
                      value={typeof slide.title === 'object' ? slide.title?.ko || '' : slide.title || ''}
                      onChange={(e) => handleUpdateSlide(slide.id, { 
                        title: typeof slide.title === 'object' 
                          ? { ...slide.title, ko: e.target.value } 
                          : e.target.value 
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="슬라이드 제목을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">부제목</label>
                    <input
                      type="text"
                      value={typeof slide.subtitle === 'object' ? slide.subtitle?.ko || '' : slide.subtitle || ''}
                      onChange={(e) => handleUpdateSlide(slide.id, { 
                        subtitle: typeof slide.subtitle === 'object' 
                          ? { ...slide.subtitle, ko: e.target.value } 
                          : e.target.value 
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="슬라이드 부제목을 입력하세요"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
                      <input
                        type="text"
                        value={typeof slide.tag === 'object' ? slide.tag?.ko || '' : slide.tag || ''}
                        onChange={(e) => handleUpdateSlide(slide.id, { 
                          tag: typeof slide.tag === 'object' 
                            ? { ...slide.tag, ko: e.target.value } 
                            : e.target.value 
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="예: 🎯 NEW"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">링크</label>
                      <input
                        type="text"
                        value={slide.link || ''}
                        onChange={(e) => handleUpdateSlide(slide.id, { link: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="/campaigns"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">배경 색상</label>
                    <select
                      value={slide.bgColor}
                      onChange={(e) => handleUpdateSlide(slide.id, { bgColor: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {presetColors.map(color => (
                        <option key={color.value} value={color.value}>{color.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* 전체 이미지 사용 체크박스 */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slide.useFullImage || false}
                        onChange={(e) => handleUpdateSlide(slide.id, { useFullImage: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        텍스트를 이미지로 변경
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      체크하면 제목/부제목 텍스트 대신 이미지만 표시됩니다
                    </p>
                  </div>

                  {slide.useFullImage && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">배너 이미지 업로드</label>
                      
                      {/* 동적으로 선택된 언어별 이미지 업로드 */}
                      {supportedLanguages.map((lang) => (
                        <div key={lang.code} className="flex items-center gap-4">
                          <span className="text-sm text-gray-600 w-20">{lang.native_name || lang.name}:</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // 언어팩 기반 동적 필드명 생성
                                let imageType: string;
                                if (lang.code === 'ko') {
                                  imageType = 'full'; // 기본 (한국어)
                                } else {
                                  imageType = `full${lang.code.charAt(0).toUpperCase() + lang.code.slice(1)}`;
                                }
                                handleImageUpload(slide.id, file, imageType as any);
                              }
                            }}
                            className="hidden"
                            id={`full-image-${lang.code}-${slide.id}`}
                          />
                          <label
                            htmlFor={`full-image-${lang.code}-${slide.id}`}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer flex items-center gap-2 text-sm"
                          >
                            <Upload className="w-3 h-3" />
                            업로드
                          </label>
                          {(() => {
                            // 언어별 이미지 URL 동적 확인
                            if (lang.code === 'ko') return slide.fullImageUrl;
                            if (lang.code === 'en') return slide.fullImageUrlEn;
                            if (lang.code === 'ja') return slide.fullImageUrlJp;
                            // 추가 언어 지원
                            const fieldName = `fullImageUrl${lang.code.charAt(0).toUpperCase() + lang.code.slice(1)}`;
                            return (slide as any)[fieldName];
                          })() ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-green-600">✓</span>
                            <button
                              onClick={() => {
                                // 언어별 필드명 동적 생성
                                let fieldName: string;
                                if (lang.code === 'ko') {
                                  fieldName = 'fullImageUrl';
                                } else if (lang.code === 'en') {
                                  fieldName = 'fullImageUrlEn';
                                } else if (lang.code === 'ja') {
                                  fieldName = 'fullImageUrlJp';
                                } else {
                                  fieldName = `fullImageUrl${lang.code.charAt(0).toUpperCase() + lang.code.slice(1)}`;
                                }
                                handleUpdateSlide(slide.id, { [fieldName]: undefined });
                              }}
                              className="text-sm text-red-600 hover:underline"
                            >
                              삭제
                            </button>
                          </div>
                        ) : null}
                        </div>
                      ))}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        * 이미지는 자동으로 WebP 포맷으로 변환되어 저장됩니다.
                      </p>
                    </div>
                  )}

                  {!slide.useFullImage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">배경 이미지 (선택사항)</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(slide.id, file, 'background');
                          }}
                          className="hidden"
                          id={`bg-image-${slide.id}`}
                        />
                        <label
                          htmlFor={`bg-image-${slide.id}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          배경 이미지 업로드
                        </label>
                        {slide.backgroundImage && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-green-600">✓ 업로드됨</span>
                            <button
                              onClick={() => handleUpdateSlide(slide.id, { backgroundImage: undefined })}
                              className="text-sm text-red-600 hover:underline"
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        텍스트와 함께 표시될 배경 이미지입니다
                      </p>
                    </div>
                  )}

                  {/* 미리보기 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">미리보기</label>
                    {slide.useFullImage && slide.fullImageUrl ? (
                      <div className="rounded-lg overflow-hidden h-32 bg-gray-100">
                        <img 
                          src={slide.fullImageUrl} 
                          alt="Slide preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`${slide.bgColor} text-white p-4 rounded-lg h-32 flex flex-col justify-center`}
                        style={{
                          backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <div className={slide.backgroundImage ? 'bg-black/30 p-2 rounded' : ''}>
                          {slide.tag && (
                            <span className="inline-block bg-white/20 backdrop-blur px-2 py-1 rounded-full text-xs font-medium mb-1">
                              {typeof slide.tag === 'object' ? slide.tag?.ko || '' : slide.tag}
                            </span>
                          )}
                          <h4 className="text-lg font-bold whitespace-pre-line">
                            {typeof slide.title === 'object' ? slide.title?.ko || '' : slide.title}
                          </h4>
                          <p className="text-sm opacity-90">
                            {typeof slide.subtitle === 'object' ? slide.subtitle?.ko || '' : slide.subtitle}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 슬라이드 추가 버튼 */}
        <button
          onClick={handleAddSlide}
          className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <Plus className="w-5 h-5" />
          새 슬라이드 추가
        </button>

        {/* 안내 메시지 */}
        {autoTranslate && (
          <div className="mt-8 bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 자동 번역 활성화됨:</strong> 저장 시 입력한 한글 내용이 자동으로 영어와 일본어로 번역됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}