import { NextRequest, NextResponse } from 'next/server'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  viewCount: number
  likeCount: number
  createdAt: string
}

// 샘플 FAQ 데이터
const sampleFAQs: FAQItem[] = [
  {
    id: '1',
    question: '회원가입은 어떻게 하나요?',
    answer: '홈페이지 우측 상단의 "회원가입" 버튼을 클릭하여 필요한 정보를 입력하시면 됩니다. 이메일 인증 후 회원가입이 완료됩니다.',
    category: '계정',
    viewCount: 1250,
    likeCount: 45,
    createdAt: '2024-01-15T09:00:00Z'
  },
  {
    id: '2',
    question: '비밀번호를 잊어버렸어요. 어떻게 해야 하나요?',
    answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하시고, 가입 시 사용한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.',
    category: '계정',
    viewCount: 980,
    likeCount: 32,
    createdAt: '2024-01-14T14:30:00Z'
  },
  {
    id: '3',
    question: '결제 방법은 어떤 것들이 있나요?',
    answer: '신용카드, 체크카드, 계좌이체, 무통장입금, 카카오페이, 토스페이, 페이코 등 다양한 결제 방법을 지원합니다.',
    category: '결제',
    viewCount: 1500,
    likeCount: 68,
    createdAt: '2024-01-13T16:45:00Z'
  },
  {
    id: '4',
    question: '배송기간은 얼마나 걸리나요?',
    answer: '일반적으로 주문 확인 후 2-3일 내에 배송됩니다. 도서산간 지역은 1-2일 추가 소요될 수 있습니다.',
    category: '배송',
    viewCount: 2100,
    likeCount: 89,
    createdAt: '2024-01-12T11:20:00Z'
  },
  {
    id: '5',
    question: '반품/교환은 어떻게 하나요?',
    answer: '상품 수령 후 7일 이내에 마이페이지에서 반품/교환 신청을 하실 수 있습니다. 단순변심의 경우 배송비가 부과될 수 있습니다.',
    category: '반품/교환',
    viewCount: 1800,
    likeCount: 76,
    createdAt: '2024-01-11T13:15:00Z'
  },
  {
    id: '6',
    question: '해외배송도 가능한가요?',
    answer: '현재 해외배송은 일부 국가에만 제한적으로 서비스하고 있습니다. 자세한 내용은 고객센터로 문의해주세요.',
    category: '배송',
    viewCount: 567,
    likeCount: 23,
    createdAt: '2024-01-10T09:30:00Z'
  },
  {
    id: '7',
    question: '적립금은 언제 지급되나요?',
    answer: '상품 구매 시 적립된 포인트는 상품 배송완료 후 7일 뒤에 자동으로 지급됩니다.',
    category: '일반',
    viewCount: 445,
    likeCount: 19,
    createdAt: '2024-01-09T18:45:00Z'
  },
  {
    id: '8',
    question: '쿠폰은 어떻게 사용하나요?',
    answer: '결제 페이지에서 "쿠폰/할인코드" 란에 쿠폰번호를 입력하시면 할인이 적용됩니다.',
    category: '일반',
    viewCount: 334,
    likeCount: 15,
    createdAt: '2024-01-08T14:00:00Z'
  },
  {
    id: '9',
    question: '주문을 취소하고 싶어요',
    answer: '결제완료 후 30분 이내에는 마이페이지에서 직접 취소 가능합니다. 그 이후에는 고객센터로 연락해주세요.',
    category: '주문',
    viewCount: 723,
    likeCount: 34,
    createdAt: '2024-01-07T16:20:00Z'
  },
  {
    id: '10',
    question: '상품 재입고 알림을 받을 수 있나요?',
    answer: '품절된 상품 페이지에서 "재입고 알림" 버튼을 클릭하시면 재입고 시 SMS나 이메일로 알림을 보내드립니다.',
    category: '상품',
    viewCount: 892,
    likeCount: 41,
    createdAt: '2024-01-06T11:10:00Z'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''

    let filteredFAQs = [...sampleFAQs]

    // 카테고리 필터링
    if (category && category !== '전체') {
      filteredFAQs = filteredFAQs.filter(faq => faq.category === category)
    }

    // 검색 필터링
    if (search) {
      filteredFAQs = filteredFAQs.filter(faq =>
        faq.question.toLowerCase().includes(search.toLowerCase()) ||
        faq.answer.toLowerCase().includes(search.toLowerCase())
      )
    }

    // 조회수 순으로 정렬
    filteredFAQs.sort((a, b) => b.viewCount - a.viewCount)

    return NextResponse.json({
      success: true,
      posts: filteredFAQs,
      board: {
        id: 'faq',
        code: 'faq',
        name: 'FAQ',
        description: '자주 묻는 질문과 답변',
        type: 'faq'
      },
      totalCount: filteredFAQs.length
    })

  } catch (error) {
    console.error('FAQ 조회 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'FAQ 목록 조회 중 오류가 발생했습니다',
        posts: [],
        totalCount: 0
      },
      { status: 500 }
    )
  }
}