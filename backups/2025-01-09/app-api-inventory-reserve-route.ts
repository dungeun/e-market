import { NextRequest, NextResponse } from 'next/server'
import { inventoryService } from '@/lib/services/inventory-service'

export async function POST(request: NextRequest) {
  try {
    const { productId, quantity } = await request.json()
    
    if (!productId || !quantity) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 })
    }
    
    const reservationId = await inventoryService.reserveStock(productId, quantity)
    
    return NextResponse.json({ 
      success: true, 
      reservationId 
    })
  } catch (error: any) {
    console.error('Reserve inventory error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}