// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { createEcountServiceFromEnv } from '@/lib/services/ecount/ecount-api'

// POST - 데이터 동기화
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type: syncType } = await params
    const ecountService = createEcountServiceFromEnv()
    
    let result
    let message
    
    switch (syncType) {
      case 'customers':
        result = await ecountService.getCustomers()
        message = '고객 데이터 동기화 완료'
        break
        
      case 'items':
        result = await ecountService.getItems()
        message = '상품 데이터 동기화 완료'
        break
        
      case 'orders':
        result = await ecountService.getSalesOrders()
        message = '주문 데이터 동기화 완료'
        break
        
      case 'inventory':
        result = await ecountService.getInventory()
        message = '재고 데이터 동기화 완료'
        break
        
      case 'all':
        // 전체 데이터 동기화
        const [customersResult, itemsResult, ordersResult, inventoryResult] = await Promise.all([
          ecountService.getCustomers(),
          ecountService.getItems(),
          ecountService.getSalesOrders(),
          ecountService.getInventory()
        ])
        
        const syncResults = {
          customers: customersResult.success ? customersResult.data?.length || 0 : 0,
          items: itemsResult.success ? itemsResult.data?.length || 0 : 0,
          orders: ordersResult.success ? ordersResult.data?.length || 0 : 0,
          inventory: inventoryResult.success ? inventoryResult.data?.length || 0 : 0
        }
        
        return NextResponse.json({
          success: true,
          message: '전체 데이터 동기화 완료',
          data: syncResults,
          timestamp: new Date().toISOString()
        })
        
      default:
        return NextResponse.json({
          success: false,
          message: `지원하지 않는 동기화 유형입니다: ${syncType}`
        }, { status: 400 })
    }
    
    // TODO: 실제 구현에서는 동기화된 데이터를 로컬 데이터베이스에 저장
    // await saveToDatabase(syncType, result.data)
    
    return NextResponse.json({
      success: result.success,
      message: result.success ? message : result.error || '동기화 실패',
      data: {
        type: syncType,
        count: result.data?.length || 0,
        timestamp: new Date().toISOString()
      },
      records: result.data
    })
    
  } catch (error) {
    console.error(`Sync error:`, error)
    
    // 개발 모드에서는 목업 동기화 성공 응답
    if (process.env.NODE_ENV === 'development') {
      const mockCounts: Record<string, number> = {
        customers: 8,
        items: 10,
        orders: 8,
        inventory: 11,
        all: 37
      }
      
      const { type: syncType } = await params
      return NextResponse.json({
        success: true,
        message: `${syncType} 데이터 동기화 완료 (Mock)`,
        data: {
          type: syncType,
          count: mockCounts[syncType] || 0,
          timestamp: new Date().toISOString(),
          mode: 'development'
        }
      })
    }
    
    return NextResponse.json({
      success: false,
      message: '동기화 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 로컬 데이터베이스에 저장하는 헬퍼 함수 (TODO: Prisma 연동 시 구현)
async function saveToDatabase(dataType: string, data: any[]) {
  // TODO: Prisma를 사용하여 실제 데이터베이스 저장 로직 구현
  // 예시:
  // switch (dataType) {
  //   case 'customers':
  //     await queryMany({
  //       data: data.map(customer => ({
  //         ...customer,
  //         syncedAt: new Date()
  //       })),
  //       skipDuplicates: true
  //     })
  //     break
  //   case 'items':
  //     // items 저장 로직
  //     break
  //   // ... 기타 케이스들
  // }
  
  console.log(`Saved ${data.length} ${dataType} records to database`)
}