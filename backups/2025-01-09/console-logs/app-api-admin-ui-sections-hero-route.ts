// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
// Import from db.ts directly, not db/index.ts which has Prisma
import { query } from '@/lib/db';

// GET: hero 섹션 가져오기
export async function GET(request: NextRequest) {
  try {
    console.log('[Hero API] Starting GET request');
    console.log('[Hero API] Query function available:', typeof query);
    
    // Test basic query first
    const testResult = await query(`SELECT 1 as test`);
    console.log('[Hero API] Test query successful:', testResult.rows[0]);
    
    // Simple query without ORDER BY first - using actual column names
    const result = await query(`
      SELECT * FROM ui_sections 
      WHERE type = 'hero' OR name = 'hero'
      LIMIT 1
    `);

    console.log('[Hero API] Query result:', result.rows.length, 'rows');

    if (result.rows.length === 0) {
      console.log('[Hero API] No hero section found');
      return NextResponse.json({ 
        section: null,
        message: 'Hero section not found'
      });
    }

    const section = result.rows[0];
    console.log('[Hero API] Section found:', section.id);

    // Parse JSON fields safely - using actual column names
    let parsedConfig = {};
    let parsedTranslations = {};
    
    try {
      parsedConfig = section.config ? 
        (typeof section.config === 'string' ? JSON.parse(section.config) : section.config) : 
        {};
      // Extract translations from config if present
      parsedTranslations = parsedConfig.translations || {};
    } catch (e) {
      console.log('[Hero API] Failed to parse config:', e);
      parsedConfig = {};
    }

    return NextResponse.json({ 
      section: {
        id: section.id,
        key: section.name || section.type,  // Use name as key
        type: section.type,
        title: section.name,
        content: parsedConfig,
        data: parsedConfig,
        translations: parsedTranslations,
        visible: section.isActive === true || section.isActive === 't' || section.isActive === 1,
        isActive: section.isActive === true || section.isActive === 't' || section.isActive === 1,
        order: section.order || 0
      },
      success: true 
    });
  } catch (error: any) {
    console.error('[Hero API] Error fetching hero section:', error.message);
    console.error('[Hero API] Stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to fetch section',
      message: error.message,
      success: false 
    }, { status: 500 });
  }
}

// PUT: hero 섹션 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, visible, autoTranslate } = body;

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
        console.log('[Hero API] Translation failed:', e);
        translations = {};
      }
    }

    // 기존 섹션 찾기 - using actual column names
    const existingResult = await query(`
      SELECT * FROM ui_sections 
      WHERE type = 'hero' OR name = 'hero'
      LIMIT 1
    `);

    let section;
    // Store all data including translations in config column
    const configData = {
      ...content,
      translations: translations
    };
    const configJson = JSON.stringify(configData);

    if (existingResult.rows.length > 0) {
      // 업데이트 - using actual column names
      const updateResult = await query(`
        UPDATE ui_sections 
        SET config = $1, "isActive" = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `, [configJson, visible, existingResult.rows[0].id]);
      
      section = updateResult.rows[0];
    } else {
      // 새로 생성 - using actual column names
      const insertResult = await query(`
        INSERT INTO ui_sections (name, type, "order", "isActive", config)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, ['히어로 배너', 'hero', 1, visible, configJson]);
      
      section = insertResult.rows[0];
    }

    // Parse JSON fields safely - using actual column names
    let parsedConfig = {};
    let parsedTranslations = {};
    
    try {
      parsedConfig = section.config ? 
        (typeof section.config === 'string' ? JSON.parse(section.config) : section.config) : 
        {};
      // Extract translations from config if present
      parsedTranslations = parsedConfig.translations || {};
    } catch (e) {
      console.log('[Hero API PUT] Failed to parse config:', e);
      parsedConfig = {};
    }

    return NextResponse.json({ 
      section: {
        id: section.id,
        key: section.name || section.type,  // Use name as key
        type: section.type,
        title: section.name,
        content: parsedConfig,
        data: parsedConfig,
        translations: parsedTranslations,
        visible: section.isActive === true || section.isActive === 't' || section.isActive === 1,
        isActive: section.isActive === true || section.isActive === 't' || section.isActive === 1,
        order: section.order || 0
      },
      success: true 
    });
  } catch (error: any) {
    console.error('[Hero API] Error updating hero section:', error.message);
    return NextResponse.json({ 
      error: 'Failed to update section',
      message: error.message,
      success: false 
    }, { status: 500 });
  }
}