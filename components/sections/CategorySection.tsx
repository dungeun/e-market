'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { 
  ShieldCheck, 
  Tag, 
  ShoppingCart, 
  AlertTriangle,
  Smartphone,
  Heart,
  BookOpen,
  ThumbsUp,
  User,
  Sprout,
  GraduationCap,
  LucideIcon
} from 'lucide-react';

interface Category {
  id: number | string;
  name: string;
  icon?: string;
  iconComponent?: React.ReactNode;
  link: string;
  badge?: string;
  color?: string;
}

interface CategorySectionProps {
  data?: {
    categories?: Category[];
    title?: string;
  };
  sectionId?: string;
  className?: string;
}

// Icon mapping for database stored icon names
const iconMap: Record<string, LucideIcon> = {
  'ShieldCheck': ShieldCheck,
  'Tag': Tag,
  'ShoppingCart': ShoppingCart,
  'AlertTriangle': AlertTriangle,
  'Smartphone': Smartphone,
  'Heart': Heart,
  'BookOpen': BookOpen,
  'ThumbsUp': ThumbsUp,
  'User': User,
  'Sprout': Sprout,
  'GraduationCap': GraduationCap
};

const CategorySection = React.memo(function CategorySection({ data, sectionId = 'category', className = '' }: CategorySectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentLanguage } = useLanguage();

  // DB에서 데이터 로드 또는 props 데이터 사용
  useEffect(() => {
    if (data?.categories && Array.isArray(data.categories) && data.categories.length > 0) {
      // Process categories - use emoji directly if it exists, otherwise use icon component
      const processedCategories = data.categories.map(cat => ({
        ...cat,
        iconComponent: cat.icon && (cat.icon.length <= 2 || cat.icon.match(/[\u{1F300}-\u{1F9FF}]/u))
          ? <span className="text-4xl">{cat.icon}</span>
          : cat.icon && iconMap[cat.icon] 
          ? React.createElement(iconMap[cat.icon], { className: "w-8 h-8" })
          : <ShieldCheck className="w-8 h-8" />
      }));
      setCategories(processedCategories);
      setLoading(false);
    } else {
      loadCategoryData();
    }
  }, [data, sectionId, currentLanguage]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ui-sections/${sectionId}`, {
        headers: {
          'Accept-Language': currentLanguage
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        let categoriesToUse: Category[] = [];
        
        // 언어별 데이터 처리
        if (currentLanguage !== 'ko' && result.section?.data?.translations?.[currentLanguage]?.categories) {
          categoriesToUse = result.section.data.translations[currentLanguage].categories;
        } else if (result.section?.data?.categories) {
          categoriesToUse = result.section.data.categories;
        }
        
        if (categoriesToUse.length > 0) {
          // Process categories - use emoji directly if it exists, otherwise use icon component
          const processedCategories = categoriesToUse.map((cat: Category) => ({
            ...cat,
            iconComponent: cat.icon && (cat.icon.length <= 2 || cat.icon.match(/[\u{1F300}-\u{1F9FF}]/u))
              ? <span className="text-4xl">{cat.icon}</span>
              : cat.icon && iconMap[cat.icon] 
              ? React.createElement(iconMap[cat.icon], { className: "w-8 h-8" })
              : <ShieldCheck className="w-8 h-8" />
          }));
          setCategories(processedCategories);
        } else {
          // 기본 카테고리 데이터 설정
          const defaultCategories: Category[] = [
            { id: '1', name: '전자제품', icon: 'Smartphone', link: '/products?category=electronics', color: 'text-blue-600' },
            { id: '2', name: '패션', icon: 'Heart', link: '/products?category=fashion', color: 'text-pink-600' },
            { id: '3', name: '도서', icon: 'BookOpen', link: '/products?category=books', color: 'text-green-600' },
            { id: '4', name: '스포츠', icon: 'ThumbsUp', link: '/products?category=sports', color: 'text-orange-600' },
            { id: '5', name: '뷰티', icon: 'Sprout', link: '/products?category=beauty', color: 'text-purple-600' },
            { id: '6', name: '교육', icon: 'GraduationCap', link: '/products?category=education', color: 'text-indigo-600' },
            { id: '7', name: '생활용품', icon: 'ShoppingCart', link: '/products?category=living', color: 'text-gray-600' },
            { id: '8', name: '건강', icon: 'ShieldCheck', link: '/products?category=health', color: 'text-red-600' }
          ];
          
          const processedCategories = defaultCategories.map(cat => ({
            ...cat,
            iconComponent: cat.icon && iconMap[cat.icon] 
              ? React.createElement(iconMap[cat.icon], { className: "w-8 h-8" })
              : <ShieldCheck className="w-8 h-8" />
          }));
          setCategories(processedCategories);
        }
      }
    } catch (error) {
      console.error('Error loading category data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className={`w-full py-8 bg-white ${className}`}>
        <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-6 justify-start md:justify-center min-w-max px-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3 px-2">
                  <div className="relative pt-2 pr-2">
                    <div className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse" />
                  </div>
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className={`w-full py-8 bg-white ${className}`}>
      <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 카테고리 가로 스크롤 */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-6 justify-start md:justify-center min-w-max px-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.link}
                className="group flex flex-col items-center gap-3 hover:scale-105 transition-transform px-2"
              >
                {/* 아이콘 컨테이너 - 패딩 추가로 배지 공간 확보 */}
                <div className="relative pt-2 pr-2">
                  {/* 배지 - 위치 조정 */}
                  {category.badge && (
                    <span className="absolute -top-0 -right-0 bg-red-500 text-white text-[11px] px-2 py-1 rounded-full font-bold z-10 whitespace-nowrap shadow-sm">
                      {category.badge}
                    </span>
                  )}
                  
                  {/* 아이콘 버튼 스타일 - 크기 증가 */}
                  <button className={`w-20 h-20 rounded-xl bg-gray-50 border border-gray-200 group-hover:bg-gray-100 group-hover:shadow-lg flex items-center justify-center transition-all ${category.color || 'text-gray-600'}`}>
                    <div className="group-hover:scale-110 transition-transform text-4xl">
                      {category.iconComponent || <ShieldCheck className="w-10 h-10" />}
                    </div>
                  </button>
                </div>
                
                {/* 카테고리 이름 */}
                <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium whitespace-nowrap">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

export default CategorySection;