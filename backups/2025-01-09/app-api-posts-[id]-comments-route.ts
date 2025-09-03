import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyJWT } from '@/lib/auth/jwt'


// POST /api/posts/[id]/comments - 댓글 작성
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
    
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { content, parentId } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // 게시글 존재 확인
    const post = await query({
      where: { id: id, status: 'PUBLISHED' }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // 대댓글인 경우 부모 댓글 확인
    if (parentId) {
      const parentComment = await query({
        where: { id: parentId, status: 'PUBLISHED' }
      })

      if (!parentComment || parentComment.postId !== id) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 })
      }
    }

    const comment = await query({
      data: {
        content: content.trim(),
        postId: id,
        authorId: user.id,
        parentId: parentId || null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                profileImage: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      parentId: comment.parentId,
      author: {
        id: comment.author.id,
        name: comment.author.name,
        avatar: comment.author.profile?.profileImage
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}