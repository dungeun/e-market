// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // 데이터베이스 연결 테스트
    console.log('Testing database connection...');
    const userCountResult = await query('SELECT COUNT(*) as count FROM users');
    console.log('User count result:', userCountResult);
    
    const productCountResult = await query('SELECT COUNT(*) as count FROM products');
    console.log('Product count result:', productCountResult);
    
    const userCount = parseInt(userCountResult.rows[0].count);
    const productCount = parseInt(productCountResult.rows[0].count);
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      stats: {
        users: userCount,
        products: productCount
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'not configured',
        port: process.env.PORT || 3000
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'not configured'
      }
    }, { status: 500 });
  }
}