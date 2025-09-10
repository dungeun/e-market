#!/usr/bin/env tsx

// Load environment variables FIRST
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

// Now import after env is loaded
import { query, connect, close } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category_id?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

async function createRealProductsAndOrders() {
  try {
    console.log('🚀 실제 상품 및 주문 데이터 생성 시작...');
    
    await connect();
    
    // 1. 실제 상품 생성 (음식/배달 테마)
    const products: Omit<Product, 'id'>[] = [
      {
        name: '불고기 버거',
        price: 8500,
        description: '한국식 불고기 패티와 신선한 야채가 들어간 시그니처 버거'
      },
      {
        name: '치킨 마요 덮밥',
        price: 12000,
        description: '바삭한 치킨과 크리미한 마요네즈, 계란후라이가 올라간 덮밥'
      },
      {
        name: '떡볶이 세트',
        price: 7500,
        description: '매콤달콤한 떡볶이와 튀김, 순대가 포함된 세트'
      },
      {
        name: '김치찌개',
        price: 9000,
        description: '집에서 끓인 것 같은 진짜 김치찌개 (밥 포함)'
      },
      {
        name: '파스타 세트',
        price: 15000,
        description: '토마토 베이스 파스타와 사라다, 음료가 포함된 세트'
      },
      {
        name: '치킨 텐더',
        price: 13500,
        description: '바삭하게 튀긴 치킨 텐더 8조각 (소스 2개 포함)'
      }
    ];
    
    console.log('📦 상품 데이터 삽입 중...');
    
    const createdProducts: Product[] = [];
    
    for (const product of products) {
      const productId = 'prod_' + Math.random().toString(36).substr(2, 16);
      
      await query(`
        INSERT INTO products (
          id, name, slug, description, price, status, 
          stock, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, 'ACTIVE', 
          100, NOW(), NOW()
        )
      `, [productId, product.name, product.name.toLowerCase().replace(/\s+/g, '-'), product.description, product.price]);
      
      createdProducts.push({
        id: productId,
        ...product
      });
      
      console.log(`✅ ${product.name} 생성됨`);
    }
    
    // 2. 기존 사용자 조회
    const usersResult = await query('SELECT id, name, email FROM users WHERE role != $1', ['ADMIN']);
    const users: User[] = usersResult.rows;
    
    console.log(`👤 ${users.length}명의 고객 사용자 확인됨`);
    
    // 3. 실제 주문 생성
    const orderStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const paymentMethods = ['CARD', 'TOSS_PAY', 'BANK_TRANSFER'];
    const paymentStatuses = ['COMPLETED', 'PENDING', 'FAILED'];
    
    console.log('📋 주문 데이터 생성 중...');
    
    const orders = [];
    
    // 각 사용자마다 2-4개의 주문 생성
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const orderCount = Math.floor(Math.random() * 3) + 2; // 2-4개 주문
      
      for (let j = 0; j < orderCount; j++) {
        const orderId = 'ord_' + Math.random().toString(36).substr(2, 16);
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        
        // 랜덤 상품 1-3개 선택
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const selectedProducts = [];
        const usedProductIds = new Set();
        
        let totalAmount = 0;
        
        for (let k = 0; k < itemCount; k++) {
          let randomProduct;
          do {
            randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
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
        
        // 논리적 일관성: 취소된 주문은 결제 실패 또는 대기
        if (orderStatus === 'CANCELLED') {
          paymentStatus = Math.random() > 0.5 ? 'FAILED' : 'PENDING';
        } else if (orderStatus === 'DELIVERED') {
          paymentStatus = 'COMPLETED';
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
        
        // 주문 생성
        await query(`
          INSERT INTO orders (
            id, order_number, user_id, status, total_amount,
            shipping_address, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, 
            NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days', NOW())
        `, [orderId, orderNumber, user.id, orderStatus, totalAmount, JSON.stringify({ address: shippingAddress })]);
        
        // 결제 정보 생성
        const paymentId = 'pay_' + Math.random().toString(36).substr(2, 16);
        await query(`
          INSERT INTO payments (
            id, order_id, method, status, amount, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        `, [paymentId, orderId, paymentMethod, paymentStatus, totalAmount]);
        
        // 주문 아이템들 생성
        for (const item of selectedProducts) {
          const orderItemId = 'oi_' + Math.random().toString(36).substr(2, 16);
          
          await query(`
            INSERT INTO order_items (
              id, order_id, product_id, name, sku, 
              price, quantity, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
          `, [
            orderItemId,
            orderId,
            item.product.id,
            item.product.name,
            `SKU-${item.product.id.substr(-8)}`,
            item.product.price,
            item.quantity
          ]);
        }
        
        orders.push({
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
    
    console.log('\n🎉 데이터 생성 완료!');
    console.log(`📦 ${createdProducts.length}개 상품 생성`);
    console.log(`📋 ${orders.length}개 주문 생성`);
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
    console.error('❌ 데이터 생성 중 오류:', error);
  } finally {
    await close();
  }
}

createRealProductsAndOrders();