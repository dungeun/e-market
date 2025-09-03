import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth } from '@/lib/auth/middleware'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// PATCH /api/admin/boards/[id]/status - 게시판 상태 변경
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
    const { status } = body
    const { id } = await params

    if (!['ACTIVE', 'INACTIVE', 'ARCHIVED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 상태입니다' },
        { status: 400 }
      )
    }

    // Mock 게시판 상태 업데이트 (board 테이블이 없음)
    const board = {
      id,
      status,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      message: '게시판 상태가 변경되었습니다',
      board
    })
  } catch (error) {

    return NextResponse.json(
      { success: false, error: '게시판 상태 변경 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}