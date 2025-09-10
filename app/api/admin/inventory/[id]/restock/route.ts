import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { inventory, inventoryTransactions, restockRequests } from '@/drizzle/migrations/schema'
import { eq, sql } from 'drizzle-orm'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { quantity, supplier, priority, notes } = body

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: '유효한 수량을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 재고 정보 조회
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

    const inventoryItem = existingInventory[0]

    // 재입고 요청 생성
    const [restockRequest] = await db
      .insert(restockRequests)
      .values({
        inventoryId: params.id,
        productId: inventoryItem.productId,
        requestedQuantity: quantity,
        supplier,
        priority: priority || 'medium',
        requestedBy: 'admin', // 실제 구현시 세션에서 가져와야 함
        notes,
        status: 'approved', // 즉시 승인으로 처리
        approvedQuantity: quantity,
        approvedBy: 'admin',
      })
      .returning()

    // 재고 업데이트
    const newStock = inventoryItem.currentStock + quantity
    
    // 재고 상태 계산
    let status = 'optimal'
    if (newStock <= 0) {
      status = 'out-of-stock'
    } else if (newStock <= inventoryItem.reorderPoint) {
      status = 'critical'
    } else if (newStock <= inventoryItem.minStock) {
      status = 'low'
    }

    const [updatedInventory] = await db
      .update(inventory)
      .set({
        currentStock: newStock,
        status,
        lastRestocked: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(inventory.id, params.id))
      .returning()

    // 재고 트랜잭션 기록
    await db
      .insert(inventoryTransactions)
      .values({
        inventoryId: params.id,
        productId: inventoryItem.productId,
        transactionType: 'purchase',
        quantityChange: quantity,
        quantityBefore: inventoryItem.currentStock,
        quantityAfter: newStock,
        reason: '재입고',
        referenceId: restockRequest.id,
        userId: 'admin',
        notes: notes || '재입고 처리',
      })

    // 재입고 요청 상태를 완료로 업데이트
    await db
      .update(restockRequests)
      .set({
        status: 'received',
        actualDate: sql`CURRENT_TIMESTAMP`,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(restockRequests.id, restockRequest.id))

    return NextResponse.json({
      success: true,
      data: {
        inventory: updatedInventory,
        restockRequest,
      },
      message: `${quantity}개 재입고가 완료되었습니다.`,
    })
  } catch (error) {
    console.error('재입고 처리 오류:', error)
    return NextResponse.json(
      { success: false, error: '재입고 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}