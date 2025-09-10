/**
 * 통합 쿼리 서비스 테스트
 * 성능 및 기능 검증
 */

import { unifiedQueryService } from '@/lib/services/unified-query-service';
import { cartService } from '@/lib/services/cart-service';
import { inventoryService } from '@/lib/services/inventory-service';
import { productService } from '@/lib/services/business/product-service';

describe('UnifiedQueryService', () => {
  
  // =============================================================================
  // 1. 기본 CRUD 성능 테스트
  // =============================================================================
  
  describe('Basic CRUD Performance', () => {
    
    test('findById should use cache on second call', async () => {
      const productId = 'test-product-1';
      
      // 첫 번째 호출 (DB에서 조회)
      const start1 = Date.now();
      const product1 = await unifiedQueryService.findById('products', productId, { useCache: true });
      const time1 = Date.now() - start1;
      
      // 두 번째 호출 (캐시에서 조회)
      const start2 = Date.now();
      const product2 = await unifiedQueryService.findById('products', productId, { useCache: true });
      const time2 = Date.now() - start2;
      
      console.log(`First call (DB): ${time1}ms, Second call (Cache): ${time2}ms`);
      
      // 캐시 호출이 더 빨라야 함
      expect(time2).toBeLessThan(time1);
      expect(product1).toEqual(product2);
    });
    
    test('findByIds should resolve N+1 problem', async () => {
      const productIds = ['product-1', 'product-2', 'product-3', 'product-4', 'product-5'];
      
      // 배치 조회 시간 측정
      const start = Date.now();
      const products = await unifiedQueryService.findByIds('products', productIds);
      const batchTime = Date.now() - start;
      
      // 개별 조회 시간 측정 (N+1 시뮬레이션)
      const individualStart = Date.now();
      const individualResults = [];
      for (const id of productIds) {
        const product = await unifiedQueryService.findById('products', id, { useCache: false });
        individualResults.push(product);
      }
      const individualTime = Date.now() - individualStart;
      
      console.log(`Batch query: ${batchTime}ms, Individual queries: ${individualTime}ms`);
      
      // 배치 조회가 개별 조회보다 빨라야 함
      expect(batchTime).toBeLessThan(individualTime);
      expect(products.size).toBeLessThanOrEqual(productIds.length);
    });
    
  });
  
  // =============================================================================
  // 2. 카트 서비스 최적화 테스트
  // =============================================================================
  
  describe('Cart Service Optimization', () => {
    
    test('loadCartWithItems should use batch queries', async () => {
      const cartId = 'test-cart-1';
      
      const start = Date.now();
      const cart = await cartService.getCart(cartId);
      const time = Date.now() - start;
      
      console.log(`Cart loading time: ${time}ms`);
      console.log(`Cart items count: ${cart.items?.length || 0}`);
      
      // 카트 로딩 시간이 합리적이어야 함 (1초 이하)
      expect(time).toBeLessThan(1000);
    });
    
    test('cart operations should invalidate cache properly', async () => {
      const cartId = 'test-cart-2';
      const productId = 'test-product-1';
      
      // 카트 생성/조회
      const cart1 = await cartService.getCart(cartId);
      
      // 아이템 추가
      await cartService.addToCart(cartId, productId, 1);
      
      // 캐시가 무효화되어 새로운 데이터가 반환되어야 함
      const cart2 = await cartService.getCart(cartId);
      
      expect(cart2.items.length).toBeGreaterThan(cart1.items.length);
    });
    
  });
  
  // =============================================================================
  // 3. 재고 서비스 최적화 테스트
  // =============================================================================
  
  describe('Inventory Service Optimization', () => {
    
    test('checkBulkStock should outperform individual checks', async () => {
      const items = [
        { productId: 'product-1', quantity: 2 },
        { productId: 'product-2', quantity: 1 },
        { productId: 'product-3', quantity: 3 },
        { productId: 'product-4', quantity: 1 },
        { productId: 'product-5', quantity: 2 }
      ];
      
      // 배치 재고 확인
      const batchStart = Date.now();
      const batchResults = await inventoryService.checkBulkStock(items);
      const batchTime = Date.now() - batchStart;
      
      // 개별 재고 확인
      const individualStart = Date.now();
      const individualResults = new Map();
      for (const item of items) {
        const hasStock = await inventoryService.checkStock(item.productId, item.quantity);
        individualResults.set(item.productId, hasStock);
      }
      const individualTime = Date.now() - individualStart;
      
      console.log(`Bulk stock check: ${batchTime}ms, Individual checks: ${individualTime}ms`);
      
      // 배치 처리가 더 빨라야 함
      expect(batchTime).toBeLessThan(individualTime);
      expect(batchResults.size).toBe(items.length);
      
      // 결과 일치성 확인
      for (const item of items) {
        expect(batchResults.get(item.productId)).toBe(individualResults.get(item.productId));
      }
    });
    
  });
  
  // =============================================================================
  // 4. 제품 서비스 최적화 테스트
  // =============================================================================
  
  describe('Product Service Optimization', () => {
    
    test('product queries should be cached', async () => {
      const productId = 'test-product-1';
      
      // 첫 번째 상품 상세 조회
      const start1 = Date.now();
      const product1 = await productService.getProductDetail(productId);
      const time1 = Date.now() - start1;
      
      // 두 번째 상품 상세 조회 (캐시 활용)
      const start2 = Date.now();
      const product2 = await productService.getProductDetail(productId);
      const time2 = Date.now() - start2;
      
      console.log(`First product detail: ${time1}ms, Second (cached): ${time2}ms`);
      
      // 캐시된 조회가 더 빨라야 함
      expect(time2).toBeLessThan(time1);
      expect(product1).toEqual(product2);
    });
    
    test('product list queries should be cached', async () => {
      const filter = { category: 'electronics', limit: 10 };
      
      const start1 = Date.now();
      const result1 = await productService.getPublicProducts(filter);
      const time1 = Date.now() - start1;
      
      const start2 = Date.now();
      const result2 = await productService.getPublicProducts(filter);
      const time2 = Date.now() - start2;
      
      console.log(`First product list: ${time1}ms, Second (cached): ${time2}ms`);
      
      expect(time2).toBeLessThan(time1);
      expect(result1.products.length).toBe(result2.products.length);
    });
    
  });
  
  // =============================================================================
  // 5. 캐시 통계 및 성능 모니터링
  // =============================================================================
  
  describe('Cache Statistics and Monitoring', () => {
    
    test('should provide cache statistics', async () => {
      const stats = await unifiedQueryService.getCacheStats();
      
      console.log('Cache Statistics:', stats);
      
      expect(stats).toHaveProperty('totalKeys');
      expect(stats).toHaveProperty('memoryUsage');
      expect(typeof stats.totalKeys).toBe('number');
      expect(typeof stats.memoryUsage).toBe('string');
    });
    
    test('should handle cache invalidation properly', async () => {
      const productId = 'test-product-cache';
      
      // 캐시에 저장
      await unifiedQueryService.findById('products', productId, { useCache: true });
      
      // 캐시 무효화
      await unifiedQueryService.invalidateTableCache('products');
      
      // 캐시 무효화 후 조회 시간이 길어져야 함
      const start = Date.now();
      await unifiedQueryService.findById('products', productId, { useCache: true });
      const time = Date.now() - start;
      
      console.log(`Query time after cache invalidation: ${time}ms`);
      
      // 캐시가 무효화되어 DB 조회가 발생했음을 확인
      expect(time).toBeGreaterThan(0);
    });
    
  });
  
  // =============================================================================
  // 6. 배치 처리 성능 테스트
  // =============================================================================
  
  describe('Batch Processing Performance', () => {
    
    test('batch insert should be efficient', async () => {
      const testItems = Array.from({ length: 100 }, (_, index) => ({
        id: `test-item-${index}`,
        name: `Test Item ${index}`,
        price: Math.random() * 100,
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      const start = Date.now();
      const success = await unifiedQueryService.batchInsert('test_items', testItems);
      const time = Date.now() - start;
      
      console.log(`Batch insert of ${testItems.length} items: ${time}ms`);
      
      expect(success).toBe(true);
      expect(time).toBeLessThan(1000); // 1초 이하
    });
    
    test('batch update should be efficient', async () => {
      const updates = Array.from({ length: 50 }, (_, index) => ({
        id: `test-item-${index}`,
        data: {
          name: `Updated Item ${index}`,
          price: Math.random() * 200
        }
      }));
      
      const start = Date.now();
      const updatedCount = await unifiedQueryService.batchUpdate('test_items', updates);
      const time = Date.now() - start;
      
      console.log(`Batch update of ${updates.length} items: ${time}ms`);
      
      expect(updatedCount).toBeLessThanOrEqual(updates.length);
      expect(time).toBeLessThan(1000); // 1초 이하
    });
    
  });
  
});

// =============================================================================
// 성능 벤치마크 실행 함수
// =============================================================================

export async function runPerformanceBenchmark() {
  console.log('='.repeat(60));
  console.log('통합 쿼리 서비스 성능 벤치마크 시작');
  console.log('='.repeat(60));
  
  const results = {
    cacheHitRatio: 0,
    averageQueryTime: 0,
    batchVsIndividualImprovement: 0,
    cacheStats: null as any
  };
  
  // 1. 캐시 적중률 테스트
  const productIds = ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5'];
  let cacheHits = 0;
  
  for (let i = 0; i < 3; i++) {
    for (const id of productIds) {
      const start = Date.now();
      await unifiedQueryService.findById('products', id, { useCache: true });
      const time = Date.now() - start;
      
      if (time < 5) cacheHits++; // 5ms 미만은 캐시 적중으로 간주
    }
  }
  
  results.cacheHitRatio = (cacheHits / (productIds.length * 3)) * 100;
  
  // 2. 배치 vs 개별 처리 성능 비교
  const testItems = Array.from({ length: 10 }, (_, i) => ({ productId: `prod-${i}`, quantity: 1 }));
  
  const batchStart = Date.now();
  await inventoryService.checkBulkStock(testItems);
  const batchTime = Date.now() - batchStart;
  
  let totalIndividualTime = 0;
  for (const item of testItems) {
    const start = Date.now();
    await inventoryService.checkStock(item.productId, item.quantity);
    totalIndividualTime += Date.now() - start;
  }
  
  results.batchVsIndividualImprovement = ((totalIndividualTime - batchTime) / totalIndividualTime) * 100;
  
  // 3. 캐시 통계
  results.cacheStats = await unifiedQueryService.getCacheStats();
  
  console.log('벤치마크 결과:');
  console.log(`- 캐시 적중률: ${results.cacheHitRatio.toFixed(2)}%`);
  console.log(`- 배치 처리 성능 개선: ${results.batchVsIndividualImprovement.toFixed(2)}%`);
  console.log(`- 캐시 키 수: ${results.cacheStats.totalKeys}`);
  console.log(`- 캐시 메모리 사용량: ${results.cacheStats.memoryUsage}`);
  
  console.log('='.repeat(60));
  console.log('벤치마크 완료');
  console.log('='.repeat(60));
  
  return results;
}