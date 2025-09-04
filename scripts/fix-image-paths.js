const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'commerce_plugin', 
  user: 'admin',
  password: 'admin123',
  ssl: false
});

async function fixImagePaths() {
  try {
    // 이미지 경로의 공백을 언더스코어로 변경
    const result = await pool.query(`
      UPDATE product_images 
      SET url = REPLACE(url, ' ', '_')
      WHERE url LIKE '/images/products/kakao/KakaoTalk_Photo%'
      RETURNING product_id, url
    `);
    
    console.log('이미지 경로 수정 완료:');
    result.rows.forEach(row => {
      console.log(`Product ID ${row.product_id}: ${row.url}`);
    });
    
    // 실제로 파일이 있는지 확인
    const fs = require('fs');
    const path = require('path');
    
    console.log('\n실제 파일 존재 확인:');
    result.rows.forEach(row => {
      const filePath = path.join(process.cwd(), 'public', row.url);
      const exists = fs.existsSync(filePath);
      console.log(`${row.url}: ${exists ? '✅ 존재' : '❌ 없음'}`);
    });
    
  } catch (error) {
    console.error('이미지 경로 수정 실패:', error.message);
  } finally {
    await pool.end();
  }
}

fixImagePaths();