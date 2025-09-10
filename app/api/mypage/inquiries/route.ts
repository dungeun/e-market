import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    const userId = decoded.userId
    
    // 사용자의 문의 목록 조회
    const result = await query(`
      SELECT 
        i.id,
        i.product_id,
        p.name as product_name,
        i.title,
        i.content,
        i.status,
        i.answer,
        i.created_at,
        i.answered_at
      FROM inquiries i
      LEFT JOIN products p ON i.product_id = p.id
      WHERE i.user_id = $1
      ORDER BY i.created_at DESC
    `, [userId])
    
    return NextResponse.json({
      success: true,
      inquiries: result.rows
    })
  } catch (error) {
    console.error('Error fetching inquiries:', error)
    return NextResponse.json(
      { success: false, message: '문의 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    const userId = decoded.userId
    
    const body = await request.json()
    const { title, content, product_id } = body
    
    // 문의 생성
    const result = await query(`
      INSERT INTO inquiries (user_id, product_id, title, content, status, created_at)
      VALUES ($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP)
      RETURNING id
    `, [userId, product_id || null, title, content])
    
    return NextResponse.json({
      success: true,
      message: '문의가 등록되었습니다.',
      inquiryId: result.rows[0].id
    })
  } catch (error) {
    console.error('Error creating inquiry:', error)
    return NextResponse.json(
      { success: false, message: '문의 등록에 실패했습니다.' },
      { status: 500 }
    )
  }
}