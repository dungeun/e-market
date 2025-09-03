// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'
import { campaignService } from '@/lib/services/business/campaign-service'

export async function GET(
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

    const campaignId = id
    const campaign = await campaignService.getCampaignById(campaignId, true)

    return NextResponse.json({
      campaign
    })

  } catch (error) {
    console.error('Campaign detail API error:', error)
    
    if (error instanceof Error && error.message === '캠페인을 찾을 수 없습니다.') {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    const campaignId = id
    const body = await request.json()
    
    const result = await campaignService.updateCampaign(campaignId, body)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Campaign update API error:', error)
    
    if (error instanceof Error && error.message === '캠페인을 찾을 수 없습니다.') {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const campaignId = id
    const result = await campaignService.deleteCampaign(campaignId)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Campaign delete API error:', error)
    
    if (error instanceof Error && error.message === '캠페인을 찾을 수 없습니다.') {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}