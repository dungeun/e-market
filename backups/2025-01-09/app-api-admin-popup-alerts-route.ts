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

// GET: 활성 팝업 조회 (공개 API)
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
        SELECT id, message, "isActive", "backgroundColor", "textColor", 
               template, "showCloseButton", "createdAt", "updatedAt"
        FROM popup_alerts 
        ORDER BY "createdAt" DESC
      `);

      return NextResponse.json({ 
        alerts: result.rows,
        templates: POPUP_TEMPLATES 
      });
    } else {
      // 공개용: 활성 팝업만 조회
      const result = await query(`
        SELECT id, message, "backgroundColor", "textColor", 
               template, "showCloseButton"
        FROM popup_alerts 
        WHERE "isActive" = true
        ORDER BY "createdAt" DESC
        LIMIT 1
      `);

      return NextResponse.json({ alert: result.rows[0] || null });
    }
  } catch (error) {
    console.error('Failed to fetch popup alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popup alerts' },
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
      message, 
      template = 'info', 
      backgroundColor, 
      textColor, 
      showCloseButton = true,
      isActive = true 
    } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 템플릿 색상 적용 또는 커스텀 색상 사용
    const templateColors = POPUP_TEMPLATES[template as keyof typeof POPUP_TEMPLATES] || POPUP_TEMPLATES.custom;
    const finalBackgroundColor = backgroundColor || templateColors.backgroundColor;
    const finalTextColor = textColor || templateColors.textColor;

    // 기존 활성 팝업들을 비활성화 (한 번에 하나만 노출)
    await query(`
      UPDATE popup_alerts SET "isActive" = false WHERE "isActive" = true
    `);

    // 새 팝업 생성
    const result = await query(`
      INSERT INTO popup_alerts (
        message, "isActive", "backgroundColor", "textColor", 
        template, "showCloseButton", "createdAt", "updatedAt"
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `, [message, isActive, finalBackgroundColor, finalTextColor, template, showCloseButton]);

    return NextResponse.json({ alert: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Failed to create popup alert:', error);
    return NextResponse.json(
      { error: 'Failed to create popup alert' },
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
      message, 
      template, 
      backgroundColor, 
      textColor, 
      showCloseButton,
      isActive 
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

    // 활성화하는 경우 다른 팝업들 비활성화
    if (isActive) {
      await query(`
        UPDATE popup_alerts SET "isActive" = false WHERE "isActive" = true AND id != $1
      `, [id]);
    }

    const result = await query(`
      UPDATE popup_alerts 
      SET message = COALESCE($2, message),
          "isActive" = COALESCE($3, "isActive"),
          "backgroundColor" = COALESCE($4, "backgroundColor"),
          "textColor" = COALESCE($5, "textColor"),
          template = COALESCE($6, template),
          "showCloseButton" = COALESCE($7, "showCloseButton"),
          "updatedAt" = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, message, isActive, finalBackgroundColor, finalTextColor, template, showCloseButton]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json({ alert: result.rows[0] });
  } catch (error) {
    console.error('Failed to update popup alert:', error);
    return NextResponse.json(
      { error: 'Failed to update popup alert' },
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

    const result = await query(`
      DELETE FROM popup_alerts WHERE id = $1 RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete popup alert:', error);
    return NextResponse.json(
      { error: 'Failed to delete popup alert' },
      { status: 500 }
    );
  }
}