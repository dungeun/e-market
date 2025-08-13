'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ShoppingBag, Shirt, Watch, Phone, Home } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  link: string;
  color: string;
  visible: boolean;
  order: number;
}

interface CategorySectionProps {
  sectionId?: string;
  className?: string;
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  package: Package,
  'shopping-bag': ShoppingBag,
  shirt: Shirt,
  watch: Watch,
  phone: Phone,
  home: Home,
};

export default function CategorySection({ sectionId = 'category', className = '' }: CategorySectionProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    loadCategoryData();
  }, [sectionId]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ui-sections/${sectionId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.section) {
          const visibleCategories = data.section.content?.categories?.filter((cat: CategoryItem) => cat.visible) || [];
          setCategories(visibleCategories.sort((a: CategoryItem, b: CategoryItem) => a.order - b.order));
          setIsVisible(data.section.isActive !== false);
        }
      }
    } catch (error) {
      console.error('Error loading category section:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`w-full py-12 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-xl p-4 h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isVisible || categories.length === 0) {
    return null;
  }

  return (
    <section className={`w-full py-12 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">카테고리</h2>
          <p className="text-gray-600">원하는 카테고리를 선택하세요</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon] || Package;
            
            return (
              <Link
                key={category.id}
                href={category.link}
                className="group block"
              >
                <div className="bg-white rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className={`${category.color} w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 text-center">
                    {category.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}