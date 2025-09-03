const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin',
  database: 'commerce_plugin'
});

async function checkUISections() {
  const client = await pool.connect();
  
  try {
    console.log('Checking ui_sections table...\n');
    
    // 테이블 구조 확인
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ui_sections'
      ORDER BY ordinal_position
    `);
    
    console.log('Table columns:');
    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n---\n');
    
    // hero 섹션 조회 (API와 동일한 쿼리)
    console.log("Querying: SELECT * FROM ui_sections WHERE key = 'hero'");
    const heroResult = await client.query(`
      SELECT * FROM ui_sections 
      WHERE key = 'hero'
      LIMIT 1
    `);
    
    if (heroResult.rows.length > 0) {
      console.log('\nHero section found:');
      const hero = heroResult.rows[0];
      console.log('  id:', hero.id);
      console.log('  name:', hero.name);
      console.log('  type:', hero.type);
      console.log('  key:', hero.key);
      console.log('  title:', hero.title);
      console.log('  order:', hero.order);
      console.log('  isActive:', hero.isActive);
      console.log('  data:', hero.data ? 'Present' : 'NULL');
    } else {
      console.log('\nNo hero section found with key = "hero"');
      
      // type으로도 확인
      console.log("\nQuerying: SELECT * FROM ui_sections WHERE type = 'hero'");
      const typeResult = await client.query(`
        SELECT * FROM ui_sections 
        WHERE type = 'hero'
        LIMIT 1
      `);
      
      if (typeResult.rows.length > 0) {
        console.log('\nHero section found by type:');
        const hero = typeResult.rows[0];
        console.log('  id:', hero.id);
        console.log('  name:', hero.name);
        console.log('  type:', hero.type);
        console.log('  key:', hero.key);
        console.log('  title:', hero.title);
      }
    }
    
    // 모든 섹션 목록
    console.log('\n---\nAll sections:');
    const allResult = await client.query('SELECT id, name, type, key FROM ui_sections');
    allResult.rows.forEach(section => {
      console.log(`  - ${section.name} (type: ${section.type}, key: ${section.key})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkUISections().catch(console.error);