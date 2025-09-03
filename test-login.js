const bcrypt = require('bcryptjs');

// 데이터베이스의 비밀번호 해시
const dbHash = '$2b$10$d0TLkjKimNt7EMRuZgGck.6va92xxyKitY9JEo0vcyMI8vSjBSDdy';

// 사용자가 입력한 비밀번호
const inputPassword = 'admin123';

// 동기 비교
const syncResult = bcrypt.compareSync(inputPassword, dbHash);
console.log('Sync compare result:', syncResult);

// 비동기 비교
bcrypt.compare(inputPassword, dbHash, (err, result) => {
  if (err) {
    console.error('Async compare error:', err);
  } else {
    console.log('Async compare result:', result);
  }
});

// 해시 정보 확인
console.log('Hash prefix:', dbHash.substring(0, 4));
console.log('Hash length:', dbHash.length);