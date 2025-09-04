const { Pool } = require('pg');

// API가 사용하는 올바른 데이터베이스에 연결
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'commerce_nextjs',  // API가 사용하는 데이터베이스
  user: 'postgres',
  password: 'password',
  ssl: false
});

const kakaoProducts = [
  {
    id: 'KAKAO_001',
    name: '삼성 갤럭시 S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    description: '최신 삼성 플래그십 스마트폰, 200MP 카메라와 S펜 지원',
    price: 1490000,
    originalPrice: 1690000,
    categoryId: 'electronics',
    stock: 25,
    featured: true,
    new: true,
    image: '/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04_002.jpeg'
  },
  {
    id: 'KAKAO_002',
    name: 'LG 올레드 C3 55인치 TV',
    slug: 'lg-oled-c3-55inch',
    description: '차세대 OLED 디스플레이, 완벽한 블랙과 생생한 색감',
    price: 1890000,
    originalPrice: 2290000,
    categoryId: 'electronics',
    stock: 15,
    featured: true,
    new: false,
    image: '/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04_003.jpeg'
  },
  {
    id: 'KAKAO_003',
    name: '다이슨 V15 디텍트 무선청소기',
    slug: 'dyson-v15-detect',
    description: '레이저로 미세 먼지까지 감지하는 스마트 청소기',
    price: 890000,
    originalPrice: 990000,
    categoryId: 'home-appliances',
    stock: 30,
    featured: true,
    new: true,
    image: '/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04_004.jpeg'
  },
  {
    id: 'KAKAO_004',
    name: '애플 맥북 프로 16인치 M3 Max',
    slug: 'macbook-pro-16-m3-max',
    description: 'M3 Max 칩셋으로 극한의 성능을 자랑하는 프로 노트북',
    price: 4890000,
    originalPrice: 5190000,
    categoryId: 'electronics',
    stock: 8,
    featured: true,
    new: true,
    image: '/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04_005.jpeg'
  },
  {
    id: 'KAKAO_005',
    name: '닌텐도 스위치 OLED 스플래툰3 에디션',
    slug: 'nintendo-switch-oled-splatoon3',
    description: '스플래툰3 특별 에디션, 생생한 OLED 디스플레이',
    price: 390000,
    originalPrice: 430000,
    categoryId: 'electronics',
    stock: 20,
    featured: true,
    new: false,
    image: '/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-05_006.jpeg'
  }
];

async function seedCorrectDatabase() {
  try {
    console.log('=== commerce_nextjs 데이터베이스에 연결 중 ===');
    
    // 먼저 기존 카카오 제품들 삭제
    console.log('기존 KAKAO 제품들 삭제 중...');
    const deleteImages = await pool.query(`DELETE FROM product_images WHERE product_id LIKE 'KAKAO_%'`);
    const deleteProducts = await pool.query(`DELETE FROM products WHERE id LIKE 'KAKAO_%'`);
    console.log(`삭제된 이미지: ${deleteImages.rowCount}, 삭제된 제품: ${deleteProducts.rowCount}`);
    
    // 카테고리 존재 확인
    console.log('카테고리 확인 중...');
    const categories = await pool.query(`SELECT id, name FROM categories ORDER BY id`);
    console.log('사용 가능한 카테고리:');
    categories.rows.forEach(cat => {
      console.log(`  ${cat.id}: ${cat.name}`);
    });
    
    // 올바른 카테고리 ID로 제품 삽입
    console.log('\n=== 카카오 제품들 삽입 중 ===');
    let successCount = 0;
    
    for (const product of kakaoProducts) {
      try {
        // 제품 삽입
        const productResult = await pool.query(`
          INSERT INTO products (
            id, name, slug, description, price, original_price,
            category_id, stock, featured, new, status,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
            NOW(), NOW()
          ) RETURNING id
        `, [
          product.id, product.name, product.slug, product.description,
          product.price, product.originalPrice,
          'CAT-001', // electronics 카테고리 사용
          product.stock, product.featured, product.new, '판매중'
        ]);
        
        // 제품 이미지 삽입
        await pool.query(`
          INSERT INTO product_images (
            id, product_id, url, order_index,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, NOW(), NOW()
          )
        `, [
          `img_${product.id}`, product.id, product.image, 0
        ]);
        
        console.log(`✅ ${product.name} 삽입 완료`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ ${product.name} 삽입 실패:`, error.message);
      }
    }
    
    console.log(`\n=== 완료: ${successCount}/${kakaoProducts.length} 제품 삽입 성공 ===`);
    
    // 결과 확인
    console.log('\n=== 삽입된 제품 확인 ===');
    const result = await pool.query(`
      SELECT p.id, p.name, p.featured, pi.url as image_url
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.order_index = 0
      WHERE p.id LIKE 'KAKAO_%'
      ORDER BY p.id
    `);
    
    result.rows.forEach(product => {
      console.log(`${product.name} (${product.id})`);
      console.log(`  Featured: ${product.featured}, Image: ${product.image_url}`);
    });
    
  } catch (error) {
    console.error('시드 작업 실패:', error.message);
  } finally {
    await pool.end();
  }
}

seedCorrectDatabase();