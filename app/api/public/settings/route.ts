import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/public/settings - 공개 설정 조회 (인증 불필요)
export async function GET() {
  try {
    // 공개적으로 접근 가능한 설정만 조회
    const publicSettings = await prisma.siteConfig.findMany({
      where: {
        key: {
          in: ['general', 'website', 'social', 'features']
        }
      }
    });

    // 설정이 없는 경우 기본값 반환
    if (publicSettings.length === 0) {
      const defaultPublicSettings = {
        general: {
          siteName: 'LinkPick',
          siteDescription: '인플루언서와 브랜드를 연결하는 플랫폼',
          language: 'ko',
          timezone: 'Asia/Seoul'
        },
        website: {
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          logo: '/logo.svg',
          favicon: '/favicon.ico',
          themeMode: 'light'
        },
        social: {
          facebook: 'https://facebook.com/linkpick',
          twitter: 'https://twitter.com/linkpick',
          instagram: 'https://instagram.com/linkpick',
          youtube: ''
        },
        features: {
          userRegistration: true,
          socialLogin: true,
          newsletter: true,
          comments: true,
          reviews: true
        }
      };

      return NextResponse.json({
        success: true,
        settings: defaultPublicSettings,
        source: 'default'
      });
    }

    // 설정 데이터를 파싱하여 반환 (민감한 정보 제외)
    const parsedSettings = publicSettings.reduce((acc, setting) => {
      try {
        const parsedValue = JSON.parse(setting.value);
        
        // 민감한 정보 필터링
        if (setting.key === 'general') {
          // adminEmail 등 민감한 정보 제외
          const { adminEmail, ...safeGeneral } = parsedValue;
          acc[setting.key] = safeGeneral;
        } else {
          acc[setting.key] = parsedValue;
        }
      } catch (e) {
        console.warn(`Failed to parse public setting ${setting.key}:`, e);
        acc[setting.key] = setting.value;
      }
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      settings: parsedSettings,
      source: 'database'
    });

  } catch (error) {
    console.error('Public settings fetch error:', error);
    
    // 에러 발생 시 기본값 반환
    const fallbackSettings = {
      general: {
        siteName: 'LinkPick',
        siteDescription: '인플루언서와 브랜드를 연결하는 플랫폼',
        language: 'ko'
      },
      website: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        logo: '/logo.svg',
        themeMode: 'light'
      },
      social: {
        facebook: '',
        twitter: '',
        instagram: '',
        youtube: ''
      },
      features: {
        userRegistration: true,
        socialLogin: true,
        newsletter: true
      }
    };

    return NextResponse.json({
      success: true,
      settings: fallbackSettings,
      source: 'fallback',
      warning: 'Using fallback settings due to database error'
    });
  }
}