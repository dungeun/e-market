import { NextRequest, NextResponse } from 'next/server'
import { createEcountServiceFromEnv } from '@/lib/services/ecount/ecount-api'

// GET - 판매 주문 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const customerCode = searchParams.get('customerCode')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')
    
    const ecountService = createEcountServiceFromEnv()
    
    const result = await ecountService.getSalesOrders({
      customerCode: customerCode || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: status || undefined
    })
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data || [],
        count: result.data?.length || 0
      })
    } else {
      // 실제 API가 실패한 경우 목업 데이터 반환
      const mockOrders = generateMockOrders()
      return NextResponse.json({
        success: true,
        data: mockOrders,
        count: mockOrders.length,
        note: 'Mock data - API 연결 후 실제 데이터로 교체됩니다.'
      })
    }
  } catch (error) {
    console.error('Orders fetch error:', error)
    
    // 에러 발생 시에도 목업 데이터 제공 (개발용)
    const mockOrders = generateMockOrders()
    return NextResponse.json({
      success: true,
      data: mockOrders,
      count: mockOrders.length,
      note: 'Mock data - API 설정 후 실제 데이터로 교체됩니다.'
    })
  }
}

// POST - 판매 주문 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerCode,
      orderDate,
      deliveryDate,
      items,
      totalAmount,
      taxAmount,
      memo,
      status = 'PENDING'
    } = body
    
    const ecountService = createEcountServiceFromEnv()
    
    const result = await ecountService.createSalesOrder({
      customerCode,
      orderDate,
      deliveryDate,
      items,
      totalAmount: Number(totalAmount),
      taxAmount: Number(taxAmount),
      memo,
      status
    })
    
    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || '주문 등록에 실패했습니다.'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({
      success: false,
      message: '주문 등록 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 목업 주문 데이터 생성
function generateMockOrders() {
  const orders = [
    {
      orderNumber: 'ORD2024001',
      customerCode: 'CUST001',
      orderDate: '2024-01-15',
      deliveryDate: '2024-01-20',
      items: [
        {
          itemCode: 'ITEM001',
          quantity: 2,
          unitPrice: 1200000,
          amount: 2400000,
          memo: '프리미엄 모델'
        }
      ],
      totalAmount: 2400000,
      taxAmount: 240000,
      memo: '긴급 주문',
      status: 'CONFIRMED'
    },
    {
      orderNumber: 'ORD2024002',
      customerCode: 'CUST002',
      orderDate: '2024-01-16',
      deliveryDate: '2024-01-25',
      items: [
        {
          itemCode: 'ITEM002',
          quantity: 1,
          unitPrice: 85000,
          amount: 85000
        },
        {
          itemCode: 'ITEM003',
          quantity: 1,
          unitPrice: 95000,
          amount: 95000
        }
      ],
      totalAmount: 180000,
      taxAmount: 18000,
      memo: '개인 주문',
      status: 'PENDING'
    },
    {
      orderNumber: 'ORD2024003',
      customerCode: 'CUST003',
      orderDate: '2024-01-17',
      deliveryDate: '2024-02-01',
      items: [
        {
          itemCode: 'ITEM005',
          quantity: 10,
          unitPrice: 65000,
          amount: 650000
        }
      ],
      totalAmount: 650000,
      taxAmount: 65000,
      memo: '대량 주문 할인 적용',
      status: 'CONFIRMED'
    },
    {
      orderNumber: 'ORD2024004',
      customerCode: 'CUST001',
      orderDate: '2024-01-18',
      deliveryDate: '2024-01-22',
      items: [
        {
          itemCode: 'ITEM007',
          quantity: 5,
          unitPrice: 120000,
          amount: 600000
        },
        {
          itemCode: 'ITEM008',
          quantity: 5,
          unitPrice: 50000,
          amount: 250000
        }
      ],
      totalAmount: 850000,
      taxAmount: 85000,
      memo: '설치 서비스 포함',
      status: 'COMPLETED'
    },
    {
      orderNumber: 'ORD2024005',
      customerCode: 'CUST005',
      orderDate: '2024-01-19',
      deliveryDate: '2024-02-10',
      items: [
        {
          itemCode: 'ITEM001',
          quantity: 10,
          unitPrice: 1200000,
          amount: 12000000
        }
      ],
      totalAmount: 12000000,
      taxAmount: 1200000,
      memo: '기업용 대량 주문',
      status: 'CONFIRMED'
    },
    {
      orderNumber: 'ORD2024006',
      customerCode: 'CUST006',
      orderDate: '2024-01-20',
      deliveryDate: null,
      items: [
        {
          itemCode: 'ITEM009',
          quantity: 12,
          unitPrice: 100000,
          amount: 1200000
        }
      ],
      totalAmount: 1200000,
      taxAmount: 120000,
      memo: '연간 유지보수 계약',
      status: 'PENDING'
    },
    {
      orderNumber: 'ORD2024007',
      customerCode: 'CUST004',
      orderDate: '2024-01-12',
      deliveryDate: '2024-01-15',
      items: [
        {
          itemCode: 'ITEM004',
          quantity: 2,
          unitPrice: 45000,
          amount: 90000
        }
      ],
      totalAmount: 90000,
      taxAmount: 9000,
      memo: '취소된 주문',
      status: 'CANCELLED'
    },
    {
      orderNumber: 'ORD2024008',
      customerCode: 'CUST007',
      orderDate: '2024-01-21',
      deliveryDate: '2024-01-28',
      items: [
        {
          itemCode: 'ITEM002',
          quantity: 50,
          unitPrice: 85000,
          amount: 4250000
        },
        {
          itemCode: 'ITEM003',
          quantity: 50,
          unitPrice: 95000,
          amount: 4750000
        }
      ],
      totalAmount: 9000000,
      taxAmount: 900000,
      memo: 'R&D 프로젝트용',
      status: 'CONFIRMED'
    }
  ]
  
  return orders
}