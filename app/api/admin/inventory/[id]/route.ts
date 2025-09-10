import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { inventory, inventoryTransactions, products } from '@/drizzle/migrations/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inventoryItem = await db
      .select({
        id: inventory.id,
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug,
          categoryId: products.categoryId,
          price: products.price,
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
      .where(eq(inventory.id, params.id))
      .limit(1)

    if (!inventoryItem.length) {
      return NextResponse.json(
        { success: false, error: '재고를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: inventoryItem[0],
    })
  } catch (error) {
    console.error('재고 조회 오류:', error)
    return NextResponse.json(
      { success: false, error: '재고 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { currentStock, minStock, maxStock, reorderPoint, location, reason } = body

    // 기존 재고 정보 조회
    const existingInventory = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, params.id))
      .limit(1)

    if (!existingInventory.length) {
      return NextResponse.json(
        { success: false, error: '재고를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const oldInventory = existingInventory[0]

    // 재고 상태 계산
    let status = 'optimal'
    if (currentStock <= 0) {
      status = 'out-of-stock'
    } else if (currentStock <= reorderPoint) {
      status = 'critical'
    } else if (currentStock <= minStock) {
      status = 'low'
    }

    // 재고 업데이트
    const [updatedInventory] = await db
      .update(inventory)
      .set({
        currentStock,
        minStock,
        maxStock,
        reorderPoint,
        location,
        status,
        updatedAt: sql`CURRENT_TIMESTAMP`,
        ...(currentStock !== oldInventory.currentStock && {
          lastRestocked: sql`CURRENT_TIMESTAMP`,
        }),
      })
      .where(eq(inventory.id, params.id))
      .returning()

    // 재고 변경이 있는 경우 트랜잭션 기록
    if (currentStock !== oldInventory.currentStock) {
      await db
        .insert(inventoryTransactions)
        .values({
          inventoryId: params.id,
          productId: oldInventory.productId,
          transactionType: 'adjustment',
          quantityChange: currentStock - oldInventory.currentStock,
          quantityBefore: oldInventory.currentStock,
          quantityAfter: currentStock,
          reason: reason || '재고 조정',
          userId: 'admin', // 실제 구현시 세션에서 가져와야 함
        })
    }

    return NextResponse.json({
      success: true,
      data: updatedInventory,
      message: '재고가 성공적으로 업데이트되었습니다.',
    })
  } catch (error) {
    console.error('재고 업데이트 오류:', error)
    return NextResponse.json(
      { success: false, error: '재고 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 재고 존재 확인
    const existingInventory = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, params.id))
      .limit(1)

    if (!existingInventory.length) {
      return NextResponse.json(
        { success: false, error: '재고를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 재고 삭제 (CASCADE로 관련 트랜잭션도 삭제됨)
    await db.delete(inventory).where(eq(inventory.id, params.id))

    return NextResponse.json({
      success: true,
      message: '재고가 성공적으로 삭제되었습니다.',
    })
  } catch (error) {
    console.error('재고 삭제 오류:', error)
    return NextResponse.json(
      { success: false, error: '재고 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}