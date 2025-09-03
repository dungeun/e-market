import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export function middleware(request: NextRequest) {
  // Add CORS headers
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    try {
      const payload = jwt.verify(token, JWT_SECRET) as unknown
      // You can add role-based access control here
      // if (payload.role !== 'ADMIN') {
      //   return NextResponse.redirect(new URL('/unauthorized', request.url))
      // }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  // API authentication for protected routes
  if (request.nextUrl.pathname.startsWith('/api/') && 
      !request.nextUrl.pathname.startsWith('/api/auth/') &&
      !request.nextUrl.pathname.startsWith('/api/products') &&
      !request.nextUrl.pathname.startsWith('/api/categories')) {
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (token) {
      try {
        const payload = jwt.verify(token, JWT_SECRET) as unknown
        // Add user info to headers for API routes
        response.headers.set('x-user-id', payload.userId)
        response.headers.set('x-user-email', payload.email)
      } catch (error) {
        // Invalid token, but don't block - let API routes handle auth
      }
    }
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}