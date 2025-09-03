import { query } from '../lib/db'

async function checkUserRoles() {
  try {

    // Get existing users and their roles
    const users = await query('SELECT id, email, role FROM "User" LIMIT 5')

    users.rows.forEach(user => {

    })
    
    // Get enum values for UserRole
    const roles = await query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
    `)

    roles.rows.forEach(role => {

    })
    
  } catch (error: Error | unknown) {

  }
  
  process.exit(0)
}

checkUserRoles()