/**
 * 진열 템플릿 관리 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { displayTemplateService } from '@/lib/services/display/display-template'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 템플릿 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    const includeInactive = searchParams.get('includeInactive') === 'true'
    
    let templates
    
    if (position) {
      // 특정 위치의 템플릿 조회
      templates = await displayTemplateService.getActiveTemplatesForPosition(
        position as any,
        {
          deviceType: searchParams.get('deviceType') || undefined,
          location: searchParams.get('location') || undefined
        }
      )
    } else {
      // 전체 템플릿 조회 (관리자용)
      const session = await getServerSession(authOptions)
      
      if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      }
      
      templates = await query({
        where: includeInactive ? {} : { isActive: true },
        orderBy: [
          { position: 'asc' },
          { priority: 'desc' }
        ],
        include: {
          _count: {
            select: {
              events: true,
              sections: true
            }
          }
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      data: templates
    })
  } catch (error: any) {

    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// 템플릿 생성
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
      type,
      position,
      config,
      schedule,
      targeting,
      priority = 0
    } = body

    if (!name || !type || !position) {
      return NextResponse.json(
        { error: 'Name, type, and position are required' },
        { status: 400 }
      )
    }

    const template = await displayTemplateService.createTemplate({
      name,
      type,
      position,
      config,
      schedule,
      targeting
    })

    // 우선순위 설정
    if (priority !== 0) {
      await query({
        where: { id: template.id },
        data: { priority }
      })
    }

    return NextResponse.json({
      success: true,
      data: template,
      message: '템플릿이 생성되었습니다.'
    })
  } catch (error: any) {

    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    )
  }
}

// 템플릿 수정
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
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const template = await query({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: template,
      message: '템플릿이 수정되었습니다.'
    })
  } catch (error: any) {

    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: 500 }
    )
  }
}

// 템플릿 삭제
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    await query({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '템플릿이 삭제되었습니다.'
    })
  } catch (error: any) {

    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: 500 }
    )
  }
}