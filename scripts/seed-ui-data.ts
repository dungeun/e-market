import { prisma } from '../lib/db/orm';

async function seedUIData() {
  console.log('🌱 Seeding UI data...');

  try {
    // Seed Language Packs
    const languagePacks = [
      // Common
      { key: 'common.home', ko: '홈', en: 'Home', ja: 'ホーム', category: 'common' },
      { key: 'common.search', ko: '검색', en: 'Search', ja: '検索', category: 'common' },
      { key: 'common.login', ko: '로그인', en: 'Login', ja: 'ログイン', category: 'common' },
      { key: 'common.logout', ko: '로그아웃', en: 'Logout', ja: 'ログアウト', category: 'common' },
      { key: 'common.signup', ko: '회원가입', en: 'Sign Up', ja: '会員登録', category: 'common' },
      
      // Header
      { key: 'header.menu.products', ko: '상품', en: 'Products', ja: '商品', category: 'header' },
      { key: 'header.menu.categories', ko: '카테고리', en: 'Categories', ja: 'カテゴリー', category: 'header' },
      { key: 'header.menu.mypage', ko: '마이페이지', en: 'My Page', ja: 'マイページ', category: 'header' },
      { key: 'header.menu.cart', ko: '장바구니', en: 'Cart', ja: 'カート', category: 'header' },
      
      // Hero Section
      { key: 'hero.title', ko: '특별한 쇼핑 경험', en: 'Special Shopping Experience', ja: '特別なショッピング体験', category: 'hero' },
      { key: 'hero.subtitle', ko: '최고의 상품을 만나보세요', en: 'Discover the Best Products', ja: '最高の商品をご覧ください', category: 'hero' },
      { key: 'hero.cta', ko: '지금 쇼핑하기', en: 'Shop Now', ja: '今すぐショッピング', category: 'hero' },
      
      // Category Section
      { key: 'category.title', ko: '카테고리별 쇼핑', en: 'Shop by Category', ja: 'カテゴリー別ショッピング', category: 'category' },
      { key: 'category.viewall', ko: '전체보기', en: 'View All', ja: 'すべて見る', category: 'category' },
      
      // Homepage
      { key: 'homepage.featured', ko: '추천 상품', en: 'Featured Products', ja: 'おすすめ商品', category: 'homepage' },
      { key: 'homepage.new', ko: '신상품', en: 'New Arrivals', ja: '新商品', category: 'homepage' },
      { key: 'homepage.bestseller', ko: '베스트셀러', en: 'Best Sellers', ja: 'ベストセラー', category: 'homepage' },
      { key: 'homepage.viewmore', ko: '더보기', en: 'View More', ja: 'もっと見る', category: 'homepage' },
    ];

    console.log('📝 Creating language packs...');
    for (const pack of languagePacks) {
      await query({
        where: { key: pack.key },
        update: pack,
        create: {
          ...pack,
          description: `${pack.category} translation`,
          isEditable: true,
        },
      });
    }
    console.log(`✅ Created ${languagePacks.length} language packs`);

    // Seed UI Sections
    const sections = [
      {
        sectionId: 'hero-banner',
        type: 'hero',
        title: '메인 배너',
        subtitle: '홈페이지 상단 메인 배너',
        order: 1,
        visible: true,
        settings: {
          autoPlay: true,
          interval: 5000,
          slides: [
            {
              id: 'slide-1',
              title: { ko: '새로운 컬렉션', en: 'New Collection', ja: '新しいコレクション' },
              subtitle: { ko: '최신 트렌드를 만나보세요', en: 'Discover Latest Trends', ja: '最新トレンドをご覧ください' },
              image: '/images/hero/slide1.jpg',
              link: '/collections/new',
              buttonText: { ko: '자세히 보기', en: 'Learn More', ja: '詳しく見る' }
            },
            {
              id: 'slide-2',
              title: { ko: '특별 할인', en: 'Special Discount', ja: '特別割引' },
              subtitle: { ko: '최대 50% 할인', en: 'Up to 50% Off', ja: '最大50％オフ' },
              image: '/images/hero/slide2.jpg',
              link: '/sale',
              buttonText: { ko: '쇼핑하기', en: 'Shop Now', ja: '今すぐショッピング' }
            }
          ]
        }
      },
      {
        sectionId: 'category-grid',
        type: 'category',
        title: '카테고리',
        subtitle: '카테고리별 쇼핑',
        order: 2,
        visible: true,
        settings: {
          title: { ko: '카테고리별 쇼핑', en: 'Shop by Category', ja: 'カテゴリー別ショッピング' },
          columns: 4,
          showImage: true,
          showCount: true
        }
      },
      {
        sectionId: 'featured-products',
        type: 'products',
        title: '추천 상품',
        subtitle: '엄선된 추천 상품',
        order: 3,
        visible: true,
        settings: {
          title: { ko: '추천 상품', en: 'Featured Products', ja: 'おすすめ商品' },
          subtitle: { ko: '엄선된 상품을 만나보세요', en: 'Discover our curated selection', ja: '厳選された商品をご覧ください' },
          filter: 'featured',
          limit: 8,
          columns: 4,
          showPrice: true,
          showRating: true
        }
      },
      {
        sectionId: 'new-arrivals',
        type: 'products',
        title: '신상품',
        subtitle: '새로 입고된 상품',
        order: 4,
        visible: true,
        settings: {
          title: { ko: '신상품', en: 'New Arrivals', ja: '新商品' },
          subtitle: { ko: '방금 도착한 신상품', en: 'Just arrived products', ja: '新着商品' },
          filter: 'new',
          limit: 8,
          columns: 4,
          showBadge: true
        }
      },
      {
        sectionId: 'promotion-banner',
        type: 'banner',
        title: '프로모션 배너',
        subtitle: '중간 프로모션 배너',
        order: 5,
        visible: true,
        settings: {
          image: '/images/promo/banner.jpg',
          title: { ko: '특별 이벤트', en: 'Special Event', ja: '特別イベント' },
          subtitle: { ko: '회원 전용 할인', en: 'Member Exclusive Discount', ja: '会員限定割引' },
          link: '/events/special',
          backgroundColor: '#f8f9fa'
        }
      },
      {
        sectionId: 'best-sellers',
        type: 'products',
        title: '베스트셀러',
        subtitle: '인기 상품',
        order: 6,
        visible: true,
        settings: {
          title: { ko: '베스트셀러', en: 'Best Sellers', ja: 'ベストセラー' },
          subtitle: { ko: '가장 인기있는 상품', en: 'Most Popular Products', ja: '最も人気のある商品' },
          filter: 'bestseller',
          limit: 12,
          columns: 4,
          showSalesCount: true
        }
      }
    ];

    console.log('🎨 Creating UI sections...');
    for (const section of sections) {
      await query({
        where: { sectionId: section.sectionId },
        update: section,
        create: section,
      });
    }
    console.log(`✅ Created ${sections.length} UI sections`);

    console.log('✨ UI data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding UI data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedUIData()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });