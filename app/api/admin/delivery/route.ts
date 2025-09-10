import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 배송중 또는 배송 준비중인 주문 조회
    const deliveriesResult = await query(`
      SELECT 
        o.id,
        o.order_number,
        o.customer_name,
        o.customer_phone,
        o.shipping_address,
        o.status,
        o.payment_method,
        o.total_amount,
        o.tracking_number,
        o.created_at,
        o.updated_at,
        CASE 
          WHEN o.tracking_number IS NOT NULL THEN 'courier'
          ELSE 'direct'
        END as shipping_type,
        STRING_AGG(oi.product_name, ', ') as product_names,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status IN ('processing', 'shipped', 'delivered')
      GROUP BY o.id, o.order_number, o.customer_name, o.customer_phone, 
               o.shipping_address, o.status, o.payment_method, o.total_amount, 
               o.tracking_number, o.created_at, o.updated_at
      ORDER BY 
        CASE o.status 
          WHEN 'processing' THEN 1
          WHEN 'shipped' THEN 2
          WHEN 'delivered' THEN 3
        END,
        o.created_at DESC
    `)

    // 통계 계산
    const statsResult = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status IN ('processing', 'shipped', 'delivered')) as totalDeliveries,
        COUNT(*) FILTER (WHERE status IN ('processing', 'shipped', 'delivered') AND tracking_number IS NULL) as directDelivery,
        COUNT(*) FILTER (WHERE status IN ('processing', 'shipped', 'delivered') AND tracking_number IS NOT NULL) as courierDelivery,
        COUNT(*) FILTER (WHERE status IN ('processing', 'shipped') AND DATE(created_at) = CURRENT_DATE) as todayDeliveries,
        COUNT(*) FILTER (WHERE status = 'shipped') as pendingDeliveries,
        COUNT(*) FILTER (WHERE status = 'delivered') as completedDeliveries
      FROM orders
    `)

    const stats = {
      totalDeliveries: parseInt(statsResult.rows[0].totaldeliveries) || 0,
      directDelivery: parseInt(statsResult.rows[0].directdelivery) || 0,
      courierDelivery: parseInt(statsResult.rows[0].courierdelivery) || 0,
      todayDeliveries: parseInt(statsResult.rows[0].todaydeliveries) || 0,
      pendingDeliveries: parseInt(statsResult.rows[0].pendingdeliveries) || 0,
      completedDeliveries: parseInt(statsResult.rows[0].completeddeliveries) || 0
    }

    // 각 주문의 아이템 정보 조회
    const deliveries = await Promise.all(deliveriesResult.rows.map(async (order) => {
      const itemsResult = await query(`
        SELECT 
          oi.product_name,
          oi.quantity
        FROM order_items oi
        WHERE oi.order_id = $1
      `, [order.id])

      return {
        ...order,
        items: itemsResult.rows,
        shipped_at: order.status === 'shipped' ? order.updated_at : null,
        delivered_at: order.status === 'delivered' ? order.updated_at : null
      }
    }))

    return NextResponse.json({
      success: true,
      deliveries,
      stats
    })
  } catch (error) {
    console.error('Failed to fetch deliveries:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deliveries' },
      { status: 500 }
    )
  }
}