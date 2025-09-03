// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'

// POST /api/admin/campaigns/[id]/approve - 캠페인 승인
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params

    // 관리자 인증 확인
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {

      return authResult.error
    }
    const { user: admin } = authResult

    // Mock 캠페인 (campaign 테이블이 없음)
    const campaign = {
      id: campaignId,
      status: 'PENDING_REVIEW',
      title: 'Mock Campaign',
      isPaid: true,
      businessId: 'mock-business-1',
      business: {
        id: 'mock-business-1',
        email: 'business@example.com',
        name: 'Mock Business'
      }
    }

    // PENDING_REVIEW 상태가 아닌 경우 에러
    if (campaign.status !== 'PENDING_REVIEW') {
      return NextResponse.json(
        { 
          error: 'Invalid campaign status', 
          message: `Campaign must be in PENDING_REVIEW status. Current status: ${campaign.status}` 
        },
        { status: 400 }
      )
    }

    // 결제 확인
    if (!campaign.isPaid) {
      return NextResponse.json(
        { 
          error: 'Campaign not paid', 
          message: 'Campaign must be paid before approval' 
        },
        { status: 400 }
      )
    }

    // Mock 캠페인 승인 처리
    const result = {
      id: campaignId,
      status: 'ACTIVE',
      reviewedAt: new Date(),
      updatedAt: new Date(),
      title: campaign.title,
      businessId: campaign.businessId
    }

    // Mock 알림 생성
    const notification = {
      id: 'mock-notification-' + Date.now(),
      userId: campaign.businessId,
      type: 'CAMPAIGN_APPROVED',
      title: '캠페인이 승인되었습니다',
      message: `"${campaign.title}" 캠페인이 승인되어 활성화되었습니다.`,
      actionUrl: `/business/campaigns/${campaign.id}`,
      metadata: JSON.stringify({
        campaignId: campaign.id,
        approvedBy: admin.id,
        approvedAt: new Date().toISOString()
      })
    }

    // 관리 로그 기록 (나중에 감사 추적용)
    // TODO: 추후 로그 시스템 구현

    return NextResponse.json({
      success: true,
      campaign: result,
      message: 'Campaign approved successfully'
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