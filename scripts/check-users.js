const { Pool } = require('pg');

async function checkUsers() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔍 데이터베이스 사용자 확인 중...');
    
    const result = await pool.query('SELECT id, email, name, role, type FROM users ORDER BY created_at DESC LIMIT 10');
    
    console.log('\n📊 현재 데이터베이스 사용자:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (result.rows.length === 0) {
      console.log('❌ 사용자가 없습니다!');
    } else {
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name || 'NULL'}`);
        console.log(`   Role: ${user.role || 'NULL'}`);
        console.log(`   Type: ${user.type || 'NULL'}`);
        console.log('');
      });
    }
    
    // 특별히 테스트 계정 확인
    const adminCheck = await pool.query("SELECT * FROM users WHERE email = 'admin@example.com'");
    const userCheck = await pool.query("SELECT * FROM users WHERE email = 'user@example.com'");
    
    console.log('\n🧪 테스트 계정 확인:');
    console.log(`admin@example.com: ${adminCheck.rows.length > 0 ? '✅ 존재' : '❌ 없음'}`);
    console.log(`user@example.com: ${userCheck.rows.length > 0 ? '✅ 존재' : '❌ 없음'}`);
    
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsers();