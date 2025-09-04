import type { AppError } from '@/lib/types/common';
import { NextRequest, NextResponse } from 'next/server'
import { query, transaction } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    let sessionId = request.cookies.get('sessionId')?.value
    let wishlist = null

    if (session?.user?.email) {
      // 로그인한 유저의 위시리스트
      const result = await query(`
        SELECT 
          w.id as wishlist_id,
          wi.id,
          wi.product_id,
          p.name as product_name,
          p.price,
          p.slug,
          p.stock,
          pi.url as image_url
        FROM wishlists w
        LEFT JOIN wishlist_items wi ON w.id = wi.wishlist_id
        LEFT JOIN products p ON wi.product_id = p.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.order_index = 0
        WHERE w.user_id = $1
        ORDER BY wi.created_at DESC
      `, [session.user.email])

      if (result.rows.length > 0) {
        const wishlistId = result.rows[0].wishlist_id
        const items = result.rows
          .filter(row => row.id) // wishlist_items가 있는 경우만
          .map(row => ({
            id: row.id,
            product_id: row.product_id,
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

        wishlist = { id: wishlistId, items }
      }
    } else if (sessionId) {
      // 비로그인 유저의 위시리스트
      const result = await query(`
        SELECT 
          w.id as wishlist_id,
          wi.id,
          wi.product_id,
          p.name as product_name,
          p.price,
          p.slug,
          p.stock,
          pi.url as image_url,
          pi.alt as image_alt
        FROM wishlists w
        LEFT JOIN wishlist_items wi ON w.id = wi.wishlist_id
        LEFT JOIN products p ON wi.product_id = p.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.order_index = 0
        WHERE w.session_id = $1
        ORDER BY wi.created_at DESC
      `, [sessionId])

      if (result.rows.length > 0) {
        const wishlistId = result.rows[0].wishlist_id
        const items = result.rows
          .filter(row => row.id) // wishlist_items가 있는 경우만
          .map(row => ({
            id: row.id,
            product_id: row.product_id,
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

        wishlist = { id: wishlistId, items }
      }
    }

    return NextResponse.json({
      wishlist: wishlist || { items: [] },
      sessionId: sessionId
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, sessionId: providedSessionId } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
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
        'SELECT id FROM products WHERE id = $1 AND status = $2',
        [productId, '판매중']
      )

      if (productResult.rows.length === 0) {
        throw new Error('상품을 찾을 수 없습니다.')
      }

      // 위시리스트 찾기 또는 생성
      let wishlistId
      if (session?.user?.email) {
        // 로그인한 유저
        const wishlistResult = await client.query(
          'SELECT id FROM wishlists WHERE user_id = $1',
          [session.user.email]
        )

        if (wishlistResult.rows.length > 0) {
          wishlistId = wishlistResult.rows[0].id
        } else {
          const newWishlistResult = await client.query(
            'INSERT INTO wishlists (id, user_id) VALUES ($1, $2) RETURNING id',
            [`wishlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, session.user.email]
          )
          wishlistId = newWishlistResult.rows[0].id
        }
      } else {
        // 비로그인 유저
        const wishlistResult = await client.query(
          'SELECT id FROM wishlists WHERE session_id = $1',
          [sessionId]
        )

        if (wishlistResult.rows.length > 0) {
          wishlistId = wishlistResult.rows[0].id
        } else {
          const newWishlistResult = await client.query(
            'INSERT INTO wishlists (id, session_id) VALUES ($1, $2) RETURNING id',
            [`wishlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, sessionId]
          )
          wishlistId = newWishlistResult.rows[0].id
        }
      }

      // 기존 아이템 확인
      const existingItem = await client.query(
        'SELECT id FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2',
        [wishlistId, productId]
      )

      if (existingItem.rows.length > 0) {
        throw new Error('이미 위시리스트에 있는 상품입니다.')
      }

      // 새 아이템 추가
      await client.query(
        'INSERT INTO wishlist_items (id, wishlist_id, product_id) VALUES ($1, $2, $3)',
        [
          `wishlist_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          wishlistId,
          productId
        ]
      )

      return { wishlistId, sessionId }
    })

    const response = NextResponse.json({
      success: true,
      message: '상품이 위시리스트에 추가되었습니다.',
      wishlistId: result.wishlistId
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
  } catch (error: Error | unknown) {
    return NextResponse.json(
      { error: error.message || 'Failed to add to wishlist' },
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
        { error: 'Wishlist not found' },
        { status: 404 }
      )
    }

    await transaction(async (client) => {
      // 위시리스트 찾기
      let wishlistId
      if (session?.user?.email) {
        const result = await client.query(
          'SELECT id FROM wishlists WHERE user_id = $1',
          [session.user.email]
        )
        if (result.rows.length === 0) {
          throw new Error('Wishlist not found')
        }
        wishlistId = result.rows[0].id
      } else {
        const result = await client.query(
          'SELECT id FROM wishlists WHERE session_id = $1',
          [sessionId]
        )
        if (result.rows.length === 0) {
          throw new Error('Wishlist not found')
        }
        wishlistId = result.rows[0].id
      }

      // 아이템 삭제
      await client.query(
        'DELETE FROM wishlist_items WHERE wishlist_id = $1 AND product_id = $2',
        [wishlistId, productId]
      )
    })

    return NextResponse.json({
      success: true,
      message: '상품이 위시리스트에서 삭제되었습니다.'
    })
  } catch (error: Error | unknown) {
    return NextResponse.json(
      { error: error.message || 'Failed to remove from wishlist' },
      { status: 500 }
    )
  }
}