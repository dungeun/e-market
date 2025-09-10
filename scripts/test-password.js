const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function testPassword() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔍 비밀번호 검증 테스트...');
    
    // 데이터베이스에서 user@example.com의 해시된 비밀번호 가져오기
    const result = await pool.query("SELECT id, email, password FROM users WHERE email = 'user@example.com'");
    
    if (result.rows.length === 0) {
      console.log('❌ user@example.com 사용자를 찾을 수 없습니다.');
      return;
    }
    
    const user = result.rows[0];
    console.log('✅ 사용자 찾음:', user.email);
    console.log('📝 저장된 해시:', user.password.substring(0, 30) + '...');
    
    // 비밀번호 테스트
    const testPassword = 'user123';
    console.log('🧪 테스트 비밀번호:', testPassword);
    
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log('🔐 비밀번호 검증 결과:', isValid ? '✅ 성공' : '❌ 실패');
    
    if (!isValid) {
      console.log('\n🔧 새로운 해시 생성 테스트:');
      const newHash = await bcrypt.hash('user123', 12);
      console.log('새 해시:', newHash.substring(0, 30) + '...');
      
      const newHashTest = await bcrypt.compare('user123', newHash);
      console.log('새 해시 검증:', newHashTest ? '✅ 성공' : '❌ 실패');
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  } finally {
    await pool.end();
  }
}

testPassword();
