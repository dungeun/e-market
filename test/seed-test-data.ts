import { query } from '../lib/db.js'
import { v4 as uuidv4 } from 'uuid'

async function seedTestData() {

  try {
    // 0. 기본 창고 위치 생성
    const locationCheck = await query('SELECT id FROM inventory_locations WHERE id = $1', ['default'])
    if (locationCheck.rows.length === 0) {
      await query(`
        INSERT INTO inventory_locations (id, name, code, address, type, "isActive", priority, "createdAt", "updatedAt")
        VALUES ('default', 'Default Warehouse', 'DEFAULT', 'Main Location', 'WAREHOUSE', true, 1, NOW(), NOW())
      `)

    }
    
    // 1. 테스트 제품 생성
    const products = [
      {
        id: 'test-product-1',
        name: '테스트 상품 1',
        slug: 'test-product-1',
        description: '테스트용 상품입니다',
        price: 10000,
        stock: 100,
        sku: 'TEST-001',
        status: 'ACTIVE'
      },
      {
        id: 'test-product-2',
        name: '테스트 상품 2',
        slug: 'test-product-2',
        description: '테스트용 상품 2입니다',
        price: 20000,
        stock: 50,
        sku: 'TEST-002',
        status: 'ACTIVE'
      }
    ]
    
    for (const product of products) {
      // 기존 제품 확인 (Product 테이블 사용)
      const existing = await query(
        'SELECT id FROM "Product" WHERE id = $1',
        [product.id]
      )
      
      if (existing.rows.length === 0) {
        await query(`
          INSERT INTO "Product" (id, name, slug, description, price, stock, status, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        `, [
          product.id,
          product.name,
          product.slug,
          product.description,
          product.price,
          product.stock,
          product.status
        ])

      } else {
        // 제품 업데이트
        await query(`
          UPDATE "Product" 
          SET stock = $2, price = $3, "updatedAt" = NOW()
          WHERE id = $1
        `, [product.id, product.stock, product.price])

      }
    }
    
    // 2. 재고 테이블 초기화
    for (const product of products) {
      // 기존 재고 확인
      const existing = await query(
        'SELECT "productId" FROM inventory WHERE "productId" = $1',
        [product.id]
      )
      
      if (existing.rows.length === 0) {
        await query(`
          INSERT INTO inventory (id, "productId", "locationId", quantity, available, reserved, "createdAt", "updatedAt")
          VALUES ($1, $2, 'default', $3, $3, 0, NOW(), NOW())
        `, [
          uuidv4(),
          product.id,
          product.stock
        ])

      } else {
        await query(`
          UPDATE inventory 
          SET quantity = $2, available = $2, "updatedAt" = NOW()
          WHERE "productId" = $1
        `, [product.id, product.stock])

      }
    }
    
    // 3. 테스트 사용자 생성
    const testUser = {
      id: 'test-user-1',
      email: 'test@example.com',
      name: '테스트 사용자',
      role: 'USER'
    }
    
    const existingUser = await query(
      'SELECT id FROM "User" WHERE email = $1',
      [testUser.email]
    )
    
    if (existingUser.rows.length === 0) {
      await query(`
        INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `, [testUser.id, testUser.email, testUser.name, testUser.role])

    } else {

    }

  } catch (error) {

    throw error
  }
}

// 실행
seedTestData()
  .then(() => {

    process.exit(0)
  })
  .catch((error) => {

    process.exit(1)
  })