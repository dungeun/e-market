import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    const skip = (page - 1) * limit

    const where: any = {
      status: 'ACTIVE',
    }

    if (category) {
      where.categoryId = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [products, total] = await Promise.all([
      query({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: {
          images: true,
          category: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      }),
      query({ where }),
    ])

    const productsWithRating = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
        : 0

      return {
        ...product,
        rating: avgRating,
        reviewCount: product.reviews.length,
      }
    })

    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: '상품을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const product = await query({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description,
        price: data.price,
        compareAt: data.compareAt,
        cost: data.cost,
        sku: data.sku,
        barcode: data.barcode,
        stock: data.stock || 0,
        trackStock: data.trackStock ?? true,
        allowBackorder: data.allowBackorder ?? false,
        weight: data.weight,
        width: data.width,
        height: data.height,
        depth: data.depth,
        categoryId: data.categoryId,
        tags: data.tags || [],
        status: data.status || 'DRAFT',
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords || [],
        images: {
          create: data.images?.map((img: any, index: number) => ({
            url: img.url,
            alt: img.alt,
            position: index,
          })) || [],
        },
      },
      include: {
        images: true,
        category: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: '상품 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}