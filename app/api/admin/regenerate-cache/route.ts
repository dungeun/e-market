import type { AppError } from '@/lib/types/common';
// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { JsonCacheService } from '@/lib/services/json-cache.service';
import { invalidateCache } from '@/lib/cache/preload-service';
import { invalidateLanguagePacksCache } from '@/lib/cache/language-packs';

// 캐시 재생성 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, language, page, immediate = false } = body;

    const jsonCacheService = new JsonCacheService();
    const regenerated: string[] = [];

    switch (type) {
      case 'products':
        if (immediate) {
          // 즉시 재생성 (동기적)
          await jsonCacheService.generateProductCache();
          regenerated.push('products-all-languages');
        } else if (language && page) {
          // 특정 페이지만 프리페치 (비동기적)
          await jsonCacheService.prefetchNextPage(language, page);
          regenerated.push(`products-${language}-page-${page + 1}`);
        } else {
          // 백그라운드에서 전체 재생성 (비동기적)
          setImmediate(() => {
            jsonCacheService.generateProductCache()
              .catch(err => logger.error('Background cache generation error:', err))
          });
          regenerated.push('products-background-all');
        }
        break;

      case 'ui-sections':
        // UI 섹션 캐시 무효화 (메모리 캐시)
        invalidateCache();
        regenerated.push('ui-sections-memory');
        break;

      case 'language-packs':
        // 언어팩 캐시 무효화
        invalidateLanguagePacksCache();
        regenerated.push('language-packs');
        break;

      case 'all':
        // 모든 캐시 재생성
        await jsonCacheService.invalidateAndRegenerate();
        invalidateCache();
        invalidateLanguagePacksCache();
        regenerated.push('all-caches');
        break;

      default:
        return NextResponse.json({
          error: 'Invalid cache type. Use: products, ui-sections, language-packs, or all'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Cache regeneration initiated',
      regenerated,
      timestamp: new Date().toISOString(),
      mode: immediate ? 'immediate' : 'background'
    });

  } catch (error) {

    return NextResponse.json({
      error: 'Failed to regenerate cache',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET: 캐시 상태 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    const cacheStatus: unknown = {
      timestamp: new Date().toISOString(),
      caches: {}
    };

    // 상품 캐시 상태 확인
    if (type === 'products' || type === 'all') {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      try {
        const cacheDir = path.join(process.cwd(), 'public/cache/products');
        const indexPath = path.join(cacheDir, 'index.json');
        
        const indexContent = await fs.readFile(indexPath, 'utf-8');
        const index = JSON.parse(indexContent);
        
        const stats = await fs.stat(indexPath);
        const ageMinutes = Math.floor((Date.now() - stats.mtimeMs) / 1000 / 60);
        
        cacheStatus.caches.products = {
          status: 'active',
          generated: index.generated,
          version: index.version,
          files: index.files?.length || 0,
          ageMinutes,
          ttlMinutes: Math.floor(index.ttl / 60),
          expired: ageMinutes > Math.floor(index.ttl / 60)
        };
      } catch (error) {
        cacheStatus.caches.products = {
          status: 'not-found',
          error: 'Cache not generated'
        };
      }
    }

    // UI 섹션 캐시 상태
    if (type === 'ui-sections' || type === 'all') {
      cacheStatus.caches['ui-sections'] = {
        status: 'active',
        type: 'memory',
        note: 'In-memory cache with TTL'
      };
    }

    // 언어팩 캐시 상태
    if (type === 'language-packs' || type === 'all') {
      cacheStatus.caches['language-packs'] = {
        status: 'active',
        type: 'memory',
        note: 'In-memory cache with TTL'
      };
    }

    return NextResponse.json({
      success: true,
      ...cacheStatus
    });

  } catch (error) {

    return NextResponse.json({
      error: 'Failed to get cache status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}