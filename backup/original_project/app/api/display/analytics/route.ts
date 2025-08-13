/**
 * 진열 성능 분석 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { displayTemplateService } from '@/lib/services/display/display-template'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 진열 성능 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('templateId')
    const position = searchParams.get('position')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const period = searchParams.get('period') || '7d'

    if (!templateId && !position) {
      return NextResponse.json(
        { error: 'Template ID or position is required' },
        { status: 400 }
      )
    }

    // 기간 계산
    const end = endDate ? new Date(endDate) : new Date()
    let start: Date

    if (startDate) {
      start = new Date(startDate)
    } else {
      start = new Date()
      switch (period) {
        case '1d':
          start.setDate(start.getDate() - 1)
          break
        case '7d':
          start.setDate(start.getDate() - 7)
          break
        case '30d':
          start.setDate(start.getDate() - 30)
          break
        case '90d':
          start.setDate(start.getDate() - 90)
          break
        default:
          start.setDate(start.getDate() - 7)
      }
    }

    let analytics

    if (templateId) {
      // 특정 템플릿 성능 분석
      analytics = await displayTemplateService.analyzePerformance(templateId, {
        start,
        end
      })

      // 상세 이벤트 데이터
      const events = await prisma.displayEvent.groupBy({
        by: ['type'],
        where: {
          templateId,
          createdAt: {
            gte: start,
            lte: end
          }
        },
        _count: {
          id: true
        }
      })

      // 시간별 트렌드
      const hourlyTrend = await prisma.displayEvent.groupBy({
        by: ['createdAt'],
        where: {
          templateId,
          createdAt: {
            gte: start,
            lte: end
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      analytics = {
        ...analytics,
        events,
        trend: hourlyTrend
      }
    } else if (position) {
      // 위치별 전체 성능 분석
      const templates = await prisma.displayTemplate.findMany({
        where: { position: position as any, isActive: true }
      })

      const positionAnalytics: any[] = []

      for (const template of templates) {
        const performance = await displayTemplateService.analyzePerformance(
          template.id,
          { start, end }
        )

        positionAnalytics.push({
          templateId: template.id,
          templateName: template.name,
          templateType: template.type,
          performance
        })
      }

      analytics = {
        position,
        templates: positionAnalytics,
        summary: {
          totalImpressions: positionAnalytics.reduce((sum, a) => sum + a.performance.impressions, 0),
          totalClicks: positionAnalytics.reduce((sum, a) => sum + a.performance.clicks, 0),
          totalConversions: positionAnalytics.reduce((sum, a) => sum + a.performance.conversions, 0),
          totalRevenue: positionAnalytics.reduce((sum, a) => sum + a.performance.revenue, 0),
          avgCTR: 0,
          avgCVR: 0
        }
      }

      // 평균 CTR, CVR 계산
      analytics.summary.avgCTR = analytics.summary.totalImpressions > 0 
        ? (analytics.summary.totalClicks / analytics.summary.totalImpressions) * 100 
        : 0

      analytics.summary.avgCVR = analytics.summary.totalClicks > 0 
        ? (analytics.summary.totalConversions / analytics.summary.totalClicks) * 100 
        : 0
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      period: { start, end }
    })
  } catch (error: any) {
    console.error('Display analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

// 이벤트 추적
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      templateId,
      type,
      productId,
      userId,
      metadata = {}
    } = body

    if (!templateId || !type) {
      return NextResponse.json(
        { error: 'Template ID and event type are required' },
        { status: 400 }
      )
    }

    // 이벤트 유효성 검사
    const validTypes = ['IMPRESSION', 'CLICK', 'CONVERSION', 'WISHLIST', 'CART_ADD']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      )
    }

    // 중복 이벤트 방지 (같은 사용자의 같은 상품에 대한 같은 이벤트)
    if (userId && productId && type !== 'IMPRESSION') {
      const recentEvent = await prisma.displayEvent.findFirst({
        where: {
          templateId,
          type,
          productId,
          userId,
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000) // 5분 내 중복 방지
          }
        }
      })

      if (recentEvent) {
        return NextResponse.json({
          success: true,
          message: 'Event already tracked'
        })
      }
    }

    // 이벤트 생성
    const event = await prisma.displayEvent.create({
      data: {
        templateId,
        type,
        productId,
        userId,
        metadata,
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    // 전환 이벤트인 경우 주문과 연결
    if (type === 'CONVERSION' && productId) {
      // 최근 주문에서 해당 상품을 포함한 주문 찾기
      if (userId) {
        const recentOrder = await prisma.order.findFirst({
          where: {
            userId,
            items: {
              some: {
                productId
              }
            },
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24시간 내
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        })

        if (recentOrder) {
          await prisma.displayEvent.update({
            where: { id: event.id },
            data: {
              orderId: recentOrder.id,
              metadata: {
                ...metadata,
                orderAmount: recentOrder.total
              }
            }
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { eventId: event.id }
    })
  } catch (error: any) {
    console.error('Event tracking error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to track event' },
      { status: 500 }
    )
  }
}

// 대시보드용 요약 통계
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'

    // 기간 계산
    const end = new Date()
    const start = new Date()
    
    switch (period) {
      case '1d':
        start.setDate(start.getDate() - 1)
        break
      case '7d':
        start.setDate(start.getDate() - 7)
        break
      case '30d':
        start.setDate(start.getDate() - 30)
        break
      default:
        start.setDate(start.getDate() - 7)
    }

    // 전체 성능 요약
    const totalEvents = await prisma.displayEvent.groupBy({
      by: ['type'],
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      _count: {
        id: true
      }
    })

    // 템플릿별 성능
    const templatePerformance = await prisma.displayEvent.groupBy({
      by: ['templateId'],
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    // 위치별 성능
    const positionPerformance = await prisma.displayTemplate.findMany({
      include: {
        _count: {
          select: {
            events: {
              where: {
                createdAt: {
                  gte: start,
                  lte: end
                }
              }
            }
          }
        }
      }
    })

    const dashboard = {
      summary: {
        totalImpressions: totalEvents.find(e => e.type === 'IMPRESSION')?._count.id || 0,
        totalClicks: totalEvents.find(e => e.type === 'CLICK')?._count.id || 0,
        totalConversions: totalEvents.find(e => e.type === 'CONVERSION')?._count.id || 0,
        totalWishlists: totalEvents.find(e => e.type === 'WISHLIST')?._count.id || 0,
        totalCartAdds: totalEvents.find(e => e.type === 'CART_ADD')?._count.id || 0,
        ctr: 0,
        cvr: 0
      },
      topTemplates: templatePerformance,
      positionBreakdown: positionPerformance.map(p => ({
        position: p.position,
        templateCount: 1,
        totalEvents: p._count.events
      }))
    }

    // CTR, CVR 계산
    dashboard.summary.ctr = dashboard.summary.totalImpressions > 0 
      ? (dashboard.summary.totalClicks / dashboard.summary.totalImpressions) * 100 
      : 0

    dashboard.summary.cvr = dashboard.summary.totalClicks > 0 
      ? (dashboard.summary.totalConversions / dashboard.summary.totalClicks) * 100 
      : 0

    return NextResponse.json({
      success: true,
      data: dashboard,
      period: { start, end }
    })
  } catch (error: any) {
    console.error('Dashboard analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard analytics' },
      { status: 500 }
    )
  }
}