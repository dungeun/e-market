'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gift, ShoppingCart, MessageCircle, LucideIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface QuickLink {
  id: number | string;
  title: string;
  subtitle?: string;
  icon?: string;
  iconComponent?: React.ReactNode;
  link: string;
  bgColor?: string;
  iconBgColor?: string;
}

interface QuickLinksSectionProps {
  data?: {
    links?: QuickLink[];
    title?: string;
    banner?: {
      emoji?: string;
      title?: string;
      subtitle?: string;
      action?: string;
    };
  };
  sectionId?: string;
  className?: string;
}

// Icon mapping for database stored icon names
const iconMap: Record<string, LucideIcon> = {
  'Gift': Gift,
  'ShoppingCart': ShoppingCart,
  'MessageCircle': MessageCircle
};

const QuickLinksSection = React.memo(function QuickLinksSection({ data, sectionId = 'quicklinks', className = '' }: QuickLinksSectionProps) {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [banner, setBanner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { currentLanguage } = useLanguage();

  // DB에서 데이터 로드 또는 props 데이터 사용
  useEffect(() => {
    if (data?.links && Array.isArray(data.links) && data.links.length > 0) {
      // Process links to include icon components
      const processedLinks = data.links.map(link => {
        let iconComponent = <Gift className="w-6 h-6 text-orange-600" />;
        if (link.icon && iconMap[link.icon]) {
          const IconComp = iconMap[link.icon];
          iconComponent = <IconComp className="w-6 h-6 text-orange-600" />;
        }
        return {
          ...link,
          subtitle: link.subtitle || link.description, // Map description to subtitle
          iconComponent
        };
      });
      setLinks(processedLinks);
      if (data.banner) {
        setBanner(data.banner);
      }
      setLoading(false);
    } else {
      loadQuickLinksData();
    }
  }, [data, sectionId, currentLanguage]);

  const loadQuickLinksData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ui-sections/${sectionId}`, {
        headers: {
          'Accept-Language': currentLanguage
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.section?.data?.links) {
          // Process links to include icon components
          const processedLinks = result.section.data.links.map((link: QuickLink) => {
            let iconComponent = <Gift className="w-6 h-6 text-orange-600" />;
            if (link.icon && iconMap[link.icon]) {
              const IconComp = iconMap[link.icon];
              iconComponent = <IconComp className="w-6 h-6 text-orange-600" />;
            }
            return {
              ...link,
              subtitle: link.subtitle || link.description, // Map description to subtitle
              iconComponent
            };
          });
          setLinks(processedLinks);
          if (result.section.data.banner) {
            setBanner(result.section.data.banner);
          }
        } else {
          // 기본 퀵링크 데이터 설정
          const defaultLinks: QuickLink[] = [
            { 
              id: '1', 
              title: '포인트 적립', 
              subtitle: '구매 시 5% 적립', 
              icon: 'Gift', 
              link: '/rewards',
              bgColor: 'bg-gradient-to-r from-purple-50 to-blue-50',
              iconBgColor: 'bg-purple-100'
            },
            { 
              id: '2', 
              title: '무료배송', 
              subtitle: '30,000원 이상 구매 시', 
              icon: 'ShoppingCart', 
              link: '/shipping',
              bgColor: 'bg-gradient-to-r from-green-50 to-emerald-50',
              iconBgColor: 'bg-green-100'
            },
            { 
              id: '3', 
              title: '고객지원', 
              subtitle: '24시간 언제든지', 
              icon: 'MessageCircle', 
              link: '/support',
              bgColor: 'bg-gradient-to-r from-orange-50 to-red-50',
              iconBgColor: 'bg-orange-100'
            }
          ];
          
          const processedLinks = defaultLinks.map(link => {
            let iconComponent = <Gift className="w-6 h-6 text-orange-600" />;
            if (link.icon && iconMap[link.icon]) {
              const IconComp = iconMap[link.icon];
              iconComponent = <IconComp className="w-6 h-6 text-orange-600" />;
            }
            return {
              ...link,
              subtitle: link.subtitle || link.description, // Map description to subtitle
              iconComponent
            };
          });
          setLinks(processedLinks);
          
          // 기본 배너 설정
          setBanner({
            emoji: '🎉',
            title: '신규 회원 혜택',
            subtitle: '첫 구매 시 10% 할인',
            action: '지금 가입하기'
          });
        }
      }
    } catch (error) {
      console.error('Error loading quick links data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className={`w-full py-8 bg-white ${className}`}>
        <div className="max-w-[1450px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
          <div className="mt-8 bg-gray-100 rounded-xl h-20 animate-pulse" />
        </div>
      </section>
    );
  }

  if (!links || links.length === 0) {
    return null;
  }

  return (
    <section className={`w-full py-8 bg-white ${className}`}>
      <div className="max-w-[1450px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {links.slice(0, 3).map((link) => (
            <Link
              key={link.id}
              href={link.link}
              className="group"
            >
              <div className={`${link.bgColor || 'bg-white'} rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer flex items-center gap-4`}>
                {/* 아이콘 */}
                <div className={`${link.iconBgColor || 'bg-gray-100'} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0`}>
                  {link.iconComponent || <Gift className="w-6 h-6 text-orange-600" />}
                </div>
                
                {/* 텍스트 */}
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    {link.title}
                  </h3>
                  {link.subtitle && (
                    <p className="text-sm text-gray-600 mt-1">
                      {link.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 하단 알림 배너 */}
        {banner && (
          <div className="mt-8 bg-yellow-50 rounded-xl p-4 flex items-center gap-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">{banner.emoji || '🚀'}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {banner.title || '지금 시작하세요!'}
              </p>
              <p className="text-xs text-gray-600">
                {banner.subtitle || '첫 캠페인은 수수료 50% 할인'}
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{banner.action || '🎯'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

export default QuickLinksSection;