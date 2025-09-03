import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';
import { translateText } from '@/lib/services/translation.service';

// GET: 특정 섹션 가져오기
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const { sectionId } = await params;
    const result = await query(`
      SELECT * FROM ui_sections 
      WHERE key = $1
      LIMIT 1
    `, [sectionId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        error: 'Section not found',
        success: false 
      }, { status: 404 });
    }

    const section = result.rows[0];

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
    logger.error('Error fetching UI section:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch section',
      success: false 
    }, { status: 500 });
  }
}

// PUT: 특정 섹션 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const { sectionId } = await params;
  try {
    const body = await request.json();
    const { title, subtitle, content, order, visible, autoTranslate } = body;

    // 기존 섹션 조회
    const existingResult = await query(`
      SELECT * FROM ui_sections 
      WHERE key = $1
      LIMIT 1
    `, [sectionId]);

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
    
    if (autoTranslate) {
      // content 내 슬라이드가 있으면 번역
      if (content?.slides) {
        translations.en = translations.en || {};
        translations.jp = translations.jp || {};
        
        // 영어 번역
        translations.en.slides = await Promise.all(content.slides.map(async (slide: any) => ({
          ...slide,
          title: slide.title ? await translateText(slide.title, 'ko', 'en') : slide.title,
          subtitle: slide.subtitle ? await translateText(slide.subtitle, 'ko', 'en') : slide.subtitle,
          tag: slide.tag ? await translateTagText(slide.tag, 'ko', 'en') : slide.tag
        })));

        // 일본어 번역
        translations.jp.slides = await Promise.all(content.slides.map(async (slide: any) => ({
          ...slide,
          title: slide.title ? await translateText(slide.title, 'ko', 'ja') : slide.title,
          subtitle: slide.subtitle ? await translateText(slide.subtitle, 'ko', 'ja') : slide.subtitle,
          tag: slide.tag ? await translateTagText(slide.tag, 'ko', 'ja') : slide.tag
        })));
      }

      // 카테고리가 있으면 번역
      if (content?.categories) {
        translations.en = translations.en || {};
        translations.jp = translations.jp || {};
        
        translations.en.categories = await Promise.all(content.categories.map(async (cat: any) => ({
          ...cat,
          name: cat.name ? await translateText(cat.name, 'ko', 'en') : cat.name,
          badge: cat.badge ? await translateText(cat.badge, 'ko', 'en') : cat.badge
        })));

        translations.jp.categories = await Promise.all(content.categories.map(async (cat: any) => ({
          ...cat,
          name: cat.name ? await translateText(cat.name, 'ko', 'ja') : cat.name,
          badge: cat.badge ? await translateText(cat.badge, 'ko', 'ja') : cat.badge
        })));
      }

      // 링크가 있으면 번역
      if (content?.links) {
        translations.en = translations.en || {};
        translations.jp = translations.jp || {};
        
        translations.en.links = await Promise.all(content.links.map(async (link: any) => ({
          ...link,
          title: link.title ? await translateTagText(link.title, 'ko', 'en') : link.title
        })));

        translations.jp.links = await Promise.all(content.links.map(async (link: any) => ({
          ...link,
          title: link.title ? await translateTagText(link.title, 'ko', 'ja') : link.title
        })));
      }

      // 제목과 부제목 번역
      if (title) {
        translations.en = translations.en || {};
        translations.jp = translations.jp || {};
        translations.en.title = await translateText(title, 'ko', 'en');
        translations.jp.title = await translateText(title, 'ko', 'ja');
      }

      if (subtitle) {
        translations.en = translations.en || {};
        translations.jp = translations.jp || {};
        translations.en.subtitle = await translateText(subtitle, 'ko', 'en');
        translations.jp.subtitle = await translateText(subtitle, 'ko', 'ja');
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
    
    updateFields.push(`updated_at = NOW()`);
    updateValues.push(sectionId);

    const updateResult = await query(`
      UPDATE ui_sections 
      SET ${updateFields.join(', ')}
      WHERE key = $${paramIndex}
      RETURNING *
    `, updateValues);

    const section = updateResult.rows[0];

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

// DELETE: 특정 섹션 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const { sectionId } = await params;
  try {
    await query(`
      DELETE FROM ui_sections 
      WHERE key = $1
    `, [sectionId]);

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

// 이모지를 보존하면서 텍스트만 번역
async function translateTagText(text: string, from: string, to: string): Promise<string> {
  // 이모지 패턴
  const emojiRegex = /[\u{1F000}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]|[\u{1F900}-\u{1F9FF}]/gu;
  
  // 이모지 찾기
  const emojis = text.match(emojiRegex) || [];
  
  // 이모지 제거한 텍스트
  const textOnly = text.replace(emojiRegex, '').trim();
  
  if (!textOnly) return text;
  
  // 텍스트 번역
  const translated = await translateText(textOnly, from, to);
  
  // 이모지 다시 붙이기 (원본 위치 유지)
  if (emojis.length > 0) {
    // 첫 번째 이모지가 앞에 있었는지 확인
    if (text.indexOf(emojis[0]) === 0) {
      return emojis[0] + ' ' + translated;
    } else {
      return translated + ' ' + emojis[0];
    }
  }
  
  return translated;
}