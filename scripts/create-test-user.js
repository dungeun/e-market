const bcrypt = require('bcryptjs');

async function createHash() {
  const password = 'test123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
}

createHash();