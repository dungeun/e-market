const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:password@localhost:5432/commerce_nextjs?sslmode=disable'
});

// 카테고리별 상품 데이터 정의
const productDataSet = [
  {
    name: '갤럭시 S23 울트라 256GB',
    description: '삼성 갤럭시 S23 울트라, 완벽한 상태의 플래그십 스마트폰',
    price: 980000,
    originalPrice: 1599000,
    categoryId: 'CAT-001-1', // 스마트폰
    brand: 'Samsung',
    condition: 'A',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 002.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '6개월',
    purchaseDate: '2024-03',
    detailedDescription: '거의 사용하지 않은 갤럭시 S23 울트라입니다. 박스 및 모든 구성품 포함.'
  },
  {
    name: 'iPhone 14 Pro Max 512GB',
    description: 'Apple iPhone 14 Pro Max, 프리미엄 스마트폰',
    price: 1280000,
    originalPrice: 1899000,
    categoryId: 'CAT-001-1', // 스마트폰
    brand: 'Apple',
    condition: 'S',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 003.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '3개월',
    purchaseDate: '2024-06',
    detailedDescription: 'iOS 17 최신 업데이트, 완전 무상점 상태입니다.'
  },
  {
    name: 'LG 29인치 울트라와이드 모니터',
    description: '생산성 향상을 위한 초광각 모니터',
    price: 320000,
    originalPrice: 450000,
    categoryId: 'CAT-002-1', // TV/모니터
    brand: 'LG',
    condition: 'A',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 004.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '1년',
    purchaseDate: '2023-08',
    detailedDescription: '재택근무용으로 구매했으나 사무실 복귀로 인해 판매합니다.'
  },
  {
    name: '애플 워치 시리즈 9 45mm GPS',
    description: 'Apple Watch Series 9, 최신 헬스케어 기능',
    price: 380000,
    originalPrice: 569000,
    categoryId: 'CAT-001-6', // 스마트워치
    brand: 'Apple',
    condition: 'A+',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 005.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '4개월',
    purchaseDate: '2024-05',
    detailedDescription: 'AppleCare+ 가입된 상품, 밴드 여러개 포함 판매.'
  },
  {
    name: 'MacBook Air M2 13인치 256GB',
    description: 'Apple MacBook Air M2 칩, 휴대용 노트북',
    price: 1150000,
    originalPrice: 1690000,
    categoryId: 'CAT-001-2', // 노트북
    brand: 'Apple',
    condition: 'S',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 006.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '5개월',
    purchaseDate: '2024-04',
    detailedDescription: '대학생 할인으로 구매한 제품, 케이스 포함 판매.'
  },
  {
    name: 'iPad Pro 11인치 M2 512GB',
    description: 'Apple iPad Pro 11인치, 프로 작업용 태블릿',
    price: 950000,
    originalPrice: 1449000,
    categoryId: 'CAT-001-3', // 태블릿
    brand: 'Apple',
    condition: 'A+',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 007.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '7개월',
    purchaseDate: '2024-02',
    detailedDescription: 'Apple Pencil 2세대 및 Magic Keyboard 포함.'
  },
  {
    name: '나이키 에어맥스 270 (운동화)',
    description: '나이키 에어맥스 270, 편안한 데일리 운동화',
    price: 95000,
    originalPrice: 149000,
    categoryId: 'CAT-003-6', // 생활용품
    brand: 'Nike',
    condition: 'B+',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 008.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '6개월',
    purchaseDate: '2024-03',
    detailedDescription: '사이즈 260, 실착용 3-4회 정도, 거의 새 제품 수준.'
  },
  {
    name: '다이슨 V15 무선청소기',
    description: 'Dyson V15 Detect 무선청소기, 강력한 흡입력',
    price: 550000,
    originalPrice: 899000,
    categoryId: 'CAT-002-6', // 청소기
    brand: 'Dyson',
    condition: 'A',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 009.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '8개월',
    purchaseDate: '2024-01',
    detailedDescription: '모든 헤드 및 부속품 완비, 정기 필터 교체 완료.'
  },
  {
    name: '삼성 비스포크 냉장고 4도어',
    description: 'Samsung BESPOKE 냉장고, 프리미엄 가전',
    price: 1800000,
    originalPrice: 2650000,
    categoryId: 'CAT-002-2', // 냉장고
    brand: 'Samsung',
    condition: 'A-',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 010.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '1년 2개월',
    purchaseDate: '2023-07',
    detailedDescription: '이사로 인한 급매, 설치비 별도. 서울 강남구 직거래.'
  },
  {
    name: '로지텍 MX Master 3S 마우스',
    description: 'Logitech MX Master 3S, 프리미엄 무선마우스',
    price: 85000,
    originalPrice: 139000,
    categoryId: 'CAT-001', // 전자제품
    brand: 'Logitech',
    condition: 'A',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 011.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '5개월',
    purchaseDate: '2024-04',
    detailedDescription: '정품 리시버 및 충전 케이블 모두 포함.'
  },
  {
    name: '아디다스 울트라부스트 22 (런닝화)',
    description: 'Adidas Ultraboost 22, 프리미엄 런닝화',
    price: 110000,
    originalPrice: 180000,
    categoryId: 'CAT-003-6', // 생활용품
    brand: 'Adidas',
    condition: 'B',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 012.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '10개월',
    purchaseDate: '2023-11',
    detailedDescription: '사이즈 270, 실제 러닝 사용으로 밑창 약간 마모.'
  },
  {
    name: 'Sony WH-1000XM5 헤드폰',
    description: 'Sony WH-1000XM5 노이즈캔슬링 헤드폰',
    price: 320000,
    originalPrice: 449000,
    categoryId: 'CAT-001-4', // 이어폰/헤드폰
    brand: 'Sony',
    condition: 'A+',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 013.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '3개월',
    purchaseDate: '2024-06',
    detailedDescription: '케이스 및 모든 부속품 포함, 하루 1-2시간 사용.'
  },
  {
    name: 'KitchenAid 스탠드 믹서',
    description: 'KitchenAid Artisan 스탠드믹서, 베이킹 필수템',
    price: 380000,
    originalPrice: 599000,
    categoryId: 'CAT-002-7', // 밥솥/전기포트
    brand: 'KitchenAid',
    condition: 'A',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 014.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '6개월',
    purchaseDate: '2024-03',
    detailedDescription: '베이킹 취미로 구매했으나 사용 빈도 낮아 판매.'
  },
  {
    name: '무인양품 오크원목 책상',
    description: 'MUJI 오크무늬목 책상, 미니멀 디자인',
    price: 220000,
    originalPrice: 349000,
    categoryId: 'CAT-003-2', // 책상/의자
    brand: 'MUJI',
    condition: 'A-',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 015.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '1년',
    purchaseDate: '2023-09',
    detailedDescription: '서랍 2개 포함, 사용감 있으나 견고한 상태.'
  },
  {
    name: '니콘 D850 DSLR 카메라',
    description: 'Nikon D850 풀프레임 DSLR, 전문가용 카메라',
    price: 1850000,
    originalPrice: 2800000,
    categoryId: 'CAT-001', // 전자제품
    brand: 'Nikon',
    condition: 'A',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 016.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '1년 6개월',
    purchaseDate: '2023-03',
    detailedDescription: '24-70mm 렌즈 포함, 사진 취미생활 정리로 판매.'
  },
  {
    name: '윌슨 테니스 라켓 Pro Staff',
    description: 'Wilson Pro Staff 테니스 라켓, 프로급 사양',
    price: 180000,
    originalPrice: 280000,
    categoryId: 'CAT-003-5', // 자전거
    brand: 'Wilson',
    condition: 'B+',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 017.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '8개월',
    purchaseDate: '2024-01',
    detailedDescription: '그립 새로 교체, 레슨용으로 주 1회 사용.'
  },
  {
    name: '브레빌 에스프레소 머신',
    description: 'Breville Barista Express 에스프레소 머신',
    price: 420000,
    originalPrice: 650000,
    categoryId: 'CAT-002-7', // 밥솥/전기포트
    brand: 'Breville',
    condition: 'A',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 018.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '7개월',
    purchaseDate: '2024-02',
    detailedDescription: '내장 그라인더 포함, 정기 청소 및 디스케일링 완료.'
  },
  {
    name: '이케아 KALLAX 선반',
    description: 'IKEA KALLAX 4x4 선반유닛, 수납가구',
    price: 65000,
    originalPrice: 99000,
    categoryId: 'CAT-003-3', // 옷장/수납장
    brand: 'IKEA',
    condition: 'B+',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 019.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '2년',
    purchaseDate: '2022-09',
    detailedDescription: '이사로 인한 판매, 수납박스 4개 포함.'
  }
];

