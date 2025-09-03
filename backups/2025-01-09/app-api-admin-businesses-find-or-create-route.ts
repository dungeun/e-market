import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }
    const { user } = authResult

    const { email, companyName } = await request.json()

    if (!email || !companyName) {
      return NextResponse.json({ error: '이메일과 회사명은 필수입니다.' }, { status: 400 })
    }

    // Mock 비즈니스 사용자 (businessProfile 테이블이 없음)
    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    const businessUser = {
      id: 'mock-business-' + Date.now(),
      email,
      password: hashedPassword,
      name: companyName,
      type: 'BUSINESS',
      businessProfile: {
        companyName,
        businessNumber: '000-00-00000',
        representativeName: companyName,
        businessAddress: '미입력',
        businessCategory: '미분류'
      }
    }

    console.log(`Mock 비즈니스 계정 생성: ${email}, 임시 비밀번호: ${tempPassword}`)

    return NextResponse.json({
      success: true,
      businessId: businessUser.id,
      businessName: businessUser.businessProfile?.companyName || companyName,
      isNewAccount: true
    })

  } catch (error) {
    console.error('Business find or create API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}