import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { logger } from '@/lib/utils/logger';

// GET: category 섹션 가져오기
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const result = await query(`
      SELECT * FROM ui_sections 
      WHERE type = 'category' OR key = 'category'
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      // 기본 카테고리 데이터 생성
      const defaultCategories = {
        categories: [
          { id: 'beauty', name: '뷰티', icon: 'Sparkles', badge: 'HOT' },
          { id: 'fashion', name: '패션', icon: 'Shirt' },
          { id: 'food', name: '식품', icon: 'UtensilsCrossed', badge: 'NEW' },
          { id: 'tech', name: '전자제품', icon: 'Laptop' },
          { id: 'lifestyle', name: '라이프스타일', icon: 'Home' },
          { id: 'sports', name: '스포츠', icon: 'Dumbbell' }
        ]
      };

      const insertResult = await query(`
        INSERT INTO ui_sections (key, title, type, "order", "isActive", data)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, ['category', '카테고리 메뉴', 'category', 2, true, JSON.stringify(defaultCategories)]);
      
      const section = insertResult.rows[0];
      return NextResponse.json({ 
        section: {
          ...section,
          data: defaultCategories,
          content: defaultCategories
        }
      });
    }

    const section = result.rows[0];
    let parsedData = {};
    
    try {
      parsedData = section.data ? 
        (typeof section.data === 'string' ? JSON.parse(section.data) : section.data) : 
        {};
    } catch (e) {
      logger.error('Failed to parse data:', e);
    }

    return NextResponse.json({ 
      section: {
        ...section,
        content: parsedData,
        data: parsedData
      }
    });
  } catch (error) {
    logger.error('Failed to fetch category section:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch section'
    }, { status: 500 });
  }
}

// PUT: category 섹션 업데이트
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const body = await request.json();
    const { content, visible, autoTranslate } = body;
    
    // 자동 번역 처리
    let translations = {};
    if (autoTranslate && content) {
      try {
        const { translateSectionContent } = await import('@/lib/services/section-translation.service');
        translations = await translateSectionContent({
          sectionKey: 'category',
          content: content,
          autoTranslate: true
        });
      } catch (e) {
        logger.warn('Auto translation failed:', e);
      }
    }

    const sectionData = {
      categories: content.categories, // 메인 페이지에서 data.categories로 접근할 수 있도록
      gridLayout: content.gridLayout,
      translations: translations
    };
    const dataJson = JSON.stringify(sectionData);

    // 기존 섹션 찾기
    const existingResult = await query(`
      SELECT * FROM ui_sections 
      WHERE type = 'category' OR key = 'category'
      LIMIT 1
    `);

    let section;
    if (existingResult.rows.length > 0) {
      // 업데이트
      const updateResult = await query(`
        UPDATE ui_sections 
        SET data = $1, "isActive" = $2, "updatedAt" = NOW()
        WHERE id = $3
        RETURNING *
      `, [dataJson, visible, existingResult.rows[0].id]);
      
      section = updateResult.rows[0];
    } else {
      // 새로 생성 - type 필드 명시적 설정
      const insertResult = await query(`
        INSERT INTO ui_sections (key, title, type, "order", "isActive", data)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, ['category', '카테고리 메뉴', 'category', 2, visible, dataJson]);
      
      section = insertResult.rows[0];
    }

    return NextResponse.json({ 
      section: {
        ...section,
        content: sectionData,
        data: sectionData
      }
    });
  } catch (error) {
    logger.error('Failed to update category section:', error);
    return NextResponse.json({ 
      error: 'Failed to update section'
    }, { status: 500 });
  }
}