import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/db"
import { z } from 'zod'

const OrderCreateSchema = z.object({
  customerInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }),
  shippingAddress: z.object({
    recipient: z.string(),
    phone: z.string(),
    address: z.string(),
    addressDetail: z.string().optional(),
    zipCode: z.string(),
  }),
  paymentMethod: z.enum(['card', 'bank', 'kakao', 'naver']),
  orderNotes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    image: z.string().optional(),
  })),
  totalAmount: z.number(),
})

function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  
  return `ORD${year}${month}${day}${random}`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const userId = request.headers.get('x-user-id')
    
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (userId) {
      where.userId = userId
    }
    
    const orders = await query({
      where,
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = OrderCreateSchema.parse(body)
    const userId = request.headers.get('x-user-id')
    
    const orderNumber = generateOrderNumber()
    
    // Calculate shipping fee
    const shippingFee = validatedData.totalAmount >= 50000 ? 0 : 3000
    const finalTotal = validatedData.totalAmount + shippingFee
    
    const order = await query({
      data: {
        orderNumber,
        userId: userId || undefined,
        customerName: validatedData.customerInfo.name,
        customerEmail: validatedData.customerInfo.email,
        customerPhone: validatedData.customerInfo.phone,
        shippingRecipient: validatedData.shippingAddress.recipient,
        shippingPhone: validatedData.shippingAddress.phone,
        shippingAddress: validatedData.shippingAddress.address,
        shippingAddressDetail: validatedData.shippingAddress.addressDetail || '',
        shippingZipCode: validatedData.shippingAddress.zipCode,
        paymentMethod: validatedData.paymentMethod,
        orderNotes: validatedData.orderNotes || '',
        subtotal: validatedData.totalAmount,
        shippingFee,
        totalAmount: finalTotal,
        status: 'PENDING',
        items: {
          create: validatedData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })),
        },
      },
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
    
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}