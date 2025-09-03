const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// PostgreSQL 연결 설정
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'commerce_plugin'
});

async function updateAdminPassword() {
  try {
    // 비밀번호 해시 생성
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Generated password hash:', hashedPassword);

    // admin@example.com 계정 비밀번호 업데이트
    const result = await pool.query(
      `UPDATE users 
       SET password = $1, updated_at = NOW() 
       WHERE email = 'admin@example.com'
       RETURNING id, email, name`,
      [hashedPassword]
    );

    if (result.rowCount > 0) {
      console.log('✅ Admin password updated successfully!');
      console.log('Updated user:', result.rows[0]);
      console.log('\n🔑 Login credentials:');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
    } else {
      console.log('❌ Admin user not found');
      
      // 관리자 계정이 없으면 생성
      console.log('Creating new admin user...');
      const insertResult = await pool.query(
        `INSERT INTO users (id, email, password, name, type, role, status, email_verified, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING id, email, name`,
        [
          'usr_' + Math.random().toString(36).substr(2, 15),
          'admin@example.com',
          hashedPassword,
          'System Admin',
          'ADMIN',
          'ADMIN',
          'ACTIVE',
          true
        ]
      );
      
      console.log('✅ Admin user created successfully!');
      console.log('New user:', insertResult.rows[0]);
      console.log('\n🔑 Login credentials:');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
    }
  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    await pool.end();
  }
}

// 스크립트 실행
updateAdminPassword();