// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { inventoryService } from '@/lib/services/inventory-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inventory = await inventoryService.getInventory(params.id)
    
    if (!inventory) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product not found' 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      inventory 
    })
  } catch (error: any) {
    console.error('Inventory GET error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}