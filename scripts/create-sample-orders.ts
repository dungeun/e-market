import { query } from '../lib/db'

async function createSampleOrders() {
  try {
    // 사용자와 상품 조회
    const usersResult = await query(`
      SELECT id FROM users WHERE email = 'user@example.com' LIMIT 1
    `)
    
    if (usersResult.rows.length === 0) {
      console.log('사용자를 찾을 수 없습니다.')
      return
    }
    
    const userId = usersResult.rows[0].id
    
    const productsResult = await query(`
      SELECT id, name, price FROM products LIMIT 5
    `)
    
    if (productsResult.rows.length === 0) {
      console.log('상품을 찾을 수 없습니다.')
      return
    }
    
    const products = productsResult.rows
    
    // 다양한 상태의 주문 생성
    const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'processing', 'shipped']
    const orderDates = [
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3일 전
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1주일 전
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2주일 전
      new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3주일 전
      new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 4주일 전
    ]
    
    for (let i = 0; i < orderStatuses.length; i++) {
      const orderNumber = `ORD-${Date.now()}-${i}`
      const status = orderStatuses[i]
      const createdAt = orderDates[i]
      
      // 랜덤하게 1-3개 상품 선택
      const numProducts = Math.floor(Math.random() * 3) + 1
      const selectedProducts = products.slice(0, numProducts)
      const totalAmount = Math.round(selectedProducts.reduce((sum, p) => sum + Number(p.price), 0))
      
      // 주문 생성
      const orderResult = await query(`
        INSERT INTO orders (
          order_number,
          user_id,
          customer_name,
          customer_email,
          customer_phone,
          shipping_address,
          total_amount,
          status,
          payment_method,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10
        ) RETURNING id
      `, [
        orderNumber,
        userId,
        'Test User',
        'user@example.com',
        '010-1234-5678',
        '서울시 강남구 테헤란로 123',
        totalAmount,
        status,
        'CASH',
        createdAt
      ])
      
      const orderId = orderResult.rows[0].id
      
      // 주문 상품 추가
      for (const product of selectedProducts) {
        await query(`
          INSERT INTO order_items (
            order_id,
            product_id,
            product_name,
            quantity,
            price,
            created_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6
          )
        `, [
          orderId,
          product.id,
          product.name,
          1,
          Math.round(Number(product.price)),
          createdAt
        ])
      }
      
      console.log(`주문 생성 완료: ${orderNumber} (${status})`)
    }
    
    console.log('샘플 주문 생성이 완료되었습니다.')
    process.exit(0)
  } catch (error) {
    console.error('Error creating sample orders:', error)
    process.exit(1)
  }
}

createSampleOrders()