import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting to seed UI sections...')

  // 기존 섹션 삭제
  await prisma.uIText.deleteMany()
  await prisma.uISection.deleteMany()
  
  // 섹션 데이터 정의
  const sections = [
    {
      key: 'hero',
      title: '히어로 배너',
      type: 'hero',
      isActive: true,
      order: 1,
      data: {
        slides: [
          {
            id: 'slide-1',
            type: 'blue',
            tag: '🔥 HOT DEAL',
            title: '인플루언서와 함께하는\n특별한 캠페인',
            subtitle: '지금 바로 시작하세요',
            bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
            order: 1,
            visible: true,
          },
          {
            id: 'slide-2',
            type: 'dark',
            title: '프리미엄 브랜드\n마케팅 솔루션',
            subtitle: '당신의 브랜드를 성장시키세요',
            bgColor: 'bg-gradient-to-br from-gray-800 to-gray-900',
            order: 2,
            visible: true,
          },
          {
            id: 'slide-3',
            type: 'green',
            title: '실시간 데이터 분석으로\n캠페인 최적화',
            subtitle: 'AI 기반 인사이트 제공',
            bgColor: 'bg-gradient-to-br from-green-400 to-green-600',
            order: 3,
            visible: true,
          },
          {
            id: 'slide-4',
            type: 'pink',
            tag: '✨ NEW',
            title: '크리에이터 매칭\n자동화 시스템',
            subtitle: '최적의 인플루언서를 찾아드립니다',
            bgColor: 'bg-gradient-to-br from-pink-400 to-pink-600',
            order: 4,
            visible: true,
          },
          {
            id: 'slide-5',
            type: 'blue',
            title: '글로벌 마케팅\n캠페인 지원',
            subtitle: '전 세계 크리에이터와 연결',
            bgColor: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
            order: 5,
            visible: true,
          },
          {
            id: 'slide-6',
            type: 'dark',
            tag: '💎 PREMIUM',
            title: '엔터프라이즈급\n마케팅 플랫폼',
            subtitle: '대규모 캠페인도 쉽고 빠르게',
            bgColor: 'bg-gradient-to-br from-gray-700 to-gray-900',
            order: 6,
            visible: true,
          },
        ]
      },
      props: {},
      style: {}
    },
    {
      key: 'category',
      title: '카테고리 메뉴',
      type: 'category',
      isActive: true,
      order: 2,
      data: {
        categories: [
          { id: 'cat-1', name: '뷰티', categoryId: 'beauty', icon: '💄', order: 1, visible: true },
          { id: 'cat-2', name: '패션', categoryId: 'fashion', icon: '👗', order: 2, visible: true },
          { id: 'cat-3', name: '음식', categoryId: 'food', icon: '🍜', badge: 'HOT', order: 3, visible: true },
          { id: 'cat-4', name: '여행', categoryId: 'travel', icon: '✈️', order: 4, visible: true },
          { id: 'cat-5', name: '테크', categoryId: 'tech', icon: '💻', order: 5, visible: true },
          { id: 'cat-6', name: '피트니스', categoryId: 'fitness', icon: '💪', order: 6, visible: true },
          { id: 'cat-7', name: '라이프스타일', categoryId: 'lifestyle', icon: '🏠', order: 7, visible: true },
          { id: 'cat-8', name: '펫', categoryId: 'pet', icon: '🐾', order: 8, visible: true },
          { id: 'cat-9', name: '육아', categoryId: 'parenting', icon: '👶', order: 9, visible: true },
          { id: 'cat-10', name: '게임', categoryId: 'game', icon: '🎮', badge: 'NEW', order: 10, visible: true },
          { id: 'cat-11', name: '교육', categoryId: 'education', icon: '📚', order: 11, visible: true },
        ]
      },
      props: {},
      style: {}
    },
    {
      key: 'quicklinks',
      title: '바로가기 링크',
      type: 'quicklinks',
      isActive: true,
      order: 3,
      data: {
        links: [
          { id: 'quick-1', title: '이벤트', icon: '🎁', link: '/events', order: 1, visible: true },
          { id: 'quick-2', title: '쿠폰', icon: '🎟️', link: '/coupons', order: 2, visible: true },
          { id: 'quick-3', title: '랭킹', icon: '🏆', link: '/ranking', order: 3, visible: true },
        ]
      },
      props: {},
      style: {}
    },
    {
      key: 'promo',
      title: '프로모션 배너',
      type: 'promo',
      isActive: true,
      order: 4,
      data: {
        title: '지금 가입하면 첫 캠페인 30% 할인',
        subtitle: '인플루언서 마케팅의 새로운 기준을 경험하세요',
        icon: '📦',
        visible: true,
        link: '/signup',
        buttonText: '가입하기'
      },
      props: {},
      style: {}
    },
    {
      key: 'ranking',
      title: '실시간 랭킹',
      type: 'ranking',
      isActive: true,
      order: 5,
      data: {
        title: '🔥 실시간 인기 캠페인',
        campaigns: [
          {
            id: 1,
            rank: 1,
            title: '뷰티 인플루언서 대규모 캠페인',
            brand: '럭셔리 코스메틱',
            category: '뷰티',
            participants: 1234,
            reward: '최대 500만원',
            daysLeft: 5,
            trending: true
          },
          {
            id: 2,
            rank: 2,
            title: '맛집 리뷰 크리에이터 모집',
            brand: '프리미엄 레스토랑',
            category: '음식',
            participants: 987,
            reward: '최대 300만원',
            daysLeft: 7,
            trending: true
          },
          {
            id: 3,
            rank: 3,
            title: '패션 하울 영상 제작',
            brand: '글로벌 패션 브랜드',
            category: '패션',
            participants: 856,
            reward: '최대 400만원',
            daysLeft: 3,
            trending: false
          },
          {
            id: 4,
            rank: 4,
            title: '여행 브이로그 콘텐츠',
            brand: '럭셔리 호텔 체인',
            category: '여행',
            participants: 723,
            reward: '최대 800만원',
            daysLeft: 10,
            trending: false
          },
          {
            id: 5,
            rank: 5,
            title: '테크 리뷰어 긴급 모집',
            brand: '신제품 런칭 기업',
            category: '테크',
            participants: 654,
            reward: '최대 600만원',
            daysLeft: 2,
            trending: true
          }
        ]
      },
      props: {},
      style: {}
    },
    {
      key: 'recommended',
      title: '추천 캠페인',
      type: 'recommended',
      isActive: true,
      order: 6,
      data: {
        title: '💎 당신을 위한 추천 캠페인',
        subtitle: 'AI가 선택한 최적의 캠페인을 만나보세요',
        campaigns: [
          {
            id: 1,
            title: '프리미엄 뷰티 제품 리뷰',
            brand: '글로벌 코스메틱',
            category: '뷰티',
            image: '/placeholder.svg',
            reward: '300-500만원',
            requirements: '팔로워 1만 이상',
            deadline: '2024-02-15',
            tags: ['뷰티', '리뷰', '화장품']
          },
          {
            id: 2,
            title: '라이프스타일 브랜드 협업',
            brand: '프리미엄 가구',
            category: '라이프스타일',
            image: '/placeholder.svg',
            reward: '200-400만원',
            requirements: '팔로워 5천 이상',
            deadline: '2024-02-20',
            tags: ['인테리어', '가구', '홈데코']
          },
          {
            id: 3,
            title: '신제품 언박싱 콘텐츠',
            brand: '테크 스타트업',
            category: '테크',
            image: '/placeholder.svg',
            reward: '400-600만원',
            requirements: '테크 전문 크리에이터',
            deadline: '2024-02-10',
            tags: ['테크', '언박싱', '리뷰']
          },
          {
            id: 4,
            title: '펫 용품 체험단 모집',
            brand: '프리미엄 펫브랜드',
            category: '펫',
            image: '/placeholder.svg',
            reward: '150-300만원',
            requirements: '반려동물 보유',
            deadline: '2024-02-25',
            tags: ['펫', '반려동물', '리뷰']
          }
        ]
      },
      props: {},
      style: {}
    }
  ]

  // 섹션 생성
  for (const section of sections) {
    await prisma.uISection.create({
      data: section
    })
  }

  console.log('✅ UI sections seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })