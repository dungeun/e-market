import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, title, subtitle, config, order, visible } = body;

    // key를 name이나 title로부터 생성
    const sectionKey = name || title?.toLowerCase().replace(/\s+/g, '-') || `section-${Date.now()}`;
    
    // data 필드에 config와 추가 정보를 저장
    const sectionData = {
      subtitle,
      ...config
    };

    // UUID 생성
    const sectionId = uuidv4();

    // 섹션 생성
    const result = await query(`
      INSERT INTO ui_sections (id, key, type, title, data, "order", "isActive", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `, [
      sectionId,
      sectionKey,
      type,
      title,
      JSON.stringify(sectionData),
      order || 0,
      visible !== false
    ]);

    const section = result.rows[0];

    return NextResponse.json({ 
      success: true,
      section: {
        id: section.id,
        key: section.key,
        type: section.type,
        title: section.title,
        order: section.order,
        isActive: section.isActive,
        data: typeof section.data === 'string' ? JSON.parse(section.data) : section.data,
      }
    });
  } catch (error) {
    logger.error('Error creating UI section:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create section',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}