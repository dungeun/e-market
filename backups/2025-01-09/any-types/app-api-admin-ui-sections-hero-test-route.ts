// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {

    // 간단한 쿼리로 테스트
    const result = await query(`
      SELECT * FROM ui_sections 
      WHERE key = 'hero' OR type = 'hero'
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      const section = result.rows[0];

      return NextResponse.json({ 
        success: true,
        section: {
          ...section,
          content: typeof section.data === 'string' ? JSON.parse(section.data) : section.data,
          visible: section.isActive
        }
      });
    } else {
      return NextResponse.json({ 
        success: false,
        message: 'No hero section found'
      });
    }
  } catch (error: any) {

    return NextResponse.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}