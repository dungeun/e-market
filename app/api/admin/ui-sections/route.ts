import type { AppError } from '@/lib/types/common';
// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';
import { translateText } from '@/lib/services/translation.service';
import { emitToAll } from '@/lib/socket';

// GET: 모든 UI 섹션 가져오기
export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      SELECT * FROM ui_sections 
      ORDER BY "order" ASC
    `);

    const sections = result.rows.map(section => ({
      id: section.id,
      key: section.key || section.name,
      name: section.key || section.name,
      title: section.title || section.name,
      type: section.type,
      order: section.order,
      isActive: section.isActive,
      visible: section.isActive,
      content: typeof section.config === 'string' ? JSON.parse(section.config) : section.config,
      data: typeof section.data === 'string' ? JSON.parse(section.data) : section.data,
      config: typeof section.config === 'string' ? JSON.parse(section.config) : section.config,
      translations: typeof section.translations === 'string' ? JSON.parse(section.translations || '{}') : section.translations,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt
    }));

    return NextResponse.json({ 
      sections,
      success: true 
    });
  } catch (error) {
    logger.error('Error fetching UI sections:', error);
    console.error('Detailed error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch sections',
      details: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }, { status: 500 });
  }
}

// POST: 새 섹션 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectionId, type, title, subtitle, content, order, visible } = body;

    // 번역 처리 (한글이 기본)
    let translations: unknown = {};
    
    if (title || subtitle || content) {
      // 영어 번역
      const enTranslations: unknown = {};
      if (title) enTranslations.title = await translateText(title, 'ko', 'en');
      if (subtitle) enTranslations.subtitle = await translateText(subtitle, 'ko', 'en');
      
      // content 내부의 텍스트들도 번역
      if (content) {
        enTranslations.content = await translateContentTexts(content, 'ko', 'en');
      }
      translations.en = enTranslations;

      // 일본어 번역
      const jpTranslations: unknown = {};
      if (title) jpTranslations.title = await translateText(title, 'ko', 'ja');
      if (subtitle) jpTranslations.subtitle = await translateText(subtitle, 'ko', 'ja');
      
      if (content) {
        jpTranslations.content = await translateContentTexts(content, 'ko', 'ja');
      }
      translations.jp = jpTranslations;
    }

    const result = await query(`
      INSERT INTO ui_sections (name, type, "order", "isActive", config)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [sectionId, type, order || 0, visible !== false, JSON.stringify({...content, translations})]);

    const section = result.rows[0];

    // 캐시 무효화
    try {
      const { invalidateCache } = await import('@/lib/cache/preload-service');
      invalidateCache();
    } catch (error) {
      logger.error('Error invalidating cache after section creation:', error);
    }

    // 실시간 업데이트 이벤트 발생
    emitToAll('ui:section:updated', {
      action: 'created',
      section: {
        ...section,
        content: typeof section.data === 'string' ? JSON.parse(section.data) : section.data,
        visible: section.isActive
      }
    });

    return NextResponse.json({ 
      section: {
        ...section,
        content: typeof section.data === 'string' ? JSON.parse(section.data) : section.data,
        data: typeof section.data === 'string' ? JSON.parse(section.data) : section.data,
        translations: typeof section.translations === 'string' ? JSON.parse(section.translations || '{}') : section.translations,
        visible: section.isActive
      },
      success: true 
    });
  } catch (error) {
    logger.error('Error creating UI section:', error);
    return NextResponse.json({ 
      error: 'Failed to create section',
      success: false 
    }, { status: 500 });
  }
}

// PUT: 섹션 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, sectionId, title, subtitle, content, order, visible, autoTranslate } = body;

    if (!id && !sectionId) {
      return NextResponse.json({ 
        error: 'Section ID is required',
        success: false 
      }, { status: 400 });
    }

    // 기존 섹션 조회
    const existingResult = await query(`
      SELECT * FROM ui_sections 
      WHERE ${id ? 'id = $1' : 'name = $1'}
      LIMIT 1
    `, [id || sectionId]);

    if (existingResult.rows.length === 0) {
      return NextResponse.json({ 
        error: 'Section not found',
        success: false 
      }, { status: 404 });
    }

    const existingSection = existingResult.rows[0];

    // 자동 번역 처리
    let translations = typeof existingSection.translations === 'string' 
      ? JSON.parse(existingSection.translations || '{}') 
      : existingSection.translations || {};
    
    if (autoTranslate && (title || subtitle || content)) {
      // 영어 번역
      if (!translations.en) translations.en = {};
      if (title) translations.en.title = await translateText(title, 'ko', 'en');
      if (subtitle) translations.en.subtitle = await translateText(subtitle, 'ko', 'en');
      if (content) {
        const translatedContent = await translateContentTexts(content, 'ko', 'en');
        translations.en = { ...translations.en, ...translatedContent };
      }

      // 일본어 번역
      if (!translations.jp) translations.jp = {};
      if (title) translations.jp.title = await translateText(title, 'ko', 'ja');
      if (subtitle) translations.jp.subtitle = await translateText(subtitle, 'ko', 'ja');
      if (content) {
        const translatedContent = await translateContentTexts(content, 'ko', 'ja');
        translations.jp = { ...translations.jp, ...translatedContent };
      }
    }

    // 업데이트 쿼리 구성
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      updateValues.push(title);
    }
    if (content !== undefined) {
      updateFields.push(`data = $${paramIndex++}`);
      updateValues.push(JSON.stringify(content));
    }
    if (order !== undefined) {
      updateFields.push(`"order" = $${paramIndex++}`);
      updateValues.push(order);
    }
    if (visible !== undefined) {
      updateFields.push(`"isActive" = $${paramIndex++}`);
      updateValues.push(visible);
    }
    
    updateFields.push(`translations = $${paramIndex++}`);
    updateValues.push(JSON.stringify(translations));
    
    updateFields.push(`"updatedAt" = NOW()`);
    updateValues.push(id || sectionId);

    const updateResult = await query(`
      UPDATE ui_sections 
      SET ${updateFields.join(', ')}
      WHERE ${id ? 'id = $' + paramIndex : 'name = $' + paramIndex}
      RETURNING *
    `, updateValues);

    const section = updateResult.rows[0];

    // 캐시 무효화
    try {
      const { invalidateCache } = await import('@/lib/cache/preload-service');
      invalidateCache();
    } catch (error) {
      logger.error('Error invalidating cache after section update:', error);
    }

    // 실시간 업데이트 이벤트 발생
    emitToAll('ui:section:updated', {
      action: 'updated',
      section: {
        ...section,
        content: typeof section.data === 'string' ? JSON.parse(section.data) : section.data,
        visible: section.isActive
      }
    });

    return NextResponse.json({ 
      section: {
        ...section,
        content: typeof section.data === 'string' ? JSON.parse(section.data) : section.data,
        data: typeof section.data === 'string' ? JSON.parse(section.data) : section.data,
        translations: typeof section.translations === 'string' ? JSON.parse(section.translations || '{}') : section.translations,
        visible: section.isActive
      },
      success: true 
    });
  } catch (error) {
    logger.error('Error updating UI section:', error);
    return NextResponse.json({ 
      error: 'Failed to update section',
      success: false 
    }, { status: 500 });
  }
}

