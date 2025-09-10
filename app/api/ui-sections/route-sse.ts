import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';
import { broadcastUIUpdate } from '@/lib/events/broadcaster';

// GET: UISection 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId');
    const type = searchParams.get('type');
    const visible = searchParams.get('visible');

    // SQL 쿼리 구성
    let sqlQuery = 'SELECT * FROM ui_sections WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (sectionId) {
      sqlQuery += ` AND key = $${paramIndex++}`;
      params.push(sectionId);
    }
    if (type) {
      sqlQuery += ` AND type = $${paramIndex++}`;
      params.push(type);
    }
    if (visible !== null) {
      sqlQuery += ` AND "isActive" = $${paramIndex++}`;
      params.push(visible === 'true');
    }

    sqlQuery += ' ORDER BY "order" ASC';

    const result = await query(sqlQuery, params);

    const sections = result.rows.map(section => ({
      id: section.id,
      key: section.key,
      title: section.title,
      type: section.type,
      order: section.order,
      isActive: section.isActive,
      visible: section.isActive,
      data: typeof section.data === 'string' ? JSON.parse(section.data) : section.data,
      translations: typeof section.translations === 'string' ? JSON.parse(section.translations || '{}') : section.translations,
    }));

    return NextResponse.json({ 
      sections,
      success: true 
    });
  } catch (error) {
    logger.error('Error fetching UI sections:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch UI sections',
      success: false 
    }, { status: 500 });
  }
}

// POST: UISection 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectionId, type, title, subtitle, content, order, visible, translations, settings } = body;

    // 기존 섹션 확인
    const existingResult = await query(
      'SELECT * FROM ui_sections WHERE key = $1',
      [sectionId]
    );

    if (existingResult.rows.length > 0) {
      // 업데이트
      const updateResult = await query(
        `UPDATE ui_sections 
         SET type = $2, title = $3, data = $4, "order" = $5, "isActive" = $6, translations = $7, "updatedAt" = NOW()
         WHERE key = $1
         RETURNING *`,
        [sectionId, type, title, JSON.stringify(content), order, visible, JSON.stringify(translations || {})]
      );
      
      // SSE 이벤트 발생: 섹션 업데이트
      broadcastUIUpdate({
        type: 'update',
        section: updateResult.rows[0]
      });
      
      return NextResponse.json({ section: updateResult.rows[0] });
    } else {
      // 새로 생성
      const crypto = require('crypto');
      const id = crypto.randomUUID();
      const createResult = await query(
        `INSERT INTO ui_sections (id, key, type, title, data, "order", "isActive", translations, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING *`,
        [id, sectionId, type, title, JSON.stringify(content || {}), order || 0, visible !== false, JSON.stringify(translations || {})]
      );
      
      // SSE 이벤트 발생: 섹션 생성
      broadcastUIUpdate({
        type: 'create',
        section: createResult.rows[0]
      });
      
      return NextResponse.json({ section: createResult.rows[0] });
    }
  } catch (error) {
    logger.error('Error creating/updating UI section:', error);
    return NextResponse.json({ error: 'Failed to save UI section' }, { status: 500 });
  }
}

// PUT: UISection 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, order, isActive, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Section ID required' }, { status: 400 });
    }

    // 업데이트 쿼리 구성
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (order !== undefined) {
      updateFields.push(`"order" = $${paramIndex++}`);
      values.push(order);
    }
    if (isActive !== undefined) {
      updateFields.push(`"isActive" = $${paramIndex++}`);
      values.push(isActive);
    }
    
    updateFields.push(`"updatedAt" = NOW()`);
    values.push(id);

    const updateResult = await query(
      `UPDATE ui_sections 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    // SSE 이벤트 발생: 섹션 업데이트
    broadcastUIUpdate({
      type: 'update',
      section: updateResult.rows[0]
    });

    return NextResponse.json({ section: updateResult.rows[0] });
  } catch (error) {
    logger.error('Error updating UI section:', error);
    return NextResponse.json({ error: 'Failed to update UI section' }, { status: 500 });
  }
}

// DELETE: UISection 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Section ID required' }, { status: 400 });
    }

    await query('DELETE FROM ui_sections WHERE id = $1', [id]);

    // SSE 이벤트 발생: 섹션 삭제
    broadcastUIUpdate({
      type: 'delete',
      sectionId: id
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting UI section:', error);
    return NextResponse.json({ error: 'Failed to delete UI section' }, { status: 500 });
  }
}