import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sectionId = params.id;
    
    // 섹션 조회
    const result = await query(`
      SELECT * FROM ui_sections 
      WHERE id = $1 OR key = $1
    `, [sectionId]);

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Section not found'
      }, { status: 404 });
    }

    const section = result.rows[0];
    
    // data 필드를 개별 필드로 분리
    const content = typeof section.data === 'string' 
      ? JSON.parse(section.data) 
      : section.data || {};

    return NextResponse.json({
      id: section.id,
      key: section.key,
      type: section.type || content.type || 'best-sellers',
      title: section.title,
      order: section.order,
      isActive: section.isActive,
      data: content,
      // 하위 호환성을 위한 개별 필드들
      subtitle: content.subtitle,
      content: content.content || content.description || '',
      buttonText: content.buttonText,
      buttonLink: content.buttonLink,
      backgroundColor: content.backgroundColor,
      textColor: content.textColor,
      layout: content.layout || 'grid',
      visible: section.isActive,
      productCount: content.productCount || content.itemsPerPage || 8,
      showPrice: content.showPrice !== false,
      showRating: content.showRating !== false,
      showBadge: content.showBadge !== false,
      autoSlide: content.autoSlide || false,
      slideDuration: content.slideDuration || 3000,
      categoryFilter: content.categoryFilter || content.categories?.[0] || '',
      sortBy: content.sortBy || 'popularity',
      selectionMode: content.selectionMode || 'auto',
      minSales: content.minSales || 10,
      minRating: content.minRating || 4.0,
      dateRange: content.dateRange || 30,
      manualProducts: content.manualProducts || [],
      images: content.images || {},
      created_at: section.createdAt,
      updated_at: section.updatedAt
    });
  } catch (error) {
    logger.error('Error fetching section:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch section'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sectionId = params.id;
    const body = await request.json();
    
    // 기존 섹션 확인
    const existing = await query(`
      SELECT * FROM ui_sections 
      WHERE id = $1 OR key = $1
    `, [sectionId]);

    if (existing.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Section not found'
      }, { status: 404 });
    }

    const currentSection = existing.rows[0];
    
    // content 객체 구성
    const content = {
      type: body.type || currentSection.type,
      subtitle: body.subtitle,
      content: body.content,
      buttonText: body.buttonText,
      buttonLink: body.buttonLink,
      backgroundColor: body.backgroundColor,
      textColor: body.textColor,
      layout: body.layout,
      productCount: body.productCount,
      itemsPerPage: body.productCount, // 호환성
      showPrice: body.showPrice,
      showRating: body.showRating,
      showBadge: body.showBadge,
      autoSlide: body.autoSlide,
      slideDuration: body.slideDuration,
      categoryFilter: body.categoryFilter,
      categories: body.categoryFilter ? [body.categoryFilter] : [],
      sortBy: body.sortBy,
      selectionMode: body.selectionMode,
      minSales: body.minSales,
      minRating: body.minRating,
      dateRange: body.dateRange,
      manualProducts: body.manualProducts || [],
      images: body.images || {},
      showFilters: body.showFilters,
      showSearch: body.showSearch
    };

    // 섹션 업데이트
    const result = await query(`
      UPDATE ui_sections 
      SET 
        title = $1,
        data = $2,
        "isActive" = $3,
        type = $4,
        "updatedAt" = NOW()
      WHERE id = $5 OR key = $5
      RETURNING *
    `, [
      body.title || currentSection.title,
      JSON.stringify(content),
      body.visible !== undefined ? body.visible : currentSection.isActive,
      body.type || currentSection.type || 'best-sellers',
      sectionId
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Failed to update section'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Section updated successfully',
      section: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating section:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update section'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sectionId = params.id;
    
    const result = await query(`
      DELETE FROM ui_sections 
      WHERE id = $1 OR key = $1
      RETURNING *
    `, [sectionId]);

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Section not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting section:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete section'
    }, { status: 500 });
  }
}