#!/usr/bin/env node

/**
 * 언어팩 데이터 마이그레이션 스크립트
 * 레거시 language_packs 테이블 → 새로운 동적 시스템으로 이전
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// PostgreSQL 연결 설정
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'commerce_nextjs',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// 로깅 함수
const log = (message, ...args) => {
  console.log(`[${new Date().toISOString()}] ${message}`, ...args);
};

const error = (message, ...args) => {
  console.error(`[${new Date().toISOString()}] ERROR: ${message}`, ...args);
};

/**
 * 레거시 테이블 존재 여부 확인
 */
async function checkLegacyTable() {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'language_packs'
      )
    `);
    return result.rows[0].exists;
  } catch (err) {
    error('Failed to check legacy table:', err);
    return false;
  }
}

/**
 * 새로운 테이블 생성 (없으면)
 */
async function createNewTables() {
  try {
    // language_pack_keys 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS language_pack_keys (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        key_name VARCHAR(255) NOT NULL UNIQUE,
        component_type VARCHAR(50),
        component_id VARCHAR(100),
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    log('✅ language_pack_keys table ready');

    // language_pack_translations 테이블
    await pool.query(`
      CREATE TABLE IF NOT EXISTS language_pack_translations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        key_id UUID NOT NULL REFERENCES language_pack_keys(id) ON DELETE CASCADE,
        language_code VARCHAR(10) NOT NULL,
        translation TEXT NOT NULL,
        is_auto_translated BOOLEAN DEFAULT false,
        translator_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(key_id, language_code)
      )
    `);
    log('✅ language_pack_translations table ready');

    // 인덱스 생성
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_language_pack_keys_key_name 
      ON language_pack_keys(key_name)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_language_pack_translations_key_id 
      ON language_pack_translations(key_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_language_pack_translations_language_code 
      ON language_pack_translations(language_code)
    `);
    log('✅ Indexes created');

  } catch (err) {
    error('Failed to create new tables:', err);
    throw err;
  }
}

/**
 * 데이터 마이그레이션
 */
async function migrateData() {
  const client = await pool.connect();
  
  try {
    // 트랜잭션 시작
    await client.query('BEGIN');

    // 레거시 데이터 조회
    const legacyData = await client.query(`
      SELECT key, ko, en, ja, zh, vi
      FROM language_packs
      ORDER BY key
    `);

    log(`📊 Found ${legacyData.rows.length} legacy records to migrate`);

    let migrated = 0;
    let skipped = 0;

    for (const row of legacyData.rows) {
      try {
        // 카테고리 추출 (점으로 구분된 첫 번째 부분)
        const keyParts = row.key.split('.');
        const category = keyParts[0] || 'general';

        // 키가 이미 존재하는지 확인
        const existingKey = await client.query(
          'SELECT id FROM language_pack_keys WHERE key_name = $1',
          [row.key]
        );

        let keyId;
        
        if (existingKey.rows.length > 0) {
          keyId = existingKey.rows[0].id;
          log(`⚠️ Key already exists: ${row.key}, updating translations...`);
        } else {
          // 새 키 생성
          const keyResult = await client.query(`
            INSERT INTO language_pack_keys (key_name, component_type, description, is_active)
            VALUES ($1, $2, $3, true)
            RETURNING id
          `, [row.key, category, `Migrated from legacy system`]);
          
          keyId = keyResult.rows[0].id;
        }

        // 각 언어별 번역 추가
        const languages = [
          { code: 'ko', value: row.ko },
          { code: 'en', value: row.en },
          { code: 'ja', value: row.ja },
          { code: 'zh', value: row.zh },
          { code: 'vi', value: row.vi }
        ];

        for (const lang of languages) {
          if (lang.value) {
            await client.query(`
              INSERT INTO language_pack_translations 
              (key_id, language_code, translation, is_auto_translated)
              VALUES ($1, $2, $3, false)
              ON CONFLICT (key_id, language_code)
              DO UPDATE SET 
                translation = EXCLUDED.translation,
                updated_at = NOW()
            `, [keyId, lang.code, lang.value]);
          }
        }

        migrated++;
        if (migrated % 10 === 0) {
          log(`Progress: ${migrated}/${legacyData.rows.length}`);
        }
      } catch (err) {
        error(`Failed to migrate key: ${row.key}`, err);
        skipped++;
      }
    }

    // 트랜잭션 커밋
    await client.query('COMMIT');
    
    log('✅ Migration completed!');
    log(`📊 Results: ${migrated} migrated, ${skipped} skipped`);

  } catch (err) {
    // 롤백
    await client.query('ROLLBACK');
    error('Migration failed, rolled back:', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * 통계 출력
 */
async function printStats() {
  try {
    const keyCount = await pool.query('SELECT COUNT(*) FROM language_pack_keys');
    const translationCount = await pool.query('SELECT COUNT(*) FROM language_pack_translations');
    const languageCount = await pool.query('SELECT COUNT(DISTINCT language_code) FROM language_pack_translations');
    
    log('📈 Migration Statistics:');
    log(`   - Total keys: ${keyCount.rows[0].count}`);
    log(`   - Total translations: ${translationCount.rows[0].count}`);
    log(`   - Languages: ${languageCount.rows[0].count}`);
  } catch (err) {
    error('Failed to get statistics:', err);
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  log('🚀 Starting language pack migration...');
  
  try {
    // 1. 레거시 테이블 확인
    const hasLegacy = await checkLegacyTable();
    if (!hasLegacy) {
      log('⚠️ Legacy language_packs table not found. Nothing to migrate.');
      process.exit(0);
    }

    // 2. 새 테이블 생성
    log('📦 Setting up new tables...');
    await createNewTables();

    // 3. 데이터 마이그레이션
    log('🔄 Migrating data...');
    await migrateData();

    // 4. 통계 출력
    await printStats();

    log('🎉 Migration completed successfully!');
    
    // 선택사항: 레거시 테이블 백업 후 삭제
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('Do you want to backup and drop the legacy table? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        try {
          // 백업 테이블 생성
          await pool.query(`
            CREATE TABLE language_packs_backup AS 
            SELECT * FROM language_packs
          `);
          log('✅ Backup created: language_packs_backup');
          
          // 레거시 테이블 삭제
          await pool.query('DROP TABLE language_packs');
          log('✅ Legacy table dropped');
        } catch (err) {
          error('Failed to backup/drop legacy table:', err);
        }
      }
      
      readline.close();
      process.exit(0);
    });

  } catch (err) {
    error('Migration failed:', err);
    process.exit(1);
  }
}

// 실행
main().catch(err => {
  error('Unhandled error:', err);
  process.exit(1);
});