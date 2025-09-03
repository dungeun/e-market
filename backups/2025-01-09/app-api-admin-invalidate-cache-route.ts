import { NextRequest, NextResponse } from 'next/server';
import { invalidateLanguagePacksCache } from '@/lib/cache/language-packs';
import { invalidateCache } from '@/lib/cache/preload-service';

// 캐시 무효화 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    const invalidated: string[] = [];

    switch (type) {
      case 'ui-sections':
        // UI 섹션 캐시 무효화
        invalidateCache();
        invalidated.push('preload-service');
        
        // 언어팩 캐시도 무효화 (연관성 때문에)
        invalidateLanguagePacksCache();
        invalidated.push('language-packs');
        
        break;

      case 'language-packs':
        // 언어팩 캐시만 무효화
        invalidateLanguagePacksCache();
        invalidated.push('language-packs');
        break;

      case 'all':
        // 모든 캐시 무효화
        invalidateCache();
        invalidateLanguagePacksCache();
        invalidated.push('preload-service', 'language-packs');
        break;

      default:
        return NextResponse.json({
          error: 'Invalid cache type. Use: ui-sections, language-packs, or all'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Cache invalidated successfully',
      invalidated,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error invalidating cache:', error);
    return NextResponse.json({
      error: 'Failed to invalidate cache',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET: 현재 캐시 상태 조회
export async function GET() {
  try {
    // 캐시 상태 정보 반환 (실제 구현에 따라 조정)
    return NextResponse.json({
      success: true,
      cacheStatus: {
        'ui-sections': 'active',
        'language-packs': 'active',
        lastInvalidated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting cache status:', error);
    return NextResponse.json({
      error: 'Failed to get cache status'
    }, { status: 500 });
  }
}