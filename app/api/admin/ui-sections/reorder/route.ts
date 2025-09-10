import type { AppError } from '@/lib/types/common';
import { env } from '@/lib/config/env';
// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';
import { broadcastUIUpdate } from '@/lib/events/broadcaster';

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

    if (sections.length === 0) {
      return NextResponse.json({ 
        error: 'Sections array cannot be empty',
        success: false 
      }, { status: 400 });
    }

    logger.info(`Reordering ${sections.length} sections`, { 
      sections: sections.map(s => ({ key: s.key || s.id, order: s.order })) 
    });

    // 모든 섹션 순서 업데이트
    const updates = await Promise.all(
      sections.map(async (section: any) => {
        // Type check and provide defaults
        const order = typeof section.order === 'number' ? section.order : 0;
        const isActive = typeof section.isActive === 'boolean' ? section.isActive : true;
        const key = section.key || section.id || '';
        
        if (!key) {
          logger.error('Section missing key/id:', section);
          return null;
        }
        
        try {
          const result = await query(`
            UPDATE ui_sections 
            SET "order" = $1, "isActive" = $2, "updatedAt" = NOW()
            WHERE key = $3
            RETURNING *
          `, [order, isActive, key]);
          
          if (result.rows.length === 0) {
            logger.warn(`No section found with key: ${key}`);
            return null;
          }
          
          return result.rows[0];
        } catch (dbError) {
          logger.error(`Database error updating section ${key}:`, dbError);
          return null;
        }
      })
    );

    // 캐시 무효화 및 재생성
    try {
      // 메모리 캐시 무효화
      const { invalidateCache } = await import('@/lib/cache/preload-service');
      invalidateCache();
      
      // 언어별 sections.json 파일 업데이트
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // 모든 언어 파일 업데이트
      const languages = ['ko', 'en', 'jp'];
      for (const lang of languages) {
        const sectionsJsonPath = path.join(process.cwd(), 'public', 'i18n', lang, 'sections.json');
        
        try {
          const content = await fs.readFile(sectionsJsonPath, 'utf-8');
          const jsonData = JSON.parse(content);
          
          // 새로운 섹션 순서로 업데이트
          // isActive가 false가 아닌 모든 섹션 포함 (undefined일 경우도 활성으로 간주)
          jsonData.sectionOrder = sections
            .filter(s => s.isActive !== false)
            .sort((a, b) => {
              const aOrder = typeof a.order === 'number' ? a.order : 0;
              const bOrder = typeof b.order === 'number' ? b.order : 0;
              return aOrder - bOrder;
            })
            .map(section => section.key || section.id)
            .filter(key => key);
          
          jsonData.lastUpdated = new Date().toISOString();
          
          // 안전한 파일 쓰기 (임시 파일 사용)
          const tempPath = sectionsJsonPath + '.tmp';
          await fs.writeFile(tempPath, JSON.stringify(jsonData, null, 2));
          await fs.rename(tempPath, sectionsJsonPath);
          logger.info(`${lang}/sections.json updated with new section order`);
        } catch (fileError) {
          logger.error(`Failed to update ${lang}/sections.json:`, fileError);
        }
      }
      
      // homepage-unified.json 파일 업데이트
      const jsonFilePath = path.join(process.cwd(), 'public', 'cache', 'homepage-unified.json');
      
      try {
        // 기존 JSON 파일 읽기
        const existingData = await fs.readFile(jsonFilePath, 'utf-8');
        const homepageData = JSON.parse(existingData);
        
        // 새로운 섹션 순서로 업데이트 
        const newSectionOrder = sections
          .filter(s => s.isActive !== false) // isActive가 false가 아닌 섹션만 포함
          .sort((a, b) => {
            const aOrder = typeof a.order === 'number' ? a.order : 0;
            const bOrder = typeof b.order === 'number' ? b.order : 0;
            return aOrder - bOrder;
          })
          .map(section => section.key || section.id)
          .filter(key => key); // Remove any undefined/null keys
        
        homepageData.sectionOrder = newSectionOrder;
        homepageData.metadata = {
          ...homepageData.metadata,
          lastUpdated: new Date().toISOString(),
          orderedAt: new Date().toISOString()
        };
        
        // 안전한 파일 쓰기 (임시 파일 사용)
        const tempPath = jsonFilePath + '.tmp';
        await fs.writeFile(tempPath, JSON.stringify(homepageData, null, 2));
        await fs.rename(tempPath, jsonFilePath);
        
        logger.info('homepage-unified.json updated with new section order:', newSectionOrder);
      } catch (fileError) {
        logger.error('Failed to update homepage-unified.json:', fileError);
      }
      
      // 캐시 재생성 - 존재하지 않는 API 호출 제거
      // 이미 위에서 JSON 파일들을 직접 업데이트했으므로 추가 작업 불필요
      
      logger.info('Section reorder completed, cache invalidated');
    } catch (error) {
      logger.error('Error invalidating cache after reorder:', error);
      // 캐시 무효화 실패해도 성공 응답 반환 (섹션 업데이트는 성공했으므로)
    }

    // Filter out null results and format response
    const validUpdates = updates.filter(update => update !== null);

    // 실시간 섹션 순서 변경 이벤트 발생
    broadcastUIUpdate('ui:section:reordered', {
      action: 'reordered',
      sections: validUpdates.map(section => ({
        id: section.id,
        key: section.key || section.name,
        order: section.order,
        isActive: section.isActive
      })),
      sectionOrder: sections
        .filter(s => s.isActive !== false)
        .sort((a, b) => {
          const aOrder = typeof a.order === 'number' ? a.order : 0;
          const bOrder = typeof b.order === 'number' ? b.order : 0;
          return aOrder - bOrder;
        })
        .map(section => section.key || section.id)
        .filter(key => key)
    });
    
    return NextResponse.json({ 
      sections: validUpdates.map(section => ({
        ...section,
        content: typeof section.content === 'string' ? 
          (section.content ? JSON.parse(section.content) : {}) : 
          (section.content || {}),
        translations: typeof section.translations === 'string' ? 
          (section.translations ? JSON.parse(section.translations) : {}) : 
          (section.translations || {})
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