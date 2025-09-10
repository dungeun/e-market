import { query } from '../lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seedUsers() {
  console.log('Starting user seeding...');

  const users = [
    {
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      type: 'customer',
      role: 'ADMIN',
      email_verified: true
    },
    {
      email: 'business@example.com',
      password: 'business123',
      name: 'Business User',
      type: 'business',
      role: 'BUSINESS',
      email_verified: true
    },
    {
      email: 'user@example.com',
      password: 'user123',
      name: 'Regular User',
      type: 'customer',
      role: 'user',
      email_verified: true
    },
    {
      email: 'test@example.com',
      password: 'test123',
      name: 'Test User',
      type: 'customer',
      role: 'user',
      email_verified: true
    }
  ];

  for (const userData of users) {
    try {
      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      );

      if (existingUser.rows.length > 0) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Generate UUID
      const userId = uuidv4();

      // Insert user
      await query(
        `INSERT INTO users (
          id, email, password, name, type, role, status, email_verified, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
        )`,
        [
          userId,
          userData.email,
          hashedPassword,
          userData.name,
          userData.type,
          userData.role,
          'ACTIVE',
          userData.email_verified
        ]
      );

      console.log(`✅ Created user: ${userData.email} (password: ${userData.password})`);
    } catch (error) {
      console.error(`Error creating user ${userData.email}:`, error);
    }
  }

  console.log('\n📋 Test credentials:');
  console.log('Admin: admin@example.com / admin123');
  console.log('Business: business@example.com / business123');
  console.log('User: user@example.com / user123');
  console.log('Test: test@example.com / test123');
  
  process.exit(0);
}

seedUsers().catch(console.error);