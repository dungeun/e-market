import { query } from '../lib/db'

async function checkProductConstraints() {
  try {
    console.log('Checking Product table constraints...')
    
    // Check enum types for status
    const enumResult = await query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = (
          SELECT SUBSTRING(data_type FROM 'USER-DEFINED\\((.*)\\)') 
          FROM information_schema.columns 
          WHERE table_name = 'Product' AND column_name = 'status'
        )
      )
    `)
    
    console.log('\nAvailable status values:')
    enumResult.rows.forEach(row => {
      console.log(`  - ${row.enumlabel}`)
    })
    
    // Check if there are any existing products
    const existingResult = await query('SELECT id, name, status FROM "Product" LIMIT 5')
    console.log('\nExisting products:')
    existingResult.rows.forEach(row => {
      console.log(`  - ${row.id}: ${row.name} (${row.status})`)
    })
    
  } catch (error: any) {
    console.error('Error:', error.message)
  }
  
  process.exit(0)
}

checkProductConstraints()