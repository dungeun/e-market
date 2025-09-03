const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'commerce_plugin',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || '',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting language pack tables migration (direct execution)...\n');
    
    // Drop existing tables
    console.log('Dropping existing tables if any...');
    await client.query('DROP TABLE IF EXISTS language_pack_translations CASCADE');
    await client.query('DROP TABLE IF EXISTS language_pack_keys CASCADE');
    console.log('✅ Old tables dropped\n');
    
    // Create language_pack_keys table
    console.log('Creating language_pack_keys table...');
    await client.query(`
      CREATE TABLE language_pack_keys (
        id SERIAL PRIMARY KEY,
        key_name VARCHAR(255) UNIQUE NOT NULL,
        component_type VARCHAR(50) NOT NULL,
        component_id VARCHAR(100),
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ language_pack_keys table created\n');
    
    // Create language_pack_translations table
    console.log('Creating language_pack_translations table...');
    await client.query(`
      CREATE TABLE language_pack_translations (
        id SERIAL PRIMARY KEY,
        key_id INTEGER NOT NULL REFERENCES language_pack_keys(id) ON DELETE CASCADE,
        language_code VARCHAR(10) NOT NULL REFERENCES language_settings(code) ON DELETE CASCADE,
        translation TEXT NOT NULL,
        is_auto_translated BOOLEAN DEFAULT false,
        translator_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(key_id, language_code)
      )
    `);
    console.log('✅ language_pack_translations table created\n');
    
    // Create indexes
    console.log('Creating indexes...');
    await client.query('CREATE INDEX idx_pack_keys_component ON language_pack_keys(component_type, component_id)');
    await client.query('CREATE INDEX idx_pack_keys_active ON language_pack_keys(is_active)');
    await client.query('CREATE INDEX idx_pack_translations_lookup ON language_pack_translations(key_id, language_code)');
    await client.query('CREATE INDEX idx_pack_translations_language ON language_pack_translations(language_code)');
    console.log('✅ Indexes created\n');
    
    // Create additional tables
    console.log('Creating additional tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS translation_cache (
        id SERIAL PRIMARY KEY,
        source_text TEXT NOT NULL,
        source_language VARCHAR(10) NOT NULL,
        target_language VARCHAR(10) NOT NULL,
        translated_text TEXT NOT NULL,
        provider VARCHAR(50) DEFAULT 'google',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(source_text, source_language, target_language)
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS ui_config (
        id SERIAL PRIMARY KEY,
        config_key VARCHAR(100) UNIQUE NOT NULL,
        config_value JSONB NOT NULL,
        config_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Additional tables created\n');
    
    // Insert language pack keys
    console.log('Inserting language pack keys...');
    const keysData = [
      // Hero Section
      ['hero.title', 'section', 'hero', 'Hero section main title'],
      ['hero.subtitle', 'section', 'hero', 'Hero section subtitle'],
      ['hero.cta_primary', 'section', 'hero', 'Primary call-to-action button'],
      ['hero.cta_secondary', 'section', 'hero', 'Secondary call-to-action button'],
      // Category Section
      ['category.title', 'section', 'category', 'Category section title'],
      ['category.view_all', 'section', 'category', 'View all categories link'],
      // QuickLinks Section
      ['quicklinks.title', 'section', 'quicklinks', 'Quick links section title'],
      // Promo Section
      ['promo.title', 'section', 'promo', 'Promotion section title'],
      ['promo.badge', 'section', 'promo', 'Promotion badge text'],
      // Ranking Section
      ['ranking.title', 'section', 'ranking', 'Ranking section title'],
      ['ranking.subtitle', 'section', 'ranking', 'Ranking section subtitle'],
      // Recommended Section
      ['recommended.title', 'section', 'recommended', 'Recommended products title'],
      ['recommended.subtitle', 'section', 'recommended', 'Recommended products subtitle'],
      // Best Sellers Section
      ['bestsellers.title', 'section', 'bestsellers', 'Best sellers section title'],
      ['bestsellers.badge', 'section', 'bestsellers', 'Best seller badge'],
      // New Arrivals Section
      ['newarrivals.title', 'section', 'newarrivals', 'New arrivals section title'],
      ['newarrivals.badge', 'section', 'newarrivals', 'New arrival badge'],
      // Flash Sale Section
      ['flashsale.title', 'section', 'flashsale', 'Flash sale section title'],
      ['flashsale.timer', 'section', 'flashsale', 'Flash sale timer text'],
      ['flashsale.ends_in', 'section', 'flashsale', 'Sale ends in text'],
      // Common UI Elements
      ['common.add_to_cart', 'common', null, 'Add to cart button'],
      ['common.view_details', 'common', null, 'View details link'],
      ['common.price', 'common', null, 'Price label'],
      ['common.sale_price', 'common', null, 'Sale price label'],
      ['common.out_of_stock', 'common', null, 'Out of stock message'],
      ['common.in_stock', 'common', null, 'In stock message'],
      ['common.loading', 'common', null, 'Loading message'],
      ['common.error', 'common', null, 'Error message'],
      // Header
      ['header.search_placeholder', 'header', null, 'Search bar placeholder'],
      ['header.login', 'header', null, 'Login button'],
      ['header.signup', 'header', null, 'Sign up button'],
      ['header.my_account', 'header', null, 'My account link'],
      ['header.cart', 'header', null, 'Shopping cart'],
      // Footer
      ['footer.about', 'footer', null, 'About us link'],
      ['footer.contact', 'footer', null, 'Contact link'],
      ['footer.privacy', 'footer', null, 'Privacy policy link'],
      ['footer.terms', 'footer', null, 'Terms of service link'],
      ['footer.copyright', 'footer', null, 'Copyright text']
    ];
    
    for (const [key_name, component_type, component_id, description] of keysData) {
      await client.query(
        'INSERT INTO language_pack_keys (key_name, component_type, component_id, description) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [key_name, component_type, component_id, description]
      );
    }
    console.log(`✅ Inserted ${keysData.length} language pack keys\n`);
    
    // Insert Korean translations
    console.log('Inserting Korean translations...');
    const translations = {
      'hero.title': '특별한 쇼핑 경험',
      'hero.subtitle': '최고의 상품을 최저가로 만나보세요',
      'hero.cta_primary': '쇼핑 시작하기',
      'hero.cta_secondary': '더 알아보기',
      'category.title': '카테고리',
      'category.view_all': '전체 보기',
      'quicklinks.title': '바로가기',
      'promo.title': '프로모션',
      'promo.badge': '특가',
      'ranking.title': '실시간 랭킹',
      'ranking.subtitle': '지금 가장 인기있는 상품',
      'recommended.title': '추천 상품',
      'recommended.subtitle': '당신을 위한 맞춤 추천',
      'bestsellers.title': '베스트셀러',
      'bestsellers.badge': 'BEST',
      'newarrivals.title': '신상품',
      'newarrivals.badge': 'NEW',
      'flashsale.title': '플래시 세일',
      'flashsale.timer': '남은 시간',
      'flashsale.ends_in': '종료까지',
      'common.add_to_cart': '장바구니 담기',
      'common.view_details': '상세보기',
      'common.price': '가격',
      'common.sale_price': '할인가',
      'common.out_of_stock': '품절',
      'common.in_stock': '재고 있음',
      'common.loading': '로딩 중...',
      'common.error': '오류가 발생했습니다',
      'header.search_placeholder': '상품 검색...',
      'header.login': '로그인',
      'header.signup': '회원가입',
      'header.my_account': '내 계정',
      'header.cart': '장바구니',
      'footer.about': '회사 소개',
      'footer.contact': '문의하기',
      'footer.privacy': '개인정보처리방침',
      'footer.terms': '이용약관',
      'footer.copyright': '© 2025 Commerce. All rights reserved.'
    };
    
    for (const [key_name, translation] of Object.entries(translations)) {
      await client.query(`
        INSERT INTO language_pack_translations (key_id, language_code, translation, is_auto_translated)
        SELECT id, 'ko', $2, false
        FROM language_pack_keys
        WHERE key_name = $1
        ON CONFLICT DO NOTHING
      `, [key_name, translation]);
    }
    console.log(`✅ Inserted ${Object.keys(translations).length} Korean translations\n`);
    
    // Verify results
    console.log('📊 Verification:');
    const keysCount = await client.query('SELECT COUNT(*) as count FROM language_pack_keys');
    console.log(`   - Language pack keys: ${keysCount.rows[0].count}`);
    
    const transCount = await client.query('SELECT COUNT(*) as count FROM language_pack_translations');
    console.log(`   - Translations: ${transCount.rows[0].count}`);
    
    const stats = await client.query(`
      SELECT component_type, COUNT(*) as count
      FROM language_pack_keys
      GROUP BY component_type
      ORDER BY component_type
    `);
    console.log('\n📋 Keys by Component Type:');
    console.table(stats.rows);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('\n🎉 Language pack tables created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error.message);
    process.exit(1);
  });