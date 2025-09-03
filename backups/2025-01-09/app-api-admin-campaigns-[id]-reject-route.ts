import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'

// POST /api/admin/campaigns/[id]/reject - 캠페인 거절
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    console.log('=== Campaign Reject API Called ===')
    console.log('Campaign ID:', id)
    
    // 관리자 인증 확인
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      console.log('Auth failed:', authResult.error)
      return authResult.error
    }
    const { user: admin } = authResult
    console.log('Admin user:', { id: admin.id, email: admin.email, type: admin.type })

    const body = await request.json()
    const { reason } = body
    const campaignId = id

    // 거절 사유 필수
    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

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
      },
      payments: [
        {
          id: 'mock-payment-1',
          amount: 100000,
          status: 'COMPLETED',
          createdAt: new Date()
        }
      ]
    }
    
    console.log('Mock campaign:', { 
      id: campaign.id, 
      status: campaign.status, 
      title: campaign.title,
      isPaid: campaign.isPaid 
    })

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

    // Mock 캠페인 거절 처리
    const result = {
      id: campaignId,
      status: 'REJECTED',
      reviewedAt: new Date(),
      reviewFeedback: reason,
      updatedAt: new Date(),
      title: campaign.title,
      businessId: campaign.businessId
    }

    // Mock 알림 생성
    const notifications = [
      {
        id: 'mock-notification-' + Date.now(),
        userId: campaign.businessId,
        type: 'CAMPAIGN_REJECTED',
        title: '캠페인이 거절되었습니다',
        message: `"${campaign.title}" 캠페인이 거절되었습니다. 사유: ${reason}`,
        actionUrl: `/business/campaigns/${campaign.id}`,
        metadata: JSON.stringify({
          campaignId: campaign.id,
          rejectedBy: admin.id,
          rejectedAt: new Date().toISOString(),
          reason: reason
        })
      }
    ]

    // 결제가 있었다면 환불 관련 Mock 알림
    if (campaign.isPaid && campaign.payments.length > 0) {
      const lastPayment = campaign.payments[0]
      
      notifications.push({
        id: 'mock-notification-refund-' + Date.now(),
        userId: campaign.businessId,
        type: 'REFUND_PENDING',
        title: '환불 처리 안내',
        message: `거절된 캠페인 "${campaign.title}"의 결제 금액이 환불 처리될 예정입니다.`,
        actionUrl: `/business/payments`,
        metadata: JSON.stringify({
          campaignId: campaign.id,
          paymentId: lastPayment.id,
          amount: lastPayment.amount
        })
      })
    }

    // 관리 로그 기록 (나중에 감사 추적용)
    console.log('Campaign rejected:', {
      campaignId: campaign.id,
      rejectedBy: admin.id,
      rejectedAt: new Date().toISOString(),
      reason: reason,
      businessEmail: campaign.business.email,
      refundNeeded: campaign.isPaid
    })
    
    console.log('Campaign rejected successfully:', { 
      id: result.id, 
      newStatus: result.status 
    })

    return NextResponse.json({
      campaign: result,
      message: 'Campaign rejected successfully'
    })

  } catch (error) {
    console.error('=== Campaign Reject Error ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error instanceof Error ? error.message : error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}