import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth/services'
import { ValidationHelper, userRegisterSchema } from '@/lib/utils/validation'
import { PerformanceTimer } from '@/lib/utils/performance'
import { createSuccessResponse, handleApiError } from '@/lib/utils/api-error'
import { logger } from '@/lib/utils/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const timer = new PerformanceTimer('api.auth.register.POST');
  
  try {
    // JSON 처리
    const body = await request.json()
    const userData = {
      email: body.email,
      password: body.password,
      name: body.name,
      phone: body.phone,
      address: body.address
    }

    // 사용자 등록 데이터 유효성 검사
    const userValidation = await ValidationHelper.validate(userData, userRegisterSchema);
    if (!userValidation.success) {
      const errors = ValidationHelper.formatErrorMessages(userValidation.errors!);
      return NextResponse.json({ error: '사용자 정보가 유효하지 않습니다.', details: errors }, { status: 400 });
    }

    // Register user (성능 측정 포함)
    const registerResponse = await PerformanceTimer.measure(
      'authService.register',
      () => authService.register(userData),
      { userEmail: userData.email }
    );

    // Set cookies
    const response = NextResponse.json({
      user: registerResponse.user,
      tokens: {
        accessToken: registerResponse.token,
        refreshToken: registerResponse.refreshToken,
        expiresIn: 3600, // 1 hour in seconds
      }
    })

    // Set httpOnly cookies for tokens (보안 설정)
    const isProduction = process.env.NODE_ENV === 'production';
    
    response.cookies.set('accessToken', registerResponse.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    })

    response.cookies.set('refreshToken', registerResponse.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    timer.end();
    
    logger.logInfo('User registered successfully', { 
      userId: registerResponse.user.id, 
      userEmail: userData.email
    });

    return response
  } catch (error: any) {
    return handleApiError(error, { 
      endpoint: 'auth/register',
      method: 'POST'
    });
  }
}