// Simple JavaScript seed script to populate test data
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function query(text, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function seedTestData() {

  try {
    // 1. 테스트 제품 생성
    const products = [
      {
        id: 'test-product-1',
        name: '테스트 상품 1',
        slug: 'test-product-1',
        description: '테스트용 상품입니다',
        price: 10000,
        stock: 100,
        status: 'ACTIVE'
      },
      {
        id: 'test-product-2',
        name: '테스트 상품 2',
        slug: 'test-product-2',
        description: '테스트용 상품 2입니다',
        price: 20000,
        stock: 50,
        status: 'ACTIVE'
      }
    ];
    
    for (const product of products) {
      // 기존 제품 확인
      const existing = await query(
        'SELECT id FROM "Product" WHERE id = $1',
        [product.id]
      );
      
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
        ]);

      } else {
        // 제품 업데이트
        await query(`
          UPDATE "Product" 
          SET stock = $2, price = $3, "updatedAt" = NOW()
          WHERE id = $1
        `, [product.id, product.stock, product.price]);

      }
    }
    
    // 2. 재고 테이블 초기화
    for (const product of products) {
      // 기존 재고 확인
      const existing = await query(
        'SELECT "productId" FROM inventory WHERE "productId" = $1',
        [product.id]
      );
      
      if (existing.rows.length === 0) {
        await query(`
          INSERT INTO inventory (id, "productId", available, reserved, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, 0, NOW(), NOW())
        `, [
          uuidv4(),
          product.id,
          product.stock
        ]);

      } else {
        await query(`
          UPDATE inventory 
          SET available = $2, "updatedAt" = NOW()
          WHERE "productId" = $1
        `, [product.id, product.stock]);

      }
    }
    
    // 3. 테스트 사용자 생성
    const testUser = {
      id: 'test-user-1',
      email: 'test@example.com',
      name: '테스트 사용자',
      role: 'USER'
    };
    
    const existingUser = await query(
      'SELECT id FROM "User" WHERE email = $1',
      [testUser.email]
    );
    
    if (existingUser.rows.length === 0) {
      await query(`
        INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `, [testUser.id, testUser.email, testUser.name, testUser.role]);

    } else {

    }

  } catch (error) {

    throw error;
  } finally {
    await pool.end();
  }
}

// 실행
seedTestData()
  .then(() => {

    process.exit(0);
  })
  .catch((error) => {

    process.exit(1);
  });