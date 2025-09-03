const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function setupDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'commerce_plugin',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || undefined,
  });

  try {
    console.log('🔌 PostgreSQL에 연결 중...');
    await client.connect();
    
    // 스키마 파일 읽기
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 데이터베이스 스키마 생성 중...');
    await client.query(schemaSQL);
    
    console.log('✅ 데이터베이스 설정 완료!');
    console.log('📊 생성된 테이블:');
    console.log('  - products (상품)');
    console.log('  - product_images (상품 이미지)');  
    console.log('  - categories (카테고리)');
    
  } catch (error) {
    console.error('❌ 데이터베이스 설정 실패:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();