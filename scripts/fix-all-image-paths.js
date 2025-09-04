const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'commerce_plugin', 
  user: 'admin',
  password: 'admin123',
  ssl: false
});

async function fixAllImagePaths() {
  try {
    console.log('=== Finding products with spaces in image paths ===');
    
    // Find all products with spaces in their image URLs
    const problemImages = await pool.query(`
      SELECT p.id, p.name, pi.product_id, pi.url 
      FROM product_images pi
      JOIN products p ON p.id = pi.product_id
      WHERE pi.url LIKE '/images/products/kakao/%' AND pi.url LIKE '% %'
      ORDER BY p.name
    `);
    
    console.log(`Found ${problemImages.rows.length} images with spaces:`);
    problemImages.rows.forEach(row => {
      console.log(`Product: ${row.name} (${row.id})`);
      console.log(`  Current: ${row.url}`);
      console.log(`  Fixed: ${row.url.replace(/ /g, '_')}`);
    });
    
    // Update all image paths to replace spaces with underscores
    console.log('\n=== Updating all image paths ===');
    const updateResult = await pool.query(`
      UPDATE product_images 
      SET url = REPLACE(url, ' ', '_')
      WHERE url LIKE '/images/products/kakao/%' AND url LIKE '% %'
      RETURNING product_id, url
    `);
    
    console.log(`\nSuccessfully updated ${updateResult.rows.length} image paths:`);
    updateResult.rows.forEach(row => {
      console.log(`Product ${row.product_id}: ${row.url}`);
    });
    
    // Verify the fix
    console.log('\n=== Verification: checking for remaining spaces ===');
    const remainingSpaces = await pool.query(`
      SELECT p.id, p.name, pi.url 
      FROM product_images pi
      JOIN products p ON p.id = pi.product_id
      WHERE pi.url LIKE '/images/products/kakao/%' AND pi.url LIKE '% %'
    `);
    
    if (remainingSpaces.rows.length === 0) {
      console.log('✅ All spaces have been successfully replaced with underscores!');
    } else {
      console.log(`❌ Still found ${remainingSpaces.rows.length} paths with spaces:`);
      remainingSpaces.rows.forEach(row => {
        console.log(`${row.name}: ${row.url}`);
      });
    }
    
  } catch (error) {
    console.error('Operation failed:', error.message);
  } finally {
    await pool.end();
  }
}

fixAllImagePaths();