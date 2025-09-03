/**
 * 진열 A/B 테스트 관리 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { displayTemplateService } from '@/lib/services/display/display-template'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// A/B 테스트 목록 조회
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
    const status = searchParams.get('status')
    const position = searchParams.get('position')

    const where: any = {}
    if (status) where.status = status
    if (position) where.position = position

    const tests = await query({
      where,
      include: {
        variants: {
          include: {
            template: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 성능 데이터 추가
    const testsWithPerformance: any[] = []
    
    for (const test of tests) {
      const testPerformance: any = {
        ...test,
        variants: []
      }

      for (const variant of test.variants) {
        const performance = await displayTemplateService.analyzePerformance(
          variant.templateId,
          {
            start: test.startDate,
            end: test.endDate || new Date()
          }
        )

        testPerformance.variants.push({
          ...variant,
          performance
        })
      }

      testsWithPerformance.push(testPerformance)
    }

    return NextResponse.json({
      success: true,
      data: testsWithPerformance
    })
  } catch (error: any) {

    return NextResponse.json(
      { error: error.message || 'Failed to fetch A/B tests' },
      { status: 500 }
    )
  }
}

// A/B 테스트 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      position,
      variants,
      duration,
      description,
      hypothesis,
      successMetric = 'CVR'
    } = body

    if (!name || !position || !variants || variants.length < 2) {
      return NextResponse.json(
        { error: 'Name, position, and at least 2 variants are required' },
        { status: 400 }
      )
    }

    // 가중치 합계 확인
    const totalWeight = variants.reduce((sum: number, v: any) => sum + v.weight, 0)
    if (Math.abs(totalWeight - 100) > 0.01) {
      return NextResponse.json(
        { error: 'Variant weights must sum to 100' },
        { status: 400 }
      )
    }

    const test = await displayTemplateService.createABTest({
      name,
      position,
      variants,
      duration: duration || 14
    })

    // 추가 메타데이터 저장
    await query({
      where: { id: test.id },
      data: {
        metadata: {
          description,
          hypothesis,
          successMetric,
          createdBy: session.user.email
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: test,
      message: 'A/B 테스트가 생성되었습니다.'
    })
  } catch (error: any) {

    return NextResponse.json(
      { error: error.message || 'Failed to create A/B test' },
      { status: 500 }
    )
  }
}

// A/B 테스트 상태 변경
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { testId, status, winnerVariantId } = body

    if (!testId || !status) {
      return NextResponse.json(
        { error: 'Test ID and status are required' },
        { status: 400 }
      )
    }

    const validStatuses = ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const updateData: any = { status }

    if (status === 'COMPLETED') {
      updateData.endDate = new Date()
      
      if (winnerVariantId) {
        updateData.winnerVariantId = winnerVariantId
        
        // 승리한 변형을 활성 템플릿으로 설정
        const winnerVariant = await query({
          where: { id: winnerVariantId },
          include: { template: true }
        })

        if (winnerVariant) {
          // 다른 모든 변형 비활성화
          const test = await query({
            where: { id: testId },
            include: { variants: true }
          })

          if (test) {
            for (const variant of test.variants) {
              await query({
                where: { id: variant.templateId },
                data: { 
                  isActive: variant.id === winnerVariantId,
                  priority: variant.id === winnerVariantId ? 100 : 0
                }
              })
            }
          }
        }
      }
    }

    const test = await query({
      where: { id: testId },
      data: updateData,
      include: {
        variants: {
          include: {
            template: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: test,
      message: `A/B 테스트가 ${status === 'COMPLETED' ? '완료' : '업데이트'}되었습니다.`
    })
  } catch (error: any) {

    return NextResponse.json(
      { error: error.message || 'Failed to update A/B test' },
      { status: 500 }
    )
  }
}

// 사용자별 A/B 테스트 변형 할당
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { position, userId, sessionId } = body

    if (!position) {
      return NextResponse.json(
        { error: 'Position is required' },
        { status: 400 }
      )
    }

    // 활성 A/B 테스트 조회
    const activeTests = await query({
      where: {
        position,
        status: 'ACTIVE',
        startDate: { lte: new Date() },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      },
      include: {
        variants: {
          include: {
            template: true
          }
        }
      },
      orderBy: { priority: 'desc' }
    })

    if (activeTests.length === 0) {
      return NextResponse.json({
        success: true,
        data: { template: null, variant: null }
      })
    }

    const test = activeTests[0] // 최고 우선순위 테스트

    // 기존 할당 확인
    const identifier = userId || sessionId
    if (identifier) {
      const existingAssignment = await query({
        where: {
          testId: test.id,
          OR: [
            { userId },
            { sessionId }
          ]
        },
        include: {
          variant: {
            include: {
              template: true
            }
          }
        }
      })

      if (existingAssignment) {
        return NextResponse.json({
          success: true,
          data: {
            template: existingAssignment.variant.template,
            variant: existingAssignment.variant,
            testId: test.id
          }
        })
      }
    }

    // 새로운 할당
    const selectedVariant = selectVariantByWeight(test.variants)
    
    if (identifier) {
      await query({
        data: {
          testId: test.id,
          variantId: selectedVariant.id,
          userId,
          sessionId
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        template: selectedVariant.template,
        variant: selectedVariant,
        testId: test.id
      }
    })
  } catch (error: any) {

    return NextResponse.json(
      { error: error.message || 'Failed to assign A/B test variant' },
      { status: 500 }
    )
  }
}

// 가중치 기반 변형 선택
function selectVariantByWeight(variants: any[]): any {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)
  const random = Math.random() * totalWeight
  
  let currentWeight = 0
  for (const variant of variants) {
    currentWeight += variant.weight
    if (random <= currentWeight) {
      return variant
    }
  }
  
  return variants[0] // 폴백
}