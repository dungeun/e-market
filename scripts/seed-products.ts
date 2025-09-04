import { query } from '../lib/db';
import fs from 'fs';
import path from 'path';

// 상품 데이터 타입
interface ProductData {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  categoryId: string;
  brand?: string;
  condition: string;
  stock: number;
  images: string[];
  featured: boolean;
  new: boolean;
  usagePeriod?: string;
  purchaseDate?: string;
  detailedDescription?: string;
}

// 카테고리별 상품 데이터 정의
const productDataSet: ProductData[] = [
  {
    name: '갤럭시 S23 울트라 256GB',
    description: '삼성 갤럭시 S23 울트라, 완벽한 상태의 플래그십 스마트폰',
    price: 980000,
    originalPrice: 1599000,
    categoryId: 'CAT-006', // electronics category
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
    categoryId: 'CAT-006', // electronics category
    brand: 'Apple',
    condition: 'S',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 003.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '3개월',
    purchaseDate: '2024-06',
    detailedDescription: '개봉만 한 제품입니다. 사용 흔적 전혀 없음.'
  },
  {
    name: 'LG 그램 17인치 노트북',
    description: 'LG 그램 17Z95N, 초경량 고성능 노트북',
    price: 1450000,
    originalPrice: 2190000,
    categoryId: 'CAT-006', // electronics category
    brand: 'LG',
    condition: 'A',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 004.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '8개월',
    purchaseDate: '2024-01',
    detailedDescription: '업무용으로 사용했던 LG 그램입니다. 성능 매우 좋습니다.'
  },
  {
    name: '다이슨 V15 무선청소기',
    description: '다이슨 V15 디텍트 앱솔루트, 최고급 무선청소기',
    price: 650000,
    originalPrice: 990000,
    categoryId: 'appliances',
    brand: 'Dyson',
    condition: 'A',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04 005.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '1년',
    purchaseDate: '2023-09',
    detailedDescription: '정상 작동하는 다이슨 청소기입니다. 모든 구성품 포함.'
  },
  {
    name: '발뮤다 토스터 오븐',
    description: '발뮤다 더 토스터, 프리미엄 스팀 토스터',
    price: 180000,
    originalPrice: 329000,
    categoryId: 'appliances',
    brand: 'Balmuda',
    condition: 'B',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-05 006.jpeg'],
    featured: false,
    new: false,
    usagePeriod: '2년',
    purchaseDate: '2022-09',
    detailedDescription: '사용감 있지만 기능은 완벽한 발뮤다 토스터입니다.'
  },
  {
    name: 'LG 스타일러 블랙 에디션',
    description: 'LG 스타일러 S5MB, 의류관리기',
    price: 890000,
    originalPrice: 1390000,
    categoryId: 'appliances',
    brand: 'LG',
    condition: 'A',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-05 007.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '1년 6개월',
    purchaseDate: '2023-03',
    detailedDescription: '깔끔하게 사용한 LG 스타일러입니다. 향균시트 포함.'
  },
  {
    name: 'iPad Pro 12.9 6세대 Wi-Fi',
    description: 'Apple iPad Pro 12.9인치, M2 칩셋 탑재',
    price: 1180000,
    originalPrice: 1729000,
    categoryId: 'CAT-006', // electronics category
    brand: 'Apple',
    condition: 'S',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-05 008.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '2개월',
    purchaseDate: '2024-07',
    detailedDescription: '거의 사용하지 않은 iPad Pro입니다. Apple Pencil 포함.'
  },
  {
    name: 'Sony WH-1000XM5 헤드폰',
    description: '소니 노이즈캔슬링 헤드폰, 최상급 음질',
    price: 320000,
    originalPrice: 499000,
    categoryId: 'CAT-006', // electronics category
    brand: 'Sony',
    condition: 'A',
    stock: 2,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-05 009.jpeg'],
    featured: false,
    new: false,
    usagePeriod: '6개월',
    purchaseDate: '2024-03',
    detailedDescription: '음질 최고의 소니 헤드폰입니다. 케이스 및 케이블 포함.'
  },
  {
    name: '닌텐도 스위치 OLED 스플래툰3',
    description: '닌텐도 스위치 OLED 스플래툰3 에디션',
    price: 380000,
    originalPrice: 450000,
    categoryId: 'CAT-006', // electronics category
    brand: 'Nintendo',
    condition: 'A',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-05 010.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '4개월',
    purchaseDate: '2024-05',
    detailedDescription: '스플래툰3 에디션 한정판입니다. 게임 카트리지 2개 포함.'
  },
  {
    name: '삼성 비스포크 냉장고',
    description: '삼성 비스포크 4도어 냉장고, 글램 화이트',
    price: 1890000,
    originalPrice: 3290000,
    categoryId: 'appliances',
    brand: 'Samsung',
    condition: 'B',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-05 011.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '2년',
    purchaseDate: '2022-09',
    detailedDescription: '이사로 인해 판매합니다. 정상 작동하며 외관 깨끗합니다.'
  },
  {
    name: 'LG 올레드 TV 55인치',
    description: 'LG OLED55C3KNA, 최신형 OLED TV',
    price: 1590000,
    originalPrice: 2490000,
    categoryId: 'CAT-006', // electronics category
    brand: 'LG',
    condition: 'A',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-05 012.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '6개월',
    purchaseDate: '2024-03',
    detailedDescription: '화질 최고의 LG OLED TV입니다. 벽걸이 브라켓 포함.'
  },
  {
    name: '허먼밀러 에어론 체어',
    description: '허먼밀러 에어론 리마스터드, 최고급 사무용 의자',
    price: 1280000,
    originalPrice: 1890000,
    categoryId: 'furniture',
    brand: 'Herman Miller',
    condition: 'A',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-06 013.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '1년',
    purchaseDate: '2023-09',
    detailedDescription: '허리 건강을 위한 최고의 의자입니다. 12년 워런티 양도 가능.'
  },
  {
    name: '무인양품 원목 책상',
    description: '무인양품 오크 원목 책상 140cm',
    price: 280000,
    originalPrice: 450000,
    categoryId: 'furniture',
    brand: 'MUJI',
    condition: 'B',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-06 014.jpeg'],
    featured: false,
    new: false,
    usagePeriod: '3년',
    purchaseDate: '2021-09',
    detailedDescription: '튼튼한 원목 책상입니다. 사용감은 있지만 상태 양호합니다.'
  },
  {
    name: '이케아 킬립 3인 소파',
    description: '이케아 킬립 3인용 소파, 그레이',
    price: 450000,
    originalPrice: 799000,
    categoryId: 'furniture',
    brand: 'IKEA',
    condition: 'A',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-06 015.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '1년 6개월',
    purchaseDate: '2023-03',
    detailedDescription: '편안한 3인용 소파입니다. 커버 세탁 가능.'
  },
  {
    name: '삼성 갤럭시워치6 클래식',
    description: '갤럭시워치6 클래식 47mm, 블랙',
    price: 320000,
    originalPrice: 459000,
    categoryId: 'CAT-006', // electronics category
    brand: 'Samsung',
    condition: 'A',
    stock: 2,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-06 016.jpeg'],
    featured: false,
    new: false,
    usagePeriod: '5개월',
    purchaseDate: '2024-04',
    detailedDescription: '회전 베젤이 특징인 갤럭시워치입니다. 여분 스트랩 포함.'
  },
  {
    name: '애플워치 울트라2',
    description: 'Apple Watch Ultra 2, 티타늄',
    price: 980000,
    originalPrice: 1149000,
    categoryId: 'CAT-006', // electronics category
    brand: 'Apple',
    condition: 'S',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-06 017.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '1개월',
    purchaseDate: '2024-08',
    detailedDescription: '최신 애플워치 울트라2입니다. 보증기간 남아있음.'
  },
  {
    name: '맥북 프로 16인치 M3 Max',
    description: 'MacBook Pro 16인치, M3 Max 칩',
    price: 3890000,
    originalPrice: 5390000,
    categoryId: 'CAT-006', // electronics category
    brand: 'Apple',
    condition: 'S',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-07 018.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '2개월',
    purchaseDate: '2024-07',
    detailedDescription: '최고 사양 맥북 프로입니다. 애플케어+ 가입 제품.'
  },
  {
    name: '플레이스테이션5 스파이더맨2',
    description: 'PS5 스파이더맨2 동봉판',
    price: 580000,
    originalPrice: 688000,
    categoryId: 'CAT-006', // electronics category
    brand: 'Sony',
    condition: 'A',
    stock: 1,
    images: ['/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-07 019.jpeg'],
    featured: true,
    new: false,
    usagePeriod: '3개월',
    purchaseDate: '2024-06',
    detailedDescription: 'PS5 디스크 에디션 스파이더맨2 동봉판입니다. 듀얼센스 컨트롤러 2개.'
  }
];

