import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

// 팝업 템플릿 정의
const POPUP_TEMPLATES = {
  urgent: { 
    backgroundColor: '#DC2626', 
    textColor: '#FFFFFF',
    name: '긴급 알림'
  },
  warning: { 
    backgroundColor: '#F59E0B', 
    textColor: '#FFFFFF',
    name: '경고 알림'
  },
  info: { 
    backgroundColor: '#3B82F6', 
    textColor: '#FFFFFF',
    name: '정보 알림'
  },
  success: { 
    backgroundColor: '#10B981', 
    textColor: '#FFFFFF',
    name: '성공 알림'
  },
  custom: {
    backgroundColor: '#6B7280',
    textColor: '#FFFFFF', 
    name: '커스텀'
  }
};

// GET: 활성 팝업 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';

    if (isAdmin) {
      // 어드민용: 모든 팝업 조회
      const authResult = await verifyAuth(req);
      if (!authResult.isAuthenticated || authResult.user?.type !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const result = await query(`
        SELECT 
          id, 
          message_ko, 
          message_en, 
          message_jp,
          "isActive", 
          "backgroundColor", 
          "textColor", 
          template, 
          "showCloseButton",
          "startDate",
          "endDate",
          priority,
          "createdAt", 
          "updatedAt"
        FROM popup_alerts 
        ORDER BY priority DESC, "createdAt" DESC
      `);

      return NextResponse.json({ 
        alerts: result.rows,
        templates: POPUP_TEMPLATES 
      });
    } else {
      // 공개용: 활성 팝업만 조회 (우선순위 가장 높은 것)
      const now = new Date().toISOString();
      
      const result = await query(`
        SELECT 
          id, 
          message_ko, 
          message_en, 
          message_jp,
          "backgroundColor", 
          "textColor", 
          template, 
          "showCloseButton",
          "startDate",
          "endDate",
          priority
        FROM popup_alerts 
        WHERE "isActive" = true
          AND ("startDate" IS NULL OR "startDate" <= $1)
          AND ("endDate" IS NULL OR "endDate" >= $1)
        ORDER BY priority DESC, "createdAt" DESC
        LIMIT 1
      `, [now]);

      // 캐싱 헤더 추가 (5분)
      const headers = new Headers();
      headers.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60');
      
      return NextResponse.json(
        { alert: result.rows[0] || null },
        { headers }
      );
    }
  } catch (error) {
    console.error('Error fetching popup alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popup alerts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST: 새 팝업 생성 (어드민만)
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated || authResult.user?.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      message_ko,
      message_en,
      message_jp,
      template = 'info', 
      backgroundColor, 
      textColor, 
      showCloseButton = true,
      isActive = true,
      startDate = null,
      endDate = null,
      priority = 0
    } = body;

    // 필수 필드 검증
    if (!message_ko || !message_en || !message_jp) {
      return NextResponse.json({ 
        error: 'All language messages are required (message_ko, message_en, message_jp)' 
      }, { status: 400 });
    }

    // 템플릿 색상 적용 또는 커스텀 색상 사용
    const templateColors = POPUP_TEMPLATES[template as keyof typeof POPUP_TEMPLATES] || POPUP_TEMPLATES.custom;
    const finalBackgroundColor = backgroundColor || templateColors.backgroundColor;
    const finalTextColor = textColor || templateColors.textColor;

    // 높은 우선순위로 활성화하는 경우 기존 팝업들의 우선순위 조정
    if (isActive && priority > 0) {
      await query(`
        UPDATE popup_alerts 
        SET priority = CASE 
          WHEN priority >= $1 THEN priority - 1 
          ELSE priority 
        END
        WHERE "isActive" = true AND priority >= $1
      `, [priority]);
    }

    // 새 팝업 생성
    const result = await query(`
      INSERT INTO popup_alerts (
        message_ko, 
        message_en, 
        message_jp,
        "isActive", 
        "backgroundColor", 
        "textColor", 
        template, 
        "showCloseButton",
        "startDate",
        "endDate",
        priority,
        "createdAt", 
        "updatedAt"
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *
    `, [
      message_ko, 
      message_en, 
      message_jp, 
      isActive, 
      finalBackgroundColor, 
      finalTextColor, 
      template, 
      showCloseButton,
      startDate,
      endDate,
      priority
    ]);

    return NextResponse.json({ alert: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating popup alert:', error);
    return NextResponse.json(
      { error: 'Failed to create popup alert', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT: 팝업 수정 (어드민만)
export async function PUT(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated || authResult.user?.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      id, 
      message_ko,
      message_en,
      message_jp,
      template, 
      backgroundColor, 
      textColor, 
      showCloseButton,
      isActive,
      startDate,
      endDate,
      priority
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    // 템플릿 색상 적용
    let finalBackgroundColor = backgroundColor;
    let finalTextColor = textColor;

    if (template && POPUP_TEMPLATES[template as keyof typeof POPUP_TEMPLATES]) {
      const templateColors = POPUP_TEMPLATES[template as keyof typeof POPUP_TEMPLATES];
      finalBackgroundColor = backgroundColor || templateColors.backgroundColor;
      finalTextColor = textColor || templateColors.textColor;
    }

    // 우선순위 조정이 필요한 경우
    if (priority !== undefined) {
      const currentAlert = await query(
        'SELECT priority FROM popup_alerts WHERE id = $1',
        [id]
      );
      
      if (currentAlert.rows.length > 0) {
        const oldPriority = currentAlert.rows[0].priority;
        
        if (oldPriority !== priority) {
          // 우선순위 재조정
          if (priority > oldPriority) {
            await query(`
              UPDATE popup_alerts 
              SET priority = priority - 1 
              WHERE priority > $1 AND priority <= $2 AND id != $3
            `, [oldPriority, priority, id]);
          } else {
            await query(`
              UPDATE popup_alerts 
              SET priority = priority + 1 
              WHERE priority >= $1 AND priority < $2 AND id != $3
            `, [priority, oldPriority, id]);
          }
        }
      }
    }

    const result = await query(`
      UPDATE popup_alerts 
      SET 
        message_ko = COALESCE($2, message_ko),
        message_en = COALESCE($3, message_en),
        message_jp = COALESCE($4, message_jp),
        "isActive" = COALESCE($5, "isActive"),
        "backgroundColor" = COALESCE($6, "backgroundColor"),
        "textColor" = COALESCE($7, "textColor"),
        template = COALESCE($8, template),
        "showCloseButton" = COALESCE($9, "showCloseButton"),
        "startDate" = COALESCE($10, "startDate"),
        "endDate" = COALESCE($11, "endDate"),
        priority = COALESCE($12, priority),
        "updatedAt" = NOW()
      WHERE id = $1
      RETURNING *
    `, [
      id, 
      message_ko,
      message_en,
      message_jp,
      isActive, 
      finalBackgroundColor, 
      finalTextColor, 
      template, 
      showCloseButton,
      startDate,
      endDate,
      priority
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json({ alert: result.rows[0] });
  } catch (error) {
    console.error('Error updating popup alert:', error);
    return NextResponse.json(
      { error: 'Failed to update popup alert', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE: 팝업 삭제 (어드민만)
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated || authResult.user?.type !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    // 삭제할 팝업의 우선순위 확인
    const alertToDelete = await query(
      'SELECT priority FROM popup_alerts WHERE id = $1',
      [id]
    );

    if (alertToDelete.rows.length === 0) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const deletedPriority = alertToDelete.rows[0].priority;

    // 팝업 삭제
    await query('DELETE FROM popup_alerts WHERE id = $1', [id]);

    // 우선순위 재조정 (삭제된 팝업보다 낮은 우선순위를 가진 팝업들의 우선순위를 1씩 증가)
    await query(`
      UPDATE popup_alerts 
      SET priority = priority + 1 
      WHERE priority < $1
    `, [deletedPriority]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting popup alert:', error);
    return NextResponse.json(
      { error: 'Failed to delete popup alert', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}