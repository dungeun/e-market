import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // 사용자의 주문 내역 조회
    const ordersResult = await query(`
      SELECT 
        o.id,
        o.order_number,
        o.total_amount,
        o.status,
        o.payment_status,
        o.payment_method,
        o.created_at,
        o.customer_name,
        o.shipping_address,
        o.customer_phone,
        o.customer_email
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `, [decoded.userId])

    // 각 주문의 상품 정보 조회
    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await query(`
          SELECT 
            product_name,
            quantity,
            price
          FROM order_items
          WHERE order_id = $1
        `, [order.id])

        return {
          ...order,
          items: itemsResult.rows
        }
      })
    )

    return NextResponse.json({ 
      success: true,
      orders: ordersWithItems 
    })

  } catch (error: any) {
    console.error('Failed to fetch user orders:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}