async function seedProducts() {
  console.log('🌱 상품 데이터 시딩 시작...');
  
  try {
    // 먼저 기존 상품 데이터 확인
    const existingProducts = await query('SELECT COUNT(*) as count FROM products');
    console.log(`현재 상품 수: ${existingProducts.rows[0].count}`);

    // 카테고리 확인 및 생성
    const categories = [
      { id: 'electronics', name: '전자제품', slug: 'electronics', icon: '📱' },
      { id: 'appliances', name: '가전제품', slug: 'appliances', icon: '🏠' },
      { id: 'furniture', name: '가구', slug: 'furniture', icon: '🪑' }
    ];

    for (const category of categories) {
      try {
        const existingCat = await query('SELECT id FROM categories WHERE id = $1 OR slug = $2', [category.id, category.slug]);
        if (existingCat.rows.length === 0) {
          await query(
            'INSERT INTO categories (id, name, slug, icon, is_active) VALUES ($1, $2, $3, $4, $5)',
            [category.id, category.name, category.slug, category.icon, true]
          );
          console.log(`✅ 카테고리 생성: ${category.name}`);
        } else {
          console.log(`ℹ️ 카테고리 이미 존재: ${category.name}`);
        }
      } catch (error) {
        console.log(`⚠️ 카테고리 처리 스킵: ${category.name}`);
      }
    }

    // 상품 데이터 삽입
    let successCount = 0;
    let errorCount = 0;

    for (const product of productDataSet) {
      try {
        const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const slug = product.name.toLowerCase()
          .replace(/[^\w\s가-힣]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 100);

        // 상품 테이블에 삽입
        const result = await query(`
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
          slug,
          product.description,
          product.price,
          product.originalPrice,
          product.categoryId,
          product.stock,
          product.featured,
          product.new,
          '판매중'
        ]);

        // 상품 이미지 삽입
        if (product.images.length > 0) {
          for (let i = 0; i < product.images.length; i++) {
            const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await query(`
              INSERT INTO product_images (
                id, product_id, url, order_index, image_type,
                created_at
              ) VALUES (
                $1, $2, $3, $4, $5, NOW()
              )
            `, [
              imageId,
              productId,
              product.images[i],
              i,
              'thumbnail'
            ]);
          }
        }

        // 특가 상품 설정은 스킵 (테이블이 없을 수 있음)
        // const discountRate = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

        successCount++;
        console.log(`✅ 상품 등록 완료: ${product.name}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ 상품 등록 실패: ${product.name}`, error);
      }
    }

    console.log('\n📊 시딩 결과:');
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    
    // 최종 상품 수 확인
    const finalProducts = await query('SELECT COUNT(*) as count FROM products');
    console.log(`최종 상품 수: ${finalProducts.rows[0].count}`);

  } catch (error) {
    console.error('시딩 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
seedProducts().then(() => {
  console.log('✨ 상품 시딩 완료!');
  process.exit(0);
}).catch((error) => {
  console.error('시딩 실패:', error);
  process.exit(1);
});