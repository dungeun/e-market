#!/usr/bin/env node

/**
 * Create admin user in database
 * Run with: node scripts/create-admin.js
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://commerce:commerce123@localhost:5434/commerce_nextjs?sslmode=disable',
  ssl: false
});

async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

async function createAdminUser() {
  console.log('🔐 Creating admin user...');

  const email = 'admin@example.com';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Check if admin already exists
    const existingUser = await query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Admin user already exists, updating password and role...');
      
      // Update existing user
      await query(`
        UPDATE users 
        SET 
          password = $1,
          role = 'admin',
          type = 'ADMIN',
          status = 'ACTIVE',
          updated_at = NOW()
        WHERE email = $2
      `, [hashedPassword, email]);

      console.log('✅ Admin user updated successfully!');
    } else {
      // Create new admin user
      await query(`
        INSERT INTO users (
          id, email, password, name, role, type, status, 
          email_verified, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          $1, $2, $3, 'admin', 'ADMIN', 'ACTIVE',
          true, NOW(), NOW()
        )
      `, [email, hashedPassword, '관리자']);

      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📋 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 Login at: http://localhost:3000/auth/login');
    console.log('📊 Admin panel: http://localhost:3000/admin');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    await pool.end();
    process.exit(1);
  }
}

// Run the script
createAdminUser();