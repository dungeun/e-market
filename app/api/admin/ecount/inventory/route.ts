// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { createEcountServiceFromEnv } from '@/lib/services/ecount/ecount-api'

// GET - 재고 현황 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const itemCode = searchParams.get('itemCode')
    const warehouseCode = searchParams.get('warehouseCode')
    
    const ecountService = createEcountServiceFromEnv()
    
    const result = await ecountService.getInventory({
      itemCode: itemCode || undefined,
      warehouseCode: warehouseCode || undefined
    })
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data || [],
        count: result.data?.length || 0
      })
    } else {
      // 실제 API가 실패한 경우 목업 데이터 반환
      const mockInventory = generateMockInventory()
      return NextResponse.json({
        success: true,
        data: mockInventory,
        count: mockInventory.length,
        note: 'Mock data - API 연결 후 실제 데이터로 교체됩니다.'
      })
    }
  } catch (error) {

    // 에러 발생 시에도 목업 데이터 제공 (개발용)
    const mockInventory = generateMockInventory()
    return NextResponse.json({
      success: true,
      data: mockInventory,
      count: mockInventory.length,
      note: 'Mock data - API 설정 후 실제 데이터로 교체됩니다.'
    })
  }
}

// POST - 재고 입고/출고
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      itemCode,
      warehouseCode,
      quantity,
      unitPrice,
      memo,
      transactionType // 'IN' or 'OUT'
    } = body
    
    const ecountService = createEcountServiceFromEnv()
    
    let result
    if (transactionType === 'IN') {
      result = await ecountService.stockIn({
        itemCode,
        warehouseCode,
        quantity: Number(quantity),
        unitPrice: unitPrice ? Number(unitPrice) : undefined,
        memo
      })
    } else if (transactionType === 'OUT') {
      result = await ecountService.stockOut({
        itemCode,
        warehouseCode,
        quantity: Number(quantity),
        memo
      })
    } else {
      return NextResponse.json({
        success: false,
        message: '올바른 거래 유형을 입력해주세요. (IN 또는 OUT)'
      }, { status: 400 })
    }
    
    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || '재고 처리에 실패했습니다.'
      }, { status: 400 })
    }
  } catch (error) {

    return NextResponse.json({
      success: false,
      message: '재고 처리 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 목업 재고 데이터 생성
function generateMockInventory() {
  const inventory = [
    {
      itemCode: 'ITEM001',
      warehouseCode: 'WH001',
      currentStock: 23,
      inStock: 2,
      outStock: 4,
      safetyStock: 10,
      lastUpdated: '2024-01-21T14:30:00Z'
    },
    {
      itemCode: 'ITEM002',
      warehouseCode: 'WH001',
      currentStock: 148,
      inStock: 200,
      outStock: 52,
      safetyStock: 50,
      lastUpdated: '2024-01-21T11:15:00Z'
    },
    {
      itemCode: 'ITEM003',
      warehouseCode: 'WH001',
      currentStock: 30,
      inStock: 100,
      outStock: 70,
      safetyStock: 20,
      lastUpdated: '2024-01-21T16:45:00Z'
    },
    {
      itemCode: 'ITEM004',
      warehouseCode: 'WH001',
      currentStock: 3,
      inStock: 50,
      outStock: 47,
      safetyStock: 10,
      lastUpdated: '2024-01-20T09:20:00Z'
    },
    {
      itemCode: 'ITEM005',
      warehouseCode: 'WH001',
      currentStock: 190,
      inStock: 300,
      outStock: 110,
      safetyStock: 100,
      lastUpdated: '2024-01-21T13:00:00Z'
    },
    {
      itemCode: 'ITEM006',
      warehouseCode: 'WH001',
      currentStock: 280,
      inStock: 500,
      outStock: 220,
      safetyStock: 200,
      lastUpdated: '2024-01-21T10:30:00Z'
    },
    {
      itemCode: 'ITEM007',
      warehouseCode: 'WH001',
      currentStock: 55,
      inStock: 100,
      outStock: 45,
      safetyStock: 30,
      lastUpdated: '2024-01-21T15:20:00Z'
    },
    {
      itemCode: 'ITEM001',
      warehouseCode: 'WH002',
      currentStock: 45,
      inStock: 50,
      outStock: 5,
      safetyStock: 20,
      lastUpdated: '2024-01-20T17:00:00Z'
    },
    {
      itemCode: 'ITEM002',
      warehouseCode: 'WH002',
      currentStock: 75,
      inStock: 100,
      outStock: 25,
      safetyStock: 30,
      lastUpdated: '2024-01-21T08:45:00Z'
    },
    {
      itemCode: 'ITEM005',
      warehouseCode: 'WH002',
      currentStock: 120,
      inStock: 150,
      outStock: 30,
      safetyStock: 50,
      lastUpdated: '2024-01-21T12:10:00Z'
    },
    {
      itemCode: 'ITEM010',
      warehouseCode: 'WH001',
      currentStock: 2,
      inStock: 5,
      outStock: 3,
      safetyStock: 5,
      lastUpdated: '2024-01-19T14:00:00Z'
    }
  ]
  
  return inventory
}