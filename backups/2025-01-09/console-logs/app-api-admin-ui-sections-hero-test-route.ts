// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing hero section API...');
    
    // 간단한 쿼리로 테스트
    const result = await query(`
      SELECT * FROM ui_sections 
      WHERE key = 'hero' OR type = 'hero'
      LIMIT 1
    `);
    
    console.log('Query result:', result.rows.length, 'rows');
    
    if (result.rows.length > 0) {
      const section = result.rows[0];
      console.log('Section found:', {
        id: section.id,
        key: section.key,
        type: section.type,
        isActive: section.isActive
      });
      
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
    console.error('Test API Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}