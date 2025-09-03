// Redirect to unified UI sections API for consistency
import { NextRequest, NextResponse } from 'next/server';

// GET: 홈페이지 섹션 데이터 가져오기 (리다이렉트)
export async function GET(request: NextRequest) {
  // URL의 query parameters 유지하며 리다이렉트
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const redirectUrl = queryString ? 
    `/api/ui-sections?${queryString}` : 
    '/api/ui-sections';
  
  // 308 Permanent Redirect로 하위 호환성 유지
  return NextResponse.redirect(
    new URL(redirectUrl, request.url),
    308
  );
}