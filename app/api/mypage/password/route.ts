import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
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
    const { currentPassword, newPassword } = body
    
    // 현재 사용자 정보 조회
    const userResult = await query(
      'SELECT id, password FROM users WHERE id = $1',
      [userId]
    )
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    const user = userResult.rows[0]
    
    // 현재 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: '현재 비밀번호가 일치하지 않습니다.' },
        { status: 400 }
      )
    }
    
    // 새 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // 비밀번호 업데이트
    await query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, userId]
    )
    
    return NextResponse.json({
      success: true,
      message: '비밀번호가 변경되었습니다.'
    })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { success: false, message: '비밀번호 변경에 실패했습니다.' },
      { status: 500 }
    )
  }
}