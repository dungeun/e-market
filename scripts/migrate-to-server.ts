#!/usr/bin/env tsx

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

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

async function migrateData() {
  try {
    console.log('🚀 서버 DB에 확장 프로그램 설치...');
    
    // 서버에 필요한 확장 설치
    await serverPool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE EXTENSION IF NOT EXISTS "pg_trgm";
      CREATE EXTENSION IF NOT EXISTS "btree_gin";
    `);
    
    console.log('✅ 확장 프로그램 설치 완료');
    
    console.log('📋 로컬 DB에서 스키마 정보 추출...');
    
    // 로컬에서 스키마 정보 가져오기
    const tablesResult = await localPool.query(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    
    console.log(`📊 총 ${tablesResult.rows.length}개 테이블 발견`);
    
    // 각 테이블의 DDL 생성 및 적용
    for (const table of tablesResult.rows) {
      const tableName = table.tablename;
      console.log(`🔄 ${tableName} 테이블 처리 중...`);
      
      try {
        // 테이블 구조 복사
        const createTableResult = await localPool.query(`
          SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position;
        `, [tableName]);
        
        // 기본 테이블 생성 (제약조건 제외)
        let createTableSQL = `CREATE TABLE IF NOT EXISTS "${tableName}" (`;
        const columns = createTableResult.rows.map(col => {
          let colDef = `"${col.column_name}" ${col.data_type}`;
          if (col.character_maximum_length) {
            colDef += `(${col.character_maximum_length})`;
          }
          if (col.is_nullable === 'NO') {
            colDef += ' NOT NULL';
          }
          if (col.column_default && !col.column_default.includes('nextval')) {
            colDef += ` DEFAULT ${col.column_default}`;
          }
          return colDef;
        });
        createTableSQL += columns.join(', ') + ');';
        
        await serverPool.query(createTableSQL);
        console.log(`✅ ${tableName} 테이블 생성 완료`);
        
      } catch (error) {
        console.warn(`⚠️ ${tableName} 테이블 생성 중 오류 (계속 진행):`, error.message);
      }
    }
    
    console.log('🎉 마이그레이션 완료!');
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
  } finally {
    await localPool.end();
    await serverPool.end();
  }
}

migrateData();