'use client';

import React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface PromoBanner {
  id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  link: string;
  backgroundImage?: string;
  backgroundColor: string;
  textColor: string;
  visible: boolean;
  order: number;
}

interface PromoSectionProps {
  sectionId?: string;
  className?: string;
  data?: unknown;
}

const PromoSection = React.memo(function PromoSection({ sectionId = 'promo', className = '', data }: PromoSectionProps) {
  const [promoBanners, setPromoBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [sectionTitle, setSectionTitle] = useState('특별 혜택');
  const [sectionSubtitle, setSectionSubtitle] = useState('놓치면 안 되는 특별한 이벤트와 할인 혜택');
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    loadPromoData();
    loadSectionMetadata();
  }, [sectionId, currentLanguage]);

  const loadSectionMetadata = async () => {
    try {
      // ui-sections API에서 현재 섹션의 title 가져오기
      const response = await fetch(`/api/ui-sections?sectionId=${sectionId}&cache=false`);
      if (response.ok) {
        const data = await response.json();
        const section = data.sections?.find((s: any) => s.key === sectionId);
        if (section) {
          setSectionTitle(section.title || '특별 혜택');
          // data 필드에서 subtitle이나 description 정보 확인
          if (section.data && typeof section.data === 'object') {
            const sectionData = section.data as any;
            setSectionSubtitle(sectionData.subtitle || sectionData.description || '놓치면 안 되는 특별한 이벤트와 할인 혜택');
          }
        }
      }
    } catch (error) {
      console.error('Failed to load section metadata:', error);
      // 에러 시 기본값 유지
    }
  };

  const loadPromoData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ui-sections/${sectionId}`, {
        headers: {
          'Accept-Language': currentLanguage
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.section) {
          // Check for banners in different possible locations
          const banners = data.section.data?.banners || data.section.content?.banners || [];
          const visibleBanners = banners.filter((banner: PromoBanner) => banner.visible !== false);
          if (visibleBanners.length > 0) {
            setPromoBanners(visibleBanners.sort((a: PromoBanner, b: PromoBanner) => a.order - b.order));
          } else {
            // 기본 프로모 배너 데이터 설정
            const defaultBanners: PromoBanner[] = [
              {
                id: '1',
                title: '여름 특가 세일',
                subtitle: '최대 50% 할인',
                buttonText: '지금 쇼핑하기',
                link: '/products?sale=summer',
                backgroundColor: 'bg-gradient-to-r from-orange-400 to-pink-500',
                textColor: 'text-white',
                visible: true,
                order: 1
              },
              {
                id: '2',
                title: '신규 회원 혜택',
                subtitle: '첫 구매 시 무료배송',
                buttonText: '회원가입하기',
                link: '/auth/register',
                backgroundColor: 'bg-gradient-to-r from-blue-500 to-purple-600',
                textColor: 'text-white',
                visible: true,
                order: 2
              }
            ];
            setPromoBanners(defaultBanners);
          }
          setIsVisible(data.section.isActive !== false);
        }
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`w-full py-12 ${className}`}>
        <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isVisible) {
    return null;
  }

  return (
    <section className={`w-full py-12 ${className}`}>
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{sectionTitle}</h2>
          <p className="text-gray-600">{sectionSubtitle}</p>
        </div>
        
        <div className={`grid grid-cols-1 ${promoBanners.length >= 2 ? 'md:grid-cols-2' : ''} gap-6`}>
          {promoBanners.map((banner) => (
            <Link
              key={banner.id}
              href={banner.link}
              className="group block"
            >
              <div 
                className={`${banner.backgroundColor} rounded-xl p-8 relative overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-lg`}
                style={{
                  backgroundImage: banner.backgroundImage 
                    ? `url(${banner.backgroundImage})` 
                    : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* 오버레이 (배경 이미지가 있을 때) */}
                {banner.backgroundImage && (
                  <div className="absolute inset-0 bg-black/40" />
                )}
                
                <div className="relative z-10">
                  <h3 className={`text-xl sm:text-2xl font-bold ${banner.textColor} mb-2`}>
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className={`${banner.textColor} opacity-90 mb-4`}>
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.buttonText && (
                    <span className={`inline-flex items-center px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors group-hover:scale-105`}>
                      {banner.buttonText}
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
});
export default PromoSection;