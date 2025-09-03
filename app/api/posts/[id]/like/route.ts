// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyJWT } from '@/lib/auth/jwt'

// POST /api/posts/[id]/like - 게시글 좋아요/취소
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {

    const token = request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let user
    try {
      user = await verifyJWT(token)

    } catch (error) {

      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const userId = user.userId || user.id
    if (!user || !userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // 게시글 존재 확인

    const post = await query({
      where: { id: id, status: 'PUBLISHED' }
    })

    if (!post) {

      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // 기존 좋아요 확인

    const existingLike = await query({
      where: {
        postId_userId: {
          postId: id,
          userId: userId
        }
      }
    })

    let liked = false
    let likeCount = 0

    if (existingLike) {
      // 좋아요 취소
      await query({
        where: { id: existingLike.id }
      })
      liked = false
    } else {
      // 좋아요 추가
      await query({
        data: {
          postId: id,
          userId: userId
        }
      })
      liked = true
    }

    // 총 좋아요 수 조회
    likeCount = await query({
      where: { postId: id }
    })

    return NextResponse.json({
      liked,
      likeCount
    })
  } catch (error) {

    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}