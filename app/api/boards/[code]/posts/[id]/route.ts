import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/db'
import { withAuth } from '@/lib/auth/middleware'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/boards/[code]/posts/[id] - 게시글 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string; id: string } }
) {
  try {
    const { code, id } = params
    
    // 게시판 존재 확인
    const boardQuery = `SELECT id, code, type, visibility FROM boards WHERE code = $1 AND is_active = true`
    const boardResult = await prisma.$queryRawUnsafe(boardQuery, code)
    const boards = Array.isArray(boardResult) ? boardResult : []
    
    if (boards.length === 0) {
      return NextResponse.json(
        { success: false, error: '게시판을 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    const board = boards[0] as any

    // 게시글 상세 조회
    const postQuery = `
      SELECT 
        p.id, p.board_id, p.user_id, p.title, p.content, p.summary, p.status, p.visibility,
        p.is_pinned, p.is_featured, p.is_anonymous, p.author_name, p.author_email,
        p.inquiry_status, p.view_count, p.like_count, p.comment_count, p.attachment_count,
        p.tags, p.metadata, p.published_at, p.created_at, p.updated_at,
        u.name as user_name, u.image as user_image, u.email as user_email
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 AND p.board_id = $2 AND p.status = 'PUBLISHED'
    `
    
    const postResult = await prisma.$queryRawUnsafe(postQuery, id, board.id)
    const posts = Array.isArray(postResult) ? postResult : []
    
    if (posts.length === 0) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    const post = posts[0] as any

    // 조회수 증가
    await prisma.$queryRawUnsafe(
      'UPDATE posts SET view_count = view_count + 1 WHERE id = $1',
      id
    )

    // 첨부파일 조회
    const attachmentsQuery = `
      SELECT id, file_name, original_name, file_size, file_type, download_count, created_at
      FROM post_attachments 
      WHERE post_id = $1 
      ORDER BY created_at ASC
    `
    const attachmentsResult = await prisma.$queryRawUnsafe(attachmentsQuery, id)
    const attachments = Array.isArray(attachmentsResult) ? attachmentsResult : []

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        boardId: post.board_id,
        userId: post.user_id,
        title: post.title,
        content: post.content,
        summary: post.summary,
        status: post.status,
        visibility: post.visibility,
        isPinned: post.is_pinned,
        isFeatured: post.is_featured,
        isAnonymous: post.is_anonymous,
        author: post.is_anonymous ? post.author_name : post.user_name,
        authorEmail: post.is_anonymous ? post.author_email : post.user_email,
        authorImage: post.is_anonymous ? null : post.user_image,
        inquiryStatus: post.inquiry_status,
        viewCount: post.view_count + 1, // 증가된 조회수
        likeCount: post.like_count,
        commentCount: post.comment_count,
        attachmentCount: post.attachment_count,
        tags: post.tags,
        metadata: post.metadata,
        publishedAt: post.published_at,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        attachments: attachments.map((att: any) => ({
          id: att.id,
          fileName: att.file_name,
          originalName: att.original_name,
          fileSize: att.file_size,
          fileType: att.file_type,
          downloadCount: att.download_count,
          createdAt: att.created_at
        }))
      },
      board: {
        id: board.id,
        code: board.code,
        type: board.type
      }
    })
  } catch (error) {
    console.error('게시글 상세 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '게시글 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// PUT /api/boards/[code]/posts/[id] - 게시글 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { code: string; id: string } }
) {
  try {
    const authResult = await withAuth(request)
    if ('error' in authResult) {
      return authResult.error
    }
    
    const { user } = authResult
    const { code, id } = params
    const body = await request.json()
    
    const { title, content, summary, tags } = body

    // 게시판 및 게시글 존재 확인
    const postQuery = `
      SELECT p.id, p.user_id, p.is_anonymous, b.code, b.id as board_id
      FROM posts p
      INNER JOIN boards b ON p.board_id = b.id
      WHERE p.id = $1 AND b.code = $2 AND b.is_active = true
    `
    
    const postResult = await prisma.$queryRawUnsafe(postQuery, id, code)
    const posts = Array.isArray(postResult) ? postResult : []
    
    if (posts.length === 0) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    const post = posts[0] as any

    // 수정 권한 확인 (작성자 본인 또는 관리자)
    if (post.user_id !== user.id && user.type !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '수정 권한이 없습니다' },
        { status: 403 }
      )
    }

    // 게시글 수정
    const updateQuery = `
      UPDATE posts 
      SET title = $1, content = $2, summary = $3, tags = $4::text[], updated_at = NOW()
      WHERE id = $5
      RETURNING updated_at
    `

    const updateResult = await prisma.$queryRawUnsafe(
      updateQuery,
      title,
      content,
      summary || null,
      tags || [],
      id
    )
    
    const updateData = Array.isArray(updateResult) ? updateResult : []
    const updatedPost = updateData[0] as any

    return NextResponse.json({
      success: true,
      message: '게시글이 수정되었습니다',
      updatedAt: updatedPost.updated_at
    })
  } catch (error) {
    console.error('게시글 수정 오류:', error)
    return NextResponse.json(
      { success: false, error: '게시글 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE /api/boards/[code]/posts/[id] - 게시글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { code: string; id: string } }
) {
  try {
    const authResult = await withAuth(request)
    if ('error' in authResult) {
      return authResult.error
    }
    
    const { user } = authResult
    const { code, id } = params

    // 게시판 및 게시글 존재 확인
    const postQuery = `
      SELECT p.id, p.user_id, p.is_anonymous, b.code, b.id as board_id
      FROM posts p
      INNER JOIN boards b ON p.board_id = b.id
      WHERE p.id = $1 AND b.code = $2 AND b.is_active = true
    `
    
    const postResult = await prisma.$queryRawUnsafe(postQuery, id, code)
    const posts = Array.isArray(postResult) ? postResult : []
    
    if (posts.length === 0) {
      return NextResponse.json(
        { success: false, error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    const post = posts[0] as any

    // 삭제 권한 확인 (작성자 본인 또는 관리자)
    if (post.user_id !== user.id && user.type !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '삭제 권한이 없습니다' },
        { status: 403 }
      )
    }

    // 게시글 삭제 (실제로는 상태 변경)
    await prisma.$queryRawUnsafe(
      'UPDATE posts SET status = $1, updated_at = NOW() WHERE id = $2',
      'DELETED',
      id
    )

    return NextResponse.json({
      success: true,
      message: '게시글이 삭제되었습니다'
    })
  } catch (error) {
    console.error('게시글 삭제 오류:', error)
    return NextResponse.json(
      { success: false, error: '게시글 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}