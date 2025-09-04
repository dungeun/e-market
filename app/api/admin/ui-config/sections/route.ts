import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // key를 title로부터 생성
    const sectionKey = body.key || body.title?.toLowerCase().replace(/\s+/g, '-') || `section-${Date.now()}`;
    
    // content 객체 구성 (ui_sections 테이블의 content 컬럼 사용)
    const content = {
      type: body.type || 'best-sellers',
      subtitle: body.subtitle,
      content: body.content,
      buttonText: body.buttonText,
      buttonLink: body.buttonLink,
      backgroundColor: body.backgroundColor,
      textColor: body.textColor,
      layout: body.layout || 'grid',
      productCount: body.productCount || 8,
      itemsPerPage: body.productCount || 8, // 호환성
      showPrice: body.showPrice !== false,
      showRating: body.showRating !== false,
      showBadge: body.showBadge !== false,
      autoSlide: body.autoSlide || false,
      slideDuration: body.slideDuration || 3000,
      categoryFilter: body.categoryFilter || '',
      categories: body.categoryFilter ? [body.categoryFilter] : [],
      sortBy: body.sortBy || 'popularity',
      selectionMode: body.selectionMode || 'auto',
      minSales: body.minSales || 10,
      minRating: body.minRating || 4.0,
      dateRange: body.dateRange || 30,
      manualProducts: body.manualProducts || [],
      images: body.images || {},
      showFilters: body.showFilters,
      showSearch: body.showSearch
    };

    // UUID 생성
    const sectionId = uuidv4();

    // 최대 order 값 조회
    const maxOrderResult = await query(`
      SELECT COALESCE(MAX("order"), 0) as max_order 
      FROM ui_sections
    `);
    const nextOrder = (maxOrderResult.rows[0]?.max_order || 0) + 1;

    // 섹션 생성 (content와 visible 컬럼 사용)
    const result = await query(`
      INSERT INTO ui_sections (id, key, type, title, content, "order", visible, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `, [
      sectionId,
      sectionKey,
      body.type || 'best-sellers',
      body.title,
      JSON.stringify(content),
      body.order || nextOrder,
      body.visible !== false
    ]);

    const section = result.rows[0];

    return NextResponse.json({ 
      success: true,
      message: 'Section created successfully',
      section: {
        id: section.id,
        key: section.key,
        type: section.type,
        title: section.title,
        order: section.order,
        visible: section.visible,
        content: typeof section.content === 'string' ? JSON.parse(section.content) : section.content,
        created_at: section.created_at,
        updated_at: section.updated_at
      }
    });
  } catch (error) {
    logger.error('Error creating UI section:', error);
    
    // 더 구체적인 에러 메시지
    let errorMessage = 'Failed to create section';
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        errorMessage = 'A section with this key already exists';
      } else if (error.message.includes('column')) {
        errorMessage = 'Database schema error. Please check the table structure.';
      }
    }
    
    return NextResponse.json({ 
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}