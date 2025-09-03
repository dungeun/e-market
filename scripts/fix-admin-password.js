const bcrypt = require('bcryptjs'); // bcryptjs 사용
const { Pool } = require('pg');

// PostgreSQL 연결 설정
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'commerce_plugin'
});

async function fixAdminPassword() {
  try {
    // bcryptjs로 비밀번호 해시 생성
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Generated bcryptjs password hash:', hashedPassword);
    
    // 해시 검증 테스트
    const testVerify = await bcrypt.compare('admin123', hashedPassword);
    console.log('Hash verification test:', testVerify);

    // admin@example.com 계정 비밀번호 업데이트
    const result = await pool.query(
      `UPDATE users 
       SET password = $1, updated_at = NOW() 
       WHERE email = 'admin@example.com'
       RETURNING id, email, name, type, role`,
      [hashedPassword]
    );

    if (result.rowCount > 0) {
      console.log('\n✅ Admin password updated successfully!');
      console.log('Updated user:', result.rows[0]);
      console.log('\n🔑 Login credentials:');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
      console.log('\n🌐 Login URL: http://localhost:3001/auth/login');
      console.log('   Click "🔧 관리자로 로그인" button for quick login');
    } else {
      console.log('❌ Admin user not found. Please run seed script first.');
    }
  } catch (error) {
    console.error('Error updating admin password:', error);
  } finally {
    await pool.end();
  }
}

// 스크립트 실행
fixAdminPassword();