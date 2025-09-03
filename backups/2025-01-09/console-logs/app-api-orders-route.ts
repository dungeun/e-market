// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query, transaction } from '@/lib/db'

// GET /api/orders - 주문 목록 조회
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
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

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

    // 주문 목록 조회
    let orderQuery = `
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.total_amount,
        o.shipping_address,
        o.created_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
    `
    const params: any[] = [userId]
    
    if (status) {
      orderQuery += ' AND o.status = $2'
      params.push(status)
    }
    
    orderQuery += `
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `
    params.push(limit, offset)

    const result = await query(orderQuery, params)

    // 총 개수 조회
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE user_id = $1'
    const countParams: any[] = [userId]
    
    if (status) {
      countQuery += ' AND status = $2'
      countParams.push(status)
    }
    
    const countResult = await query(countQuery, countParams)
    const total = parseInt(countResult.rows[0]?.total || '0')

    return NextResponse.json({
      orders: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: '주문 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/orders - 주문 생성
export async function POST(request: NextRequest) {
  try {
    // JWT 토큰 확인
    const authHeader = request.headers.get('Authorization')
    const authToken = request.cookies.get('auth-token')?.value || 
                     request.cookies.get('accessToken')?.value ||
                     (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null)
    
    let userEmail = null
    
    // 토큰이 있으면 디코드
    if (authToken) {
      try {
        const jwt = await import('jsonwebtoken')
        const decoded = jwt.default.verify(authToken, process.env.JWT_SECRET || 'your-secret-key') as any
        userEmail = decoded.email
      } catch (e) {
        console.error('JWT verification failed:', e)
      }
    }
    
    // getServerSession 폴백
    if (!userEmail) {
      const session = await getServerSession(authOptions)
      userEmail = session?.user?.email
    }
    
    if (!userEmail) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { 
      shippingAddress,
      paymentMethod,
      items // 장바구니에서 전달된 아이템들
    } = await request.json()

    const result = await transaction(async (client) => {
      // 사용자 ID 조회
      const userResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [userEmail]
      )

      if (userResult.rows.length === 0) {
        throw new Error('사용자를 찾을 수 없습니다.')
      }

      const userId = userResult.rows[0].id

      // 주문 ID와 번호 생성
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substr(2, 5)}`

      // 총 금액 계산
      let totalAmount = 0
      for (const item of items) {
        const productResult = await client.query(
          'SELECT price, stock FROM products WHERE id = $1',
          [item.product_id]
        )
        
        if (productResult.rows.length === 0) {
          throw new Error(`상품을 찾을 수 없습니다: ${item.product_id}`)
        }

        const product = productResult.rows[0]
        
        // 재고 확인
        if (product.stock < item.quantity) {
          throw new Error(`재고가 부족합니다: ${item.product_id}`)
        }

        totalAmount += parseFloat(product.price) * item.quantity
      }

      // 주문 생성
      const orderResult = await client.query(
        `INSERT INTO orders (id, user_id, order_number, status, total_amount, shipping_address, payment_method)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [orderId, userId, orderNumber, 'pending', totalAmount, shippingAddress, paymentMethod]
      )

      const order = orderResult.rows[0]

      // 주문 아이템 생성 및 재고 업데이트
      for (const item of items) {
        const productResult = await client.query(
          'SELECT name, price FROM products WHERE id = $1',
          [item.product_id]
        )
        
        const product = productResult.rows[0]
        const subtotal = product.price * item.quantity

        // 주문 아이템 생성
        const orderItemId = `oi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await client.query(
          `INSERT INTO order_items (id, order_id, product_id, product_name, product_price, quantity, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [orderItemId, order.id, item.product_id, product.name, product.price, item.quantity, subtotal]
        )

        // 재고 차감
        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        )
      }

      // 장바구니 비우기
      const cartResult = await client.query(
        'SELECT id FROM carts WHERE user_id = $1',
        [userId]
      )

      if (cartResult.rows.length > 0) {
        await client.query(
          'DELETE FROM cart_items WHERE cart_id = $1',
          [cartResult.rows[0].id]
        )
      }

      return order
    })

    return NextResponse.json({
      success: true,
      order: result,
      message: '주문이 성공적으로 생성되었습니다.'
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '주문 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}