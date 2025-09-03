import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';

// GET: 특정 UISection 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // SQL 쿼리 - key로 조회
    const result = await query(
      'SELECT * FROM ui_sections WHERE key = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        error: 'Section not found',
        success: false 
      }, { status: 404 });
    }

    const section = result.rows[0];
    
    // data 파싱 처리
    let parsedData = section.data;
    if (typeof parsedData === 'string') {
      try {
        parsedData = JSON.parse(parsedData);
      } catch (e) {
        parsedData = {};
      }
    }

    // translations 파싱 처리
    let parsedTranslations = section.translations;
    if (typeof parsedTranslations === 'string') {
      try {
        parsedTranslations = JSON.parse(parsedTranslations);
      } catch (e) {
        parsedTranslations = {};
      }
    }

    return NextResponse.json({ 
      section: {
        id: section.id,
        key: section.key,
        title: section.title,
        type: section.type,
        order: section.order,
        isActive: section.isActive,
        data: parsedData,
        translations: parsedTranslations,
        content: parsedData, // 호환성을 위해 content도 추가
      },
      success: true 
    });
  } catch (error) {
    logger.error('Error fetching UI section:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch UI section',
      success: false 
    }, { status: 500 });
  }
}
