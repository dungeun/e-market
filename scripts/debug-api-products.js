const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'commerce_plugin', 
  user: 'admin',
  password: 'admin123',
  ssl: false
});

async function debugApiProducts() {
  try {
    console.log('=== Checking products that match best-seller API query ===');
    
    // Replicate the exact query from the API
    const productsResult = await pool.query(`
      SELECT 
        p.id, p.name, p.slug, p.price, p.description,
        p.category_id, p.status, p.featured, p.new, p.created_at,
        pi.url as image_url, pi.webp_url,
        COALESCE(p.rating, 4.5) as rating,
        COALESCE(p.review_count, 0) as review_count,
        COALESCE(p.stock, 0) as stock
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.order_index = 0
      WHERE p.deleted_at IS NULL
        AND p.status = '판매중'
        AND p.featured = true
      ORDER BY p.created_at DESC, p.name ASC
      LIMIT 10
    `);
    
    console.log(`Found ${productsResult.rows.length} products matching API query:`);
    
    productsResult.rows.forEach(product => {
      console.log(`\nProduct: ${product.name}`);
      console.log(`  ID: ${product.id}`);
      console.log(`  Image URL: ${product.image_url || 'NULL'}`);
      console.log(`  Featured: ${product.featured}`);
      console.log(`  Status: ${product.status}`);
      console.log(`  Created: ${product.created_at}`);
    });
    
    // Check if there are any products with old kakao-prod IDs
    console.log('\n=== Checking for old kakao-prod products ===');
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
      console.log(`    Featured: ${product.featured}, Status: ${product.status}`);
      console.log(`    Image: ${product.image_url || 'NULL'}`);
    });
    
  } catch (error) {
    console.error('Query failed:', error.message);
  } finally {
    await pool.end();
  }
}

debugApiProducts();