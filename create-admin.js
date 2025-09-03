const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  user: 'admin',
  password: 'admin123',
  host: 'localhost',
  port: 5432,
  database: 'commerce_plugin'
});

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Generated hash:', hashedPassword);
    
    // 기존 admin 계정 삭제
    await pool.query("DELETE FROM users WHERE email = 'admin@test.com'");
    
    // 새 admin 계정 생성
    const result = await pool.query(`
      INSERT INTO users (
        id, email, password, name, role, type, status, 
        email_verified, created_at, updated_at
      ) VALUES (
        'admin_test_' || extract(epoch from now())::bigint,
        'admin@test.com',
        $1,
        'Test Admin',
        'ADMIN',
        'ADMIN',
        'ACTIVE',
        NOW(),
        NOW(),
        NOW()
      ) RETURNING id, email, role, type
    `, [hashedPassword]);
    
    console.log('Admin account created:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();