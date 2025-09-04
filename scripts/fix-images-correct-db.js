const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'commerce_nextjs',
  user: 'postgres',
  password: 'password',
  ssl: false
});

async function fixImages() {
  try {
    console.log('=== product_images 테이블 스키마 확인 ===');
    const schema = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'product_images' 
      ORDER BY ordinal_position
    `);
    
    console.log('product_images 컬럼들:');
    schema.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    console.log('\n=== 카카오 제품에 이미지 추가 ===');
    
    const imageData = [
      { productId: 'KAKAO_001', url: '/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04_002.jpeg' },
      { productId: 'KAKAO_002', url: '/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04_003.jpeg' },
      { productId: 'KAKAO_003', url: '/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04_004.jpeg' },
      { productId: 'KAKAO_004', url: '/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-04_005.jpeg' },
      { productId: 'KAKAO_005', url: '/images/products/kakao/KakaoTalk_Photo_2025-09-03-18-32-05_006.jpeg' }
    ];
    
    let successCount = 0;
    for (const img of imageData) {
      try {
        // 스키마에 맞게 이미지 삽입 (updated_at 제외)
        await pool.query(`
          INSERT INTO product_images (
            id, product_id, url, order_index, created_at
          ) VALUES (
            $1, $2, $3, $4, NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            url = EXCLUDED.url
        `, [
          `img_${img.productId}`, img.productId, img.url, 0
        ]);
        
        console.log(`✅ ${img.productId} 이미지 추가 완료`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ ${img.productId} 이미지 추가 실패:`, error.message);
      }
    }
    
    console.log(`\n=== 완료: ${successCount}/${imageData.length} 이미지 추가 성공 ===`);
    
    // 최종 확인
    console.log('\n=== 최종 결과 확인 ===');
    const result = await pool.query(`
      SELECT p.id, p.name, p.featured, pi.url as image_url
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.order_index = 0
      WHERE p.id LIKE 'KAKAO_%' AND p.featured = true
      ORDER BY p.id
    `);
    
    console.log('Featured 카카오 제품들:');
    result.rows.forEach(product => {
      console.log(`${product.name}`);
      console.log(`  ID: ${product.id}`);
      console.log(`  Image: ${product.image_url || 'NULL'}`);
    });
    
  } catch (error) {
    console.error('작업 실패:', error.message);
  } finally {
    await pool.end();
  }
}

fixImages();