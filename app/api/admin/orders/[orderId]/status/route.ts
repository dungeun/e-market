import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params
    const body = await request.json()
    const {
      status,
      tracking_number,
      courier,
      delivery_note,
      estimated_time
    } = body

    // 주문 상태 업데이트
    const updateResult = await query(
      `UPDATE orders 
       SET status = $1,
           tracking_number = $2,
           courier = $3,
           delivery_note = $4,
           estimated_time = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE order_number = $6
       RETURNING *`,
      [
        status,
        tracking_number,
        courier,
        delivery_note,
        estimated_time,
        orderId
      ]
    )

    if (updateResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 배송 완료 시 실제 배송 시간 기록
    if (status === 'delivered') {
      await query(
        `UPDATE orders 
         SET actual_delivery_time = CURRENT_TIMESTAMP
         WHERE order_number = $1`,
        [orderId]
      )
    }

    return NextResponse.json({
      success: true,
      message: '주문 상태가 업데이트되었습니다.',
      order: updateResult.rows[0]
    })
  } catch (error) {
    console.error('Order status update error:', error)
    return NextResponse.json(
      { success: false, error: '주문 상태 업데이트에 실패했습니다.' },
      { status: 500 }
    )
  }
}