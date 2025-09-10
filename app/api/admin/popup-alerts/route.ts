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
    const language = searchParams.get('lang') || 'ko';

    if (isAdmin) {
      // 어드민용: 모든 팝업 조회 with translations
      const authResult = await verifyAuth(req);
      if (!authResult.isAuthenticated || authResult.user?.type !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const result = await query(`
        SELECT 
          pa.id, 
          pa."isActive", 
          pa."backgroundColor", 
          pa."textColor", 
          pa.template, 
          pa."showCloseButton",
          pa."startDate",
          pa."endDate",
          pa.priority,
          pa."createdAt", 
          pa."updatedAt",
          pa.message_ko,
          pa.message_en, 
          pa.message_jp,
          COALESCE(
            json_object_agg(
              pat.language_code, 
              pat.message
            ) FILTER (WHERE pat.language_code IS NOT NULL),
            '{}'::json
          ) as messages
        FROM popup_alerts pa
        LEFT JOIN popup_alert_translations pat ON pa.id = pat.popup_alert_id
        GROUP BY pa.id
        ORDER BY pa.priority DESC, pa."createdAt" DESC
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
          pa.id, 
          pa."backgroundColor", 
          pa."textColor", 
          pa.template, 
          pa."showCloseButton",
          pa."startDate",
          pa."endDate",
          pa.priority,
          pat.message,
          json_build_object(
            $2, pat.message,
            'ko', pat_ko.message,
            'en', pat_en.message,
            'ja', pat_ja.message
          ) as messages
        FROM popup_alerts pa
        LEFT JOIN popup_alert_translations pat ON pa.id = pat.popup_alert_id AND pat.language_code = $2
        LEFT JOIN popup_alert_translations pat_ko ON pa.id = pat_ko.popup_alert_id AND pat_ko.language_code = 'ko'
        LEFT JOIN popup_alert_translations pat_en ON pa.id = pat_en.popup_alert_id AND pat_en.language_code = 'en'
        LEFT JOIN popup_alert_translations pat_ja ON pa.id = pat_ja.popup_alert_id AND pat_ja.language_code = 'ja'
        WHERE pa."isActive" = true
          AND (pa."startDate" IS NULL OR pa."startDate" <= $1)
          AND (pa."endDate" IS NULL OR pa."endDate" >= $1)
        ORDER BY pa.priority DESC, pa."createdAt" DESC
        LIMIT 1
      `, [now, language]);

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
      messages = {},
      message_ko, // 하위 호환성
      message_en, // 하위 호환성
      message_jp, // 하위 호환성
      template = 'info', 
      backgroundColor, 
      textColor, 
      showCloseButton = true,
      isActive = true,
      startDate = null,
      endDate = null,
      priority = 0
    } = body;

    // 메시지 처리 (하위 호환성 유지)
    let finalMessages = messages;
    if (Object.keys(messages).length === 0 && (message_ko || message_en || message_jp)) {
      finalMessages = {
        ko: message_ko || '',
        en: message_en || '',
        ja: message_jp || ''
      };
    }

    // 필수 필드 검증
    const hasValidMessage = Object.values(finalMessages).some(msg => msg && msg.trim() !== '');
    if (!hasValidMessage) {
      return NextResponse.json({ 
        error: '최소 하나의 언어 메시지가 필요합니다.' 
      }, { status: 400 });
    }

    // 언어별 메시지 준비 (기존 컬럼과의 호환성을 위해)
    const messageKo = finalMessages.ko || Object.values(finalMessages)[0] || '';
    const messageEn = finalMessages.en || '';
    const messageJp = finalMessages.ja || '';

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
      messageKo, 
      messageEn, 
      messageJp, 
      isActive, 
      finalBackgroundColor, 
      finalTextColor, 
      template, 
      showCloseButton,
      startDate,
      endDate,
      priority
    ]);

    // 동적 언어 번역 추가
    const alertId = result.rows[0].id;
    for (const [langCode, message] of Object.entries(finalMessages)) {
      if (message && message.trim() !== '') {
        await query(`
          INSERT INTO popup_alert_translations (popup_alert_id, language_code, message)
          VALUES ($1, $2, $3)
          ON CONFLICT (popup_alert_id, language_code) 
          DO UPDATE SET message = EXCLUDED.message, updated_at = NOW()
        `, [alertId, langCode, message]);
      }
    }

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
      messages = {},
      message_ko, // 하위 호환성
      message_en, // 하위 호환성
      message_jp, // 하위 호환성
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

    // 메시지 처리 (하위 호환성 유지)
    let finalMessages = messages;
    if (Object.keys(messages).length === 0 && (message_ko !== undefined || message_en !== undefined || message_jp !== undefined)) {
      finalMessages = {
        ko: message_ko || '',
        en: message_en || '',
        ja: message_jp || ''
      };
    }

    // 언어별 메시지 준비 (기존 컬럼과의 호환성을 위해)
    const messageKo = finalMessages.ko !== undefined ? finalMessages.ko : message_ko;
    const messageEn = finalMessages.en !== undefined ? finalMessages.en : message_en;
    const messageJp = finalMessages.ja !== undefined ? finalMessages.ja : message_jp;

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
      messageKo,
      messageEn,
      messageJp,
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

    // 동적 언어 번역 업데이트
    const alertId = result.rows[0].id;
    if (Object.keys(finalMessages).length > 0) {
      for (const [langCode, message] of Object.entries(finalMessages)) {
        if (message !== undefined) {
          if (message && message.trim() !== '') {
            await query(`
              INSERT INTO popup_alert_translations (popup_alert_id, language_code, message)
              VALUES ($1, $2, $3)
              ON CONFLICT (popup_alert_id, language_code) 
              DO UPDATE SET message = EXCLUDED.message, updated_at = NOW()
            `, [alertId, langCode, message]);
          } else {
            // 빈 메시지는 삭제
            await query(`
              DELETE FROM popup_alert_translations 
              WHERE popup_alert_id = $1 AND language_code = $2
            `, [alertId, langCode]);
          }
        }
      }
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