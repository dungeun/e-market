import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/boards/[code] - 특정 게시판 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params
    
    // 게시판 정보 조회
    const boardQuery = `
      SELECT 
        id, code, name, description, type, visibility, 
        allow_comments, allow_attachments, require_login, allow_anonymous,
        max_attachment_size, allowed_file_types, 
        is_active, created_at, updated_at
      FROM boards 
      WHERE code = $1 AND is_active = true
    `
    
    const boardResult = await prisma.$queryRawUnsafe(boardQuery, code)
    const boards = Array.isArray(boardResult) ? boardResult : []
    
    if (boards.length === 0) {
      return NextResponse.json(
        { success: false, error: '게시판을 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    const board = boards[0] as any

    return NextResponse.json({
      success: true,
      board: {
        id: board.id,
        code: board.code,
        name: board.name,
        description: board.description,
        type: board.type,
        visibility: board.visibility,
        allowComments: board.allow_comments,
        allowAttachments: board.allow_attachments,
        requireLogin: board.require_login,
        allowAnonymous: board.allow_anonymous,
        maxAttachmentSize: board.max_attachment_size,
        allowedFileTypes: board.allowed_file_types,
        isActive: board.is_active,
        createdAt: board.created_at,
        updatedAt: board.updated_at
      }
    })
  } catch (error) {
    console.error('게시판 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '게시판 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}