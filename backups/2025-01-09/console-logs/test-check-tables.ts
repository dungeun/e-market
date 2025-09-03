import { query } from '../lib/db'

async function checkTables() {
  try {
    console.log('Checking available tables...')
    
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    console.log('\nAvailable tables:')
    result.rows.forEach(table => {
      console.log(`  - ${table.table_name}`)
    })
    
    // Check products/Product table schema
    console.log('\nChecking product table schema...')
    const productsResult = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('products', 'Product')
      ORDER BY table_name, ordinal_position
    `)
    
    console.log('\nProduct table columns:')
    productsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`)
    })
    
  } catch (error: any) {
    console.error('Error:', error.message)
  }
  
  process.exit(0)
}

checkTables()