// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/db'

// GET /api/orders/[id] - 주문 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 사용자 ID 조회
    const userResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [session.user.email]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const userId = userResult.rows[0].id

    // 주문 조회 (사용자 검증 포함)
    const orderResult = await query(
      `SELECT 
        o.*,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1 AND o.user_id = $2`,
      [params.id, userId]
    )

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const order = orderResult.rows[0]

    // 주문 아이템 조회
    const itemsResult = await query(
      `SELECT 
        oi.*,
        p.name as product_name,
        p.slug as product_slug,
        pi.url as image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
      WHERE oi.order_id = $1`,
      [params.id]
    )

    order.items = itemsResult.rows

    return NextResponse.json(order)
  } catch (error) {

    return NextResponse.json(
      { error: '주문을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/orders/[id] - 주문 상태 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { status } = await request.json()

    // 유효한 상태값 검증
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 주문 상태입니다.' },
        { status: 400 }
      )
    }

    // 사용자 ID 조회
    const userResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [session.user.email]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const userId = userResult.rows[0].id

    // 주문 상태 업데이트 (사용자 검증 포함)
    const result = await query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [status, params.id, userId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 취소인 경우 재고 복구
    if (status === 'cancelled') {
      const itemsResult = await query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [params.id]
      )

      for (const item of itemsResult.rows) {
        await query(
          'UPDATE products SET stock = stock + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        )
      }
    }

    return NextResponse.json({
      success: true,
      order: result.rows[0],
      message: '주문 상태가 업데이트되었습니다.'
    })
  } catch (error) {

    return NextResponse.json(
      { error: '주문 상태 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}