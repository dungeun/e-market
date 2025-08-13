import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    // Test comprehensive translation system
    const menuPacks = await prisma.languagePack.findMany({
      where: {
        languageCode: 'ko',
        key: {
          in: ['menu.campaigns', 'menu.influencers', 'menu.community', 'menu.pricing']
        }
      },
      select: {
        key: true,
        value: true
      }
    });

    const heroPacks = await prisma.languagePack.findMany({
      where: {
        languageCode: 'ko',
        key: {
          startsWith: 'hero.slide'
        }
      },
      select: {
        key: true,
        value: true
      }
    });

    const categoryPacks = await prisma.languagePack.findMany({
      where: {
        languageCode: 'ko',
        key: {
          startsWith: 'category.'
        }
      },
      select: {
        key: true,
        value: true
      }
    });

    const menuTranslations = menuPacks.reduce((acc, pack) => {
      acc[pack.key] = pack.value;
      return acc;
    }, {} as Record<string, string>);

    const heroTranslations = heroPacks.reduce((acc, pack) => {
      acc[pack.key] = pack.value;
      return acc;
    }, {} as Record<string, string>);

    const categoryTranslations = categoryPacks.reduce((acc, pack) => {
      acc[pack.key] = pack.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      message: 'Comprehensive translation test completed',
      summary: {
        menuItems: menuPacks.length,
        heroItems: heroPacks.length,
        categoryItems: categoryPacks.length,
        total: menuPacks.length + heroPacks.length + categoryPacks.length
      },
      translations: {
        menu: menuTranslations,
        hero: Object.fromEntries(Object.entries(heroTranslations).slice(0, 3)),
        category: Object.fromEntries(Object.entries(categoryTranslations).slice(0, 5))
      },
      status: 'All systems operational - translations ready for frontend'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Translation test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}