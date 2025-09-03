// 언어 설정 초기화 스크립트
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DATABASE_USER || 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  database: process.env.DATABASE_NAME || 'commerce_nextjs',
  password: process.env.DATABASE_PASSWORD || 'password',
  port: process.env.DATABASE_PORT || 5432,
});

async function resetLanguages() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🗑️  기존 언어 설정 삭제...');
    await client.query('DELETE FROM language_settings');
    
    console.log('📝 기본 언어 설정 추가...');
    
    // 기본 언어들 추가 (한국어, 영어, 일본어)
    const languages = [
      {
        code: 'ko',
        name: 'Korean',
        native_name: '한국어',
        enabled: true,
        is_default: true,
        google_code: 'ko',
        direction: 'ltr',
        flag_emoji: '🇰🇷'
      },
      {
        code: 'en',
        name: 'English',
        native_name: 'English',
        enabled: true,
        is_default: false,
        google_code: 'en',
        direction: 'ltr',
        flag_emoji: '🇺🇸'
      },
      {
        code: 'ja',
        name: 'Japanese',
        native_name: '日本語',
        enabled: true,
        is_default: false,
        google_code: 'ja',
        direction: 'ltr',
        flag_emoji: '🇯🇵'
      }
    ];
    
    for (const lang of languages) {
      await client.query(`
        INSERT INTO language_settings (
          code, name, native_name, enabled, is_default, 
          google_code, direction, flag_emoji
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        lang.code, lang.name, lang.native_name, lang.enabled,
        lang.is_default, lang.google_code, lang.direction, lang.flag_emoji
      ]);
      
      console.log(`✅ ${lang.native_name} (${lang.code}) 추가됨`);
    }
    
    await client.query('COMMIT');
    console.log('🎉 언어 설정 초기화 완료!');
    
    // 현재 설정 확인
    const result = await client.query('SELECT * FROM language_settings ORDER BY is_default DESC, name ASC');
    console.log('\n📊 현재 언어 설정:');
    result.rows.forEach(row => {
      console.log(`${row.flag_emoji} ${row.native_name} (${row.code}) - ${row.enabled ? '활성' : '비활성'}${row.is_default ? ' [기본]' : ''}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 언어 설정 초기화 실패:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

resetLanguages().catch(console.error);