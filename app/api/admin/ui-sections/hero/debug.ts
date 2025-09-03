import type { AppError } from '@/lib/types/common';
// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {

    const result = await query(`
      SELECT id, key, type, "isActive", data 
      FROM ui_sections 
      WHERE key = 'hero' OR type = 'hero'
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      const section = result.rows[0];

    }
    
    return NextResponse.json({ 
      debug: true,
      rowCount: result.rows.length,
      section: result.rows[0] || null
    });
  } catch (error: Error | unknown) {

    return NextResponse.json({ 
      debug: true,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}