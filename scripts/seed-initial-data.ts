import { query } from '../lib/db';

async function seedInitialData() {
  console.log('🌱 Starting to seed initial data...');

  try {
    // 1. Add UI Sections
    console.log('Adding UI sections...');
    
    const uiSections = [
      {
        id: 'hero-main',
        key: 'hero',
        type: 'hero',
        title: '메인 히어로',
        data: JSON.stringify({
          title: 'E-Market Korea에 오신 것을 환영합니다',
          subtitle: '최고의 상품을 최저가로!',
          backgroundImage: '/images/hero-bg.jpg',
          ctaText: '쇼핑 시작하기',
          ctaLink: '/products'
        }),
        order: 1,
        isActive: true
      },
      {
        id: 'category-showcase',
        key: 'categories',
        type: 'category',
        title: '카테고리',
        data: JSON.stringify({
          title: '인기 카테고리',
          categories: []
        }),
        order: 2,
        isActive: true
      },
      {
        id: 'product-grid-main',
        key: 'product-grid',
        type: 'product-grid',
        title: '상품 그리드',
        data: JSON.stringify({
          title: '추천 상품',
          productCount: 8
        }),
        order: 3,
        isActive: true
      },
      {
        id: 'promo-banner',
        key: 'promo',
        type: 'promo',
        title: '프로모션 배너',
        data: JSON.stringify({
          title: '특별 할인!',
          description: '지금 가입하면 10% 할인 쿠폰 증정',
          ctaText: '지금 가입하기',
          ctaLink: '/auth/register'
        }),
        order: 4,
        isActive: true
      }
    ];

    for (const section of uiSections) {
      await query(`
        INSERT INTO ui_sections (id, key, type, title, data, "order", "isActive", translations, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          data = $5,
          "order" = $6,
          "isActive" = $7,
          "updatedAt" = NOW()
      `, [section.id, section.key, section.type, section.title, section.data, section.order, section.isActive, '{}']);
    }
    
    console.log('✅ UI sections added');

    // 2. Add Categories
    console.log('Adding categories...');
    
    const categories = [
      { id: 'electronics', name: '전자제품', slug: 'electronics', description: '최신 전자제품', icon: '📱' },
      { id: 'fashion', name: '패션', slug: 'fashion', description: '트렌디한 패션 아이템', icon: '👕' },
      { id: 'home', name: '홈&리빙', slug: 'home', description: '집을 위한 모든 것', icon: '🏠' },
      { id: 'beauty', name: '뷰티', slug: 'beauty', description: '화장품 & 뷰티 용품', icon: '💄' },
      { id: 'food', name: '식품', slug: 'food', description: '신선한 식재료', icon: '🍎' },
      { id: 'sports', name: '스포츠', slug: 'sports', description: '스포츠 & 레저 용품', icon: '⚽' }
    ];

    for (const category of categories) {
      await query(`
        INSERT INTO categories (id, name, slug, description, icon)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          name = $2,
          description = $4
      `, [category.id, category.name, category.slug, category.description, category.icon]);
    }
    
    console.log('✅ Categories added');

    // 3. Add Sample Products
    console.log('Adding sample products...');
    
    const products = [
      {
        id: 'prod-001',
        name: '삼성 갤럭시 S24',
        slug: 'samsung-galaxy-s24',
        description: '최신 플래그십 스마트폰',
        price: 1200000,
        stock: 50,
        category_id: 'electronics',
        sku: 'SGS24-001'
      },
      {
        id: 'prod-002',
        name: '나이키 에어맥스',
        slug: 'nike-airmax',
        description: '편안한 러닝화',
        price: 150000,
        stock: 100,
        category_id: 'fashion',
        sku: 'NK-AM-001'
      },
      {
        id: 'prod-003',
        name: 'LG 스타일러',
        slug: 'lg-styler',
        description: '의류관리기',
        price: 2000000,
        stock: 20,
        category_id: 'home',
        sku: 'LG-ST-001'
      },
      {
        id: 'prod-004',
        name: '설화수 에센셜 세트',
        slug: 'sulwhasoo-essential',
        description: '프리미엄 스킨케어 세트',
        price: 250000,
        stock: 30,
        category_id: 'beauty',
        sku: 'SH-ES-001'
      },
      {
        id: 'prod-005',
        name: '한우 선물세트',
        slug: 'hanwoo-gift',
        description: '프리미엄 한우 1++',
        price: 300000,
        stock: 10,
        category_id: 'food',
        sku: 'HW-GF-001'
      },
      {
        id: 'prod-006',
        name: '윌슨 테니스 라켓',
        slug: 'wilson-racket',
        description: '프로페셔널 테니스 라켓',
        price: 180000,
        stock: 25,
        category_id: 'sports',
        sku: 'WL-TR-001'
      },
      {
        id: 'prod-007',
        name: '애플 아이폰 15 Pro',
        slug: 'iphone-15-pro',
        description: '최신 아이폰',
        price: 1500000,
        stock: 40,
        category_id: 'electronics',
        sku: 'AP-IP15-001'
      },
      {
        id: 'prod-008',
        name: '다이슨 에어랩',
        slug: 'dyson-airwrap',
        description: '헤어 스타일러',
        price: 700000,
        stock: 15,
        category_id: 'beauty',
        sku: 'DY-AW-001'
      }
    ];

    for (const product of products) {
      await query(`
        INSERT INTO products (id, name, slug, description, price, stock, category_id, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          price = $5,
          stock = $6,
          updated_at = NOW()
      `, [product.id, product.name, product.slug, product.description, product.price, product.stock, product.category_id]);
      
      // Add product images
      await query(`
        INSERT INTO product_images (id, product_id, url, order_index)
        VALUES 
          (gen_random_uuid(), $1, $2, 0),
          (gen_random_uuid(), $1, $3, 1)
        ON CONFLICT DO NOTHING
      `, [
        product.id, 
        `https://via.placeholder.com/500x500?text=${encodeURIComponent(product.name)}`,
        `https://via.placeholder.com/500x500?text=${encodeURIComponent(product.name + ' 2')}`
      ]);
    }
    
    console.log('✅ Products added');

    console.log('✅ All initial data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedInitialData();