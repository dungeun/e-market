const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'commerce_plugin',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || undefined,
});

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@example.com']);
    
    if (existingUser.rows.length > 0) {

      await pool.end();
      return;
    }

    // Create admin user with bcrypt password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const result = await pool.query(`
      INSERT INTO users (email, name, password, type, role, status, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, email, name
    `, ['admin@example.com', 'System Admin', hashedPassword, 'ADMIN', 'ADMIN', 'ACTIVE']);

  } catch (error) {

  } finally {
    await pool.end();
  }
}

createAdminUser();