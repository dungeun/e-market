import bcrypt from 'bcryptjs';


async function main() {
  console.log('🌱 Creating test users...');

  // 비밀번호 해시화
  const hashedPassword = await bcrypt.hash('test123!', 12);

  // 관리자 계정
  const adminUser = await query({
    where: {
      email: 'admin@shopmall.com',
    },
    update: {},
    create: {
      email: 'admin@shopmall.com',
      name: '관리자',
      password: hashedPassword,
      role: 'ADMIN',
      type: 'ADMIN',
      status: 'ACTIVE',
      verified: true,
      isOnboarded: true,
      phone: '010-1234-5678',
      phoneVerified: true,
      emailVerified: new Date(),
      provider: 'credentials',
      profile: {
        create: {
          bio: '시스템 관리자입니다.',
          phoneNumber: '010-1234-5678',
          address: '서울특별시 강남구 테헤란로 123',
        },
      },
    },
  });

  // 슈퍼 관리자 계정
  const superAdminUser = await query({
    where: {
      email: 'superadmin@shopmall.com',
    },
    update: {},
    create: {
      email: 'superadmin@shopmall.com',
      name: '슈퍼 관리자',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      type: 'ADMIN',
      status: 'ACTIVE',
      verified: true,
      isOnboarded: true,
      phone: '010-0000-0000',
      phoneVerified: true,
      emailVerified: new Date(),
      provider: 'credentials',
      profile: {
        create: {
          bio: '슈퍼 관리자입니다.',
          phoneNumber: '010-0000-0000',
          address: '서울특별시 중구 세종대로 110',
        },
      },
    },
  });

  // 일반 사용자 계정 1
  const user1 = await query({
    where: {
      email: 'user1@test.com',
    },
    update: {},
    create: {
      email: 'user1@test.com',
      name: '홍길동',
      password: hashedPassword,
      role: 'USER',
      type: 'USER',
      status: 'ACTIVE',
      verified: true,
      isOnboarded: true,
      phone: '010-1111-1111',
      phoneVerified: true,
      emailVerified: new Date(),
      provider: 'credentials',
      profile: {
        create: {
          bio: '일반 사용자입니다.',
          phoneNumber: '010-1111-1111',
          address: '서울특별시 마포구 홍대입구역로 94',
        },
      },
    },
  });

  // 일반 사용자 계정 2
  const user2 = await query({
    where: {
      email: 'user2@test.com',
    },
    update: {},
    create: {
      email: 'user2@test.com',
      name: '김철수',
      password: hashedPassword,
      role: 'USER',
      type: 'USER',
      status: 'ACTIVE',
      verified: true,
      isOnboarded: true,
      phone: '010-2222-2222',
      phoneVerified: true,
      emailVerified: new Date(),
      provider: 'credentials',
      profile: {
        create: {
          bio: '쇼핑을 좋아하는 사용자입니다.',
          phoneNumber: '010-2222-2222',
          address: '서울특별시 송파구 올림픽로 300',
        },
      },
    },
  });

  // 장바구니 생성 (사용자들을 위해)
  await query({
    where: {
      userId: user1.id,
    },
    update: {},
    create: {
      userId: user1.id,
    },
  });

  await query({
    where: {
      userId: user2.id,
    },
    update: {},
    create: {
      userId: user2.id,
    },
  });

  console.log('✅ Test users created successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👑 SUPER ADMIN');
  console.log('   Email: superadmin@shopmall.com');
  console.log('   Password: test123!');
  console.log('   Role: SUPER_ADMIN');
  console.log('');
  console.log('🔧 ADMIN');
  console.log('   Email: admin@shopmall.com');
  console.log('   Password: test123!');
  console.log('   Role: ADMIN');
  console.log('');
  console.log('👤 USER 1');
  console.log('   Email: user1@test.com');
  console.log('   Name: 홍길동');
  console.log('   Password: test123!');
  console.log('   Role: USER');
  console.log('');
  console.log('👤 USER 2');
  console.log('   Email: user2@test.com');
  console.log('   Name: 김철수');
  console.log('   Password: test123!');
  console.log('   Role: USER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Error creating test users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });