const bcryptjs = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'admin123',
  database: 'commerce_plugin'
});

async function directTestLogin() {
  try {
    console.log('🔐 Direct Login Test\n');
    
    // 1. 데이터베이스에서 사용자 조회
    const result = await pool.query(
      "SELECT id, email, password, name, type, role, status FROM users WHERE email = 'admin@example.com'"
    );
    
    if (result.rows.length === 0) {
      console.log('❌ 사용자를 찾을 수 없습니다.');
      return;
    }
    
    const user = result.rows[0];
    console.log('✓ 사용자 찾음:', {
      email: user.email,
      type: user.type,
      role: user.role,
      status: user.status
    });
    
    // 2. 비밀번호 검증
    const testPassword = 'admin123';
    console.log('\n비밀번호 테스트:', testPassword);
    console.log('저장된 해시:', user.password);
    
    // bcryptjs로 비교
    const isValid = await bcryptjs.compare(testPassword, user.password);
    console.log('\n✅ bcryptjs.compare 결과:', isValid ? '성공' : '실패');
    
    if (isValid) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ 로그인 가능!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('이메일: admin@example.com');
      console.log('비밀번호: admin123');
    } else {
      console.log('\n❌ 비밀번호가 일치하지 않습니다.');
      
      // 새 해시 생성 및 업데이트
      console.log('\n새 비밀번호 해시를 생성하여 업데이트합니다...');
      const newHash = await bcryptjs.hash(testPassword, 10);
      
      await pool.query(
        "UPDATE users SET password = $1 WHERE email = 'admin@example.com'",
        [newHash]
      );
      
      console.log('✅ 비밀번호 업데이트 완료!');
      console.log('\n다시 로그인을 시도해 보세요:');
      console.log('이메일: admin@example.com');
      console.log('비밀번호: admin123');
    }
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
  } finally {
    await pool.end();
  }
}

directTestLogin();