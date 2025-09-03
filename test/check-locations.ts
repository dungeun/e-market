import { query } from '../lib/db'

async function checkLocationSchema() {
  try {

    const result = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'inventory_locations'
      ORDER BY ordinal_position
    `)

    result.rows.forEach(col => {

    })
    
    // Check existing locations
    const existing = await query('SELECT * FROM inventory_locations LIMIT 3')

    existing.rows.forEach(row => {

    })
    
  } catch (error: Error | unknown) {

  }
  
  process.exit(0)
}

checkLocationSchema()