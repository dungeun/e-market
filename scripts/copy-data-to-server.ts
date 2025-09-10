#!/usr/bin/env tsx

import { Pool } from 'pg';

// 로컬 DB 연결
const localPool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'commerce',
  database: 'commerce_nextjs',
});

// 서버 DB 연결
const serverPool = new Pool({
  host: '141.164.60.51',
  port: 5432,
  user: 'nextjs_user',
  password: 'ITeRgI4nxSZCaefOaheYJLnA5',
  database: 'nextjs_production',
});

const TABLES_TO_COPY = [
  'users',
  'products', 
  'categories',
  'product_images',
  'orders',
  'order_items',
  'carts',
  'cart_items',
  'language_packs',
  'language_pack_keys',
  'language_pack_translations',
  'ui_sections',
  'system_settings',
  'products_cache'
];

async function copyData() {
  try {
    console.log('🚀 데이터 복사 시작...');
    
    for (const tableName of TABLES_TO_COPY) {
      console.log(`📊 ${tableName} 데이터 복사 중...`);
      
      try {
        // 로컬에서 데이터 조회
        const localData = await localPool.query(`SELECT * FROM "${tableName}"`);
        
        if (localData.rows.length === 0) {
          console.log(`⚠️ ${tableName} 테이블이 비어있음`);
          continue;
        }
        
        // 서버 테이블 초기화 
        await serverPool.query(`DELETE FROM "${tableName}"`);
        
        // 컬럼명 가져오기
        const columns = Object.keys(localData.rows[0]);
        const columnString = columns.map(col => `"${col}"`).join(', ');
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        
        // 각 행 데이터 삽입
        for (const row of localData.rows) {
          const values = columns.map(col => row[col]);
          
          await serverPool.query(
            `INSERT INTO "${tableName}" (${columnString}) VALUES (${placeholders})`,
            values
          );
        }
        
        console.log(`✅ ${tableName}: ${localData.rows.length}개 행 복사 완료`);
        
      } catch (error) {
        console.warn(`⚠️ ${tableName} 복사 중 오류 (계속 진행):`, error.message);
      }
    }
    
    console.log('🎉 데이터 복사 완료!');
    
  } catch (error) {
    console.error('❌ 데이터 복사 실패:', error);
  } finally {
    await localPool.end();
    await serverPool.end();
  }
}

copyData();