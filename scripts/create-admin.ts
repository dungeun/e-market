import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // 관리자 계정이 이미 있는지 확인
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@test.com' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      return
    }

    // 관리자 계정 생성
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: '관리자',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
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