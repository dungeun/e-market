const bcryptjs = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'commerce_plugin'
});

async function createTestAdmin() {
  try {
    console.log('🔧 관리자 테스트 계정 생성 시작...\n');
    
    // 1. 기존 계정 삭제
    await pool.query("DELETE FROM users WHERE email = 'admin@example.com'");
    console.log('✓ 기존 계정 삭제 완료');
    
    // 2. bcryptjs로 새 비밀번호 해시 생성
    const password = 'admin123';
    const hashedPassword = await bcryptjs.hash(password, 10);
    console.log('✓ 비밀번호 해시 생성 완료');
    
    // 3. 해시 검증
    const isValid = await bcryptjs.compare(password, hashedPassword);
    console.log('✓ 해시 검증:', isValid ? '성공' : '실패');
    
    // 4. 새 관리자 계정 생성
    const newUserId = 'usr_admin_' + Date.now();
    const result = await pool.query(
      `INSERT INTO users (
        id, email, password, name, type, role, status, 
        verified, email_verified, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING id, email, name, type, role, status`,
      [
        newUserId,
        'admin@example.com',
        hashedPassword,
        'System Admin',
        'ADMIN',
        'ADMIN', 
        'ACTIVE',
        true,  // verified (boolean)
        new Date(),  // email_verified (timestamp)
        new Date(),  // created_at
        new Date()   // updated_at
      ]
    );
    
    console.log('\n✅ 관리자 계정 생성 완료!\n');
    console.log('계정 정보:', result.rows[0]);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 로그인 정보');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('이메일: admin@example.com');
    console.log('비밀번호: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 로그인 URL: http://localhost:3001/auth/login');
    console.log('   "🔧 관리자로 로그인" 버튼을 클릭하세요\n');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await pool.end();
  }
}

createTestAdmin();