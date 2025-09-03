import { prisma } from '../lib/db/orm';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  try {
    // 관리자 계정이 이미 있는지 확인
    const existingAdmin = await query({
      where: { email: 'admin@test.com' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      return
    }

    // 관리자 계정 생성
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const admin = await query({
      data: {
        email: 'admin@test.com',
        name: '관리자',
        password: hashedPassword,
        role: 'ADMIN',
        email_verified: new Date(),
        type: 'USER',
        status: 'ACTIVE',
        verified: true,
      }
    })

    console.log('✅ Admin user created successfully:', admin.email)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()