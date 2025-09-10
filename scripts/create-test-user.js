const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createTestUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔍 사용자 계정 생성 중...');
    
    // 비밀번호 해시화 (user123)
    const hashedPassword = await bcrypt.hash('user123', 12);
    const userId = uuidv4();
    
    // user@example.com이 이미 존재하는지 확인
    const existingUser = await pool.query("SELECT * FROM users WHERE email = 'user@example.com'");
    
    if (existingUser.rows.length > 0) {
      console.log('✅ user@example.com 계정이 이미 존재합니다.');
      return;
    }
    
    // 사용자 계정 생성
    const result = await pool.query(`
      INSERT INTO users (
        id, email, password, name, type, role, status, email_verified, phone, 
        address, city, state, postal_code, country, 
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, 
        $10, $11, $12, $13, $14, 
        NOW(), NOW()
      ) RETURNING id, email, name, role, type
    `, [
      userId,
      'user@example.com',
      hashedPassword,
      'Test User',
      'customer',
      'user', 
      'ACTIVE',
      false,
      '010-9876-5432',
      '서울특별시 강남구 테스트로 123',
      '서울',
      '서울특별시',
      '12345',
      '대한민국'
    ]);
    
    console.log('✅ 테스트 사용자 계정이 성공적으로 생성되었습니다!');
    console.log('\n📋 생성된 계정 정보:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 TEST USER');
    console.log('   Email: user@example.com');
    console.log('   Password: user123');
    console.log('   Name: Test User');
    console.log('   Role: user');
    console.log('   Type: customer');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ 사용자 생성 실패:', error.message);
  } finally {
    await pool.end();
  }
}

createTestUser();
