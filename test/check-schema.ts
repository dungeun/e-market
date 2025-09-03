import { query } from '../lib/db'

async function checkSchema() {
  try {

    // Check if inventory table exists and its columns
    const schemaResult = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'inventory'
      ORDER BY ordinal_position
    `)

    schemaResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'required'})`)
    })
    
    // Try to see what's actually in the table
    const sampleResult = await query('SELECT * FROM inventory LIMIT 1')
    console.log('\nSample inventory row structure:', Object.keys(sampleResult.rows[0] || {}))
    
  } catch (error: Error | unknown) {

  }
  
  process.exit(0)
}

checkSchema()