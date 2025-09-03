import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionId = request.cookies.get('sessionId')?.value

    let cart: any = null

    if (session?.user?.email) {
      // 로그인 유저의 장바구니 - 먼저 이메일로 유저 찾기
      const user = await query({
        where: { email: session.user.email }
      })
      
      if (user) {
        cart = await query({
          where: { userId: user.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
      })
      }
    } else if (sessionId) {
      // 비로그인 유저의 장바구니
      cart = await query({
        where: { sessionId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
      })
    }

    if (!cart) {
      return NextResponse.json({ items: [] })
    }

    return NextResponse.json(cart)
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: '장바구니를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { productId, quantity, variant } = await request.json()

    // 세션 ID 생성 또는 가져오기
    let sessionId = request.cookies.get('sessionId')?.value
    if (!sessionId && !session?.user?.email) {
      sessionId = crypto.randomUUID()
    }

    // 장바구니 찾기 또는 생성
    let cart: any = null
    if (session?.user?.email) {
      const user = await query({
        where: { email: session.user.email }
      })
      
      if (user) {
        cart = await query({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id },
        })
      }
    } else if (sessionId) {
      cart = await query({
        where: { sessionId },
        update: {},
        create: { sessionId },
      })
    }

    if (!cart) {
      return NextResponse.json(
        { error: '장바구니를 생성할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 상품 확인
    const product = await query({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: '상품을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 재고 확인
    if (product.trackStock && product.stock < quantity) {
      return NextResponse.json(
        { error: '재고가 부족합니다.' },
        { status: 400 }
      )
    }

    // 장바구니 아이템 추가 또는 업데이트
    const existingItem = await query({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    let cartItem
    if (existingItem) {
      cartItem = await query({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          variant,
        },
      })
    } else {
      cartItem = await query({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          variant,
        },
      })
    }

    // 응답에 세션 ID 쿠키 설정
    const response = NextResponse.json(cartItem)
    if (sessionId && !session?.user?.email) {
      response.cookies.set('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30일
      })
    }

    return response
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: '장바구니에 추가하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionId = request.cookies.get('sessionId')?.value
    const { productId } = await request.json()

    let cart: any = null
    if (session?.user?.email) {
      // 로그인 유저의 장바구니 - 먼저 이메일로 유저 찾기
      const user = await query({
        where: { email: session.user.email }
      })
      
      if (user) {
        cart = await query({
          where: { userId: user.id },
        })
      }
    } else if (sessionId) {
      cart = await query({
        where: { sessionId },
      })
    }

    if (!cart) {
      return NextResponse.json(
        { error: '장바구니를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    await query({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json(
      { error: '장바구니에서 제거하는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}