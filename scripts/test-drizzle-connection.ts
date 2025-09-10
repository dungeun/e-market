#!/usr/bin/env tsx

// Load environment variables FIRST
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

// Now import after env is loaded
import { connect, testDrizzleConnection, getDrizzle, close } from '../lib/db';
import { users } from '../drizzle/migrations/schema';

async function testDrizzle() {
  try {
    console.log('🚀 Drizzle 연결 테스트 시작...');
    console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not Set');
    console.log('🔍 DB_HOST:', process.env.DB_HOST);
    
    // 데이터베이스 연결
    await connect();
    console.log('✅ 기본 데이터베이스 연결 성공');
    
    // Drizzle 연결 테스트
    const drizzleTest = await testDrizzleConnection();
    console.log('📊 Drizzle 테스트 결과:', drizzleTest.message);
    
    if (drizzleTest.success) {
      console.log(`📋 총 ${drizzleTest.tableCount}개 테이블 발견`);
      
      // 실제 Drizzle 쿼리 테스트
      console.log('🔍 사용자 테이블 데이터 조회 중...');
      const drizzle = getDrizzle();
      
      // 사용자 수 확인
      const userCount = await drizzle.select().from(users).limit(1);
      console.log('👤 사용자 테이블 접근 성공:', userCount.length > 0 ? '데이터 존재' : '빈 테이블');
      
      console.log('🎉 Drizzle 완전 통합 성공!');
    } else {
      console.error('❌ Drizzle 테스트 실패');
    }
    
  } catch (error) {
    console.error('❌ 연결 테스트 중 오류:', error);
  } finally {
    await close();
    console.log('🔚 연결 종료');
  }
}

testDrizzle();