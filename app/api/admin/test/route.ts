// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/test - 관리자 API 테스트
export async function GET(request: NextRequest) {

  // 토큰 파싱 테스트
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  return NextResponse.json({
    message: 'Test API working',
    headers: {
      authorization: request.headers.get('authorization'),
      cookie: request.headers.get('cookie')
    },
    token: token || null
  });
}