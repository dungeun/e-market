import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/db"
import { z } from 'zod'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

const AddToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  options: z.record(z.any()).optional(),
})

async function getOrCreateCart(userId?: string) {
  const cookieStore = await cookies()
  let cartId = cookieStore.get('cartId')?.value
  
  if (userId) {
    // For logged-in users, find or create cart by userId
    let cart = await query({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    })
    
    if (!cart) {
      cart = await query({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { images: true },
              },
            },
          },
        },
      })
    }
    
    return cart
  } else {
    // For guest users, use session-based cart
    if (!cartId) {
      cartId = uuidv4()
      cookieStore.set('cartId', cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }
    
    let cart = await query({
      where: { sessionId: cartId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    })
    
    if (!cart) {
      cart = await query({
        data: { sessionId: cartId },
        include: {
          items: {
            include: {
              product: {
                include: { images: true },
              },
            },
          },
        },
      })
    }
    
    return cart
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from auth
    const userId = undefined
    const cart = await getOrCreateCart(userId)
    
    return NextResponse.json(cart)
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
    const validatedData = AddToCartSchema.parse(body)
    
    // TODO: Get userId from auth
    const userId = undefined
    const cart = await getOrCreateCart(userId)
    
    // Check if product exists
    const product = await query({
      where: { id: validatedData.productId },
    })
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Check if item already exists in cart
    const existingItem = await query({
      where: {
        cartId: cart.id,
        productId: validatedData.productId,
        options: validatedData.options || {},
      },
    })
    
    if (existingItem) {
      // Update quantity
      await query({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + validatedData.quantity,
        },
      })
    } else {
      // Create new cart item
      await query({
        data: {
          cartId: cart.id,
          productId: validatedData.productId,
          quantity: validatedData.quantity,
          price: product.price,
          options: validatedData.options || {},
        },
      })
    }
    
    // Return updated cart
    const updatedCart = await query({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
    })
    
    return NextResponse.json(updatedCart)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    )
  }
}