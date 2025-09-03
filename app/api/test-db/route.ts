// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // 데이터베이스 연결 테스트
    const campaignCount = await query();
    const userCount = await query();
    
    // 첫 번째 캠페인 데이터 조회 (있다면)
    const firstCampaign = await query({
      include: {
        business: true
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        campaignCount,
        userCount,
        firstCampaign,
        dbConnection: 'OK'
      }
    });
  } catch (error) {

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}