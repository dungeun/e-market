// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';

// PUT: 섹션 순서 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sections } = body;

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json({ 
        error: 'Sections array is required',
        success: false 
      }, { status: 400 });
    }

    // 모든 섹션 순서 업데이트
    const updates = await Promise.all(
      sections.map(async (section: any) => {
        const result = await query(`
          UPDATE ui_sections 
          SET "order" = $1, "isActive" = $2, "updatedAt" = NOW()
          WHERE key = $3
          RETURNING *
        `, [
          section.order || 0, 
          section.isActive !== undefined ? section.isActive : true, 
          section.key
        ]);
        
        return result.rows[0];
      })
    );

    // 캐시 무효화 및 재생성
    try {
      // 메모리 캐시 무효화
      const { invalidateCache } = await import('@/lib/cache/preload-service');
      invalidateCache();
      
      // homepage-unified.json 파일 업데이트
      const fs = await import('fs/promises');
      const path = await import('path');
      const jsonFilePath = path.join(process.cwd(), 'public', 'cache', 'homepage-unified.json');
      
      try {
        // 기존 JSON 파일 읽기
        const existingData = await fs.readFile(jsonFilePath, 'utf-8');
        const homepageData = JSON.parse(existingData);
        
        // 새로운 섹션 순서로 업데이트
        const newSectionOrder = sections
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(section => section.key);
        
        homepageData.sectionOrder = newSectionOrder;
        homepageData.metadata = {
          ...homepageData.metadata,
          lastUpdated: new Date().toISOString(),
          orderedAt: new Date().toISOString()
        };
        
        // 파일에 다시 쓰기
        await fs.writeFile(jsonFilePath, JSON.stringify(homepageData, null, 2));
        
        logger.info('homepage-unified.json updated with new section order:', newSectionOrder);
      } catch (fileError) {
        logger.error('Failed to update homepage-unified.json:', fileError);
      }
      
      // JSON 캐시 재생성 요청 (백그라운드에서 비동기적으로)
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001' 
        : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
      
      fetch(`${apiUrl}/api/admin/regenerate-cache`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ui-sections' })
      }).catch(err => logger.error('Failed to regenerate cache:', err));
      
      logger.info('Section reorder completed, cache invalidated');
    } catch (error) {
      logger.error('Error invalidating cache after reorder:', error);
      // 캐시 무효화 실패해도 성공 응답 반환 (섹션 업데이트는 성공했으므로)
    }

    return NextResponse.json({ 
      sections: updates.map(section => ({
        ...section,
        content: typeof section.content === 'string' ? JSON.parse(section.content) : section.content,
        translations: typeof section.translations === 'string' ? JSON.parse(section.translations || '{}') : section.translations
      })),
      success: true,
      message: 'Sections reordered and cache invalidated'
    });
  } catch (error) {
    logger.error('Error updating section order:', error);
    return NextResponse.json({ 
      error: 'Failed to update section order',
      success: false 
    }, { status: 500 });
  }
}