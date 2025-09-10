#!/usr/bin/env tsx

// Load environment variables FIRST
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function syncSchemaToServer() {
  try {
    console.log('🔄 Drizzle 스키마 서버 동기화 시작...');
    
    // 1. Drizzle에서 SQL 생성
    console.log('📝 SQL 마이그레이션 파일 생성 중...');
    const { stdout, stderr } = await execAsync('npx drizzle-kit generate');
    
    if (stderr && !stderr.includes('No schema changes')) {
      console.log('📄 생성된 마이그레이션:', stdout);
      
      // 2. 생성된 SQL 파일 찾기
      const sqlFiles = await execAsync('ls -t drizzle/migrations/*.sql | head -1');
      const latestSqlFile = sqlFiles.stdout.trim();
      
      if (latestSqlFile) {
        console.log('📤 서버로 스키마 동기화:', latestSqlFile);
        
        // 3. 서버에 SQL 적용
        const sqlContent = await execAsync(`cat ${latestSqlFile}`);
        const dbCommand = `PGPASSWORD=${process.env.DB_PASSWORD} psql -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -h ${process.env.DB_HOST} -c "${sqlContent.stdout.replace(/"/g, '\\"')}"`;
        
        // SSH를 통해 서버에서 실행
        await execAsync(`ssh root@${process.env.DB_HOST} '${dbCommand}'`);
        
        console.log('✅ 스키마 동기화 완료!');
      } else {
        console.log('ℹ️ 적용할 스키마 변경사항이 없습니다.');
      }
    } else {
      console.log('ℹ️ 스키마 변경사항이 없습니다.');
    }
    
  } catch (error) {
    console.error('❌ 스키마 동기화 실패:', error);
    process.exit(1);
  }
}

syncSchemaToServer();