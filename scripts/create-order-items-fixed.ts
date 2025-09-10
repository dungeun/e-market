#!/usr/bin/env tsx

// Load environment variables FIRST
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

// Now import after env is loaded
import { query, connect, close } from '../lib/db';

async function createOrderItems() {
  try {
    console.log('🔧 order_items 테이블 수정 및 주문 완성...');
    
    await connect();
    
    // 1. 기존 주문들 중 order_items가 없는 주문들 확인
    const ordersWithoutItemsResult = await query(`
      SELECT o.id, o.order_number, o.total_amount 
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE oi.order_id IS NULL
      ORDER BY o.id DESC
    `);
    
    console.log(`📋 order_items가 없는 주문: ${ordersWithoutItemsResult.rows.length}개`);
    
    // 2. 활성 상품들 확인
    const productsResult = await query(`
      SELECT id, name, price 
      FROM products 
      WHERE status = 'ACTIVE' 
      ORDER BY created_at DESC
    `);
    const products = productsResult.rows;
    
    console.log(`🛍️ ${products.length}개의 활성 상품 확인됨`);
    
    // 3. 각 주문에 대해 order_items 생성
    for (const orderData of ordersWithoutItemsResult.rows) {
      const orderId = orderData.id;
      const targetTotal = orderData.total_amount;
      
      // 랜덤하게 1-3개 상품 선택하여 총액 맞추기
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [];
      const usedProductIds = new Set();
      
      let currentTotal = 0;
      
      for (let i = 0; i < itemCount; i++) {
        let randomProduct;
        do {
          randomProduct = products[Math.floor(Math.random() * products.length)];
        } while (usedProductIds.has(randomProduct.id) && usedProductIds.size < products.length);
        
        usedProductIds.add(randomProduct.id);
        
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3개
        const price = parseInt(randomProduct.price);
        
        selectedProducts.push({
          product: randomProduct,
          quantity,
          price
        });
        
        currentTotal += price * quantity;
      }
      
      // order_items 생성 (올바른 스키마로)
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
      
      console.log(`✅ 주문 ${orderData.order_number}에 ${selectedProducts.length}개 아이템 추가됨`);
    }
    
    // 4. 새로운 주문들도 계속 생성
    const usersResult = await query(`
      SELECT id, name, email 
      FROM users 
      WHERE role != 'ADMIN' 
      ORDER BY created_at DESC
      LIMIT 5
    `);
    const users = usersResult.rows;
    
    console.log(`\n👤 추가 주문을 위한 ${users.length}명의 사용자...`);
    
    const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const paymentStatuses = ['pending', 'paid', 'refunded'];
    const paymentMethods = ['CARD', 'TOSS_PAY', 'BANK_TRANSFER'];
    
    // 각 사용자마다 1-2개 추가 주문 생성
    const newOrders = [];
    for (const user of users) {
      const orderCount = Math.floor(Math.random() * 2) + 1; // 1-2개 주문
      
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
          
          const quantity = Math.floor(Math.random() * 3) + 1;
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
          '서울특별시 송파구 잠실로 123, 456호',
          '인천광역시 남동구 구월로 78, 901호', 
          '경기도 수원시 영통구 광교로 234, 567호',
          '대전광역시 유성구 대학로 89, 101호',
          '광주광역시 서구 상무로 456, 789호'
        ];
        const shippingAddress = addresses[Math.floor(Math.random() * addresses.length)];
        const customerPhone = '010-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0') + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
        // 주문 생성
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
        
        newOrders.push({
          orderNumber,
          customerName: user.name,
          status: orderStatus,
          paymentStatus,
          totalAmount,
          itemCount: selectedProducts.length
        });
        
        console.log(`📋 ${orderNumber} 생성됨 (${user.name}) - ${orderStatus} - ₩${totalAmount.toLocaleString()}`);
      }
    }
    
    console.log('\n🎉 모든 주문 데이터 완성!');
    console.log(`📋 새로 생성된 주문: ${newOrders.length}개`);
    
    // 최종 확인
    const finalOrdersResult = await query(`
      SELECT COUNT(*) as total_orders FROM orders
    `);
    const finalItemsResult = await query(`
      SELECT COUNT(*) as total_items FROM order_items
    `);
    
    console.log(`\n📊 최종 데이터 상태:`);
    console.log(`  전체 주문 수: ${finalOrdersResult.rows[0].total_orders}개`);
    console.log(`  전체 주문 아이템 수: ${finalItemsResult.rows[0].total_items}개`);
    
  } catch (error) {
    console.error('❌ order_items 생성 중 오류:', error);
  } finally {
    await close();
  }
}

createOrderItems();