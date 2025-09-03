import { query } from '../lib/db'

async function checkLocationSchema() {
  try {
    console.log('Checking inventory_locations table schema...')
    
    const result = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'inventory_locations'
      ORDER BY ordinal_position
    `)
    
    console.log('\nInventory_locations columns:')
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`)
    })
    
    // Check existing locations
    const existing = await query('SELECT * FROM inventory_locations LIMIT 3')
    console.log('\nExisting locations:')
    existing.rows.forEach(row => {
      console.log(`  - ${row.id}: ${row.name}`)
    })
    
  } catch (error: any) {
    console.error('Error:', error.message)
  }
  
  process.exit(0)
}

checkLocationSchema()