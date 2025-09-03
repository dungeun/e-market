const bcryptjs = require('bcryptjs');

async function testBcrypt() {
  const password = 'admin123';
  const storedHash = '$2b$10$nGhxng60CPwux5Le.pX02eYRMQ8/rBHxQjoOOqjZd58S46ri3HSgi';
  
  console.log('Testing bcryptjs password verification...');
  console.log('Password:', password);
  console.log('Stored hash:', storedHash);
  
  try {
    // bcryptjs로 비교
    const isValid = await bcryptjs.compare(password, storedHash);
    console.log('bcryptjs.compare result:', isValid);
    
    // 새 해시 생성하고 즉시 테스트
    const newHash = await bcryptjs.hash(password, 10);
    console.log('New hash:', newHash);
    const testNew = await bcryptjs.compare(password, newHash);
    console.log('New hash verification:', testNew);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testBcrypt();