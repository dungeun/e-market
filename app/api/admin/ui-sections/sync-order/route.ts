// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-server';
import { UIConfigSyncService } from '@/lib/services/ui-config-sync.service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/admin/ui-sections/sync-order - 섹션 순서 JSON 동기화
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getServerSession();
    if (!session || session.user.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sectionOrder } = await request.json();

    if (!sectionOrder || !Array.isArray(sectionOrder)) {
      return NextResponse.json(
        { error: 'Invalid section order data' },
        { status: 400 }
      );
    }

    // JSON 파일 동기화 서비스 호출
    const syncService = UIConfigSyncService.getInstance();
    const result = await syncService.syncSectionOrder(sectionOrder, session.user.id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `섹션 순서가 ${result.updatedLanguages.length}개 언어에 동기화되었습니다.`,
        updatedLanguages: result.updatedLanguages,
        timestamp: result.timestamp
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: '일부 언어 동기화 실패',
          errors: result.errors,
          updatedLanguages: result.updatedLanguages
        },
        { status: 207 } // 부분 성공
      );
    }
  } catch (error) {

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}