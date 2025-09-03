// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // Check for setup key
  const setupKey = request.nextUrl.searchParams.get('key')
  if (setupKey !== 'emarketkorea-setup-2025') {
    return NextResponse.json({ error: 'Invalid setup key' }, { status: 401 })
  }

  try {

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123!@#', 10)
    const admin = await query({
      where: { email: 'admin@emarketkorea.co.kr' },
      update: {},
      create: {
        email: 'admin@emarketkorea.co.kr',
        password: adminPassword,
        name: 'E-Market Korea Admin',
        type: 'ADMIN',
      }
    })

    // Create test business user
    const businessPassword = await bcrypt.hash('business123', 10)
    const businessUser = await query({
      where: { email: 'business@company.com' },
      update: {},
      create: {
        email: 'business@company.com',
        password: businessPassword,
        name: '테스트 기업',
        type: 'BUSINESS',
        businessProfile: {
          create: {
            companyName: '테스트 주식회사',
            businessNumber: '123-45-67890',
            representativeName: '김대표',
            businessAddress: '서울특별시 강남구 테헤란로 123',
            businessCategory: '이커머스',
          }
        }
      }
    })

    // Create test influencer user
    const influencerPassword = await bcrypt.hash('user123', 10)
    const influencerUser = await query({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        password: influencerPassword,
        name: '테스트 인플루언서',
        type: 'INFLUENCER',
        profile: {
          create: {
            bio: '패션과 라이프스타일을 공유하는 인플루언서입니다.',
            instagram: '@test_influencer',
            instagramFollowers: 50000,
            youtube: 'TestInfluencer',
            youtubeSubscribers: 30000,
            categories: JSON.stringify(['패션', '라이프스타일']),
          }
        }
      }
    })

    // Create sample campaign
    const campaign = await query({
      data: {
        businessId: businessUser.id,
        title: 'E-Market Korea 런칭 기념 이벤트',
        description: 'E-Market Korea 플랫폼 런칭을 기념하는 특별 이벤트입니다. 외국인 노동자들에게 필수 생활용품을 합리적인 가격에 제공합니다.',
        platform: 'INSTAGRAM',
        budget: 5000000,
        targetFollowers: 10000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        requirements: '- 팔로워 1만명 이상\n- 참여율 3% 이상\n- 고품질 콘텐츠 제작 가능',
        hashtags: JSON.stringify(['EMarketKorea', '외국인노동자', '중고거래', '런칭이벤트']),
        status: 'ACTIVE',
        isPaid: true,
      }
    })

    // Create site configuration
    await query({
      where: { key: 'ui-config' },
      update: {},
      create: {
        key: 'ui-config',
        value: JSON.stringify({
          header: {
            menus: [
              { id: '1', label: '캠페인', href: '/campaigns', order: 0 },
              { id: '2', label: '인플루언서', href: '/influencers', order: 1 },
              { id: '3', label: '커뮤니티', href: '/community', order: 2 },
              { id: '4', label: '요금제', href: '/pricing', order: 3 },
            ]
          },
          footer: {
            columns: [
              {
                id: '1',
                title: '서비스',
                order: 0,
                links: [
                  { id: '1-1', label: '서비스 소개', href: '/about', order: 0 },
                  { id: '1-2', label: '이용 가이드', href: '/guide', order: 1 },
                  { id: '1-3', label: '요금제', href: '/pricing', order: 2 },
                ]
              },
              {
                id: '2',
                title: '고객지원',
                order: 1,
                links: [
                  { id: '2-1', label: '공지사항', href: '/notices', order: 0 },
                  { id: '2-2', label: 'FAQ', href: '/faq', order: 1 },
                  { id: '2-3', label: '문의하기', href: '/contact', order: 2 },
                ]
              },
              {
                id: '3',
                title: '정책',
                order: 2,
                links: [
                  { id: '3-1', label: '이용약관', href: '/terms', order: 0 },
                  { id: '3-2', label: '개인정보처리방침', href: '/privacy', order: 1 },
                ]
              }
            ]
          }
        })
      }
    })

    const result = {
      message: '✅ Production database setup completed!',
      users: [
        { email: 'admin@emarketkorea.co.kr', password: 'admin123!@#', type: 'Admin' },
        { email: 'business@company.com', password: 'business123!', type: 'Business' },
        { email: 'user@example.com', password: 'influencer123!', type: 'Influencer' }
      ],
      campaign: campaign.title
    }

    return NextResponse.json(result)
  } catch (error) {

    return NextResponse.json({ error: 'Failed to setup database', details: error }, { status: 500 })
  }
}