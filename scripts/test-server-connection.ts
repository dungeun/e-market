#!/usr/bin/env tsx

// Load environment variables FIRST
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import * as schema from '../drizzle/migrations/schema';
import * as relations from '../drizzle/migrations/relations';

async function testServerConnection() {
  try {
    console.log('🚀 서버 DB 연결 테스트 시작...');
    console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not Set');
    
    // Create a new pool with the server connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 30000,
      max: 20
    });
    
    console.log('📡 서버 데이터베이스 연결 중...');
    
    // Test basic connectivity
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    console.log('✅ 서버 연결 성공:', result.rows[0].db_name, 'at', result.rows[0].current_time);
    client.release();
    
    // Test Drizzle with server schema
    console.log('🔍 Drizzle ORM 테스트...');
    const db = drizzle(pool, { schema: { ...schema, ...relations } });
    
    // Get table count
    const tableCountResult = await db.execute(sql`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tableCount = parseInt(tableCountResult.rows[0].table_count as string);
    console.log('📊 서버에서', tableCount, '개 테이블 발견');
    
    // Test simple query
    const userCountResult = await db.execute(sql`SELECT COUNT(*) as user_count FROM users`);
    const userCount = parseInt(userCountResult.rows[0].user_count as string);
    console.log('👤 사용자 테이블에', userCount, '명의 사용자 존재');
    
    console.log('🎉 서버 DB + Drizzle 통합 테스트 성공!');
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ 서버 연결 테스트 실패:', error);
  }
}

testServerConnection();