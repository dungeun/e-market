// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { translateSectionContent, saveToLanguagePack } from '@/lib/services/section-translation.service';

// GET: quicklinks 섹션 가져오기
export async function GET(request: NextRequest) {
  try {
    const result = await query(`
      SELECT * FROM ui_sections 
      WHERE key = 'quicklinks' OR type = 'quicklinks'
      ORDER BY "createdAt" DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        section: null,
        message: 'Quicklinks section not found'
      });
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

    return NextResponse.json({ 
      error: 'Failed to fetch section',
      success: false 
    }, { status: 500 });
  }
}

// PUT: quicklinks 섹션 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, visible, autoTranslate } = body;

    // 자동 번역 처리
    const translations = await translateSectionContent({
      sectionKey: 'quicklinks',
      content,
      autoTranslate
    });

    // 언어팩 API에 저장
    if (autoTranslate && Object.keys(translations).length > 0) {
      await saveToLanguagePack('quicklinks', { ...translations, ko: content });
    }

    // 기존 섹션 찾기
    const existingResult = await query(`
      SELECT * FROM ui_sections 
      WHERE key = 'quicklinks' OR type = 'quicklinks'
      LIMIT 1
    `);

    let section;
    const contentJson = JSON.stringify(content);
    const translationsJson = JSON.stringify(autoTranslate ? translations : {});

    if (existingResult.rows.length > 0) {
      // 업데이트
      const updateResult = await query(`
        UPDATE ui_sections 
        SET data = $1, "isActive" = $2, translations = $3, "updatedAt" = NOW()
        WHERE id = $4
        RETURNING *
      `, [contentJson, visible, translationsJson, existingResult.rows[0].id]);
      
      section = updateResult.rows[0];
    } else {
      // 새로 생성
      const insertResult = await query(`
        INSERT INTO ui_sections (key, type, title, "order", "isActive", data, translations)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, ['quicklinks', 'quicklinks', '바로가기 링크', 3, visible, contentJson, translationsJson]);
      
      section = insertResult.rows[0];
    }

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

    return NextResponse.json({ 
      error: 'Failed to update section',
      success: false 
    }, { status: 500 });
  }
}