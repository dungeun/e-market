import { query } from '../lib/db'

async function checkTables() {
  try {

    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)

    result.rows.forEach(table => {

    })
    
    // Check products/Product table schema

    const productsResult = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name IN ('products', 'Product')
      ORDER BY table_name, ordinal_position
    `)

    productsResult.rows.forEach(col => {

    })
    
  } catch (error: any) {

  }
  
  process.exit(0)
}

checkTables()