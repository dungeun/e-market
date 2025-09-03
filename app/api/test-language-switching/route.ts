// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const testLang = searchParams.get('lang') || 'ko';

    // Test comprehensive language switching across all three languages
    const testKeys = [
      'menu.campaigns',
      'menu.influencers', 
      'menu.community',
      'menu.pricing',
      'hero.slide1.title',
      'hero.slide1.subtitle',
      'category.beauty',
      'category.fashion',
      'category.food'
    ];

    const languagePacks = await query({
      where: {
        languageCode: testLang,
        key: {
          in: testKeys
        },
        isActive: true
      },
      select: {
        key: true,
        value: true,
        languageCode: true
      },
      orderBy: {
        key: 'asc'
      }
    });

    // Get counts for all languages
    const allLanguageCounts = await prisma.languagePack.groupBy({
      by: ['languageCode'],
      where: {
        isActive: true
      },
      _count: {
        key: true
      }
    });

    const translationMap = languagePacks.reduce((acc, pack) => {
      acc[pack.key] = pack.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      language: testLang,
      message: `Language switching test for ${testLang.toUpperCase()}`,
      translationsFound: languagePacks.length,
      expectedKeys: testKeys.length,
      coverage: `${Math.round((languagePacks.length / testKeys.length) * 100)}%`,
      allLanguageCounts: allLanguageCounts.reduce((acc, count) => {
        acc[count.languageCode] = count._count.key;
        return acc;
      }, {} as Record<string, number>),
      sampleTranslations: {
        menu: {
          campaigns: translationMap['menu.campaigns'],
          influencers: translationMap['menu.influencers'],
          community: translationMap['menu.community'],
          pricing: translationMap['menu.pricing']
        },
        hero: {
          title: translationMap['hero.slide1.title'],
          subtitle: translationMap['hero.slide1.subtitle']
        },
        categories: {
          beauty: translationMap['category.beauty'],
          fashion: translationMap['category.fashion'],
          food: translationMap['category.food']
        }
      },
      status: languagePacks.length === testKeys.length ? 
        'Complete language pack - all translations available' : 
        `Partial language pack - ${languagePacks.length}/${testKeys.length} translations found`,
      nextSteps: [
        'Test language switching in browser',
        'Verify UI updates properly',
        'Check localStorage persistence',
        'Validate React Context updates'
      ]
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Language switching test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}