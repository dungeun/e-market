import { NextRequest, NextResponse } from 'next/server'

interface Post {
  id: string
  title: string
  summary?: string
  author: string
  authorImage?: string
  viewCount: number
  likeCount: number
  commentCount: number
  isPinned: boolean
  isFeatured: boolean
  tags?: string[]
  publishedAt: string
  createdAt: string
  category: string
}

// 샘플 커뮤니티 게시글 데이터
const samplePosts: Post[] = [
  {
    id: '1',
    title: '새로운 커뮤니티에 오신 것을 환영합니다! 🎉',
    summary: '커뮤니티 이용 규칙과 주요 기능들을 소개합니다.',
    author: '관리자',
    authorImage: '/admin-avatar.png',
    viewCount: 1250,
    likeCount: 45,
    commentCount: 12,
    isPinned: true,
    isFeatured: true,
    tags: ['공지사항', '환영'],
    publishedAt: '2024-01-15T09:00:00Z',
    createdAt: '2024-01-15T09:00:00Z',
    category: 'notice'
  },
  {
    id: '2',
    title: '외국인 노동자를 위한 생활 정보 공유합니다',
    summary: '한국에서 생활하면서 유용한 팁들을 정리했어요',
    author: '김민수',
    viewCount: 890,
    likeCount: 32,
    commentCount: 8,
    isPinned: false,
    isFeatured: true,
    tags: ['생활정보', '팁'],
    publishedAt: '2024-01-14T14:30:00Z',
    createdAt: '2024-01-14T14:30:00Z',
    category: 'info'
  },
  {
    id: '3',
    title: '중고 가전제품 거래 시 주의사항',
    summary: '안전한 중고거래를 위한 체크리스트를 공유합니다',
    author: '이영희',
    viewCount: 567,
    likeCount: 28,
    commentCount: 15,
    isPinned: false,
    isFeatured: false,
    tags: ['중고거래', '안전'],
    publishedAt: '2024-01-13T16:45:00Z',
    createdAt: '2024-01-13T16:45:00Z',
    category: 'market'
  },
  {
    id: '4',
    title: '한국어 학습 앱 추천드려요',
    summary: '실제로 사용해보고 도움이 된 한국어 학습 앱들을 소개합니다',
    author: '박철수',
    viewCount: 723,
    likeCount: 41,
    commentCount: 6,
    isPinned: false,
    isFeatured: false,
    tags: ['한국어', '학습', '앱추천'],
    publishedAt: '2024-01-12T11:20:00Z',
    createdAt: '2024-01-12T11:20:00Z',
    category: 'tips'
  },
  {
    id: '5',
    title: '겨울철 난방비 절약 꿀팁',
    summary: '추운 겨울, 난방비를 줄이면서도 따뜻하게 지내는 방법들',
    author: '정수진',
    viewCount: 445,
    likeCount: 19,
    commentCount: 4,
    isPinned: false,
    isFeatured: false,
    tags: ['생활팁', '절약'],
    publishedAt: '2024-01-11T13:15:00Z',
    createdAt: '2024-01-11T13:15:00Z',
    category: 'tips'
  },
  {
    id: '6',
    title: '서울 지하철 이용 가이드 (외국인용)',
    summary: '지하철 노선도 보는 법부터 교통카드 충전까지',
    author: '김태호',
    viewCount: 1123,
    likeCount: 67,
    commentCount: 11,
    isPinned: false,
    isFeatured: true,
    tags: ['교통', '지하철', '가이드'],
    publishedAt: '2024-01-10T09:30:00Z',
    createdAt: '2024-01-10T09:30:00Z',
    category: 'info'
  },
  {
    id: '7',
    title: '한국 음식 처음 도전해보는 분들께',
    summary: '매운 음식을 잘 못 먹는 분들도 즐길 수 있는 한식 추천',
    author: '윤서연',
    viewCount: 334,
    likeCount: 25,
    commentCount: 9,
    isPinned: false,
    isFeatured: false,
    tags: ['음식', '한식', '추천'],
    publishedAt: '2024-01-09T18:45:00Z',
    createdAt: '2024-01-09T18:45:00Z',
    category: 'free'
  },
  {
    id: '8',
    title: '병원 이용할 때 알아두면 좋은 한국어',
    summary: '응급상황에서 도움이 될 수 있는 기본 의료 한국어',
    author: '최민영',
    viewCount: 892,
    likeCount: 53,
    commentCount: 7,
    isPinned: false,
    isFeatured: false,
    tags: ['의료', '한국어', '응급'],
    publishedAt: '2024-01-08T14:00:00Z',
    createdAt: '2024-01-08T14:00:00Z',
    category: 'qna'
  },
  {
    id: '9',
    title: '새해 이벤트 공지사항',
    summary: '새해를 맞아 특별한 이벤트를 준비했습니다.',
    author: '이벤트팀',
    viewCount: 678,
    likeCount: 34,
    commentCount: 8,
    isPinned: false,
    isFeatured: true,
    tags: ['이벤트', '새해'],
    publishedAt: '2024-01-07T10:00:00Z',
    createdAt: '2024-01-07T10:00:00Z',
    category: 'event'
  },
  {
    id: '10',
    title: '후기: 배송 서비스가 정말 빨라요!',
    summary: '주문 후 하루만에 받았어요. 만족합니다.',
    author: '만족고객',
    viewCount: 234,
    likeCount: 18,
    commentCount: 5,
    isPinned: false,
    isFeatured: false,
    tags: ['후기', '배송'],
    publishedAt: '2024-01-06T15:30:00Z',
    createdAt: '2024-01-06T15:30:00Z',
    category: 'review'
  },
  {
    id: '11',
    title: '자유롭게 인사해요 👋',
    summary: '새로 가입한 회원입니다. 잘 부탁드려요!',
    author: '신규회원',
    viewCount: 156,
    likeCount: 22,
    commentCount: 13,
    isPinned: false,
    isFeatured: false,
    tags: ['인사', '신규'],
    publishedAt: '2024-01-05T12:15:00Z',
    createdAt: '2024-01-05T12:15:00Z',
    category: 'free'
  },
  {
    id: '12',
    title: '중고 스마트폰 팝니다',
    summary: '아이폰 13 미니, 상태 양호합니다.',
    author: '판매자2',
    viewCount: 289,
    likeCount: 7,
    commentCount: 9,
    isPinned: false,
    isFeatured: false,
    tags: ['중고', '스마트폰', '판매'],
    publishedAt: '2024-01-04T16:45:00Z',
    createdAt: '2024-01-04T16:45:00Z',
    category: 'market'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'recent'
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    let filteredPosts = [...samplePosts]

    // 카테고리 필터링
    if (category && category !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.category === category)
    }

    // 검색 필터링
    if (search) {
      filteredPosts = filteredPosts.filter(post =>
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.summary?.toLowerCase().includes(search.toLowerCase()) ||
        post.author.toLowerCase().includes(search.toLowerCase())
      )
    }

    // 정렬
    switch (sort) {
      case 'popular':
        filteredPosts.sort((a, b) => b.likeCount - a.likeCount)
        break
      case 'views':
        filteredPosts.sort((a, b) => b.viewCount - a.viewCount)
        break
      case 'comments':
        filteredPosts.sort((a, b) => b.commentCount - a.commentCount)
        break
      case 'recent':
      default:
        filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    // 고정 게시글을 맨 위로
    filteredPosts.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return 0
    })

    // 페이지네이션
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

    const totalPages = Math.ceil(filteredPosts.length / limit)

    return NextResponse.json({
      success: true,
      posts: paginatedPosts,
      board: {
        id: 'community',
        code: 'community',
        name: '커뮤니티',
        description: '자유롭게 소통하고 정보를 공유하는 공간입니다',
        type: 'community'
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: filteredPosts.length,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('커뮤니티 게시글 조회 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: '게시글 목록 조회 중 오류가 발생했습니다',
        posts: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          hasNext: false,
          hasPrev: false
        }
      },
      { status: 500 }
    )
  }
}