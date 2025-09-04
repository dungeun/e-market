const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'commerce_plugin', 
  user: 'admin',
  password: 'admin123',
  ssl: false
});

async function cleanupOldProducts() {
  try {
    console.log('=== Finding all kakao-prod products ===');
    
    // Find all old kakao-prod products
    const oldProducts = await pool.query(`
      SELECT p.id, p.name, p.featured, p.status, pi.url as image_url
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.order_index = 0
      WHERE p.id LIKE 'kakao-prod-%'
      ORDER BY p.id
    `);
    
    console.log(`Found ${oldProducts.rows.length} old kakao-prod products:`);
    oldProducts.rows.forEach(product => {
      console.log(`  ${product.id}: ${product.name}`);
      console.log(`    Image: ${product.image_url || 'NULL'}`);
    });
    
    if (oldProducts.rows.length > 0) {
      console.log('\n=== Removing old kakao-prod products ===');
      
      // Delete product images first (foreign key constraint)
      const deleteImages = await pool.query(`
        DELETE FROM product_images 
        WHERE product_id LIKE 'kakao-prod-%'
        RETURNING product_id, url
      `);
      
      console.log(`Deleted ${deleteImages.rows.length} product images`);
      
      // Delete products
      const deleteProducts = await pool.query(`
        DELETE FROM products 
        WHERE id LIKE 'kakao-prod-%'
        RETURNING id, name
      `);
      
      console.log(`Deleted ${deleteProducts.rows.length} products:`);
      deleteProducts.rows.forEach(product => {
        console.log(`  ${product.id}: ${product.name}`);
      });
    }
    
    console.log('\n=== Verifying remaining featured products ===');
    const remainingFeatured = await pool.query(`
      SELECT p.id, p.name, pi.url as image_url
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.order_index = 0
      WHERE p.featured = true AND p.status = '판매중' AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC, p.name ASC
      LIMIT 10
    `);
    
    console.log(`Found ${remainingFeatured.rows.length} remaining featured products:`);
    remainingFeatured.rows.forEach(product => {
      console.log(`  ${product.name} (${product.id})`);
      console.log(`    Image: ${product.image_url || 'NULL'}`);
    });
    
  } catch (error) {
    console.error('Operation failed:', error.message);
  } finally {
    await pool.end();
  }
}

cleanupOldProducts();