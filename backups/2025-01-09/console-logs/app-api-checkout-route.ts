// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, transaction } from '@/lib/db'

// POST /api/checkout - 결제 처리
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { 
      orderId,
      paymentMethod,
      paymentData // 결제 관련 데이터 (카드 정보 등)
    } = await request.json()

    const result = await transaction(async (client) => {
      // 사용자 ID 조회
      const userResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [session.user.email]
      )

      if (userResult.rows.length === 0) {
        throw new Error('사용자를 찾을 수 없습니다.')
      }

      const userId = userResult.rows[0].id

      // 주문 확인
      const orderResult = await client.query(
        'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
        [orderId, userId]
      )

      if (orderResult.rows.length === 0) {
        throw new Error('주문을 찾을 수 없습니다.')
      }

      const order = orderResult.rows[0]

      if (order.status !== 'pending') {
        throw new Error('이미 처리된 주문입니다.')
      }

      // 결제 레코드 생성
      const paymentId = `PAY${Date.now()}${Math.random().toString(36).substr(2, 5)}`
      
      const paymentResult = await client.query(
        `INSERT INTO payments (id, order_id, amount, payment_method, status, payment_data)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [paymentId, orderId, order.total_amount, paymentMethod, 'processing', JSON.stringify(paymentData)]
      )

      // 여기서 실제 결제 게이트웨이 호출 (토스페이먼츠, 나이스페이 등)
      // const paymentGatewayResponse = await processPayment(paymentData)

      // 결제 성공 가정 (실제로는 게이트웨이 응답에 따라 처리)
      const paymentSuccess = true

      if (paymentSuccess) {
        // 결제 상태 업데이트
        await client.query(
          'UPDATE payments SET status = $1, processed_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['completed', paymentId]
        )

        // 주문 상태 업데이트
        await client.query(
          'UPDATE orders SET status = $1, payment_status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
          ['processing', 'paid', orderId]
        )

        return {
          payment: paymentResult.rows[0],
          order: { ...order, status: 'processing', payment_status: 'paid' }
        }
      } else {
        // 결제 실패 처리
        await client.query(
          'UPDATE payments SET status = $1, processed_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['failed', paymentId]
        )

        throw new Error('결제 처리에 실패했습니다.')
      }
    })

    return NextResponse.json({
      success: true,
      message: '결제가 성공적으로 처리되었습니다.',
      payment: result.payment,
      order: result.order
    })
  } catch (error) {
    console.error('Error processing checkout:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// GET /api/checkout/validate - 결제 전 유효성 검사
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: '주문 ID가 필요합니다.' },
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

    // 주문 확인
    const orderResult = await query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    )

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: '주문을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const order = orderResult.rows[0]

    // 주문 아이템과 재고 확인
    const itemsResult = await query(
      `SELECT 
        oi.*,
        p.name as product_name,
        p.stock as current_stock
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1`,
      [orderId]
    )

    const stockIssues = []
    for (const item of itemsResult.rows) {
      if (item.current_stock < item.quantity) {
        stockIssues.push({
          product_id: item.product_id,
          product_name: item.product_name,
          requested: item.quantity,
          available: item.current_stock
        })
      }
    }

    if (stockIssues.length > 0) {
      return NextResponse.json({
        valid: false,
        message: '일부 상품의 재고가 부족합니다.',
        stockIssues
      })
    }

    return NextResponse.json({
      valid: true,
      message: '결제 가능한 주문입니다.',
      order: {
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        items_count: itemsResult.rows.length
      }
    })
  } catch (error) {
    console.error('Error validating checkout:', error)
    return NextResponse.json(
      { error: '결제 유효성 검사 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}