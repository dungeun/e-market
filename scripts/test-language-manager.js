const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: process.env.DATABASE_USER || 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  database: process.env.DATABASE_NAME || 'commerce_nextjs',
  password: process.env.DATABASE_PASSWORD || 'password',
  port: process.env.DATABASE_PORT || 5432,
});

async function testLanguageManager() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 데이터베이스 연결 테스트...');
    
    // 1. 현재 언어 설정 확인
    console.log('\n📋 현재 언어 설정:');
    const settingsResult = await client.query(
      'SELECT selected_languages, default_language FROM language_settings LIMIT 1'
    );
    
    if (settingsResult.rows.length > 0) {
      const { selected_languages, default_language } = settingsResult.rows[0];
      const selectedCodes = Array.isArray(selected_languages) ? selected_languages : JSON.parse(selected_languages);
      
      console.log('선택된 언어:', selectedCodes);
      console.log('기본 언어:', default_language);
      
      // 2. 언어 메타데이터 확인
      console.log('\n🗂️ 선택된 언어들의 메타데이터:');
      const metadataResult = await client.query(
        `SELECT code, name, native_name, flag_emoji FROM language_metadata WHERE code = ANY($1) ORDER BY 
         CASE WHEN code = $2 THEN 0 ELSE 1 END, name ASC`,
        [selectedCodes, default_language]
      );
      
      metadataResult.rows.forEach(row => {
        console.log(`${row.flag_emoji} ${row.native_name || row.name} (${row.code})${row.code === default_language ? ' [기본]' : ''}`);
      });
      
      // 3. 사용 가능한 모든 언어 메타데이터 확인
      console.log('\n🌍 사용 가능한 모든 언어:');
      const allMetadataResult = await client.query(
        'SELECT code, name, native_name, flag_emoji FROM language_metadata ORDER BY name ASC'
      );
      
      allMetadataResult.rows.forEach(row => {
        const isSelected = selectedCodes.includes(row.code);
        console.log(`${row.flag_emoji} ${row.native_name || row.name} (${row.code})${isSelected ? ' ✅ 활성' : ' ⭕ 비활성'}`);
      });
      
    } else {
      console.log('⚠️ 언어 설정을 찾을 수 없습니다.');
    }
    
    console.log('\n✅ 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testLanguageManager().catch(console.error);