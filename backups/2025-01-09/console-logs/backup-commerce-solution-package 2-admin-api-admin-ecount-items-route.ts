import { NextRequest, NextResponse } from 'next/server'
import { createEcountServiceFromEnv } from '@/lib/services/ecount/ecount-api'

// GET - 상품 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const itemCode = searchParams.get('itemCode')
    const itemName = searchParams.get('itemName')
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')
    
    const ecountService = createEcountServiceFromEnv()
    
    const result = await ecountService.getItems({
      itemCode: itemCode || undefined,
      itemName: itemName || undefined,
      category: category || undefined,
      isActive: isActive ? isActive === 'true' : undefined
    })
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data || [],
        count: result.data?.length || 0
      })
    } else {
      // 실제 API가 실패한 경우 목업 데이터 반환
      const mockItems = generateMockItems()
      return NextResponse.json({
        success: true,
        data: mockItems,
        count: mockItems.length,
        note: 'Mock data - API 연결 후 실제 데이터로 교체됩니다.'
      })
    }
  } catch (error) {
    console.error('Items fetch error:', error)
    
    // 에러 발생 시에도 목업 데이터 제공 (개발용)
    const mockItems = generateMockItems()
    return NextResponse.json({
      success: true,
      data: mockItems,
      count: mockItems.length,
      note: 'Mock data - API 설정 후 실제 데이터로 교체됩니다.'
    })
  }
}

// POST - 상품 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      itemName,
      itemType,
      unit,
      salePrice,
      purchasePrice,
      stockQuantity,
      barcode,
      specification,
      category,
      isActive = true
    } = body
    
    const ecountService = createEcountServiceFromEnv()
    
    const result = await ecountService.createItem({
      itemName,
      itemType: itemType || 'PRODUCT',
      unit: unit || 'EA',
      salePrice: Number(salePrice) || 0,
      purchasePrice: Number(purchasePrice) || 0,
      stockQuantity: Number(stockQuantity) || 0,
      barcode,
      specification,
      category,
      isActive
    })
    
    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || '상품 등록에 실패했습니다.'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Item creation error:', error)
    return NextResponse.json({
      success: false,
      message: '상품 등록 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 목업 상품 데이터 생성
function generateMockItems() {
  const items = [
    {
      itemCode: 'ITEM001',
      itemName: '프리미엄 노트북',
      itemType: 'PRODUCT',
      unit: 'EA',
      salePrice: 1200000,
      purchasePrice: 900000,
      stockQuantity: 25,
      barcode: '8801234567890',
      specification: '15인치, 16GB RAM, 512GB SSD',
      category: '전자제품',
      isActive: true
    },
    {
      itemCode: 'ITEM002',
      itemName: '무선 키보드',
      itemType: 'PRODUCT',
      unit: 'EA',
      salePrice: 85000,
      purchasePrice: 60000,
      stockQuantity: 150,
      barcode: '8801234567891',
      specification: '블루투스 5.0, 87키',
      category: '전자제품',
      isActive: true
    },
    {
      itemCode: 'ITEM003',
      itemName: '게이밍 마우스',
      itemType: 'PRODUCT',
      unit: 'EA',
      salePrice: 95000,
      purchasePrice: 70000,
      stockQuantity: 80,
      barcode: '8801234567892',
      specification: 'RGB LED, 12000DPI',
      category: '전자제품',
      isActive: true
    },
    {
      itemCode: 'ITEM004',
      itemName: '모니터 받침대',
      itemType: 'PRODUCT',
      unit: 'EA',
      salePrice: 45000,
      purchasePrice: 30000,
      stockQuantity: 5,
      barcode: '8801234567893',
      specification: '높이 조절 가능, 알루미늄',
      category: '사무용품',
      isActive: true
    },
    {
      itemCode: 'ITEM005',
      itemName: 'USB-C 허브',
      itemType: 'PRODUCT',
      unit: 'EA',
      salePrice: 65000,
      purchasePrice: 45000,
      stockQuantity: 200,
      barcode: '8801234567894',
      specification: '7포트, 4K HDMI 지원',
      category: '전자제품',
      isActive: true
    },
    {
      itemCode: 'ITEM006',
      itemName: '데스크매트',
      itemType: 'PRODUCT',
      unit: 'EA',
      salePrice: 25000,
      purchasePrice: 15000,
      stockQuantity: 300,
      barcode: '8801234567895',
      specification: '90x40cm, 방수 처리',
      category: '사무용품',
      isActive: true
    },
    {
      itemCode: 'ITEM007',
      itemName: '웹캠 HD',
      itemType: 'PRODUCT',
      unit: 'EA',
      salePrice: 120000,
      purchasePrice: 85000,
      stockQuantity: 60,
      barcode: '8801234567896',
      specification: '1080p, 자동 초점',
      category: '전자제품',
      isActive: true
    },
    {
      itemCode: 'ITEM008',
      itemName: '설치 서비스',
      itemType: 'SERVICE',
      unit: '건',
      salePrice: 50000,
      purchasePrice: 30000,
      stockQuantity: 0,
      barcode: null,
      specification: '현장 설치 및 설정 서비스',
      category: '서비스',
      isActive: true
    },
    {
      itemCode: 'ITEM009',
      itemName: '유지보수 서비스',
      itemType: 'SERVICE',
      unit: '월',
      salePrice: 100000,
      purchasePrice: 70000,
      stockQuantity: 0,
      barcode: null,
      specification: '월단위 유지보수 서비스',
      category: '서비스',
      isActive: true
    },
    {
      itemCode: 'ITEM010',
      itemName: '구형 모니터',
      itemType: 'PRODUCT',
      unit: 'EA',
      salePrice: 150000,
      purchasePrice: 120000,
      stockQuantity: 3,
      barcode: '8801234567897',
      specification: '24인치, 1920x1080',
      category: '전자제품',
      isActive: false
    }
  ]
  
  return items
}