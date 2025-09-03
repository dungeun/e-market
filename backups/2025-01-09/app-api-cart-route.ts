import { NextRequest, NextResponse } from 'next/server'
import { query, transaction } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    let sessionId = request.cookies.get('sessionId')?.value
    let cart = null

    if (session?.user?.email) {
      // 로그인한 유저의 장바구니
      const result = await query(`
        SELECT 
          c.id as cart_id,
          ci.id,
          ci.product_id,
          ci.quantity,
          p.name as product_name,
          p.price,
          p.slug,
          p.stock,
          pi.url as image_url,
          pi.alt as image_alt
        FROM carts c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN cart_items ci ON c.id = ci.cart_id
        LEFT JOIN products p ON ci.product_id = p.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
        WHERE u.email = $1
        ORDER BY ci.created_at DESC
      `, [session.user.email])

      if (result.rows.length > 0) {
        const cartId = result.rows[0].cart_id
        const items = result.rows
          .filter(row => row.id) // cart_items가 있는 경우만
          .map(row => ({
            id: row.id,
            product_id: row.product_id,
            quantity: row.quantity,
            product: {
              id: row.product_id,
              name: row.product_name,
              price: parseFloat(row.price),
              slug: row.slug,
              stock: row.stock,
              images: row.image_url ? [{
                url: row.image_url,
                alt: row.image_alt || ''
              }] : []
            }
          }))

        cart = { id: cartId, items }
      }
    } else if (sessionId) {
      // 비로그인 유저의 장바구니
      const result = await query(`
        SELECT 
          c.id as cart_id,
          ci.id,
          ci.product_id,
          ci.quantity,
          p.name as product_name,
          p.price,
          p.slug,
          p.stock,
          pi.url as image_url,
          pi.alt as image_alt
        FROM carts c
        LEFT JOIN cart_items ci ON c.id = ci.cart_id
        LEFT JOIN products p ON ci.product_id = p.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
        WHERE c.session_id = $1
        ORDER BY ci.created_at DESC
      `, [sessionId])

      if (result.rows.length > 0) {
        const cartId = result.rows[0].cart_id
        const items = result.rows
          .filter(row => row.id) // cart_items가 있는 경우만
          .map(row => ({
            id: row.id,
            product_id: row.product_id,
            quantity: row.quantity,
            product: {
              id: row.product_id,
              name: row.product_name,
              price: parseFloat(row.price),
              slug: row.slug,
              stock: row.stock,
              images: row.image_url ? [{
                url: row.image_url,
                alt: row.image_alt || ''
              }] : []
            }
          }))

        cart = { id: cartId, items }
      }
    }

    return NextResponse.json({
      cart: cart || { items: [] },
      sessionId: sessionId
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity = 1, sessionId: providedSessionId } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    let sessionId = providedSessionId || request.headers.get('x-session-id') || request.cookies.get('sessionId')?.value

    // 세션 ID 생성 (비로그인 유저용)
    if (!sessionId && !session?.user?.email) {
      sessionId = crypto.randomUUID()
    }

    const result = await transaction(async (client) => {
      // 상품 확인
      const productResult = await client.query(
        'SELECT id, stock FROM products WHERE id = $1 AND status = $2',
        [productId, '판매중']
      )

      if (productResult.rows.length === 0) {
        throw new Error('상품을 찾을 수 없습니다.')
      }

      const product = productResult.rows[0]

      // 재고 확인
      if (product.stock < quantity) {
        throw new Error('재고가 부족합니다.')
      }

      // 장바구니 찾기 또는 생성
      let cartId
      if (session?.user?.email) {
        // 로그인한 유저
        const userResult = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [session.user.email]
        )

        if (userResult.rows.length === 0) {
          throw new Error('사용자를 찾을 수 없습니다.')
        }

        const userId = userResult.rows[0].id

        // 장바구니 찾기 또는 생성
        const cartResult = await client.query(
          'SELECT id FROM carts WHERE user_id = $1',
          [userId]
        )

        if (cartResult.rows.length > 0) {
          cartId = cartResult.rows[0].id
        } else {
          const newCartResult = await client.query(
            'INSERT INTO carts (id, user_id) VALUES ($1, $2) RETURNING id',
            [`cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, userId]
          )
          cartId = newCartResult.rows[0].id
        }
      } else {
        // 비로그인 유저
        const cartResult = await client.query(
          'SELECT id FROM carts WHERE session_id = $1',
          [sessionId]
        )

        if (cartResult.rows.length > 0) {
          cartId = cartResult.rows[0].id
        } else {
          const newCartResult = await client.query(
            'INSERT INTO carts (id, session_id) VALUES ($1, $2) RETURNING id',
            [`cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, sessionId]
          )
          cartId = newCartResult.rows[0].id
        }
      }

      // 기존 아이템 확인
      const existingItem = await client.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, productId]
      )

      if (existingItem.rows.length > 0) {
        // 수량 업데이트
        const newQuantity = existingItem.rows[0].quantity + quantity
        
        // 재고 확인
        if (product.stock < newQuantity) {
          throw new Error('재고가 부족합니다.')
        }

        await client.query(
          'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newQuantity, existingItem.rows[0].id]
        )
      } else {
        // 새 아이템 추가
        await client.query(
          'INSERT INTO cart_items (id, cart_id, product_id, quantity) VALUES ($1, $2, $3, $4)',
          [
            `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            cartId,
            productId,
            quantity
          ]
        )
      }

      return { cartId, sessionId }
    })

    // Get the full cart details
    const cartQuery = await query(`
      SELECT 
        c.id,
        COALESCE(SUM(p.price * ci.quantity), 0) as total,
        COUNT(ci.id) as item_count,
        json_agg(
          json_build_object(
            'id', ci.id,
            'product_id', ci.product_id,
            'quantity', ci.quantity,
            'product_name', p.name,
            'price', p.price
          )
        ) FILTER (WHERE ci.id IS NOT NULL) as items
      FROM carts c
      LEFT JOIN cart_items ci ON c.id = ci.cart_id
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE c.id = $1
      GROUP BY c.id
    `, [result.cartId])

    const cart = cartQuery.rows[0]
    
    const response = NextResponse.json({
      success: true,
      message: '상품이 장바구니에 추가되었습니다.',
      cart: {
        id: cart.id,
        total: parseFloat(cart.total || 0),
        items: cart.items || []
      }
    })

    // 세션 ID 쿠키 설정 (비로그인 유저용)
    if (sessionId && !session?.user?.email) {
      response.cookies.set('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30일
      })
    }

    return response
  } catch (error: any) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add to cart' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { productId, quantity } = await request.json()

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    const sessionId = request.cookies.get('sessionId')?.value

    if (!session?.user?.email && !sessionId) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    await transaction(async (client) => {
      // 장바구니 찾기
      let cartId
      if (session?.user?.email) {
        const result = await client.query(
          'SELECT c.id FROM carts c JOIN users u ON c.user_id = u.id WHERE u.email = $1',
          [session.user.email]
        )
        if (result.rows.length === 0) {
          throw new Error('Cart not found')
        }
        cartId = result.rows[0].id
      } else {
        const result = await client.query(
          'SELECT id FROM carts WHERE session_id = $1',
          [sessionId]
        )
        if (result.rows.length === 0) {
          throw new Error('Cart not found')
        }
        cartId = result.rows[0].id
      }

      if (quantity === 0) {
        // 아이템 삭제
        await client.query(
          'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
          [cartId, productId]
        )
      } else {
        // 재고 확인
        const productResult = await client.query(
          'SELECT stock FROM products WHERE id = $1',
          [productId]
        )

        if (productResult.rows.length === 0) {
          throw new Error('Product not found')
        }

        if (productResult.rows[0].stock < quantity) {
          throw new Error('재고가 부족합니다.')
        }

        // 수량 업데이트
        await client.query(
          'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE cart_id = $2 AND product_id = $3',
          [quantity, cartId, productId]
        )
      }
    })

    return NextResponse.json({
      success: true,
      message: quantity === 0 ? '상품이 삭제되었습니다.' : '수량이 업데이트되었습니다.'
    })
  } catch (error: any) {
    console.error('Error updating cart:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update cart' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    const sessionId = request.cookies.get('sessionId')?.value

    if (!session?.user?.email && !sessionId) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    await transaction(async (client) => {
      // 장바구니 찾기
      let cartId
      if (session?.user?.email) {
        const result = await client.query(
          'SELECT c.id FROM carts c JOIN users u ON c.user_id = u.id WHERE u.email = $1',
          [session.user.email]
        )
        if (result.rows.length === 0) {
          throw new Error('Cart not found')
        }
        cartId = result.rows[0].id
      } else {
        const result = await client.query(
          'SELECT id FROM carts WHERE session_id = $1',
          [sessionId]
        )
        if (result.rows.length === 0) {
          throw new Error('Cart not found')
        }
        cartId = result.rows[0].id
      }

      // 아이템 삭제
      await client.query(
        'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, productId]
      )
    })

    return NextResponse.json({
      success: true,
      message: '상품이 장바구니에서 삭제되었습니다.'
    })
  } catch (error: any) {
    console.error('Error removing from cart:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to remove from cart' },
      { status: 500 }
    )
  }
}