import { query } from '../lib/db'

async function checkSchema() {
  try {
    console.log('Checking inventory table schema...')
    
    // Check if inventory table exists and its columns
    const schemaResult = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'inventory'
      ORDER BY ordinal_position
    `)
    
    console.log('\nInventory table columns:')
    schemaResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'required'})`)
    })
    
    // Try to see what's actually in the table
    const sampleResult = await query('SELECT * FROM inventory LIMIT 1')
    console.log('\nSample inventory row structure:', Object.keys(sampleResult.rows[0] || {}))
    
  } catch (error: any) {
    console.error('Error:', error.message)
  }
  
  process.exit(0)
}

checkSchema()