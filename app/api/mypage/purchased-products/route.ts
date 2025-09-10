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
    
    // 사용자가 구매한 상품 목록 조회 (중복 제거)
    const result = await query(`
      SELECT DISTINCT
        p.id,
        p.name
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
        AND o.status NOT IN ('cancelled')
      ORDER BY p.name
    `, [userId])
    
    return NextResponse.json({
      success: true,
      products: result.rows
    })
  } catch (error) {
    console.error('Error fetching purchased products:', error)
    return NextResponse.json(
      { success: false, message: '구매 상품 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}