// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }
    const { user } = authResult

    // DB에서 설정 조회
    const settingKeys = [
      'general',
      'website', 
      'payments',
      'content',
      'notifications',
      'security',
      'legal'
    ]

    const settings: Record<string, any> = {}
    
    // 각 설정 키에 대해 DB 조회
    for (const key of settingKeys) {
      const config = await query({
        where: { key }
      })
      
      if (config) {
        try {
          settings[key] = JSON.parse(config.value)
        } catch (e) {
          // JSON 파싱 실패 시 문자열 그대로 사용
          settings[key] = config.value
        }
      }
    }

    // 설정이 없으면 기본값 사용
    const defaultSettings = {
      general: {
        siteName: 'E-Market Korea',
        siteDescription: '해외 노동자를 위한 중고 거래 플랫폼',
        supportEmail: 'support@emarketkorea.com',
        maintenanceMode: false,
        registrationEnabled: true,
        emailVerificationRequired: true
      },
      website: {
        logo: '/logo.svg',
        favicon: '/favicon.svg',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        footerEnabled: true,
        footerText: '© 2024 E-Market Korea. All rights reserved.',
        footerLinks: [
          { title: '이용약관', url: '/terms', newWindow: false },
          { title: '개인정보처리방침', url: '/privacy', newWindow: false },
          { title: '고객지원', url: '/support', newWindow: false },
          { title: '회사소개', url: '/about', newWindow: false }
        ],
        socialLinks: {
          facebook: 'https://facebook.com/emarketkorea',
          twitter: 'https://twitter.com/emarketkorea',
          instagram: 'https://instagram.com/emarketkorea',
          youtube: 'https://youtube.com/emarketkorea',
          linkedin: 'https://linkedin.com/company/emarketkorea'
        },
        seo: {
          metaTitle: 'E-Market Korea - 해외 노동자를 위한 중고 거래 플랫폼',
          metaDescription: '한국에서 생활하는 외국인 노동자들을 위한 필수품 중고 거래 플랫폼입니다.',
          metaKeywords: '중고거래, 외국인노동자, 전자제품, 가전제품, 생활용품, 한국, 거래',
          ogImage: '/og-image.svg'
        },
        analytics: {
          googleAnalyticsId: '',
          facebookPixelId: '',
          hotjarId: ''
        }
      },
      payments: {
        platformFeeRate: 15,
        minimumPayout: 10000,
        paymentMethods: ['bank_transfer', 'paypal'],
        autoPayoutEnabled: true,
        payoutSchedule: 'monthly'
      },
      content: {
        maxFileSize: 10,
        allowedFileTypes: ['jpg', 'png', 'gif', 'mp4', 'mov'],
        contentModerationEnabled: true,
        autoApprovalEnabled: false,
        maxCampaignDuration: 90
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        notificationDelay: 5
      },
      legal: {
        termsOfService: '',
        privacyPolicy: '',
        termsLastUpdated: new Date().toISOString().split('T')[0],
        privacyLastUpdated: new Date().toISOString().split('T')[0]
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

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }
    const { user } = authResult

    const newSettings = await request.json()
    
    // 각 설정 항목을 DB에 저장
    for (const [key, value] of Object.entries(newSettings)) {
      const jsonValue = typeof value === 'string' ? value : JSON.stringify(value)
      
      await query({
        where: { key },
        update: { value: jsonValue },
        create: { key, value: jsonValue }
      })
    }

    return NextResponse.json({
      success: true,
      message: '설정이 성공적으로 저장되었습니다.'
    })

  } catch (error) {

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}