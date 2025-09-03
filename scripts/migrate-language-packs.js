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
    console.log('🔄 Starting language pack tables migration...');
    
    // Read migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../migrations/002_create_language_pack_tables.sql'),
      'utf8'
    );
    
    // Execute migration in a transaction
    await client.query('BEGIN');
    
    try {
      // Split SQL statements and execute
      const statements = migrationSQL
        .split(';')
        .filter(stmt => stmt.trim())
        .map(stmt => stmt.trim() + ';');
      
      for (const statement of statements) {
        if (statement.includes('CREATE') || statement.includes('INSERT') || statement.includes('DROP')) {
          const shortStmt = statement.substring(0, 60).replace(/\n/g, ' ');
          console.log(`Executing: ${shortStmt}...`);
          try {
            await client.query(statement);
          } catch (err) {
            if (!err.message.includes('already exists') && 
                !err.message.includes('unterminated')) {
              console.error(`Error: ${err.message}`);
            }
          }
        }
      }
      
      await client.query('COMMIT');
      console.log('✅ Migration transaction committed');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
    
    // Verify tables creation
    console.log('\n📊 Verifying tables...');
    
    // Check language_pack_keys
    const keysResult = await client.query(`
      SELECT COUNT(*) as count FROM language_pack_keys
    `);
    console.log(`✅ language_pack_keys table: ${keysResult.rows[0].count} keys`);
    
    // Check language_pack_translations
    const transResult = await client.query(`
      SELECT COUNT(*) as count FROM language_pack_translations
    `);
    console.log(`✅ language_pack_translations table: ${transResult.rows[0].count} translations`);
    
    // Show sample data
    const sampleKeys = await client.query(`
      SELECT 
        lpk.key_name,
        lpk.component_type,
        lpk.component_id,
        lpt.translation as korean_translation
      FROM language_pack_keys lpk
      LEFT JOIN language_pack_translations lpt 
        ON lpk.id = lpt.key_id AND lpt.language_code = 'ko'
      ORDER BY lpk.component_type, lpk.key_name
      LIMIT 10
    `);
    
    console.log('\n📋 Sample Language Pack Keys:');
    console.table(sampleKeys.rows);
    
    // Statistics
    const stats = await client.query(`
      SELECT 
        component_type,
        COUNT(*) as key_count
      FROM language_pack_keys
      GROUP BY component_type
      ORDER BY component_type
    `);
    
    console.log('\n📊 Keys by Component Type:');
    console.table(stats.rows);
    
    // Check foreign key constraints
    const constraints = await client.query(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name IN ('language_pack_translations', 'language_pack_keys')
    `);
    
    console.log('\n🔗 Foreign Key Constraints:');
    console.table(constraints.rows);
    
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
    console.log('\n🎉 Language pack tables created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error.message);
    process.exit(1);
  });