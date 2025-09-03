// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth } from '@/lib/auth/middleware'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/boards - 게시판 목록 조회
export async function GET(request: NextRequest) {
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

    // Mock 게시판 목록 (boards 테이블이 없음)
    const boards = []

    return NextResponse.json({
      success: true,
      boards: boards.map((board: any) => ({
        id: board.id,
        name: board.name,
        description: board.description,
        category: board.category,
        status: board.status,
        visibility: board.visibility,
        postCount: parseInt(board.post_count || 0),
        lastPostAt: board.last_post_at,
        createdAt: board.created_at,
        updatedAt: board.updated_at
      }))
    })
  } catch (error) {

    return NextResponse.json(
      { success: false, error: '게시판 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST /api/admin/boards - 새 게시판 생성
export async function POST(request: NextRequest) {
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
    const { name, description, category, visibility } = body

    // Mock 게시판 생성 (board 테이블이 없음)
    const board = {
      id: 'mock-board-' + Date.now(),
      name,
      description,
      category: category || 'community',
      visibility: visibility || 'PUBLIC',
      status: 'ACTIVE',
      settings: {
        allowComments: true,
        allowLikes: true,
        requireApproval: false,
        allowAttachments: true,
        maxAttachmentSize: 10485760, // 10MB
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      message: '게시판이 생성되었습니다',
      board
    })
  } catch (error) {

    return NextResponse.json(
      { success: false, error: '게시판 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}