import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/settings - 일반 설정 조회
export async function GET() {
  try {
    // 기본 사이트 설정 조회
    const settings = await prisma.siteConfig.findMany({
      where: {
        OR: [
          { key: 'general' },
          { key: 'website' },
          { key: 'social' },
          { key: 'features' }
        ]
      }
    });

    // 설정이 없는 경우 기본값 반환
    if (settings.length === 0) {
      const defaultSettings = {
        general: {
          siteName: 'LinkPick',
          siteDescription: '인플루언서와 브랜드를 연결하는 플랫폼',
          adminEmail: 'admin@linkpick.co.kr',
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
          emailVerification: true,
          socialLogin: true,
          newsletter: true,
          comments: true,
          reviews: true
        }
      };

      return NextResponse.json({
        success: true,
        settings: defaultSettings
      });
    }

    // 설정 데이터를 파싱하여 반환
    const parsedSettings = settings.reduce((acc, setting) => {
      try {
        acc[setting.key] = JSON.parse(setting.value);
      } catch (e) {
        console.warn(`Failed to parse setting ${setting.key}:`, e);
        acc[setting.key] = setting.value;
      }
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      settings: parsedSettings
    });

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/settings - 설정 업데이트 (관리자만)
export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Key and value are required'
      }, { status: 400 });
    }

    // 설정 업데이트 또는 생성
    const updatedSetting = await prisma.siteConfig.upsert({
      where: { key },
      update: { 
        value: typeof value === 'string' ? value : JSON.stringify(value),
        updatedAt: new Date()
      },
      create: {
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value)
      }
    });

    return NextResponse.json({
      success: true,
      setting: updatedSetting
    });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}