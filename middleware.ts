import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증이 필요없는 public 경로들
const publicPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/health',
  '/api/influencers', // 인플루언서 검색은 공개
  '/api/payments/confirm', // Toss 결제 콜백
  '/api/payments/callback', // 결제 콜백
  '/api/posts', // 커뮤니티 게시글 조회는 공개
  '/api/setup', // 초기 설정 API
  '/api/home', // 홈페이지 데이터 API는 공개
  '/api/ui-config', // UI 설정은 공개
  '/api/campaigns', // 캠페인 목록 조회는 공개
  '/api/home/campaigns',
  '/api/home/content',
  '/api/home/statistics',
  '/api/settings',
  '/api/language-packs', // 언어팩은 공개
  '/api/home/sections', // 홈페이지 섹션은 공개
];

// 인증이 필요없는 페이지 경로들
const publicPagePaths = [
  '/',
  '/auth/login',
  '/auth/register',
  '/forgot-password',
  '/about',
  '/pricing',
  '/influencers',
  '/campaigns',
  '/community',
  '/terms',
  '/privacy',
  '/contact',
];

// 인증이 필요한 페이지 경로들
const protectedPagePaths = [
  '/admin',
  '/business',
  '/influencer',
  '/campaigns/create',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 응답 준비
  let response = NextResponse.next();

  // Public 페이지는 인증 체크 스킵
  if (publicPagePaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    return addSecurityHeaders(response);
  }

  // Public API는 인증 체크 스킵
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return pathname.startsWith('/api/') ? addApiSecurityHeaders(response) : addSecurityHeaders(response);
  }

  // 기타 API 라우트는 각 라우트에서 인증 처리
  if (pathname.startsWith('/api/')) {
    return addApiSecurityHeaders(response);
  }

  // 페이지 라우트 보호
  if (protectedPagePaths.some(path => pathname.startsWith(path))) {
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // 관리자 페이지 접근 시 사용자 정보 확인은 클라이언트에서 처리
    if (pathname.startsWith('/admin')) {
      // 토큰만 확인하고 상세 검증은 클라이언트에서
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login?error=admin_required&message=' + 
          encodeURIComponent('관리자 권한이 필요합니다.'), request.url));
      }
    }
  }
  
  // 모든 응답에 보안 헤더 추가
  return addSecurityHeaders(response);
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

function addApiSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}