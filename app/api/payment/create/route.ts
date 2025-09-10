import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { authService } from '@/lib/auth/services'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
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
        { error: 'Authentication required' },
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

    const body = await request.json()
    const {
      items,
      shippingInfo,
      paymentMethod,
      totalAmount
    } = body

    // 필수 필드 확인
    if (!items || !shippingInfo || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 주문 생성
    const orderNumber = `ORD${Date.now()}`
    
    // 배송 주소 합치기
    const fullShippingAddress = `${shippingInfo.address} ${shippingInfo.addressDetail || ''} (${shippingInfo.postcode})`.trim()

    // 주문 정보 저장 (id는 자동 생성)
    const orderResult = await query(`
      INSERT INTO orders (
        order_number,
        user_id, 
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        total_amount,
        payment_method,
        status,
        payment_status,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
      ) RETURNING id, order_number
    `, [
      orderNumber,
      userId,
      shippingInfo.name,
      shippingInfo.email,
      shippingInfo.phone,
      fullShippingAddress,
      totalAmount,
      paymentMethod || 'CASH',
      'pending',
      'pending'
    ])

    if (!orderResult.rows[0]) {
      throw new Error('Failed to create order')
    }

    // 주문 상품 정보 저장
    const orderId = orderResult.rows[0].id
    
    for (const item of items) {
      // 먼저 상품 이름을 가져옵니다
      const productResult = await query(`
        SELECT name FROM products WHERE id = $1
      `, [item.productId])
      
      const productName = productResult.rows[0]?.name || 'Unknown Product'
      
      await query(`
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          quantity,
          price,
          created_at
        ) VALUES (
          $1, $2, $3, $4, $5, NOW()
        )
      `, [
        orderId,
        item.productId,
        productName,
        item.quantity,
        Math.round(item.price) // Convert to integer
      ])

      // 재고 감소
      await query(`
        UPDATE products 
        SET stock = stock - $1,
            updated_at = NOW()
        WHERE id = $2 AND stock >= $1
      `, [item.quantity, item.productId])
    }

    // 현금 결제인 경우 주문 상태를 pending으로 유지 (현장에서 결제)
    // payments 테이블이 없으므로 주문 테이블의 payment_status로 관리

    return NextResponse.json({
      success: true,
      data: {
        orderId: orderResult.rows[0].id,
        orderNumber: orderResult.rows[0].order_number,
        message: '주문이 성공적으로 생성되었습니다.'
      }
    })

  } catch (error: any) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    )
  }
}