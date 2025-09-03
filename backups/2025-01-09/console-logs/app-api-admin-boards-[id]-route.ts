// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth } from '@/lib/auth/middleware'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// PATCH /api/admin/boards/[id] - 게시판 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withAuth(request)
    if ('error' in authResult) {
      return authResult.error
    }
    
    const { user } = authResult
    
    // 관리자 권한 확인
    if (user.type !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, category, visibility, status, settings } = body
    const { id } = await params

    // Mock 게시판 업데이트 (board 테이블이 없음)
    const board = {
      id,
      name: name || 'Mock Board',
      description: description || 'Mock Description',
      category: category || 'general',
      visibility: visibility || 'public',
      status: status || 'active',
      settings: settings || {},
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      message: '게시판이 수정되었습니다',
      board
    })
  } catch (error) {
    console.error('Failed to update board:', error)
    return NextResponse.json(
      { success: false, error: '게시판 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/boards/[id] - 게시판 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withAuth(request)
    if ('error' in authResult) {
      return authResult.error
    }
    
    const { user } = authResult
    
    // 관리자 권한 확인
    if (user.type !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Mock 게시판 삭제 (board 테이블이 없음)
    // 실제로는 아무것도 삭제하지 않음

    return NextResponse.json({
      success: true,
      message: '게시판이 삭제되었습니다'
    })
  } catch (error) {
    console.error('Failed to delete board:', error)
    return NextResponse.json(
      { success: false, error: '게시판 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}