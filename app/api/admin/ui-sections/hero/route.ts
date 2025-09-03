import type { AppError } from '@/lib/types/common';
// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
// Import from db.ts directly, not db/index.ts which has Prisma
import { query } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logger } from '@/lib/utils/logger';

// GET: hero 섹션 가져오기 - Fixed column names
export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    // Simple query - using actual column names from schema
    const result = await query(`
      SELECT * FROM ui_sections 
      WHERE type = 'hero' OR key = 'hero'
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        section: null,
        message: 'Hero section not found'
      });
    }

    const section = result.rows[0];

    // Parse JSON fields safely - using actual column name 'data'
    let parsedData = {};
    let parsedTranslations = {};
    
    try {
      parsedData = section.data ? 
        (typeof section.data === 'string' ? JSON.parse(section.data) : section.data) : 
        {};
      // Extract translations from data if present
      parsedTranslations = parsedData.translations || {};
    } catch (e) {
      logger.error('Failed to parse data:', e);
      parsedData = {};
    }

    return NextResponse.json({ 
      section: {
        id: section.id,
        key: section.key || section.type,
        type: section.type,
        title: section.title,
        content: parsedData,
        data: parsedData,
        translations: parsedTranslations,
        visible: section.isActive === true || section.isActive === 't' || section.isActive === 1,
        isActive: section.isActive === true || section.isActive === 't' || section.isActive === 1,
        order: section.order || 0
      },
      success: true 
    });
  } catch (error: Error | unknown) {
    logger.error('Failed to fetch hero section:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch section',
      message: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }, { status: 500 });
  }
}

// PUT: hero 섹션 업데이트
export async function PUT(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const body = await request.json();
    const { content, visible, autoTranslate } = body;
    
    logger.info('Updating hero section:', { 
      hasContent: !!content, 
      visible, 
      autoTranslate,
      slidesCount: content?.slides?.length 
    });

    // 자동 번역 처리
    let translations = {};
    if (autoTranslate && content) {
      try {
        const { translateSectionContent } = await import('@/lib/services/section-translation.service');
        translations = await translateSectionContent({
          sectionKey: 'hero',
          content: content,
          autoTranslate: true
        });
      } catch (e) {
        logger.warn('Auto translation failed:', e);
        translations = {};
      }
    }

    // 기존 섹션 찾기 - using actual column names
    const existingResult = await query(`
      SELECT * FROM ui_sections 
      WHERE type = 'hero' OR key = 'hero'
      LIMIT 1
    `);

    let section;
    // Store all data including translations in data column
    const sectionData = {
      ...content,
      translations: translations
    };
    const dataJson = JSON.stringify(sectionData);

    if (existingResult.rows.length > 0) {
      // 업데이트 - using actual column names
      const updateResult = await query(`
        UPDATE ui_sections 
        SET data = $1, "isActive" = $2, "updatedAt" = NOW()
        WHERE id = $3
        RETURNING *
      `, [dataJson, visible, existingResult.rows[0].id]);
      
      section = updateResult.rows[0];
    } else {
      // 새로 생성 - using actual column names
      const insertResult = await query(`
        INSERT INTO ui_sections (key, title, type, "order", "isActive", data)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, ['hero', '히어로 배너', 'hero', 1, visible, dataJson]);
      
      section = insertResult.rows[0];
    }

    // Parse JSON fields safely - using actual column name 'data'
    let parsedData = {};
    let parsedTranslations = {};
    
    try {
      parsedData = section.data ? 
        (typeof section.data === 'string' ? JSON.parse(section.data) : section.data) : 
        {};
      // Extract translations from data if present
      parsedTranslations = parsedData.translations || {};
    } catch (e) {
      logger.error('Failed to parse data after save:', e);
      parsedData = {};
    }

    return NextResponse.json({ 
      section: {
        id: section.id,
        key: section.key || section.type,
        type: section.type,
        title: section.title,
        content: parsedData,
        data: parsedData,
        translations: parsedTranslations,
        visible: section.isActive === true || section.isActive === 't' || section.isActive === 1,
        isActive: section.isActive === true || section.isActive === 't' || section.isActive === 1,
        order: section.order || 0
      },
      success: true 
    });
  } catch (error: Error | unknown) {
    logger.error('Failed to update hero section:', error);
    return NextResponse.json({ 
      error: 'Failed to update section',
      message: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }, { status: 500 });
  }
}