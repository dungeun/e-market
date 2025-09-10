#!/usr/bin/env tsx

// Load environment variables FIRST
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdirSync } from 'fs';

const execAsync = promisify(exec);

async function backupDatabase() {
  try {
    console.log('💾 데이터베이스 백업 시작...');
    
    // 백업 디렉토리 생성
    const backupDir = path.join(__dirname, '../backups');
    mkdirSync(backupDir, { recursive: true });
    
    // 백업 파일명 (날짜 포함)
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const backupFile = `backup_${timestamp}_${Date.now()}.sql`;
    const backupPath = `/tmp/${backupFile}`;
    
    console.log('📊 서버 데이터베이스 덤프 중...');
    
    // 서버에서 PostgreSQL 덤프 실행
    const dumpCommand = `PGPASSWORD=${process.env.DB_PASSWORD} pg_dump -U ${process.env.DB_USER} -h localhost -d ${process.env.DB_NAME} > ${backupPath}`;
    
    await execAsync(`ssh root@${process.env.DB_HOST} '${dumpCommand}'`);
    
    console.log('📥 백업 파일 다운로드 중...');
    
    // 로컬로 백업 파일 다운로드
    await execAsync(`scp root@${process.env.DB_HOST}:${backupPath} ${backupDir}/${backupFile}`);
    
    // 서버에서 임시 파일 삭제
    await execAsync(`ssh root@${process.env.DB_HOST} 'rm ${backupPath}'`);
    
    console.log(`✅ 백업 완료: backups/${backupFile}`);
    
    // 백업 파일 크기 확인
    const { stdout } = await execAsync(`ls -lh ${backupDir}/${backupFile}`);
    console.log('📁 백업 파일 정보:', stdout.trim());
    
  } catch (error) {
    console.error('❌ 데이터베이스 백업 실패:', error);
    process.exit(1);
  }
}

backupDatabase();