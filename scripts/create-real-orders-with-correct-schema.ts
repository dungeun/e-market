#!/usr/bin/env tsx

// Load environment variables FIRST
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

// Now import after env is loaded
import { query, connect, close } from '../lib/db';

async function createRealOrders() {
  try {
    console.log('📋 실제 주문 데이터 생성 시작...');
    
    await connect();
    
    // 1. 기존 활성 상품들 확인
    const productsResult = await query(`
      SELECT id, name, price 
      FROM products 
      WHERE status = 'ACTIVE' 
      ORDER BY created_at DESC
    `);
    const products = productsResult.rows;
    
    console.log(`🛍️ ${products.length}개의 활성 상품 확인됨`);
    if (products.length === 0) {
      console.log('❌ 활성 상품이 없습니다. 먼저 상품을 생성하세요.');
      return;
    }
    
    // 2. 기존 사용자들 확인 (ADMIN 제외)
    const usersResult = await query(`
      SELECT id, name, email 
      FROM users 
      WHERE role != 'ADMIN' 
      ORDER BY created_at DESC
    `);
    const users = usersResult.rows;
    
    console.log(`👤 ${users.length}명의 고객 사용자 확인됨`);
    
    // 3. 주문 상태와 결제 정보 설정
    const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const paymentStatuses = ['pending', 'paid', 'refunded'];
    const paymentMethods = ['CARD', 'TOSS_PAY', 'BANK_TRANSFER'];
    
    const orders = [];
    
    // 각 사용자마다 2-4개의 주문 생성
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const orderCount = Math.floor(Math.random() * 3) + 2; // 2-4개 주문
      
      for (let j = 0; j < orderCount; j++) {
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        
        // 랜덤 상품 1-3개 선택
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const selectedProducts = [];
        const usedProductIds = new Set();
        
        let totalAmount = 0;
        
        for (let k = 0; k < itemCount; k++) {
          let randomProduct;
          do {
            randomProduct = products[Math.floor(Math.random() * products.length)];
          } while (usedProductIds.has(randomProduct.id));
          
          usedProductIds.add(randomProduct.id);
          
          const quantity = Math.floor(Math.random() * 3) + 1; // 1-3개
          const itemTotal = randomProduct.price * quantity;
          
          selectedProducts.push({
            product: randomProduct,
            quantity,
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
        
        // 배송 주소 생성
        const addresses = [
          '서울특별시 강남구 테헤란로 123, 456호',
          '서울특별시 마포구 홍익로 78, 901호', 
          '경기도 성남시 분당구 판교역로 234, 567호',
          '부산광역시 해운대구 해운대해변로 89, 101호',
          '대구광역시 수성구 달구벌대로 456, 789호'
        ];
        const shippingAddress = addresses[Math.floor(Math.random() * addresses.length)];
        
        // 전화번호 생성
        const phoneNumbers = [
          '010-1234-5678',
          '010-9876-5432',
          '010-5555-6666',
          '010-7777-8888',
          '010-3333-4444'
        ];
        const customerPhone = phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];
        
        // 주문 생성 (orders 테이블 스키마에 맞춤)
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
          shippingAddress, Math.round(totalAmount), orderStatus, paymentStatus, paymentMethod
        ]);
        
        const orderId = orderResult.rows[0].id;
        
        // 주문 아이템들 생성
        for (const item of selectedProducts) {
          await query(`
            INSERT INTO order_items (
              order_id, product_id, name, sku, 
              price, quantity, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          `, [
            orderId,
            item.product.id,
            item.product.name,
            `SKU-${item.product.id.substr(-8)}`,
            item.product.price,
            item.quantity
          ]);
        }
        
        orders.push({
          id: orderId,
          orderNumber,
          customerName: user.name,
          status: orderStatus,
          paymentStatus,
          totalAmount: Math.round(totalAmount),
          itemCount: selectedProducts.length
        });
        
        console.log(`📋 ${orderNumber} 생성됨 (${user.name}) - ${orderStatus} - ₩${Math.round(totalAmount).toLocaleString()}`);
      }
    }
    
    console.log('\n🎉 주문 데이터 생성 완료!');
    console.log(`📋 총 ${orders.length}개 주문 생성`);
    console.log(`👤 ${users.length}명 고객에게 분배`);
    
    // 생성된 데이터 요약
    console.log('\n📊 생성된 주문 상태별 요약:');
    const statusCounts: Record<string, number> = {};
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}개`);
    });
    
  } catch (error) {
    console.error('❌ 주문 생성 중 오류:', error);
  } finally {
    await close();
  }
}

createRealOrders();