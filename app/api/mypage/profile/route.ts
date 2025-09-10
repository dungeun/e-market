import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function PUT(request: NextRequest) {
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
    const { name, email, phone, address, postal_code } = body
    
    // 이메일 중복 체크 (자신 제외)
    const emailCheck = await query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, userId]
    )
    
    if (emailCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      )
    }
    
    // 프로필 업데이트
    const result = await query(
      'UPDATE users SET name = $1, email = $2, phone = $3, address = $4, postal_code = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING id, name, email, phone, address, postal_code',
      [name, email, phone, address, postal_code, userId]
    )
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user: result.rows[0],
      message: '프로필이 업데이트되었습니다.'
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { success: false, message: '프로필 업데이트에 실패했습니다.' },
      { status: 500 }
    )
  }
}