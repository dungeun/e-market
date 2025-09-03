// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';
import { emitToAll } from '@/lib/socket-client';

// POST: UISection 순서 변경
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectionOrder } = body;

    // 섹션 순서 배열 검증
    if (!sectionOrder || !Array.isArray(sectionOrder) || sectionOrder.length === 0) {
      return NextResponse.json(
        { error: 'sectionOrder array is required' },
        { status: 400 }
      );
    }

    // DB에서 기존 섹션들 조회
    const existingSectionsResult = await query(
      'SELECT id, key FROM ui_sections WHERE key = ANY($1)',
      [sectionOrder]
    );

    const existingSections = existingSectionsResult.rows;
    const existingKeys = existingSections.map(s => s.key);
    const missingKeys = sectionOrder.filter(key => !existingKeys.includes(key));

    if (missingKeys.length > 0) {
      return NextResponse.json({
        error: 'Some sections do not exist in database',
        missingSections: missingKeys
      }, { status: 400 });
    }

    // 각 섹션의 순서 업데이트
    const updatePromises = sectionOrder.map((key, index) => {
      return query(
        'UPDATE ui_sections SET "order" = $1, "updatedAt" = NOW() WHERE key = $2',
        [index, key]
      );
    });

    await Promise.all(updatePromises);

    // 업데이트된 섹션들 조회
    const updatedSectionsResult = await query(
      'SELECT * FROM ui_sections WHERE key = ANY($1) ORDER BY "order" ASC',
      [sectionOrder]
    );

    const updatedSections = updatedSectionsResult.rows.map(section => ({
      id: section.id,
      key: section.key,
      title: section.title,
      type: section.type,
      order: section.order,
      isActive: section.isActive,
      data: typeof section.data === 'string' ? JSON.parse(section.data) : section.data,
      translations: typeof section.translations === 'string' ? JSON.parse(section.translations || '{}') : section.translations,
    }));

    // Socket.io 이벤트 발생: 섹션 순서 변경
    emitToAll('ui:section:reordered', {
      type: 'reorder',
      sections: updatedSections,
      sectionOrder
    });

    return NextResponse.json({
      success: true,
      message: '섹션 순서가 업데이트되었습니다.',
      sections: updatedSections,
      sectionOrder
    });

  } catch (error) {
    logger.error('Error reordering UI sections:', error);
    return NextResponse.json({
      error: 'Failed to reorder sections',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}