// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { createEcountServiceFromEnv } from '@/lib/services/ecount/ecount-api'

// GET - 고객 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const customerCode = searchParams.get('customerCode')
    const customerName = searchParams.get('customerName')
    const isActive = searchParams.get('isActive')
    
    const ecountService = createEcountServiceFromEnv()
    
    const result = await ecountService.getCustomers({
      customerCode: customerCode || undefined,
      customerName: customerName || undefined,
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
      const mockCustomers = generateMockCustomers()
      return NextResponse.json({
        success: true,
        data: mockCustomers,
        count: mockCustomers.length,
        note: 'Mock data - API 연결 후 실제 데이터로 교체됩니다.'
      })
    }
  } catch (error) {

    // 에러 발생 시에도 목업 데이터 제공 (개발용)
    const mockCustomers = generateMockCustomers()
    return NextResponse.json({
      success: true,
      data: mockCustomers,
      count: mockCustomers.length,
      note: 'Mock data - API 설정 후 실제 데이터로 교체됩니다.'
    })
  }
}

// POST - 고객 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName,
      customerType,
      businessNumber,
      representative,
      address,
      phone,
      email,
      memo
    } = body
    
    const ecountService = createEcountServiceFromEnv()
    
    const result = await ecountService.createCustomer({
      customerName,
      customerType: customerType || 'INDIVIDUAL',
      businessNumber,
      representative,
      address,
      phone,
      email,
      isActive: true,
      memo
    })
    
    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json({
        success: false,
        message: result.error || '고객 등록에 실패했습니다.'
      }, { status: 400 })
    }
  } catch (error) {

    return NextResponse.json({
      success: false,
      message: '고객 등록 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 목업 고객 데이터 생성
function generateMockCustomers() {
  const customers = [
    {
      customerCode: 'CUST001',
      customerName: '(주)테크솔루션',
      customerType: 'COMPANY',
      businessNumber: '123-45-67890',
      representative: '김대표',
      address: '서울시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      email: 'contact@techsolution.co.kr',
      isActive: true,
      memo: '주요 고객사'
    },
    {
      customerCode: 'CUST002',
      customerName: '김철수',
      customerType: 'INDIVIDUAL',
      businessNumber: null,
      representative: null,
      address: '서울시 마포구 홍대입구역 근처',
      phone: '010-1234-5678',
      email: 'kim.cs@gmail.com',
      isActive: true,
      memo: '개인 고객'
    },
    {
      customerCode: 'CUST003',
      customerName: '(주)글로벌커머스',
      customerType: 'COMPANY',
      businessNumber: '987-65-43210',
      representative: '박사장',
      address: '부산시 해운대구 센텀시티',
      phone: '051-9876-5432',
      email: 'info@globalcommerce.co.kr',
      isActive: true,
      memo: '월 정기 주문 고객'
    },
    {
      customerCode: 'CUST004',
      customerName: '이영희',
      customerType: 'INDIVIDUAL',
      businessNumber: null,
      representative: null,
      address: '대구시 중구 동성로',
      phone: '010-9876-5432',
      email: 'lee.yh@naver.com',
      isActive: false,
      memo: '휴면 고객'
    },
    {
      customerCode: 'CUST005',
      customerName: '(주)스마트팩토리',
      customerType: 'COMPANY',
      businessNumber: '555-44-33221',
      representative: '정CTO',
      address: '인천시 연수구 송도국제도시',
      phone: '032-5555-4444',
      email: 'cto@smartfactory.co.kr',
      isActive: true,
      memo: '기술 파트너십'
    },
    {
      customerCode: 'CUST006',
      customerName: '최민수',
      customerType: 'INDIVIDUAL',
      businessNumber: null,
      representative: null,
      address: '광주시 서구 상무지구',
      phone: '010-5555-6666',
      email: 'choi.ms@hotmail.com',
      isActive: true,
      memo: '프리미엄 고객'
    },
    {
      customerCode: 'CUST007',
      customerName: '(주)디지털이노베이션',
      customerType: 'COMPANY',
      businessNumber: '777-88-99000',
      representative: '한대표',
      address: '수원시 영통구 광교신도시',
      phone: '031-7777-8888',
      email: 'han@digitalinnovation.co.kr',
      isActive: true,
      memo: 'R&D 협력사'
    },
    {
      customerCode: 'CUST008',
      customerName: '박지연',
      customerType: 'INDIVIDUAL',
      businessNumber: null,
      representative: null,
      address: '대전시 유성구 카이스트 근처',
      phone: '010-7777-9999',
      email: 'park.jy@kaist.ac.kr',
      isActive: true,
      memo: '학계 연구자'
    }
  ]
  
  return customers
}