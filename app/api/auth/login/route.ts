import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
      include: {
        profile: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: '등록되지 않은 이메일이거나 잘못된 비밀번호입니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '등록되지 않은 이메일이거나 잘못된 비밀번호입니다.' },
        { status: 401 }
      );
    }

    // 계정 상태 확인
    if (user.status !== 'ACTIVE') {
      let errorMessage = '계정에 문제가 있습니다.';
      switch (user.status) {
        case 'INACTIVE':
          errorMessage = '비활성화된 계정입니다. 고객센터에 문의하세요.';
          break;
        case 'SUSPENDED':
          errorMessage = '정지된 계정입니다. 고객센터에 문의하세요.';
          break;
        case 'DELETED':
          errorMessage = '삭제된 계정입니다.';
          break;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 403 }
      );
    }

    // 마지막 로그인 시간 업데이트
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        type: user.type,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 사용자 정보 (비밀번호 제외)
    const userInfo = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      type: user.type,
      status: user.status,
      image: user.image,
      verified: user.verified,
      isOnboarded: user.isOnboarded,
      profile: user.profile,
    };

    // 쿠키에 토큰 설정
    const response = NextResponse.json({
      success: true,
      message: '로그인에 성공했습니다.',
      user: userInfo,
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7일
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}