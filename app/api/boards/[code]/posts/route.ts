import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/db'
import { withAuth } from '@/lib/auth/middleware'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/boards/[code]/posts - 게시글 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'PUBLISHED'
    const sort = searchParams.get('sort') || 'recent'
    
    const offset = (page - 1) * limit

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

    // 정렬 조건 설정
    let orderBy = ''
    switch (sort) {
      case 'popular':
        orderBy = 'ORDER BY p.like_count DESC, p.published_at DESC'
        break
      case 'views':
        orderBy = 'ORDER BY p.view_count DESC, p.published_at DESC'
        break
      case 'comments':
        orderBy = 'ORDER BY p.comment_count DESC, p.published_at DESC'
        break
      default:
        orderBy = 'ORDER BY p.is_pinned DESC, p.published_at DESC'
    }

    // 검색 조건 설정
    let whereClause = 'WHERE p.board_id = $1 AND p.status = $2'
    let queryParams: any[] = [board.id, status]
    let paramIndex = 3

    if (search) {
      whereClause += ` AND (p.title ILIKE $${paramIndex} OR p.content ILIKE $${paramIndex})`
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    // 게시글 목록 조회
    const postsQuery = `
      SELECT 
        p.id, p.title, p.summary, p.status, p.is_pinned, p.is_featured, p.is_anonymous,
        p.author_name, p.view_count, p.like_count, p.comment_count, p.attachment_count,
        p.tags, p.published_at, p.created_at, p.updated_at,
        u.name as user_name, u.image as user_image
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ${whereClause}
      ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    
    queryParams.push(limit, offset)
    
    // 총 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total
      FROM posts p
      ${whereClause}
    `
    
    const [postsResult, countResult] = await Promise.all([
      prisma.$queryRawUnsafe(postsQuery, ...queryParams),
      prisma.$queryRawUnsafe(countQuery, ...queryParams.slice(0, -2)) // limit, offset 제외
    ])

    const posts = Array.isArray(postsResult) ? postsResult : []
    const countData = Array.isArray(countResult) ? countResult : []
    const total = countData.length > 0 ? Number((countData[0] as any).total) : 0

    return NextResponse.json({
      success: true,
      posts: posts.map((post: any) => ({
        id: post.id,
        title: post.title,
        summary: post.summary,
        status: post.status,
        isPinned: post.is_pinned,
        isFeatured: post.is_featured,
        isAnonymous: post.is_anonymous,
        author: post.is_anonymous ? post.author_name : post.user_name,
        authorImage: post.is_anonymous ? null : post.user_image,
        viewCount: post.view_count,
        likeCount: post.like_count,
        commentCount: post.comment_count,
        attachmentCount: post.attachment_count,
        tags: post.tags,
        publishedAt: post.published_at,
        createdAt: post.created_at,
        updatedAt: post.updated_at
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      board: {
        id: board.id,
        code: board.code,
        type: board.type,
        visibility: board.visibility
      }
    })
  } catch (error) {
    console.error('게시글 목록 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '게시글 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// POST /api/boards/[code]/posts - 새 게시글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const authResult = await withAuth(request)
    if ('error' in authResult) {
      return authResult.error
    }
    
    const { user } = authResult
    const { code } = params
    const body = await request.json()
    
    const { title, content, summary, tags, isAnonymous, authorName, authorEmail, authorPhone } = body

    // 게시판 존재 및 권한 확인
    const boardQuery = `SELECT id, code, type, require_login, allow_anonymous FROM boards WHERE code = $1 AND is_active = true`
    const boardResult = await prisma.$queryRawUnsafe(boardQuery, code)
    const boards = Array.isArray(boardResult) ? boardResult : []
    
    if (boards.length === 0) {
      return NextResponse.json(
        { success: false, error: '게시판을 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    const board = boards[0] as any

    // 로그인 필수 게시판 체크
    if (board.require_login && !user) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    // 익명 게시 허용 체크
    if (isAnonymous && !board.allow_anonymous) {
      return NextResponse.json(
        { success: false, error: '익명 게시가 허용되지 않는 게시판입니다' },
        { status: 400 }
      )
    }

    // 게시글 생성
    const insertQuery = `
      INSERT INTO posts (
        board_id, user_id, title, content, summary, tags,
        is_anonymous, author_name, author_email, author_phone,
        status, visibility, published_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6::text[], $7, $8, $9, $10, 'PUBLISHED', 'PUBLIC', NOW()
      ) RETURNING id, created_at
    `

    const insertParams = [
      board.id,
      user?.id || null,
      title,
      content,
      summary || null,
      tags || [],
      isAnonymous || false,
      isAnonymous ? authorName : null,
      isAnonymous ? authorEmail : null,
      isAnonymous ? authorPhone : null
    ]

    const insertResult = await prisma.$queryRawUnsafe(insertQuery, ...insertParams)
    const insertData = Array.isArray(insertResult) ? insertResult : []
    const newPost = insertData[0] as any

    return NextResponse.json({
      success: true,
      message: '게시글이 등록되었습니다',
      post: {
        id: newPost.id,
        createdAt: newPost.created_at
      }
    })
  } catch (error) {
    console.error('게시글 작성 오류:', error)
    return NextResponse.json(
      { success: false, error: '게시글 작성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}