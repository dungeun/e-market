const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'commerce_nextjs',
  user: 'postgres',
  password: 'password',
  ssl: false
});

async function createTables() {
  try {
    console.log('=== 기존 테이블 확인 ===');
    const existingTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('carts', 'cart_items', 'wishlists', 'wishlist_items')
      ORDER BY table_name
    `);
    
    console.log('기존 테이블:');
    existingTables.rows.forEach(table => {
      console.log(`  ${table.table_name}`);
    });
    
    // 카트 테이블 생성
    console.log('\n=== 카트 테이블 생성 ===');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR(255),
        session_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT cart_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        cart_id VARCHAR(255) REFERENCES carts(id) ON DELETE CASCADE,
        product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(cart_id, product_id)
      )
    `);
    
    console.log('✅ 카트 테이블 생성 완료');
    
    // 위시리스트 테이블 생성
    console.log('\n=== 위시리스트 테이블 생성 ===');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR(255),
        session_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT wishlist_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        wishlist_id VARCHAR(255) REFERENCES wishlists(id) ON DELETE CASCADE,
        product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(wishlist_id, product_id)
      )
    `);
    
    console.log('✅ 위시리스트 테이블 생성 완료');
    
    // 최종 테이블 확인
    console.log('\n=== 최종 테이블 확인 ===');
    const finalTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('carts', 'cart_items', 'wishlists', 'wishlist_items')
      ORDER BY table_name
    `);
    
    console.log('생성된 테이블:');
    finalTables.rows.forEach(table => {
      console.log(`  ✅ ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('테이블 생성 실패:', error.message);
  } finally {
    await pool.end();
  }
}

createTables();