import { NextRequest, NextResponse } from 'next/server';
import { campaignService } from '@/lib/services/business/campaign-service';

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const result = await campaignService.getPublicCampaigns({ filter }, limit);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    
    // 에러 발생 시 빈 배열 반환
    return NextResponse.json({
      success: true,
      campaigns: [],
      total: 0,
      message: 'Failed to load campaigns, showing empty results'
    });
  }
}