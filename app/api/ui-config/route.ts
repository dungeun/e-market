import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Note: Removed server-side translation function - translations now handled client-side

// GET /api/ui-config - 공개 UI 설정 조회 (모든 사용자 접근 가능)
export async function GET(request: NextRequest) {
  try {
    // Note: Language parameter removed - all translations handled client-side
    
    // Note: Category menu fetching disabled - using static default categories
    let categoryMenus = [];

    // 헤더 메뉴용 카테고리 추가 (상위 3개만)
    const headerCategoryMenus = categoryMenus.slice(0, 3).map((cat, index) => ({
      id: `header-cat-${cat.id}`,
      label: cat.name,
      href: cat.href,
      order: 10 + index, // 기본 메뉴 뒤에 배치
      visible: true
    }));

    // 기본 설정 먼저 준비 (번역 적용)
    const defaultConfig = {
        header: {
          logo: {
            text: 'LinkPick',
            imageUrl: null
          },
          menus: [
            { id: 'menu-1', label: 'menu.campaigns', href: '/campaigns', order: 1, visible: true },
            { id: 'menu-2', label: 'menu.influencers', href: '/influencers', order: 2, visible: true },
            { id: 'menu-3', label: 'menu.community', href: '/community', order: 3, visible: true },
            { id: 'menu-4', label: 'menu.pricing', href: '/pricing', order: 4, visible: true },
            ...headerCategoryMenus,
          ],
          ctaButton: {
            text: 'menu.get_started',
            href: '/register',
            visible: true
          }
        },
        footer: {
          columns: [
            {
              id: 'column-1',
              title: 'footer.service.title',
              order: 1,
              links: [
                { id: 'link-1', label: 'footer.service.find_influencers', href: '/influencers', order: 1, visible: true },
                { id: 'link-2', label: 'footer.service.create_campaign', href: '/campaigns/create', order: 2, visible: true },
              ]
            },
            {
              id: 'column-2',
              title: 'footer.company.title',
              order: 2,
              links: [
                { id: 'link-3', label: 'footer.company.about', href: '/about', order: 1, visible: true },
                { id: 'link-4', label: 'footer.company.contact', href: '/contact', order: 2, visible: true },
              ]
            },
            {
              id: 'column-3',
              title: 'footer.legal.title',
              order: 3,
              links: [
                { id: 'link-5', label: 'footer.legal.terms', href: '/terms', order: 1, visible: true },
                { id: 'link-6', label: 'footer.legal.privacy', href: '/privacy', order: 2, visible: true },
              ]
            }
          ],
          social: [
            { platform: 'twitter', url: 'https://twitter.com/linkpick', visible: true },
            { platform: 'facebook', url: 'https://facebook.com/linkpick', visible: true },
            { platform: 'instagram', url: 'https://instagram.com/linkpick', visible: true }
          ],
          copyright: 'footer.copyright'
        },
        mainPage: {
          heroSlides: [
            {
              id: 'slide-1',
              type: 'blue' as const,
              tag: 'hero.slide1.tag',
              title: 'hero.slide1.title',
              subtitle: 'hero.slide1.subtitle',
              bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
              order: 1,
              visible: true,
            },
            {
              id: 'slide-2',
              type: 'dark' as const,
              title: 'hero.slide2.title',
              subtitle: 'hero.slide2.subtitle',
              bgColor: 'bg-gradient-to-br from-gray-800 to-gray-900',
              order: 2,
              visible: true,
            },
            {
              id: 'slide-3',
              type: 'green' as const,
              title: 'hero.slide3.title',
              subtitle: 'hero.slide3.subtitle',
              bgColor: 'bg-gradient-to-br from-green-400 to-green-600',
              order: 3,
              visible: true,
            },
            {
              id: 'slide-4',
              type: 'pink' as const,
              tag: 'hero.slide4.tag',
              title: 'hero.slide4.title',
              subtitle: 'hero.slide4.subtitle',
              bgColor: 'bg-gradient-to-br from-pink-400 to-pink-600',
              order: 4,
              visible: true,
            },
            {
              id: 'slide-5',
              type: 'blue' as const,
              title: 'hero.slide5.title',
              subtitle: 'hero.slide5.subtitle',
              bgColor: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
              order: 5,
              visible: true,
            },
            {
              id: 'slide-6',
              type: 'dark' as const,
              tag: 'hero.slide6.tag',
              title: 'hero.slide6.title',
              subtitle: 'hero.slide6.subtitle',
              bgColor: 'bg-gradient-to-br from-gray-700 to-gray-900',
              order: 6,
              visible: true,
            },
          ],
          categoryMenus: categoryMenus.length > 0 ? categoryMenus : [
            { id: 'cat-1', name: 'category.beauty', categoryId: 'beauty', icon: '💄', href: '/category/beauty', order: 1, visible: true },
            { id: 'cat-2', name: 'category.fashion', categoryId: 'fashion', icon: '👗', href: '/category/fashion', order: 2, visible: true },
            { id: 'cat-3', name: 'category.food', categoryId: 'food', icon: '🍔', href: '/category/food', badge: 'category.badge.hot', order: 3, visible: true },
            { id: 'cat-4', name: 'category.travel', categoryId: 'travel', icon: '✈️', href: '/category/travel', order: 4, visible: true },
            { id: 'cat-5', name: 'category.tech', categoryId: 'tech', icon: '💻', href: '/category/tech', order: 5, visible: true },
            { id: 'cat-6', name: 'category.fitness', categoryId: 'fitness', icon: '💪', href: '/category/fitness', order: 6, visible: true },
            { id: 'cat-7', name: 'category.lifestyle', categoryId: 'lifestyle', icon: '🌱', href: '/category/lifestyle', order: 7, visible: true },
            { id: 'cat-8', name: 'category.pet', categoryId: 'pet', icon: '🐕', href: '/category/pet', order: 8, visible: true },
          ],
          quickLinks: [
            { id: 'quick-1', title: 'quicklink.events', icon: '🎁', link: '/events', order: 1, visible: true },
            { id: 'quick-2', title: 'quicklink.coupons', icon: '🎟️', link: '/coupons', order: 2, visible: true },
            { id: 'quick-3', title: 'quicklink.ranking', icon: '🏆', link: '/ranking', order: 3, visible: true },
          ],
          promoBanner: {
            title: 'promo.title',
            subtitle: 'promo.subtitle',
            icon: '📦',
            visible: true,
          },
          sectionOrder: [
            { id: 'hero', type: 'hero', order: 1, visible: true },
            { id: 'category', type: 'category', order: 2, visible: true },
            { id: 'quicklinks', type: 'quicklinks', order: 3, visible: true },
            { id: 'promo', type: 'promo', order: 4, visible: true },
            { id: 'ranking', type: 'ranking', order: 5, visible: true },
            { id: 'recommended', type: 'recommended', order: 6, visible: true }
          ]
        }
      };

    // 데이터베이스에서 UI 설정 조회 시도
    try {
      const uiConfig = await prisma.siteConfig.findFirst({
        where: { key: 'ui-config' },
      });

      if (uiConfig) {
        return NextResponse.json({ config: JSON.parse(uiConfig.value) });
      }
    } catch (dbError) {
      console.warn('Database connection failed, using default config:', dbError);
    }

    // 기본 설정 반환
    return NextResponse.json({ config: defaultConfig });
  } catch (error) {
    console.error('UI config 조회 오류:', error);
    
    // Fallback to default config defined above
    const defaultConfig = {
      header: {
        logo: {
          text: 'LinkPick',
          imageUrl: null
        },
        menus: [
          { id: 'menu-1', label: 'menu.campaigns', href: '/campaigns', order: 1, visible: true },
          { id: 'menu-2', label: 'menu.influencers', href: '/influencers', order: 2, visible: true },
          { id: 'menu-3', label: 'menu.community', href: '/community', order: 3, visible: true },
          { id: 'menu-4', label: 'menu.pricing', href: '/pricing', order: 4, visible: true },
        ],
        ctaButton: {
          text: 'menu.get_started',
          href: '/register',
          visible: true
        }
      },
      footer: {
        columns: [
          {
            id: 'column-1',
            title: 'footer.service.title',
            order: 1,
            links: [
              { id: 'link-1', label: 'footer.service.find_influencers', href: '/influencers', order: 1, visible: true },
              { id: 'link-2', label: 'footer.service.create_campaign', href: '/campaigns/create', order: 2, visible: true },
            ]
          },
          {
            id: 'column-2',
            title: 'footer.company.title',
            order: 2,
            links: [
              { id: 'link-3', label: 'footer.company.about', href: '/about', order: 1, visible: true },
              { id: 'link-4', label: 'footer.company.contact', href: '/contact', order: 2, visible: true },
            ]
          },
          {
            id: 'column-3',
            title: 'footer.legal.title',
            order: 3,
            links: [
              { id: 'link-5', label: 'footer.legal.terms', href: '/terms', order: 1, visible: true },
              { id: 'link-6', label: 'footer.legal.privacy', href: '/privacy', order: 2, visible: true },
            ]
          }
        ],
        social: [
          { platform: 'twitter', url: 'https://twitter.com/linkpick', visible: true },
          { platform: 'facebook', url: 'https://facebook.com/linkpick', visible: true },
          { platform: 'instagram', url: 'https://instagram.com/linkpick', visible: true }
        ],
        copyright: 'footer.copyright'
      },
      mainPage: {
        heroSlides: [
          {
            id: 'slide-1',
            type: 'blue' as const,
            tag: 'hero.slide1.tag',
            title: 'hero.slide1.title',
            subtitle: 'hero.slide1.subtitle',
            bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
            order: 1,
            visible: true,
          },
          {
            id: 'slide-2',
            type: 'dark' as const,
            title: 'hero.slide2.title',
            subtitle: 'hero.slide2.subtitle',
            bgColor: 'bg-gradient-to-br from-gray-800 to-gray-900',
            order: 2,
            visible: true,
          },
          {
            id: 'slide-3',
            type: 'green' as const,
            title: 'hero.slide3.title',
            subtitle: 'hero.slide3.subtitle',
            bgColor: 'bg-gradient-to-br from-green-400 to-green-600',
            order: 3,
            visible: true,
          },
          {
            id: 'slide-4',
            type: 'pink' as const,
            tag: 'hero.slide4.tag',
            title: 'hero.slide4.title',
            subtitle: 'hero.slide4.subtitle',
            bgColor: 'bg-gradient-to-br from-pink-400 to-pink-600',
            order: 4,
            visible: true,
          },
          {
            id: 'slide-5',
            type: 'blue' as const,
            title: 'hero.slide5.title',
            subtitle: 'hero.slide5.subtitle',
            bgColor: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
            order: 5,
            visible: true,
          },
          {
            id: 'slide-6',
            type: 'dark' as const,
            tag: 'hero.slide6.tag',
            title: 'hero.slide6.title',
            subtitle: 'hero.slide6.subtitle',
            bgColor: 'bg-gradient-to-br from-gray-700 to-gray-900',
            order: 6,
            visible: true,
          },
        ],
        categoryMenus: [
          { id: 'cat-1', name: 'category.beauty', categoryId: 'beauty', icon: '', order: 1, visible: true },
          { id: 'cat-2', name: 'category.fashion', categoryId: 'fashion', icon: '', order: 2, visible: true },
          { id: 'cat-3', name: 'category.food', categoryId: 'food', icon: '', badge: 'badge.hot', order: 3, visible: true },
        ],
        quickLinks: [
          { id: 'quick-1', title: 'quicklink.events', icon: '🎁', link: '/events', order: 1, visible: true },
          { id: 'quick-2', title: 'quicklink.coupons', icon: '🎟️', link: '/coupons', order: 2, visible: true },
          { id: 'quick-3', title: 'quicklink.ranking', icon: '🏆', link: '/ranking', order: 3, visible: true },
        ],
        promoBanner: {
          title: 'promo.title',
          subtitle: 'promo.subtitle',
          icon: '📦',
          visible: true,
        },
        sectionOrder: [
          { id: 'hero', type: 'hero', order: 1, visible: true },
          { id: 'category', type: 'category', order: 2, visible: true },
          { id: 'quicklinks', type: 'quicklinks', order: 3, visible: true },
          { id: 'promo', type: 'promo', order: 4, visible: true },
          { id: 'ranking', type: 'ranking', order: 5, visible: true },
          { id: 'recommended', type: 'recommended', order: 6, visible: true }
        ]
      }
    };
    
    return NextResponse.json({ config: defaultConfig });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.warn('Failed to disconnect Prisma:', e);
    }
  }
}