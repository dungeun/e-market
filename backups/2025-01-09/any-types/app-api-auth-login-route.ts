// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import * as bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { JWT_SECRET } from '@/lib/auth/constants'
import { logger } from '@/lib/utils/logger'
import { authRateLimiter } from '@/lib/security/rate-limiter'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  // Rate limiting check (disabled in development for testing)
  if (process.env.NODE_ENV === 'production') {
    const rateLimitResponse = await authRateLimiter.check(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
  }

  try {
    logger.debug('Request headers:', Object.fromEntries(request.headers.entries()))
    logger.debug('Request method:', request.method)
    logger.debug('Request URL:', request.url)
    
    let body;
    try {
      const textBody = await request.text()
      logger.debug('Raw request body:', textBody)
      body = JSON.parse(textBody)
    } catch (parseError) {
      logger.error('JSON parsing error:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }
    
    const { email, password } = body
    
    logger.debug('Login attempt for:', email, 'Password length:', password?.length)

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // 데이터베이스에서 사용자 찾기
    const userResult = await query(`
      SELECT u.*, u.role
      FROM users u
      WHERE u.email = $1
    `, [email])
    
    const user = userResult.rows[0]

    if (!user) {
      logger.debug('User not found for email:', email)
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    // 비밀번호 확인
    logger.debug('User found:', user.email, 'Type:', user.type, 'Status:', user.status)
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    logger.debug('Password validation result:', isValidPassword)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    // 상태 확인
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: '계정이 비활성화되었습니다. 관리자에게 문의하세요.' },
        { status: 403 }
      )
    }

    // 마지막 로그인 시간 업데이트
    await query(`
      UPDATE users 
      SET last_login_at = NOW(), updated_at = NOW()
      WHERE id = $1
    `, [user.id])

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        id: user.id,
        userId: user.id, // 호환성을 위해 추가
        email: user.email,
        type: user.type,
        role: user.role, // role 필드 추가
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 응답 생성
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        verified: user.email_verified,
        profile: null
      },
      token,
      accessToken: token // Add this for backward compatibility with useAuth hook
    })

    // 쿠키 보안 설정 (환경에 따라 적절히 설정)
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction, // 프로덕션에서는 HTTPS 강제
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/'
    };

    response.cookies.set('auth-token', token, cookieOptions);
    response.cookies.set('accessToken', token, cookieOptions); // 호환성 유지

    return response

  } catch (error: any) {
    const { handleApiError } = await import('@/lib/utils/api-error');
    return handleApiError(error, { endpoint: 'login' });
  }
}