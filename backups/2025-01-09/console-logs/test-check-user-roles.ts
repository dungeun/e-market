import { query } from '../lib/db'

async function checkUserRoles() {
  try {
    console.log('Checking User table roles...')
    
    // Get existing users and their roles
    const users = await query('SELECT id, email, role FROM "User" LIMIT 5')
    console.log('\nExisting users:')
    users.rows.forEach(user => {
      console.log(`  - ${user.email}: ${user.role}`)
    })
    
    // Get enum values for UserRole
    const roles = await query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')
    `)
    console.log('\nAvailable UserRole values:')
    roles.rows.forEach(role => {
      console.log(`  - ${role.enumlabel}`)
    })
    
  } catch (error: any) {
    console.error('Error:', error.message)
  }
  
  process.exit(0)
}

checkUserRoles()