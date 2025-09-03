const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'admin',
  password: 'admin123',
  host: 'localhost',
  port: 5432,
  database: 'commerce_plugin'
});

async function testBcrypt() {
  try {
    // DB에서 사용자 가져오기
    const result = await pool.query("SELECT * FROM users WHERE email = 'admin@test.com'");
    const user = result.rows[0];
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    
    console.log('User found:', user.email);
    console.log('DB Hash:', user.password);
    console.log('Hash prefix:', user.password.substring(0, 4));
    console.log('Hash length:', user.password.length);
    
    // 비밀번호 테스트
    const password = 'admin123';
    
    // 동기 방식
    const syncResult = bcrypt.compareSync(password, user.password);
    console.log('Sync comparison result:', syncResult);
    
    // 비동기 방식
    const asyncResult = await bcrypt.compare(password, user.password);
    console.log('Async comparison result:', asyncResult);
    
    // 새 해시 생성
    const newHash = bcrypt.hashSync(password, 10);
    console.log('New hash:', newHash);
    
    // 새 해시로 테스트
    const testNew = bcrypt.compareSync(password, newHash);
    console.log('New hash test:', testNew);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testBcrypt();