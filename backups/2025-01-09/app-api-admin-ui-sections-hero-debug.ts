import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Starting hero section query...');
    
    const result = await query(`
      SELECT id, key, type, "isActive", data 
      FROM ui_sections 
      WHERE key = 'hero' OR type = 'hero'
      LIMIT 1
    `);
    
    console.log('🔍 Debug: Query result rows:', result.rows.length);
    
    if (result.rows.length > 0) {
      const section = result.rows[0];
      console.log('🔍 Debug: Section found:', {
        id: section.id,
        key: section.key,
        type: section.type,
        isActive: section.isActive,
        hasData: !!section.data
      });
    }
    
    return NextResponse.json({ 
      debug: true,
      rowCount: result.rows.length,
      section: result.rows[0] || null
    });
  } catch (error: any) {
    console.error('🔍 Debug Error:', error.message);
    console.error('🔍 Debug Stack:', error.stack);
    return NextResponse.json({ 
      debug: true,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}