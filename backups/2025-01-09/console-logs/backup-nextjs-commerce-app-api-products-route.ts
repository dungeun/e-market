import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/db"
import { z } from 'zod'

const ProductCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  quantity: z.number().int().min(0).default(0),
  categoryId: z.string().optional(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
  })).optional(),
  isActive: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    
    const where: any = {
      isActive: true,
    }
    
    if (category) {
      where.categoryId = category
    }
    
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    const products = await query({
      where,
      include: {
        images: true,
        category: true,
      },
      orderBy: {
        [sort]: order,
      },
    })
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ProductCreateSchema.parse(body)
    
    const product = await query({
      data: {
        ...validatedData,
        images: validatedData.images ? {
          create: validatedData.images,
        } : undefined,
      },
      include: {
        images: true,
        category: true,
      },
    })
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}