const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'commerce_plugin', 
  user: 'admin',
  password: 'admin123',
  ssl: false
});

async function checkAndFixPaths() {
  try {
    // First, check current paths
    console.log('=== Current database image paths ===');
    const currentResult = await pool.query(`
      SELECT product_id, url 
      FROM product_images 
      WHERE url LIKE '/images/products/kakao/%'
      ORDER BY product_id
    `);
    
    currentResult.rows.forEach(row => {
      console.log(`Product ${row.product_id}: ${row.url}`);
    });
    
    // Update paths to replace spaces with underscores
    console.log('\n=== Updating paths ===');
    const updateResult = await pool.query(`
      UPDATE product_images 
      SET url = REPLACE(url, ' ', '_')
      WHERE url LIKE '/images/products/kakao/%' AND url LIKE '% %'
      RETURNING product_id, url
    `);
    
    console.log(`Updated ${updateResult.rows.length} image paths:`);
    updateResult.rows.forEach(row => {
      console.log(`Product ${row.product_id}: ${row.url}`);
    });
    
    // Check updated paths
    console.log('\n=== Updated database image paths ===');
    const finalResult = await pool.query(`
      SELECT product_id, url 
      FROM product_images 
      WHERE url LIKE '/images/products/kakao/%'
      ORDER BY product_id
    `);
    
    finalResult.rows.forEach(row => {
      console.log(`Product ${row.product_id}: ${row.url}`);
    });
    
  } catch (error) {
    console.error('Operation failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkAndFixPaths();