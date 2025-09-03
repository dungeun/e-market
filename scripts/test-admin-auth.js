#!/usr/bin/env node

/**
 * Test script for admin authentication
 * Run with: node scripts/test-admin-auth.js
 */

const jwt = require('jsonwebtoken');

// Generate test admin token
function generateAdminToken() {
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-at-least-32-characters-long-for-security';
  
  const payload = {
    id: 'admin-001',
    email: 'admin@example.com',
    name: 'Test Admin',
    role: 'admin',
    type: 'ADMIN',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  
  const token = jwt.sign(payload, secret);
  
  console.log('\n=== Admin Test Token Generated ===\n');
  console.log('Token:', token);
  console.log('\n=== How to use ===\n');
  console.log('1. Open browser console at http://localhost:3000/admin');
  console.log('2. Run the following command:');
  console.log(`\nlocalStorage.setItem('accessToken', '${token}');\nlocalStorage.setItem('auth-token', '${token}');\nlocalStorage.setItem('user', '${JSON.stringify({
    id: payload.id,
    email: payload.email,
    name: payload.name,
    type: payload.type
  })}');\nwindow.location.reload();\n`);
  console.log('\n3. The page will reload and you should be authenticated as admin');
  console.log('\n=== Token Details ===\n');
  console.log('Payload:', payload);
  console.log('Expires at:', new Date(payload.exp * 1000).toLocaleString());
}

// Test API endpoint
async function testAdminAPI(token) {
  try {
    const response = await fetch('http://localhost:3000/api/admin/categories', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('\n=== API Test Result ===\n');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Categories count:', data.categories?.length || 0);
    } else {
      console.log('Failed! Check token or server status');
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

// Main execution
async function main() {
  generateAdminToken();
  
  // Optional: Test API directly
  // const token = generateAdminToken();
  // await testAdminAPI(token);
}

main();