async function seedKakaoProducts() {
  console.log('🌱 Starting kakao products seeding...');
  
  try {
    // Clean up existing kakao products
    console.log('🗑️  Cleaning up existing kakao products...');
    await pool.query('DELETE FROM product_images WHERE product_id LIKE $1', ['kakao-prod-%']);
    await pool.query('DELETE FROM products WHERE id LIKE $1', ['kakao-prod-%']);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < productDataSet.length; i++) {
      const product = productDataSet[i];
      const productId = `kakao-prod-${String(i + 1).padStart(3, '0')}`;
      
      try {
        console.log(`📦 Seeding product ${i + 1}/${productDataSet.length}: ${product.name}`);
        
        // Insert product
        const result = await pool.query(`
          INSERT INTO products (
            id, name, slug, description, price, original_price,
            category_id, stock, featured, new, status,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
            NOW(), NOW()
          ) RETURNING id
        `, [
          productId,
          product.name,
          product.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-'),
          product.description,
          product.price,
          product.originalPrice,
          product.categoryId,
          product.stock,
          product.featured,
          product.new,
          '판매중'
        ]);
        
        console.log(`✅ Product created with ID: ${result.rows[0].id}`);
        
        // Insert product images
        for (let j = 0; j < product.images.length; j++) {
          const imageId = `${productId}-img-${j + 1}`;
          await pool.query(`
            INSERT INTO product_images (
              id, product_id, url, order_index, created_at
            ) VALUES ($1, $2, $3, $4, NOW())
          `, [
            imageId,
            productId,
            product.images[j],
            j
          ]);
          
          console.log(`🖼️  Image added: ${product.images[j]}`);
        }
        
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error seeding product ${product.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('🎉 Seeding completed!');
    console.log(`✅ Successfully seeded: ${successCount} products`);
    console.log(`❌ Failed to seed: ${errorCount} products`);
    
    // Verify the results
    console.log('🔍 Verifying seeded products...');
    const verifyResult = await pool.query(`
      SELECT p.name, p.price, pi.url as image_url 
      FROM products p 
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.order_index = 0 
      WHERE p.id LIKE 'kakao-prod-%' 
      ORDER BY p.created_at DESC 
      LIMIT 5
    `);
    
    console.log('📊 Sample of seeded products:');
    verifyResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} - ₩${row.price} - ${row.image_url}`);
    });
    
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error);
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding
seedKakaoProducts();