import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// 보호된 라우트 정의
const protectedRoutes = ['/dashboard', '/profile', '/orders', '/admin']
const adminRoutes = ['/admin']
const authRoutes = ['/auth/signin', '/auth/signup']

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // 인증이 필요한 라우트 체크
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // 로그인되지 않은 상태에서 보호된 라우트 접근 시
  if (isProtectedRoute && !token) {
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 관리자 권한 체크
  if (isAdminRoute && token?.role !== 'ADMIN' && token?.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 로그인된 상태에서 인증 페이지 접근 시
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Rate Limiting 헤더 추가
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}