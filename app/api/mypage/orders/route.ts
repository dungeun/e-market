import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { authService } from '@/lib/auth/services'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    let accessToken = request.cookies.get('auth-token')?.value || request.cookies.get('accessToken')?.value
    
    if (!accessToken) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7)
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 토큰 검증
    const tokenData = await authService.validateToken(accessToken)
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const userId = tokenData.userId || tokenData.id
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token data' },
        { status: 401 }
      )
    }

    // 최근 1개월 주문 조회
    const ordersResult = await query(`
      SELECT 
        o.id,
        o.order_number,
        o.total_amount,
        o.status,
        o.payment_method,
        o.created_at,
        o.shipping_address,
        o.customer_phone,
        COUNT(oi.id) as item_count,
        STRING_AGG(DISTINCT oi.product_name, ', ') as product_names
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
        AND o.created_at >= NOW() - INTERVAL '1 month'
      GROUP BY o.id, o.order_number, o.total_amount, o.status, 
               o.payment_method, o.created_at, o.shipping_address, o.customer_phone
      ORDER BY o.created_at DESC
    `, [userId])

    // 배송 상태별 통계
    const statusCountResult = await query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM orders
      WHERE user_id = $1
        AND created_at >= NOW() - INTERVAL '1 month'
      GROUP BY status
    `, [userId])

    // 상태별 카운트 객체 생성
    const statusCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    }

    statusCountResult.rows.forEach(row => {
      if (statusCounts.hasOwnProperty(row.status)) {
        statusCounts[row.status] = parseInt(row.count)
      }
    })

    return NextResponse.json({
      orders: ordersResult.rows,
      statusCounts,
      total: ordersResult.rows.length
    })
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}