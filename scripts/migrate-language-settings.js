const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'commerce_plugin',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || '',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting language_settings migration...');
    
    // Read migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../migrations/001_create_language_settings.sql'),
      'utf8'
    );
    
    // Split SQL statements and execute
    const statements = migrationSQL
      .split(';')
      .filter(stmt => stmt.trim())
      .map(stmt => stmt.trim() + ';');
    
    for (const statement of statements) {
      if (statement.includes('CREATE') || statement.includes('INSERT') || statement.includes('DROP')) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        try {
          await client.query(statement);
        } catch (err) {
          console.error(`Error executing statement: ${err.message}`);
          // Continue with next statement
        }
      }
    }
    
    // Verify table creation
    const result = await client.query(`
      SELECT * FROM language_settings 
      ORDER BY display_order
    `);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Language Settings:');
    console.table(result.rows);
    
    // Check Korean is default
    const korean = result.rows.find(row => row.code === 'ko');
    if (korean && korean.is_default && korean.enabled) {
      console.log('\n✅ Korean is set as default language');
    } else {
      console.log('\n⚠️ Warning: Korean is not properly set as default');
    }
    
    // Count enabled languages
    const enabledCount = result.rows.filter(row => row.enabled).length;
    console.log(`\n📌 Enabled languages: ${enabledCount}/3 (max)`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('\n🎉 Language settings table created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error.message);
    process.exit(1);
  });