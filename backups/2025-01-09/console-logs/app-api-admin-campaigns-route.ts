// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { campaignService } from '@/lib/services/business/campaign-service';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/campaigns - 캠페인 목록 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    // 공통 인증 함수 사용
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      mainCategory: searchParams.get('mainCategory') || undefined
    };
    
    const pagination = {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20
    };

    const result = await campaignService.getAdminCampaigns(filters, pagination);
    return NextResponse.json(result);

  } catch (error) {
    console.error('캠페인 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '캠페인 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/admin/campaigns - 캠페인 생성 (관리자용)
export async function POST(request: NextRequest) {
  try {
    // 공통 인증 함수 사용
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const body = await request.json();
    const result = await campaignService.createCampaign(body);
    return NextResponse.json(result);

  } catch (error) {
    console.error('캠페인 생성 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '캠페인 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}