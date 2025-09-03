'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Gift, Zap } from 'lucide-react';

interface QuickLink {
  id: string;
  title: string;
  description: string;
  link: string;
  icon: string;
  bgColor: string;
  textColor: string;
  visible: boolean;
  order: number;
}

interface QuickLinksSectionProps {
  sectionId?: string;
  className?: string;
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  star: Star,
  gift: Gift,
  zap: Zap,
};

export default function QuickLinksSection({ sectionId = 'quicklinks', className = '' }: QuickLinksSectionProps) {
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    loadQuickLinksData();
  }, [sectionId]);

  const loadQuickLinksData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ui-sections/${sectionId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.section) {
          const visibleLinks = data.section.content?.links?.filter((link: QuickLink) => link.visible) || [];
          setQuickLinks(visibleLinks.sort((a: QuickLink, b: QuickLink) => a.order - b.order));
          setIsVisible(data.section.isActive !== false);
        }
      }
    } catch (error) {
      console.error('Error loading quick links section:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`w-full py-12 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-xl p-6 h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isVisible || quickLinks.length === 0) {
    return null;
  }

  return (
    <section className={`w-full py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">빠른 접근</h2>
          <p className="text-gray-600">자주 찾는 메뉴를 빠르게 이용하세요</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickLinks.map((link) => {
            const IconComponent = iconMap[link.icon] || Star;
            
            return (
              <Link
                key={link.id}
                href={link.link}
                className="group block"
              >
                <div className={`${link.bgColor} rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${link.textColor === 'text-white' ? 'bg-white/20' : 'bg-gray-100'} w-12 h-12 rounded-lg flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 ${link.textColor === 'text-white' ? 'text-white' : 'text-gray-700'}`} />
                    </div>
                    <ArrowRight className={`w-5 h-5 ${link.textColor} group-hover:translate-x-1 transition-transform`} />
                  </div>
                  <h3 className={`text-lg font-semibold ${link.textColor} mb-2`}>
                    {link.title}
                  </h3>
                  <p className={`text-sm ${link.textColor} opacity-80`}>
                    {link.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}