/**
 * 진열 섹션 관리 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { displayTemplateService } from '@/lib/services/display/display-template'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'


// 섹션별 상품 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('templateId')
    const position = searchParams.get('position')
    const userId = searchParams.get('userId')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const sortBy = searchParams.get('sortBy') || 'popularity'
    const personalized = searchParams.get('personalized') === 'true'

    if (!templateId && !position) {
      return NextResponse.json(
        { error: 'Template ID or position is required' },
        { status: 400 }
      )
    }

    let template
    
    if (templateId) {
      // 특정 템플릿으로 조회
      template = await query({
        where: { id: templateId }
      })
    } else if (position) {
      // 위치별 활성 템플릿 조회
      const templates = await displayTemplateService.getActiveTemplatesForPosition(
        position as any,
        { userId: userId || undefined }
      )
      template = templates[0] // 최고 우선순위 템플릿
    }

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // 템플릿 연결된 섹션 조회
    const sections = await query({
      where: { templateId: template.id },
      include: {
        products: {
          include: {
            category: true,
            Inventory: true,
            _count: {
              select: {
                reviews: true
              }
            }
          }
        }
      },
      orderBy: { priority: 'desc' }
    })

    // 동적 상품 선택이 필요한 경우
    if (sections.length === 0) {
      // 기본 상품 조회 로직
      const products = await query({
        where: { status: 'ACTIVE' },
        include: {
          category: true,
          Inventory: true,
          _count: {
            select: {
              reviews: true
            }
          }
        },
        take: limit || 20
      })

      const arrangedProducts = await displayTemplateService.arrangeProducts(
        template.id,
        products,
        {
          sortBy: sortBy as any,
          limit,
          personalized,
          userId: userId || undefined
        }
      )

      return NextResponse.json({
        success: true,
        data: {
          template,
          sections: [{
            id: 'default',
            title: '추천 상품',
            products: arrangedProducts
          }]
        }
      })
    }

    // 기존 섹션의 상품 재배치
    const processedSections: any[] = []
    
    for (const section of sections) {
      const arrangedProducts = await displayTemplateService.arrangeProducts(
        template.id,
        section.products,
        {
          sortBy: sortBy as any,
          limit,
          personalized,
          userId: userId || undefined
        }
      )

      processedSections.push({
        ...section,
        products: arrangedProducts
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        template,
        sections: processedSections
      }
    })
  } catch (error: any) {
    console.error('Display sections error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sections' },
      { status: 500 }
    )
  }
}

// 동적 섹션 생성
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
      title,
      position,
      rules,
      templateType,
      config,
      priority = 0
    } = body

    if (!title || !position || !rules || !templateType) {
      return NextResponse.json(
        { error: 'Title, position, rules, and template type are required' },
        { status: 400 }
      )
    }

    const result = await displayTemplateService.createDynamicSection({
      title,
      position,
      rules,
      templateType,
      config
    })

    // 우선순위 설정
    if (priority !== 0) {
      await query({
        where: { id: result.section.id },
        data: { priority }
      })
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: '동적 섹션이 생성되었습니다.'
    })
  } catch (error: any) {
    console.error('Dynamic section creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create dynamic section' },
      { status: 500 }
    )
  }
}

// 섹션 수정
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, productIds, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Section ID is required' },
        { status: 400 }
      )
    }

    const section = await query({
      where: { id },
      data: {
        ...updateData,
        ...(productIds && {
          products: {
            set: productIds.map((id: string) => ({ id }))
          }
        })
      },
      include: {
        products: true
      }
    })

    return NextResponse.json({
      success: true,
      data: section,
      message: '섹션이 수정되었습니다.'
    })
  } catch (error: any) {
    console.error('Section update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update section' },
      { status: 500 }
    )
  }
}