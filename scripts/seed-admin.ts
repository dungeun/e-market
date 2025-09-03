import bcrypt from 'bcrypt'


async function main() {
  console.log('🔐 Creating admin user...')

  try {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await query({
      where: {
        email: 'admin@example.com'
      },
      update: {
        password: hashedPassword,
        name: '관리자',
        role: 'ADMIN'
      },
      create: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: '관리자',
        role: 'ADMIN',
        emailVerified: new Date()
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email: admin@example.com')
    console.log('🔑 Password: admin123')
    console.log('👤 Name:', admin.name)
    console.log('🎭 Role:', admin.role)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })