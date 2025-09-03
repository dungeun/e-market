const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin',
  database: 'commerce_plugin'
});

async function testHeroAPI() {
  const client = await pool.connect();
  
  try {
    console.log('Testing API query...\n');
    
    // API에서 사용하는 정확한 쿼리
    const apiQuery = `
      SELECT * FROM ui_sections 
      WHERE key = 'hero' OR type = 'hero'
      ORDER BY "createdAt" DESC
      LIMIT 1
    `;
    
    try {
      const result = await client.query(apiQuery);
      console.log('✅ API Query succeeded');
      console.log('Rows found:', result.rows.length);
      if (result.rows.length > 0) {
        const section = result.rows[0];
        console.log('Section ID:', section.id);
        console.log('Section key:', section.key);
        console.log('Section type:', section.type);
        console.log('Has data:', !!section.data);
      }
    } catch (error) {
      console.log('❌ API Query failed:', error.message);
      console.log('\nTrying alternative query...');
      
      // createdAt이 없을 경우 대체 쿼리
      const altQuery = `
        SELECT * FROM ui_sections 
        WHERE key = 'hero' OR type = 'hero'
        LIMIT 1
      `;
      
      try {
        const altResult = await client.query(altQuery);
        console.log('✅ Alternative Query succeeded');
        console.log('Rows found:', altResult.rows.length);
        if (altResult.rows.length > 0) {
          const section = altResult.rows[0];
          console.log('Section ID:', section.id);
          console.log('Section key:', section.key);
          console.log('Section type:', section.type);
        }
      } catch (altError) {
        console.log('❌ Alternative Query also failed:', altError.message);
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testHeroAPI().catch(console.error);