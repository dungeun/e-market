import type { AppError } from '@/lib/types/common';
// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';
import { translateText } from '@/lib/services/translation.service';

// 활성화된 언어 목록 조회 헬퍼 함수
async function getEnabledLanguages(): Promise<string[]> {
  try {
    const result = await query(`
      SELECT code FROM language_metadata 
      WHERE enabled = true 
      ORDER BY is_default DESC, code ASC
    `);
    return result.rows.map(row => row.code);
  } catch (error) {
    console.warn('언어 설정 조회 실패, 기본값 사용:', error);
    return ['ko', 'en']; // 기본값
  }
}

// GET: 메뉴 목록 조회 - 언어팩 데이터 포함
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'header'; // header or footer
    
    // 활성화된 언어 목록 조회
    const enabledLanguages = await getEnabledLanguages();

    // ui_menus 테이블에서 메뉴 조회하고 언어팩 데이터 조인
    const result = await query(`
      SELECT 
        um.*,
        COALESCE(
          json_object_agg(
            lpt.language_code, 
            lpt.translation
          ) FILTER (WHERE lpt.language_code IS NOT NULL),
          '{}'
        ) as language_pack_translations
      FROM ui_menus um
      LEFT JOIN language_pack_keys lpk ON lpk.key_name = (um.content->>'languagePackKey')
      LEFT JOIN language_pack_translations lpt ON lpk.id = lpt.key_id
      WHERE um.type = $1 AND um.visible = true
      GROUP BY um.id, um.type, um."sectionId", um.content, um.visible, um."order", um."createdAt", um."updatedAt"
      ORDER BY um."order" ASC
    `, [type]);
    
    // 메뉴 데이터에 언어팩 정보 병합 (동적 언어 지원)
    const menus = result.rows.map(menu => {
      const content = menu.content || {};
      const translations = menu.language_pack_translations || {};
      
      // 동적으로 content에 언어별 필드 추가
      const updatedContent = { ...content };
      
      enabledLanguages.forEach(langCode => {
        if (translations[langCode]) {
          if (langCode === 'ko') {
            // 기본 언어인 경우 label, name 필드 업데이트
            updatedContent.label = translations[langCode];
            updatedContent.name = translations[langCode];
          } else {
            // 다른 언어인 경우 label_{code} 형식으로 추가
            updatedContent[`label_${langCode}`] = translations[langCode];
          }
        }
      });
      
      return {
        ...menu,
        content: updatedContent,
        // 추가 정보로 번역 데이터 제공 (활성화된 언어만)
        translations: Object.fromEntries(
          Object.entries(translations).filter(([langCode]) => 
            enabledLanguages.includes(langCode)
          )
        )
      };
    });

    return NextResponse.json({ menus }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch menus:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    );
  }
}

