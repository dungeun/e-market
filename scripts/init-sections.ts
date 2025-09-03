import { query } from '@/lib/db';

async function initializeSections() {
  const defaultSections = [
    {
      key: 'hero',
      type: 'hero',
      title: '히어로 배너',
      order: 1,
      isActive: true,
      data: {
        slides: [
          {
            id: '1',
            title: '특별한 혜택',
            subtitle: '지금 바로 만나보세요',
            tag: '🔥 HOT',
            link: '/products',
            bgColor: '#4F46E5',
            visible: true,
            order: 1
          },
          {
            id: '2',
            title: '신규 회원 혜택',
            subtitle: '첫 구매 20% 할인',
            tag: '🎁 GIFT',
            link: '/auth/register',
            bgColor: '#EC4899',
            visible: true,
            order: 2
          }
        ]
      }
    },
    {
      key: 'category',
      type: 'category',
      title: '카테고리 메뉴',
      order: 2,
      isActive: true,
      data: {
        categories: [
          { id: 'beauty', name: '뷰티', icon: 'Sparkles', badge: 'HOT' },
          { id: 'fashion', name: '패션', icon: 'Shirt' },
          { id: 'food', name: '식품', icon: 'UtensilsCrossed', badge: 'NEW' },
          { id: 'tech', name: '전자제품', icon: 'Laptop' },
          { id: 'lifestyle', name: '라이프스타일', icon: 'Home' },
          { id: 'sports', name: '스포츠', icon: 'Dumbbell' }
        ]
      }
    },
    {
      key: 'quicklinks',
      type: 'quicklinks',
      title: '바로가기 링크',
      order: 3,
      isActive: true,
      data: {
        links: [
          { id: '1', title: '🔥 오늘의 특가', url: '/deals', color: 'bg-red-500' },
          { id: '2', title: '🎁 신상품', url: '/new-arrivals', color: 'bg-blue-500' },
          { id: '3', title: '⭐ 베스트', url: '/best', color: 'bg-yellow-500' },
          { id: '4', title: '💝 기획전', url: '/special', color: 'bg-purple-500' }
        ]
      }
    },
    {
      key: 'promo',
      type: 'promo',
      title: '프로모션 배너',
      order: 4,
      isActive: true,
      data: {
        banners: [
          {
            id: '1',
            title: '여름 시즌 세일',
            subtitle: '최대 50% 할인',
            image: '/images/promo1.jpg',
            link: '/summer-sale'
          }
        ]
      }
    },
    {
      key: 'ranking',
      type: 'ranking',
      title: '실시간 랭킹',
      order: 5,
      isActive: true,
      data: {
        title: '실시간 인기 상품',
        subtitle: '지금 가장 많이 찾는 상품'
      }
    },
    {
      key: 'recommended',
      type: 'recommended',
      title: '추천 콘텐츠',
      order: 6,
      isActive: true,
      data: {
        title: '당신을 위한 추천',
        subtitle: 'AI가 선별한 맞춤 상품'
      }
    },
    {
      key: 'featured-products',
      type: 'featured-products',
      title: '이달의 특가',
      order: 7,
      isActive: true,
      data: {
        title: '이달의 특가 상품',
        subtitle: '놓치면 후회하는 특별 할인'
      }
    }
  ];

  console.log('Initializing sections...');

  for (const section of defaultSections) {
    try {
      // Check if section exists
      const existing = await query(`
        SELECT id FROM ui_sections 
        WHERE "name" = $1 OR ("type" = $1 AND "name" IS NULL)
        LIMIT 1
      `, [section.key]);

      if (existing.rows.length === 0) {
        // Insert new section
        await query(`
          INSERT INTO ui_sections ("name", "type", "order", "isActive", "config")
          VALUES ($1, $2, $3, $4, $5)
        `, [
          section.key,
          section.type,
          section.order,
          section.isActive,
          JSON.stringify(section.data)
        ]);
        console.log(`✅ Created section: ${section.key}`);
      } else {
        console.log(`⏭️  Section already exists: ${section.key}`);
      }
    } catch (error) {
      console.error(`❌ Error creating section ${section.key}:`, error);
    }
  }

  console.log('✨ Sections initialization complete!');
}

// Run if called directly
if (require.main === module) {
  initializeSections()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { initializeSections };