// DELETE: 섹션 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const sectionId = searchParams.get('sectionId');

    if (!id && !sectionId) {
      return NextResponse.json({ 
        error: 'Section ID is required',
        success: false 
      }, { status: 400 });
    }

    const result = await query(`
      DELETE FROM ui_sections 
      WHERE ${id ? 'id = $1' : 'name = $1'}
      RETURNING id, name
    `, [id || sectionId]);

    // 캐시 무효화
    if (result.rows.length > 0) {
      try {
        const { invalidateCache } = await import('@/lib/cache/preload-service');
        invalidateCache();
      } catch (error) {
        logger.error('Error invalidating cache after section deletion:', error);
      }
    }

    // 실시간 업데이트 이벤트 발생
    if (result.rows.length > 0) {
      emitToAll('ui:section:updated', {
        action: 'deleted',
        section: {
          id: result.rows[0].id,
          name: result.rows[0].name
        }
      });
    }

    return NextResponse.json({ 
      success: true 
    });
  } catch (error) {
    logger.error('Error deleting UI section:', error);
    return NextResponse.json({ 
      error: 'Failed to delete section',
      success: false 
    }, { status: 500 });
  }
}

// content 내부의 텍스트 번역 헬퍼 함수
async function translateContentTexts(content: unknown, from: string, to: string): Promise<unknown> {
  if (!content) return {};

  const result: unknown = {};

  // 히어로 슬라이드 번역
  if (content.slides && Array.isArray(content.slides)) {
    result.slides = await Promise.all(content.slides.map(async (slide: unknown) => {
      const translatedSlide: unknown = {
        ...slide
      };
      
      if (slide.title) {
        translatedSlide.title = await translateText(slide.title, from, to);
      }
      if (slide.subtitle) {
        translatedSlide.subtitle = await translateText(slide.subtitle, from, to);
      }
      if (slide.tag) {
        // 이모지는 제외하고 텍스트만 번역
        const textOnly = slide.tag.replace(/[\u{1F000}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim();
        if (textOnly) {
          const translated = await translateText(textOnly, from, to);
          translatedSlide.tag = slide.tag.replace(textOnly, translated);
        } else {
          translatedSlide.tag = slide.tag;
        }
      }
      
      return translatedSlide;
    }));
  }

  // 카테고리 번역
  if (content.categories && Array.isArray(content.categories)) {
    result.categories = await Promise.all(content.categories.map(async (cat: unknown) => {
      const translatedCat: unknown = {
        ...cat
      };
      
      if (cat.name) {
        translatedCat.name = await translateText(cat.name, from, to);
      }
      if (cat.badge) {
        translatedCat.badge = await translateText(cat.badge, from, to);
      }
      
      return translatedCat;
    }));
  }

  // 링크 번역
  if (content.links && Array.isArray(content.links)) {
    result.links = await Promise.all(content.links.map(async (link: unknown) => {
      const translatedLink: unknown = {
        ...link
      };
      
      if (link.title) {
        // 이모지는 제외하고 텍스트만 번역
        const textOnly = link.title.replace(/[\u{1F000}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim();
        if (textOnly) {
          const translated = await translateText(textOnly, from, to);
          translatedLink.title = link.title.replace(textOnly, translated);
        } else {
          translatedLink.title = link.title;
        }
      }
      
      return translatedLink;
    }));
  }

  // 기타 콘텐츠
  if (content.campaigns) result.campaigns = content.campaigns;
  if (content.products) result.products = content.products;
  if (content.buttons) result.buttons = content.buttons;

  return result;
}