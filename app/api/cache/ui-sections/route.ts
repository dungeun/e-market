import { NextRequest, NextResponse } from 'next/server';
import { uiSectionsCacheService } from '@/lib/services/ui-sections-cache';
import { logger } from '@/lib/logger';

// GET: 캐시 상태 조회 또는 특정 언어 캐시 데이터 반환
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const action = searchParams.get('action'); // status, data

    if (action === 'status') {
      // 캐시 상태 조회
      const isValid = await uiSectionsCacheService.isCacheValid();
      return NextResponse.json({
        success: true,
        isValid,
        timestamp: new Date().toISOString()
      });
    }

    if (language) {
      // 특정 언어의 캐시 데이터 반환
      const cacheData = await uiSectionsCacheService.readCache(language);
      
      if (!cacheData) {
        return NextResponse.json({
          success: false,
          error: `Cache not found for language: ${language}`
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: cacheData
      });
    }

    // 기본: 캐시 유효성 상태 반환
    const isValid = await uiSectionsCacheService.isCacheValid();
    return NextResponse.json({
      success: true,
      isValid,
      message: isValid ? 'Cache is valid' : 'Cache needs regeneration'
    });

  } catch (error) {
    logger.error('Error in UI sections cache GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process cache request'
    }, { status: 500 });
  }
}

// POST: 캐시 생성/재생성
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    logger.info('UI sections cache generation requested', { force });

    // 강제 재생성이 아닌 경우, 캐시 유효성 확인
    if (!force) {
      const isValid = await uiSectionsCacheService.isCacheValid();
      if (isValid) {
        return NextResponse.json({
          success: true,
          message: 'Cache is already valid, no regeneration needed',
          cached: true
        });
      }
    }

    // 캐시 생성
    const result = await uiSectionsCacheService.generateCache();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Cache generated successfully',
        languages: result.languages,
        sectionsCount: result.sectionsCount,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to generate cache'
      }, { status: 500 });
    }

  } catch (error) {
    logger.error('Error generating UI sections cache:', error);
    return NextResponse.json({
      success: false,
      error: 'Cache generation failed'
    }, { status: 500 });
  }
}

// DELETE: 캐시 삭제
export async function DELETE(request: NextRequest) {
  try {
    await uiSectionsCacheService.clearCache();

    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully'
    });

  } catch (error) {
    logger.error('Error clearing UI sections cache:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear cache'
    }, { status: 500 });
  }
}