#!/usr/bin/env tsx

// 환경변수 로드
import { config } from 'dotenv';
config({ path: '.env.local' });

import { list } from '@vercel/blob';

/**
 * Vercel Blob Storage의 파일 목록 확인
 */
async function checkBlobStorage() {
  try {
    console.log('🔍 Vercel Blob Storage 파일 목록 확인 중...');
    
    const { blobs } = await list();
    
    console.log(`📄 총 ${blobs.length}개 파일 발견:`);
    
    for (const blob of blobs) {
      console.log(`  📁 ${blob.pathname}`);
      console.log(`     URL: ${blob.url}`);
      console.log(`     크기: ${Math.round(blob.size / 1024)}KB`);
      console.log(`     업로드: ${blob.uploadedAt}`);
      console.log('');
    }
    
    return blobs;
    
  } catch (error) {
    console.error('❌ Blob Storage 확인 실패:', error);
    throw error;
  }
}

// 스크립트 직접 실행 시에만 main 함수 호출
if (require.main === module) {
  checkBlobStorage();
}

export { checkBlobStorage };