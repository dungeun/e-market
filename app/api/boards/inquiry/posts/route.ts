import { NextRequest, NextResponse } from 'next/server'

interface Inquiry {
  id: string
  title: string
  category: string
  status: 'pending' | 'answered' | 'closed'
  createdAt: string
  updatedAt: string
  isSecret: boolean
  hasAttachment: boolean
}

// 샘플 1:1 문의 데이터
const sampleInquiries: Inquiry[] = [
  {
    id: '1',
    title: '주문한 상품이 아직 배송되지 않았습니다.',
    category: '배송문의',
    status: 'answered',
    createdAt: '2024-01-15T14:30:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
    isSecret: false,
    hasAttachment: false
  },
  {
    id: '2',
    title: '결제가 완료되었는데 주문이 취소되었어요.',
    category: '결제문의',
    status: 'pending',
    createdAt: '2024-01-14T16:20:00Z',
    updatedAt: '2024-01-14T16:20:00Z',
    isSecret: true,
    hasAttachment: true
  },
  {
    id: '3',
    title: '교환 신청 후 처리 현황을 알고 싶습니다.',
    category: '반품/교환',
    status: 'answered',
    createdAt: '2024-01-13T11:45:00Z',
    updatedAt: '2024-01-14T10:30:00Z',
    isSecret: false,
    hasAttachment: false
  },
  {
    id: '4',
    title: '상품 정보에 대해 더 자세히 알고 싶어요.',
    category: '상품문의',
    status: 'closed',
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-12T15:20:00Z',
    isSecret: false,
    hasAttachment: false
  },
  {
    id: '5',
    title: '회원정보 수정이 안 되는 문제',
    category: '기술지원',
    status: 'pending',
    createdAt: '2024-01-11T13:20:00Z',
    updatedAt: '2024-01-11T13:20:00Z',
    isSecret: true,
    hasAttachment: false
  },
  {
    id: '6',
    title: '대량 주문 할인 문의드립니다.',
    category: '일반문의',
    status: 'answered',
    createdAt: '2024-01-10T16:45:00Z',
    updatedAt: '2024-01-11T08:30:00Z',
    isSecret: false,
    hasAttachment: false
  },
  {
    id: '7',
    title: '배송지 변경이 가능한가요?',
    category: '배송문의',
    status: 'closed',
    createdAt: '2024-01-09T11:30:00Z',
    updatedAt: '2024-01-09T14:15:00Z',
    isSecret: false,
    hasAttachment: false
  },
  {
    id: '8',
    title: '적립금 사용에 대한 문의',
    category: '일반문의',
    status: 'answered',
    createdAt: '2024-01-08T09:45:00Z',
    updatedAt: '2024-01-08T16:20:00Z',
    isSecret: false,
    hasAttachment: false
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''

    let filteredInquiries = [...sampleInquiries]

    // 카테고리 필터링
    if (category && category !== '전체') {
      filteredInquiries = filteredInquiries.filter(inquiry => inquiry.category === category)
    }

    // 상태 필터링
    if (status && status !== '전체') {
      filteredInquiries = filteredInquiries.filter(inquiry => inquiry.status === status)
    }

    // 최신순으로 정렬
    filteredInquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      success: true,
      posts: filteredInquiries,
      board: {
        id: 'inquiry',
        code: 'inquiry',
        name: '1:1 문의',
        description: '개인 문의 및 상담',
        type: 'inquiry'
      },
      totalCount: filteredInquiries.length
    })

  } catch (error) {
    console.error('1:1 문의 조회 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '1:1 문의 목록 조회 중 오류가 발생했습니다',
        posts: [],
        totalCount: 0
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, title, content, isSecret, email, phone } = body

    if (!category || !title || !content) {
      return NextResponse.json(
        { success: false, error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 새로운 문의 생성 (실제로는 데이터베이스에 저장)
    const newInquiry = {
      id: Date.now().toString(),
      title,
      category,
      content,
      isSecret,
      email,
      phone,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hasAttachment: false
    }

    console.log('새로운 문의 등록:', newInquiry)

    return NextResponse.json({
      success: true,
      message: '문의가 성공적으로 등록되었습니다.',
      inquiry: newInquiry
    })

  } catch (error) {
    console.error('문의 등록 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '문의 등록 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    )
  }
}