// POST: 새 메뉴 추가 - 언어팩과 연동
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated || authResult.user?.type !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, name, href, icon } = body;

    // 메뉴 ID 생성 (sectionId로 사용)
    const menuId = `${type}_menu_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    
    // 언어팩 키 생성
    const languagePackKey = `header.menu.${menuId}`;
    
    try {
      // 1. 언어팩 키 먼저 생성
      const createKeyResult = await query(`
        INSERT INTO language_pack_keys (key_name, component_type, component_id, description)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [languagePackKey, 'menu', type, `${type} 메뉴: ${name}`]);

      const keyId = createKeyResult.rows[0].id;

      // 2. 한국어 번역 추가
      await query(`
        INSERT INTO language_pack_translations (key_id, language_code, translation, is_auto_translated)
        VALUES ($1, $2, $3, $4)
      `, [keyId, 'ko', name, false]);

      // 3. 자동 번역 처리 (활성화된 언어만)
      const enabledLanguages = await getEnabledLanguages();
      const targetLanguages = enabledLanguages.filter(lang => lang !== 'ko'); // 한국어 제외
      
      if (targetLanguages.length > 0) {
        try {
          // 활성화된 언어로 번역
          const translations = await Promise.all(
            targetLanguages.map(targetLang =>
              translateText(name, 'ko', targetLang)
            )
          );

          // 번역 결과를 데이터베이스에 저장
          await Promise.all(
            targetLanguages.map((langCode, index) =>
              query(`
                INSERT INTO language_pack_translations (key_id, language_code, translation, is_auto_translated)
                VALUES ($1, $2, $3, $4)
              `, [keyId, langCode, translations[index], true])
            )
          );
        } catch (translationError) {
          console.warn('자동 번역 실패, 기본값 사용:', translationError);
          // 번역 실패시 원본 텍스트 사용
          await Promise.all(
            targetLanguages.map(langCode =>
              query(`
                INSERT INTO language_pack_translations (key_id, language_code, translation, is_auto_translated)
                VALUES ($1, $2, $3, $4)
              `, [keyId, langCode, name, false])
            )
          );
        }
      }
    } catch (langPackError) {
      console.error('언어팩 생성 오류:', langPackError);
      // 언어팩 생성 실패해도 메뉴는 생성하되 기본 데이터 사용
    }

    // 4. 메뉴 데이터 생성 (언어팩 키 참조)
    const menuContent = {
      languagePackKey: languagePackKey, // 언어팩 키 참조
      href: href || '/',
      icon: icon || null,
      // 백업용 직접 데이터
      label: name,
      name: name
    };

    // 최대 order 값 조회
    const maxOrderResult = await query(`
      SELECT MAX("order") as max_order FROM ui_menus WHERE type = $1
    `, [type]);
    
    const maxOrder = maxOrderResult.rows[0]?.max_order || 0;

    // 5. UI 메뉴 DB에 저장
    const menuResult = await query(`
      INSERT INTO ui_menus (type, "sectionId", content, "order", visible)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [type, menuId, JSON.stringify(menuContent), maxOrder + 1, true]);
    
    const menu = menuResult.rows[0];

    return NextResponse.json({ menu }, { status: 201 });
  } catch (error) {
    console.error('Failed to create menu:', error);
    return NextResponse.json(
      { error: 'Failed to create menu' },
      { status: 500 }
    );
  }
}

// PUT: 메뉴 수정 - 언어팩과 연동
export async function PUT(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated || authResult.user?.type !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, name, href, icon, visible, order, autoTranslate = false, targetLanguages = [] } = body;

    const menuResult = await query(`
      SELECT * FROM ui_menus WHERE id = $1
    `, [id]);
    
    const menu = menuResult.rows[0];

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    const currentContent = (menu.content as any) || {};
    const updatedContent = { ...currentContent };

    // 기본 필드 업데이트
    if (href !== undefined) updatedContent.href = href;
    if (icon !== undefined) updatedContent.icon = icon;

    // 이름 변경시 언어팩 업데이트
    if (name !== undefined && name !== currentContent.name) {
      updatedContent.name = name;
      updatedContent.label = name;

      // 언어팩 키가 있으면 언어팩 업데이트
      if (currentContent.languagePackKey) {
        try {
          // 한국어 번역 업데이트
          await query(`
            UPDATE language_pack_translations 
            SET translation = $1, is_auto_translated = false, updated_at = CURRENT_TIMESTAMP
            WHERE key_id = (
              SELECT id FROM language_pack_keys WHERE key_name = $2
            ) AND language_code = 'ko'
          `, [name, currentContent.languagePackKey]);

          // 자동 번역 업데이트 (동적 언어 지원)
          if (autoTranslate) {
            try {
              // 사용자 지정 언어 또는 활성화된 언어 중 한국어 제외
              const enabledLanguages = await getEnabledLanguages();
              const languagesToTranslate = targetLanguages.length > 0 
                ? targetLanguages.filter(lang => lang !== 'ko')
                : enabledLanguages.filter(lang => lang !== 'ko');

              if (languagesToTranslate.length > 0) {
                // 번역 실행
                const translations = await Promise.all(
                  languagesToTranslate.map(targetLang =>
                    translateText(name, 'ko', targetLang)
                  )
                );

                // 번역 결과를 데이터베이스에 업데이트
                await Promise.all(
                  languagesToTranslate.map((langCode, index) =>
                    query(`
                      UPDATE language_pack_translations 
                      SET translation = $1, is_auto_translated = true, updated_at = CURRENT_TIMESTAMP
                      WHERE key_id = (
                        SELECT id FROM language_pack_keys WHERE key_name = $2
                      ) AND language_code = $3
                    `, [translations[index], currentContent.languagePackKey, langCode])
                  )
                );
              }
            } catch (translationError) {
              console.warn('자동 번역 실패:', translationError);
            }
          }
        } catch (langPackError) {
          console.warn('언어팩 업데이트 실패:', langPackError);
        }
      }
    }

    // DB 업데이트
    const updatedMenuResult = await query(`
      UPDATE ui_menus 
      SET content = $2, "order" = $3, visible = $4, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id, JSON.stringify(updatedContent), 
        order !== undefined ? order : menu.order, 
        visible !== undefined ? visible : menu.visible]);
    
    const updatedMenu = updatedMenuResult.rows[0];

    return NextResponse.json({ menu: updatedMenu }, { status: 200 });
  } catch (error) {
    console.error('Failed to update menu:', error);
    return NextResponse.json(
      { error: 'Failed to update menu' },
      { status: 500 }
    );
  }
}

// DELETE: 메뉴 삭제
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.isAuthenticated || authResult.user?.type !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Menu ID is required' },
        { status: 400 }
      );
    }

    const menuResult = await query(`
      SELECT * FROM ui_menus WHERE id = $1
    `, [id]);
    
    const menu = menuResult.rows[0];

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    // 메뉴 삭제
    await query(`
      DELETE FROM ui_menus WHERE id = $1
    `, [id]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete menu:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu' },
      { status: 500 }
    );
  }
}