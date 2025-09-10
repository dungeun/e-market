#!/usr/bin/env tsx

// Load environment variables FIRST
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

// Now import after env is loaded
import { query, connect, close } from '../lib/db';

async function checkRealData() {
  try {
    console.log('🔍 실제 데이터 확인 시작...');
    
    // 데이터베이스 연결
    await connect();
    
    // 실제 사용자 확인
    const usersResult = await query(`
      SELECT id, name, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    console.log('👤 사용자 데이터:');
    console.log(`총 ${usersResult.rows.length}명의 사용자 발견`);
    usersResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // 실제 상품 확인
    const productsResult = await query(`
      SELECT id, name, price, status, created_at 
      FROM products 
      WHERE status = 'ACTIVE'
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    console.log('\n🛍️ 활성 상품 데이터:');
    console.log(`총 ${productsResult.rows.length}개의 활성 상품 발견`);
    productsResult.rows.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ₩${parseInt(product.price).toLocaleString()}`);
    });
    
    // 기존 주문 확인
    const ordersResult = await query(`
      SELECT id, order_number, status, total_amount, created_at 
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('\n📦 기존 주문 데이터:');
    console.log(`총 ${ordersResult.rows.length}개의 주문 발견`);
    ordersResult.rows.forEach((order, index) => {
      console.log(`${index + 1}. ${order.order_number} - ${order.status} - ₩${parseInt(order.total_amount).toLocaleString()}`);
    });
    
    console.log('\n✅ 데이터 확인 완료');
    
  } catch (error) {
    console.error('❌ 데이터 확인 중 오류:', error);
  } finally {
    await close();
  }
}

checkRealData();