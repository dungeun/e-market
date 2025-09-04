const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'commerce_plugin', 
  user: 'admin',
  password: 'admin123',
  ssl: false
});

async function updateStock() {
  try {
    const result = await pool.query(`
      UPDATE products 
      SET stock = CASE 
        WHEN id LIKE 'KAKAO_%' THEN FLOOR(RANDOM() * 50) + 10
        ELSE stock
      END
      WHERE id LIKE 'KAKAO_%'
      RETURNING id, name, stock
    `);
    
    console.log('재고 업데이트 완료:');
    result.rows.forEach(row => {
      console.log(`${row.name}: ${row.stock}개`);
    });
    
  } catch (error) {
    console.error('재고 업데이트 실패:', error.message);
  } finally {
    await pool.end();
  }
}

updateStock();