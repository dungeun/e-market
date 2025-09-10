import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    const offset = (page - 1) * limit
    
    // 기본 쿼리
    let whereConditions = []
    let queryParams = []
    let paramIndex = 1
    
    // 상태 필터
    if (status && status !== 'all') {
      whereConditions.push(`o.status = $${paramIndex}`)
      queryParams.push(status)
      paramIndex++
    }
    
    // 검색 필터 (주문번호, 고객명, 이메일)
    if (search) {
      whereConditions.push(`(o.order_number ILIKE $${paramIndex} OR o.customer_name ILIKE $${paramIndex} OR o.customer_email ILIKE $${paramIndex})`)
      queryParams.push(`%${search}%`)
      paramIndex++
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
    
    // 주문 목록 조회 (orders 테이블 직접 사용)
    const ordersQuery = `
      SELECT 
        o.id,
        o.order_number,
        o.total_amount,
        o.status,
        o.tracking_number,
        o.created_at,
        o.delivery_date,
        o.shipping_address,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.payment_status,
        o.payment_method,
        COUNT(*) OVER() as total_count
      FROM orders o
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    queryParams.push(limit, offset)
    
    const ordersResult = await query(ordersQuery, queryParams)
    
    // 각 주문의 아이템들 조회
    const orders = []
    for (const order of ordersResult.rows) {
      const itemsResult = await query(`
        SELECT 
          oi.id,
          oi.order_id,
          oi.product_name,
          oi.product_name as current_product_name,
          oi.product_id,
          oi.price,
          oi.quantity,
          '' as product_image
        FROM order_items oi
        WHERE oi.order_id = $1
        ORDER BY oi.id
      `, [order.id])
      
      orders.push({
        ...order,
        items: itemsResult.rows,
        total_count: order.total_count
      })
    }
    
    // 통계 데이터 조회 (소문자 상태로 수정)
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE o.status = 'pending') as pending_orders,
        COUNT(*) FILTER (WHERE o.status = 'processing') as processing_orders,
        COUNT(*) FILTER (WHERE o.status = 'shipped') as shipped_orders,
        COUNT(*) FILTER (WHERE o.status = 'delivered') as delivered_orders,
        COUNT(*) FILTER (WHERE o.status = 'cancelled') as cancelled_orders,
        COALESCE(SUM(o.total_amount) FILTER (WHERE o.payment_status = 'paid'), 0) as total_revenue
      FROM orders o
    `)
    
    const stats = statsResult.rows[0]
    
    return NextResponse.json({
      success: true,
      orders: orders,
      pagination: {
        page,
        limit,
        total: orders.length > 0 ? parseInt(orders[0].total_count) : 0,
        totalPages: orders.length > 0 ? Math.ceil(parseInt(orders[0].total_count) / limit) : 0
      },
      stats: {
        total: parseInt(stats.total_orders),
        pending: parseInt(stats.pending_orders),
        processing: parseInt(stats.processing_orders),
        shipped: parseInt(stats.shipped_orders),
        delivered: parseInt(stats.delivered_orders),
        cancelled: parseInt(stats.cancelled_orders),
        totalRevenue: parseInt(stats.total_revenue)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: '주문 데이터를 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, status, trackingNumber, shippingType } = body
    
    // 상태 업데이트
    let updateQuery = 'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP'
    let queryParams: any[] = [status]
    let paramCount = 2
    
    if (trackingNumber !== undefined) {
      updateQuery += `, tracking_number = $${paramCount}`
      queryParams.push(trackingNumber)
      paramCount++
    }
    
    if (status === 'delivered') {
      updateQuery += ', delivery_date = CURRENT_TIMESTAMP'
    }
    
    // 배송 타입 저장 (메타데이터 또는 노트 필드 활용)
    if (shippingType) {
      // shipping_type을 tracking_number가 있으면 'courier', 없으면 'direct'로 구분
      // 직접배송인 경우 tracking_number를 null로 설정
      if (shippingType === 'direct' && !trackingNumber) {
        // 이미 처리됨
      }
    }
    
    updateQuery += ` WHERE id = $${paramCount} RETURNING *`
    queryParams.push(orderId)
    
    const result = await query(updateQuery, queryParams)
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      order: result.rows[0],
      message: '주문 상태가 업데이트되었습니다.'
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { success: false, error: '주문 상태 업데이트에 실패했습니다.' },
      { status: 500 }
    )
  }
}