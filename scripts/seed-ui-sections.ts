import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultUISections = [
  {
    key: 'hero',
    title: '히어로 배너',
    type: 'hero',
    isActive: true,
    order: 1,
    data: {
      slides: [
        {
          id: '1',
          title: '새로운 컬렉션\n2024 겨울 신상품',
          subtitle: '따뜻한 겨울을 위한 특별한 컬렉션을 만나보세요',
          tag: '🎯 NEW',
          link: '/products',
          bgColor: 'bg-gradient-to-br from-blue-600 to-cyan-600',
          visible: true,
          order: 1
        },
        {
          id: '2',
          title: '특별 할인\n최대 50% OFF',
          subtitle: '선별된 인기 상품들을 특가로 만나보세요',
          tag: '🔥 SALE',
          link: '/products?sale=true',
          bgColor: 'bg-gradient-to-br from-red-500 to-pink-600',
          visible: true,
          order: 2
        },
        {
          id: '3',
          title: '프리미엄 브랜드\n엄선된 상품',
          subtitle: '믿을 수 있는 브랜드의 고품질 상품들',
          tag: '⭐ PREMIUM',
          link: '/products?brand=premium',
          bgColor: 'bg-gradient-to-br from-purple-600 to-indigo-600',
          visible: true,
          order: 3
        }
      ]
    }
  },
  {
    key: 'category',
    title: '카테고리 메뉴',
    type: 'category',
    isActive: true,
    order: 2,
    data: {
      categories: [
        {
          id: '1',
          name: '전자제품',
          icon: 'phone',
          link: '/products/electronics',
          color: 'bg-gradient-to-r from-blue-500 to-blue-600',
          visible: true,
          order: 1
        },
        {
          id: '2',
          name: '패션',
          icon: 'shirt',
          link: '/products/fashion',
          color: 'bg-gradient-to-r from-pink-500 to-pink-600',
          visible: true,
          order: 2
        },
        {
          id: '3',
          name: '생활용품',
          icon: 'home',
          link: '/products/lifestyle',
          color: 'bg-gradient-to-r from-green-500 to-green-600',
          visible: true,
          order: 3
        },
        {
          id: '4',
          name: '스포츠',
          icon: 'package',
          link: '/products/sports',
          color: 'bg-gradient-to-r from-orange-500 to-orange-600',
          visible: true,
          order: 4
        },
        {
          id: '5',
          name: '뷰티',
          icon: 'shopping-bag',
          link: '/products/beauty',
          color: 'bg-gradient-to-r from-purple-500 to-purple-600',
          visible: true,
          order: 5
        },
        {
          id: '6',
          name: '시계',
          icon: 'watch',
          link: '/products/watches',
          color: 'bg-gradient-to-r from-gray-500 to-gray-600',
          visible: true,
          order: 6
        }
      ]
    }
  },
  {
    key: 'quicklinks',
    title: '바로가기 링크',
    type: 'quicklinks',
    isActive: true,
    order: 3,
    data: {
      links: [
        {
          id: '1',
          title: '인기 상품',
          description: '지금 가장 인기 있는 상품들',
          link: '/products/popular',
          icon: 'star',
          bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          textColor: 'text-white',
          visible: true,
          order: 1
        },
        {
          id: '2',
          title: '특가 할인',
          description: '놓치면 후회할 특별 할인',
          link: '/products/sale',
          icon: 'gift',
          bgColor: 'bg-gradient-to-r from-red-500 to-pink-500',
          textColor: 'text-white',
          visible: true,
          order: 2
        },
        {
          id: '3',
          title: '신상품',
          description: '따끈따끈한 신상품 소식',
          link: '/products/new',
          icon: 'zap',
          bgColor: 'bg-gradient-to-r from-green-500 to-teal-500',
          textColor: 'text-white',
          visible: true,
          order: 3
        }
      ]
    }
  },
  {
    key: 'promo',
    title: '프로모션 배너',
    type: 'promo',
    isActive: true,
    order: 4,
    data: {
      banners: [
        {
          id: '1',
          title: '겨울 시즌 특가 이벤트',
          subtitle: '따뜻한 겨울용품 최대 40% 할인',
          buttonText: '지금 쇼핑하기',
          link: '/events/winter-sale',
          backgroundColor: 'bg-gradient-to-r from-blue-600 to-purple-600',
          textColor: 'text-white',
          visible: true,
          order: 1
        },
        {
          id: '2',
          title: '신규 회원 전용 혜택',
          subtitle: '가입 즉시 10% 쿠폰 + 무료배송',
          buttonText: '회원가입하기',
          link: '/auth/register',
          backgroundColor: 'bg-gradient-to-r from-emerald-500 to-teal-600',
          textColor: 'text-white',
          visible: true,
          order: 2
        }
      ]
    }
  },
  {
    key: 'ranking',
    title: '실시간 랭킹',
    type: 'ranking',
    isActive: true,
    order: 5,
    data: {
      rankings: {
        popular: [
          {
            id: '1',
            rank: 1,
            title: '무선 이어폰 Pro Max',
            description: '최고급 무선 이어폰',
            price: '₩299,000',
            originalPrice: '₩349,000',
            image: '/placeholder.svg',
            link: '/products/1',
            badge: 'BEST',
            rating: 4.9
          },
          {
            id: '2',
            rank: 2,
            title: '스마트 워치 Series 10',
            description: '건강 관리의 새로운 차원',
            price: '₩499,000',
            image: '/placeholder.svg',
            link: '/products/2',
            rating: 4.8
          },
          {
            id: '3',
            rank: 3,
            title: '프리미엄 백팩',
            description: '일상과 여행을 위한 완벽한 백팩',
            price: '₩159,000',
            originalPrice: '₩199,000',
            image: '/placeholder.svg',
            link: '/products/3',
            rating: 4.7
          },
          {
            id: '4',
            rank: 4,
            title: 'USB-C 멀티 허브',
            description: '모든 연결을 한 번에',
            price: '₩89,000',
            image: '/placeholder.svg',
            link: '/products/4',
            rating: 4.6
          },
          {
            id: '5',
            rank: 5,
            title: '게이밍 키보드',
            description: '프로게이머를 위한 선택',
            price: '₩199,000',
            image: '/placeholder.svg',
            link: '/products/5',
            rating: 4.5
          }
        ],
        urgent: [
          {
            id: '6',
            rank: 1,
            title: '한정판 스니커즈',
            description: '24시간 한정 특가',
            price: '₩149,000',
            originalPrice: '₩249,000',
            image: '/placeholder.svg',
            link: '/products/6',
            badge: '6시간 남음',
            rating: 4.8
          },
          {
            id: '7',
            rank: 2,
            title: '노트북 스탠드',
            description: '재고 한정 특가',
            price: '₩49,000',
            originalPrice: '₩79,000',
            image: '/placeholder.svg',
            link: '/products/7',
            badge: '재고 5개',
            rating: 4.4
          }
        ]
      }
    }
  },
  {
    key: 'recommended',
    title: '추천 상품',
    type: 'recommended',
    isActive: true,
    order: 6,
    data: {
      items: [
        {
          id: '1',
          title: '프리미엄 커피 머신',
          description: '집에서 즐기는 카페 퀄리티',
          price: '₩399,000',
          originalPrice: '₩499,000',
          image: '/placeholder.svg',
          link: '/products/coffee-machine',
          rating: 4.9,
          reviewCount: 1234,
          isNew: false,
          isSale: true
        },
        {
          id: '2',
          title: '무선 충전 패드',
          description: '빠르고 안전한 무선 충전',
          price: '₩59,000',
          image: '/placeholder.svg',
          link: '/products/wireless-charger',
          rating: 4.7,
          reviewCount: 856,
          isNew: true,
          isSale: false
        },
        {
          id: '3',
          title: '스마트 홈 스피커',
          description: '음성으로 조작하는 스마트 라이프',
          price: '₩129,000',
          image: '/placeholder.svg',
          link: '/products/smart-speaker',
          rating: 4.6,
          reviewCount: 642,
          isNew: false,
          isSale: false,
          badge: 'CHOICE'
        },
        {
          id: '4',
          title: '블루투스 헤드폰',
          description: '몰입감 넘치는 사운드 경험',
          price: '₩199,000',
          originalPrice: '₩259,000',
          image: '/placeholder.svg',
          link: '/products/bluetooth-headphone',
          rating: 4.8,
          reviewCount: 934,
          isNew: false,
          isSale: true
        }
      ]
    }
  }
]

async function main() {
  console.log('🌱 Seeding UI sections...')

  try {
    for (const sectionData of defaultUISections) {
      await prisma.uISection.upsert({
        where: {
          key: sectionData.key
        },
        update: {
          title: sectionData.title,
          type: sectionData.type,
          isActive: sectionData.isActive,
          order: sectionData.order,
          data: sectionData.data,
          updatedAt: new Date()
        },
        create: {
          key: sectionData.key,
          title: sectionData.title,
          type: sectionData.type,
          isActive: sectionData.isActive,
          order: sectionData.order,
          data: sectionData.data
        }
      })
    }

    console.log(`✅ Successfully seeded ${defaultUISections.length} UI sections`)
  } catch (error) {
    console.error('❌ Error seeding UI sections:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })