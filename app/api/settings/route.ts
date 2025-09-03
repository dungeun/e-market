// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 공개적으로 접근 가능한 설정만 반환
    const publicSettings = {
      website: {
        logo: '/logo.png',
        favicon: '/favicon.ico',
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
          ogImage: '/og-image.jpg'
        }
      },
      general: {
        siteName: 'E-Market Korea',
        siteDescription: '해외 노동자를 위한 중고 거래 플랫폼'
      }
    }

    return NextResponse.json({
      settings: publicSettings
    })

  } catch (error) {

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}