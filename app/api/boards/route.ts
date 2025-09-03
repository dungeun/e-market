import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/boards - 게시판 목록 조회 (공개)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    
    // 게시판 목록 조회
    const query = `
      SELECT 
        id, code, name, description, type, visibility, 
        allow_comments, allow_attachments, require_login, 
        is_active, created_at, updated_at
      FROM boards 
      WHERE is_active = true 
      ${type ? 'AND type = $1' : ''}
      ORDER BY sort_order ASC, created_at ASC
    `
    
    const params = type ? [type] : []
    const result = await prisma.$queryRawUnsafe(query, ...params)
    const boards = Array.isArray(result) ? result : []

    return NextResponse.json({
      success: true,
      boards: boards.map((board: any) => ({
        id: board.id,
        code: board.code,
        name: board.name,
        description: board.description,
        type: board.type,
        visibility: board.visibility,
        allowComments: board.allow_comments,
        allowAttachments: board.allow_attachments,
        requireLogin: board.require_login,
        isActive: board.is_active,
        createdAt: board.created_at,
        updatedAt: board.updated_at
      }))
    })
  } catch (error) {
    console.error('게시판 목록 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '게시판 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}