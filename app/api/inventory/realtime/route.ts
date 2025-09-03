import type { User, RequestContext } from '@/lib/types/common';
import type { AppError } from '@/lib/types/common';
// TODO: Refactor to use createApiHandler from @/lib/api/handler
/**
 * 실시간 재고 관리 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { inventoryService } from '@/lib/services/inventory/realtime-inventory'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 재고 상태 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const status = await inventoryService.getStockStatus(productId)

    return NextResponse.json({
      success: true,
      data: status
    })
  } catch (error: Error | unknown) {
    return NextResponse.json(
      { error: error.message || 'Failed to get inventory status' },
      { status: 500 }
    )
  }
}

// 재고 예약
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const { productId, quantity, cartId, orderId } = body

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      )
    }

    const reservationId = await inventoryService.reserveStock({
      productId,
      quantity,
      userId: session?.user?.id,
      cartId,
      orderId
    })

    return NextResponse.json({
      success: true,
      data: { reservationId }
    })
  } catch (error: Error | unknown) {
    return NextResponse.json(
      { error: error.message || 'Failed to reserve inventory' },
      { status: 500 }
    )
  }
}

// 예약 확정 (관리자용)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 관리자 권한 확인
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reservationId, action } = body

    if (!reservationId || !action) {
      return NextResponse.json(
        { error: 'Reservation ID and action are required' },
        { status: 400 }
      )
    }

    if (action === 'confirm') {
      await inventoryService.confirmReservation(reservationId)
    } else if (action === 'cancel') {
      await inventoryService.cancelReservation(reservationId)
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Reservation ${action}ed successfully`
    })
  } catch (error: Error | unknown) {
    return NextResponse.json(
      { error: error.message || 'Failed to update reservation' },
      { status: 500 }
    )
  }
}

// 벌크 업데이트 (관리자용)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 관리자 권한 확인
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { updates } = body

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      )
    }

    await inventoryService.bulkUpdateInventory(updates)

    return NextResponse.json({
      success: true,
      message: `${updates.length} products updated successfully`
    })
  } catch (error: Error | unknown) {
    return NextResponse.json(
      { error: error.message || 'Failed to update inventory' },
      { status: 500 }
    )
  }
}