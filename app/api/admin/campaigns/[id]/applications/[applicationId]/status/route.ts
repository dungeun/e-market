// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, applicationId: string }> }
) {
  try {
    // 관리자 인증 확인
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }
    const { user } = authResult

    const { status } = await request.json()
    const { applicationId } = await params

    // 지원 상태 업데이트
    const updatedApplication = await query({
      where: { id: applicationId },
      data: { 
        status,
        reviewedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      application: updatedApplication
    })

  } catch (error) {

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}