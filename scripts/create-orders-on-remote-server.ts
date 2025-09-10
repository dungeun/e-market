#!/usr/bin/env tsx

// Load environment variables FIRST
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

// Now import after env is loaded
import { query, connect, close } from '../lib/db';

async function createOrdersOnRemoteServer() {
  try {
    console.log('🚀 원격 서버에 실제 주문 데이터 생성 시작...');
    console.log('🔗 서버:', process.env.DB_HOST);
    console.log('📊 데이터베이스:', process.env.DB_NAME);
    
    await connect();
    
    // 1. 현재 원격 데이터베이스의 상품들 확인
    const productsResult = await query(`
      SELECT id, name, price 
      FROM products 
      WHERE status = 'ACTIVE' OR status IS NULL
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log(`🛍️ 원격 서버 활성 상품: ${productsResult.rows.length}개`);
    productsResult.rows.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ₩${parseInt(product.price).toLocaleString()}`);
    });
    
    if (productsResult.rows.length === 0) {
      console.log('❌ 원격 서버에 활성 상품이 없습니다.');
      return;
    }
    
    // 2. 원격 서버의 사용자들 확인
    const usersResult = await query(`
      SELECT id, name, email 
      FROM users 
      WHERE role != 'ADMIN' OR role IS NULL
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log(`👤 원격 서버 사용자: ${usersResult.rows.length}명`);
    
    if (usersResult.rows.length === 0) {
      console.log('❌ 원격 서버에 사용자가 없습니다.');
      return;
    }
    
    const products = productsResult.rows;
    const users = usersResult.rows;
    
    // 3. 기존 주문 수 확인
    const existingOrdersResult = await query(`
      SELECT COUNT(*) as count FROM orders
    `);
    const existingOrderCount = parseInt(existingOrdersResult.rows[0].count);
    console.log(`📋 기존 주문 수: ${existingOrderCount}개`);
    
    // 4. 실제 주문 생성
    const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const paymentStatuses = ['pending', 'paid', 'refunded'];
    const paymentMethods = ['CARD', 'TOSS_PAY', 'BANK_TRANSFER'];
    
    const orders = [];
    
    // 각 사용자마다 2-3개의 주문 생성
    for (let i = 0; i < Math.min(users.length, 5); i++) {
      const user = users[i];
      const orderCount = Math.floor(Math.random() * 2) + 2; // 2-3개 주문
      
      for (let j = 0; j < orderCount; j++) {
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        
        // 랜덤 상품 1-2개 선택
        const itemCount = Math.floor(Math.random() * 2) + 1;
        const selectedProducts = [];
        const usedProductIds = new Set();
        
        let totalAmount = 0;
        
        for (let k = 0; k < itemCount; k++) {
          let randomProduct;
          do {
            randomProduct = products[Math.floor(Math.random() * products.length)];
          } while (usedProductIds.has(randomProduct.id));
          
          usedProductIds.add(randomProduct.id);
          
          const quantity = Math.floor(Math.random() * 2) + 1; // 1-2개
          const price = parseInt(randomProduct.price);
          const itemTotal = price * quantity;
          
          selectedProducts.push({
            product: randomProduct,
            quantity,
            price,
            itemTotal
          });
          
          totalAmount += itemTotal;
        }
        
        // 주문 상태와 결제 정보
        const orderStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        let paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
        
        // 논리적 일관성 유지
        if (orderStatus === 'cancelled') {
          paymentStatus = Math.random() > 0.5 ? 'refunded' : 'pending';
        } else if (orderStatus === 'delivered') {
          paymentStatus = 'paid';
        }
        
        // 배송 주소와 전화번호
        const addresses = [
          '서울특별시 강남구 테헤란로 427, 위워크 타워',
          '서울특별시 서초구 서초대로 398, 플래티넘타워', 
          '경기도 성남시 분당구 판교역로 231, 현대백화점',
          '부산광역시 해운대구 센텀중앙로 79, 센텀시티',
          '대구광역시 수성구 달구벌대로 2437, 수성아트피아'
        ];
        const shippingAddress = addresses[Math.floor(Math.random() * addresses.length)];
        const customerPhone = '010-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0') + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
        // orders 테이블 스키마 확인 후 삽입
        try {
          const orderResult = await query(`
            INSERT INTO orders (
              order_number, user_id, customer_name, customer_email, customer_phone,
              shipping_address, total_amount, status, payment_status, payment_method,
              created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
              NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days', NOW())
            RETURNING id
          `, [
            orderNumber, user.id, user.name, user.email, customerPhone,
            shippingAddress, totalAmount, orderStatus, paymentStatus, paymentMethod
          ]);
          
          const orderId = orderResult.rows[0].id;
          
          // order_items 생성
          for (const item of selectedProducts) {
            await query(`
              INSERT INTO order_items (
                order_id, product_id, product_name, 
                price, quantity, created_at
              ) VALUES ($1, $2, $3, $4, $5, NOW())
            `, [
              orderId,
              item.product.id,
              item.product.name,
              item.price,
              item.quantity
            ]);
          }
          
          orders.push({
            id: orderId,
            orderNumber,
            customerName: user.name,
            status: orderStatus,
            paymentStatus,
            totalAmount,
            itemCount: selectedProducts.length
          });
          
          console.log(`📋 ${orderNumber} 생성됨 (${user.name}) - ${orderStatus} - ₩${totalAmount.toLocaleString()}`);
          
        } catch (error) {
          console.error(`❌ 주문 생성 실패 (${orderNumber}):`, error.message);
        }
      }
    }
    
    console.log('\n🎉 원격 서버 주문 데이터 생성 완료!');
    console.log(`📋 총 ${orders.length}개 주문 생성`);
    
    // 최종 확인
    const finalOrdersResult = await query(`
      SELECT COUNT(*) as total_orders FROM orders
    `);
    const finalItemsResult = await query(`
      SELECT COUNT(*) as total_items FROM order_items
    `);
    
    console.log(`\n📊 원격 서버 최종 데이터 상태:`);
    console.log(`  전체 주문 수: ${finalOrdersResult.rows[0].total_orders}개`);
    console.log(`  전체 주문 아이템 수: ${finalItemsResult.rows[0].total_items}개`);
    
    // 생성된 데이터 요약
    if (orders.length > 0) {
      console.log('\n📊 생성된 주문 상태별 요약:');
      const statusCounts: Record<string, number> = {};
      orders.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });
      
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}개`);
      });
    }
    
  } catch (error) {
    console.error('❌ 원격 서버 주문 생성 중 오류:', error);
  } finally {
    await close();
  }
}

createOrdersOnRemoteServer();