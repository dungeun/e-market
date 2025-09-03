/**
 * 상품 캐시 자동 재생성 훅
 * 상품 생성/수정/삭제 시 자동으로 JSON 캐시를 업데이트
 */

import { Product } from '@prisma/client';

interface CacheRegenerationOptions {
  immediate?: boolean;
  affectedPages?: number[];
  languages?: string[];
}

export class ProductCacheHook {
  private static regenerationQueue: Set<string> = new Set();
  private static regenerationTimer: NodeJS.Timeout | null = null;
  private static BATCH_DELAY = 5000; // 5초 후 배치 처리

  /**
   * 상품 생성 후 캐시 재생성
   */
  static async onProductCreated(product: Product): Promise<void> {

    // 새 상품은 일반적으로 첫 페이지에 표시되므로 첫 페이지만 재생성
    this.scheduleRegeneration('create', {
      affectedPages: [1],
      languages: ['ko', 'en', 'jp']
    });

    // 번역도 자동 생성 트리거
    this.triggerAutoTranslation(product);
  }

  /**
   * 상품 수정 후 캐시 재생성
   */
  static async onProductUpdated(
    productId: string,
    oldData: Partial<Product>,
    newData: Partial<Product>
  ): Promise<void> {

    // 가격, 재고, 상태 변경은 즉시 반영
    const criticalChanges = 
      oldData.price !== newData.price ||
      oldData.discountPrice !== newData.discountPrice ||
      oldData.stock !== newData.stock ||
      oldData.status !== newData.status;

    this.scheduleRegeneration('update', {
      immediate: criticalChanges,
      affectedPages: await this.findAffectedPages(productId)
    });
  }

  /**
   * 상품 삭제 후 캐시 재생성
   */
  static async onProductDeleted(productId: string): Promise<void> {

    // 삭제는 전체 페이지네이션에 영향을 줄 수 있음
    this.scheduleRegeneration('delete', {
      immediate: true
    });
  }

  /**
   * 대량 상품 업데이트 후 캐시 재생성
   */
  static async onBulkProductUpdate(productIds: string[]): Promise<void> {

    // 대량 업데이트는 백그라운드에서 전체 재생성
    this.scheduleRegeneration('bulk', {
      immediate: false
    });
  }

  /**
   * 재생성 스케줄링 (배치 처리)
   */
  private static scheduleRegeneration(
    operation: string,
    options: CacheRegenerationOptions = {}
  ): void {
    const key = `${operation}-${Date.now()}`;
    this.regenerationQueue.add(key);

    if (options.immediate) {
      // 즉시 실행
      this.executeRegeneration();
    } else {
      // 배치 처리 스케줄링
      if (this.regenerationTimer) {
        clearTimeout(this.regenerationTimer);
      }
      
      this.regenerationTimer = setTimeout(() => {
        this.executeRegeneration();
      }, this.BATCH_DELAY);
    }
  }

  /**
   * 캐시 재생성 실행
   */
  private static async executeRegeneration(): Promise<void> {
    if (this.regenerationQueue.size === 0) return;

    const operations = Array.from(this.regenerationQueue);
    this.regenerationQueue.clear();

    try {
      // API 호출로 백그라운드 재생성 트리거
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/regenerate-cache`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'products',
            immediate: false // 백그라운드에서 처리
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Cache regeneration failed: ${response.statusText}`);
      }

      const result = await response.json();

    } catch (error) {

      // 실패한 작업을 다시 큐에 추가 (재시도)
      operations.forEach(op => this.regenerationQueue.add(op));
      
      // 30초 후 재시도
      setTimeout(() => {
        this.executeRegeneration();
      }, 30000);
    }
  }

  /**
   * 상품이 포함된 페이지 찾기
   */
  private static async findAffectedPages(productId: string): Promise<number[]> {
    // 실제 구현에서는 DB 쿼리로 상품 위치 파악
    // 여기서는 간단히 처음 3페이지로 가정
    return [1, 2, 3];
  }

  /**
   * 자동 번역 트리거
   */
  private static async triggerAutoTranslation(product: Product): Promise<void> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/products/${product.id}/translate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            languages: ['en', 'ja'],
            fields: ['name', 'description']
          })
        }
      );

      if (response.ok) {

      }
    } catch (error) {

    }
  }

  /**
   * 캐시 워밍 (사전 로드)
   */
  static async warmCache(): Promise<void> {

    const criticalPages = [1, 2, 3]; // 처음 3페이지
    const languages = ['ko', 'en', 'jp'];
    
    for (const lang of languages) {
      for (const page of criticalPages) {
        try {
          // 캐시 파일 미리 로드
          await fetch(`/cache/products/products-${lang}-page-${page}.json`, {
            method: 'HEAD'
          });
        } catch {
          // 실패해도 무시 (백그라운드 작업)
        }
      }
    }

  }
}

// Prisma 미들웨어로 자동 훅 등록 (선택사항)
export function registerProductCacheHooks(prisma: any): void {
  // Prisma 미들웨어 사용 예시
  prisma.$use(async (params: any, next: any) => {
    const result = await next(params);
    
    if (params.model === 'Product') {
      switch (params.action) {
        case 'create':
        case 'createMany':
          ProductCacheHook.onProductCreated(result);
          break;
        case 'update':
        case 'updateMany':
          ProductCacheHook.onProductUpdated(
            params.args.where?.id || 'unknown',
            params.args.data,
            result
          );
          break;
        case 'delete':
        case 'deleteMany':
          ProductCacheHook.onProductDeleted(params.args.where?.id || 'unknown');
          break;
      }
    }
    
    return result;
  });
}