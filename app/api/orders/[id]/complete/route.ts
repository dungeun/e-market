import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    // 주문 상태를 완료로 업데이트
    const result = await query(
      `UPDATE orders 
       SET status = 'completed', payment_status = 'paid', paid_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [orderId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const order = result.rows[0]

    return NextResponse.json({
      success: true,
      order,
      message: '주문이 완료되었습니다.'
    })
  } catch (error) {

    return NextResponse.json(
      { error: '주문 완료 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}