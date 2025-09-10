const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://commerce:secure_password@141.164.60.51:5432/commerce_db"
});

async function checkLanguageSettings() {
  try {
    // language_settings 테이블 확인
    const languageSettings = await pool.query('SELECT code, name, native_name, enabled, is_default FROM language_settings ORDER BY display_order');
    console.log('=== language_settings 테이블 ===');
    console.log(JSON.stringify(languageSettings.rows, null, 2));
    
    // 활성화된 언어만
    const enabledLanguages = await pool.query('SELECT code, name, native_name FROM language_settings WHERE enabled = true ORDER BY display_order');
    console.log('\n=== 활성화된 언어들 ===');
    console.log(JSON.stringify(enabledLanguages.rows, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkLanguageSettings();