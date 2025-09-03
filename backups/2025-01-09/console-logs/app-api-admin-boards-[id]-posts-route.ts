// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth } from '@/lib/auth/middleware'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/boards/[id]/posts - 게시판의 게시물 목록 조회
export async function GET(
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

    const { id } = await params;

    // Mock 게시물 목록 (posts 테이블이 없음)
    const posts = []

    return NextResponse.json({
      success: true,
      posts: posts.map((post: any) => ({
        id: post.id,
        boardId: post.board_id,
        title: post.title,
        author: post.author_name || 'Unknown',
        status: post.status,
        viewCount: post.view_count || 0,
        likeCount: parseInt(post.like_count || 0),
        commentCount: parseInt(post.comment_count || 0),
        createdAt: post.created_at
      }))
    })
  } catch (error) {
    console.error('Failed to get posts:', error)
    return NextResponse.json(
      { success: false, error: '게시물 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}