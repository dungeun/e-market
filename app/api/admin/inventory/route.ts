import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { inventory, inventoryTransactions, products, restockRequests } from '@/drizzle/migrations/schema'
import { eq, sql, desc, and, or, like, count } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // 기본 쿼리 - 재고와 상품 정보 조인
    let query = db
      .select({
        id: inventory.id,
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug,
          categoryId: products.categoryId,
        },
        currentStock: inventory.currentStock,
        minStock: inventory.minStock,
        maxStock: inventory.maxStock,
        reorderPoint: inventory.reorderPoint,
        reservedStock: inventory.reservedStock,
        availableStock: sql<number>`${inventory.currentStock} - ${inventory.reservedStock}`.as('available_stock'),
        lastRestocked: inventory.lastRestocked,
        location: inventory.location,
        status: inventory.status,
        createdAt: inventory.createdAt,
        updatedAt: inventory.updatedAt,
      })
      .from(inventory)
      .leftJoin(products, eq(inventory.productId, products.id))

    // 검색 조건
    const conditions = []
    if (search) {
      conditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.slug, `%${search}%`),
          like(inventory.id, `%${search}%`)
        )
      )
    }
    if (status) {
      conditions.push(eq(inventory.status, status))
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    // 페이지네이션과 정렬
    const inventoryData = await query
      .orderBy(desc(inventory.updatedAt))
      .limit(limit)
      .offset(offset)

    // 전체 개수 조회
    let countQuery = db
      .select({ count: count() })
      .from(inventory)
      .leftJoin(products, eq(inventory.productId, products.id))

    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions))
    }

    const [{ count: totalCount }] = await countQuery

    // 통계 데이터 계산
    const stats = await db
      .select({
        totalItems: count(),
        totalStock: sql<number>`SUM(${inventory.currentStock})`,
        lowStock: sql<number>`SUM(CASE WHEN ${inventory.status} IN ('low', 'critical') THEN 1 ELSE 0 END)`,
        outOfStock: sql<number>`SUM(CASE WHEN ${inventory.status} = 'out-of-stock' THEN 1 ELSE 0 END)`,
        criticalStock: sql<number>`SUM(CASE WHEN ${inventory.status} = 'critical' THEN 1 ELSE 0 END)`,
      })
      .from(inventory)

    return NextResponse.json({
      success: true,
      data: inventoryData,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: stats[0] || {
        totalItems: 0,
        totalStock: 0,
        lowStock: 0,
        outOfStock: 0,
        criticalStock: 0,
      },
    })
  } catch (error) {
    console.error('재고 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '재고 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, currentStock, minStock, maxStock, reorderPoint, location } = body

    // 상품 존재 확인
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)

    if (!product.length) {
      return NextResponse.json(
        { success: false, error: '존재하지 않는 상품입니다.' },
        { status: 404 }
      )
    }

    // 이미 재고가 등록된 상품인지 확인
    const existingInventory = await db
      .select()
      .from(inventory)
      .where(eq(inventory.productId, productId))
      .limit(1)

    if (existingInventory.length > 0) {
      return NextResponse.json(
        { success: false, error: '이미 재고가 등록된 상품입니다.' },
        { status: 409 }
      )
    }

    // 재고 상태 계산
    let status = 'optimal'
    if (currentStock <= 0) {
      status = 'out-of-stock'
    } else if (currentStock <= reorderPoint) {
      status = 'critical'
    } else if (currentStock <= minStock) {
      status = 'low'
    }

    // 재고 생성
    const [newInventory] = await db
      .insert(inventory)
      .values({
        productId,
        currentStock,
        minStock,
        maxStock,
        reorderPoint,
        location,
        status,
      })
      .returning()

    return NextResponse.json({
      success: true,
      data: newInventory,
      message: '재고가 성공적으로 등록되었습니다.',
    })
  } catch (error) {
    console.error('재고 등록 오류:', error)
    return NextResponse.json(
      { success: false, error: '재고 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}