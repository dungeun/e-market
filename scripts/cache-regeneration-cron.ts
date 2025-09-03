#!/usr/bin/env node

/**
 * JSON 캐시 자동 재생성 크론 작업
 * 매 시간마다 실행되어 캐시를 최신 상태로 유지
 */

import * as cron from 'node-cron';
import { jsonCacheService } from '../lib/services/json-cache.service';
import { pool } from '../lib/db';
import { query } from '../lib/db';

// 환경 변수 로드
import dotenv from 'dotenv';
dotenv.config();

// 로깅 유틸리티
const log = {
  info: (message: string) => console.log(`[${new Date().toISOString()}] ℹ️  ${message}`),
  success: (message: string) => console.log(`[${new Date().toISOString()}] ✅ ${message}`),
  error: (message: string, error?: any) => console.error(`[${new Date().toISOString()}] ❌ ${message}`, error),
  warning: (message: string) => console.warn(`[${new Date().toISOString()}] ⚠️  ${message}`)
};

// 캐시 재생성 함수
async function regenerateCache() {
  log.info('캐시 재생성 시작...');
  
  try {
    // 데이터베이스는 이미 pool로 연결되어 있음
    
    // 캐시 생성 전 상품 수 확인
    const result = await query('SELECT COUNT(*) as count FROM products WHERE status = $1', ['ACTIVE']);
    const productCount = result.rows[0]?.count || 0;
    
    if (productCount === 0) {
      log.warning('활성 상품이 없어 캐시 생성을 건너뜁니다.');
      return;
    }
    
    log.info(`${productCount}개의 활성 상품으로 캐시 생성 중...`);
    
    // JSON 캐시 재생성
    await jsonCacheService.invalidateAndRegenerate();
    
    log.success('캐시 재생성 완료!');
    
    // 통계 로깅
    await logStatistics();
    
  } catch (error) {
    log.error('캐시 재생성 실패:', error);
    
    // 에러 알림 (프로덕션에서는 Slack 등으로 알림)
    if (process.env.NODE_ENV === 'production') {
      await sendErrorNotification(error);
    }
  }
}

// 캐시 통계 로깅
async function logStatistics() {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN featured = true THEN 1 END) as featured_products,
        COUNT(DISTINCT category_id) as categories,
        AVG(price) as avg_price
      FROM products 
      WHERE status = 'ACTIVE'
    `);
    
    const stat = stats.rows[0];
    log.info(`📊 캐시 통계: 상품 ${stat.total_products}개, 추천 ${stat.featured_products}개, 카테고리 ${stat.categories}개`);
  } catch (error) {
    log.warning('통계 로깅 실패');
  }
}

// 에러 알림 함수 (프로덕션 환경용)
async function sendErrorNotification(error: any) {
  // TODO: Slack, Discord, 또는 이메일 알림 구현
  console.error('Production error notification:', error);
}

// 크론 작업 시작
function startCronJob() {
  // 개발 환경: 5분마다
  // 프로덕션 환경: 매 시간
  const schedule = process.env.NODE_ENV === 'production' ? '0 * * * *' : '*/5 * * * *';
  
  log.info(`크론 작업 시작 (일정: ${schedule})`);
  
  // 크론 작업 등록
  cron.schedule(schedule, async () => {
    log.info('예약된 캐시 재생성 시작...');
    await regenerateCache();
  });
  
  // 시작 시 즉시 한 번 실행
  regenerateCache();
  
  log.success('캐시 재생성 크론 작업이 활성화되었습니다.');
}

// 종료 시그널 처리
process.on('SIGINT', async () => {
  log.info('크론 작업 종료 중...');
  if (pool) {
    await pool.end();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log.info('크론 작업 종료 중...');
  if (pool) {
    await pool.end();
  }
  process.exit(0);
});

// 메인 실행
if (require.main === module) {
  startCronJob();
  
  // 프로세스 유지
  setInterval(() => {}, 1000 * 60 * 60); // 1시간마다 heartbeat
}

export { regenerateCache, startCronJob };