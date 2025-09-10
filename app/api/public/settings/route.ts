import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/public/settings - 공개 설정 조회 (인증 불필요)
export async function GET(request: NextRequest) {
  try {
    // 공개적으로 접근 가능한 설정만 조회
    const publicSettingKeys = [
      'general',
      'store',
      'website',
      'footer',
      'seo'
    ]

    const settings: Record<string, any> = {}
    
    // 각 설정 키에 대해 DB 조회
    for (const key of publicSettingKeys) {
      try {
        const result = await query(
          'SELECT value FROM site_settings WHERE key = $1',
          [key]
        )
        
        if (result.rows.length > 0) {
          settings[key] = result.rows[0].value
        }
      } catch (e) {
        console.error(`Failed to fetch setting for key ${key}:`, e)
      }
    }

    // 설정이 없으면 기본값 사용
    const defaultSettings = {
      general: {
        siteName: 'Commerce Store',
        siteDescription: '최고의 온라인 쇼핑 경험을 제공합니다.',
        supportEmail: 'support@example.com',
        maintenanceMode: false,
        registrationEnabled: true,
        emailVerificationRequired: true
      },
      store: {
        storeName: 'Commerce Store',
        storeEmail: 'store@example.com',
        storePhone: '02-1234-5678',
        storeAddress: '서울시 강남구 테헤란로 123',
        businessNumber: '123-45-67890',
        ceoName: '홍길동',
        onlineBusinessNumber: '2024-서울강남-1234',
        facebook: 'https://facebook.com/commercestore',
        instagram: 'https://instagram.com/commercestore',
        twitter: 'https://twitter.com/commercestore',
        youtube: 'https://youtube.com/commercestore'
      },
      website: {
        logo: '/logo.png',
        favicon: '/favicon.ico',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        footerEnabled: true,
        footerText: '© 2024 Commerce Store. All rights reserved.',
        footerLinks: [],
        socialLinks: {
          facebook: '',
          twitter: '',
          instagram: '',
          youtube: '',
          linkedin: ''
        },
        seo: {
          metaTitle: 'Commerce Store',
          metaDescription: '최고의 온라인 쇼핑 경험을 제공합니다.',
          metaKeywords: '온라인쇼핑, 이커머스, 전자상거래',
          ogImage: '/og-image.png'
        },
        analytics: {
          googleAnalyticsId: '',
          facebookPixelId: '',
          hotjarId: ''
        }
      },
      seo: {
        enableSitemap: true,
        enableRobots: true,
        googleAnalytics: '',
        naverWebmaster: '',
        googleSearchConsole: ''
      }
    }

    // DB 설정과 기본값 병합
    const mergedSettings = {
      ...defaultSettings,
      ...settings
    }
    
    return NextResponse.json({
      settings: mergedSettings
    })

  } catch (error) {
    console.error('Failed to fetch public settings:', error)
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    )
  }
}