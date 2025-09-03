// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {

    // 관리자 인증 확인
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {

      return authResult.error
    }
    const { user } = authResult

    const body = await request.json()

    const { status } = body
    const campaignId = id

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // 상태값 변환 (소문자로 오는 경우 대문자로 변환)
    const dbStatus = status.toUpperCase()

    // 먼저 캠페인이 존재하는지 확인
    const existingCampaign = await query({
      where: { id: campaignId },
      select: { id: true, status: true, title: true }
    })
    
    if (!existingCampaign) {

      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // 캠페인 상태 업데이트
    const updatedCampaign = await query({
      where: { id: campaignId },
      data: { 
        status: dbStatus,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign
    })

  } catch (error) {

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}