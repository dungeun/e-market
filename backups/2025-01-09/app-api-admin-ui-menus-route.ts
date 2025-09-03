import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';
import { translateText } from '@/lib/services/translation.service';

// GET: 메뉴 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'header'; // header or footer

    // UI 메뉴 테이블이 없으므로 ui_sections 테이블을 활용
    const result = await query(`
      SELECT * FROM ui_sections 
      WHERE type = $1 AND visible = true
      ORDER BY "order" ASC
    `, [type]);
    
    const menus = result.rows;

    return NextResponse.json({ menus }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch menus:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    );
  }
}

// POST: 새 메뉴 추가
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
    const { type, name, href, icon, autoTranslate = true } = body;

    // 언어팩 키 생성
    const menuKey = `${type}.menu.${name.toLowerCase().replace(/\s+/g, '_')}`;

    // 번역 처리
    let translations: any = {};
    if (autoTranslate) {
      const [enTranslation, jpTranslation] = await Promise.all([
        translateText(name, 'ko', 'en'),
        translateText(name, 'ko', 'ja')
      ]);

      translations = {
        en: { name: enTranslation },
        jp: { name: jpTranslation }
      };
    }

    // 메뉴 데이터 생성
    const menuContent = {
      id: `menu-${Date.now()}`,
      label: menuKey,
      name: name,
      href: href || '/',
      icon: icon || null,
      visible: true
    };

    // 최대 order 값 조회
    const maxOrderResult = await query(`
      SELECT MAX("order") as max_order FROM ui_sections WHERE type = $1
    `, [type]);
    
    const maxOrder = maxOrderResult.rows[0]?.max_order || 0;

    // DB에 저장
    const menuResult = await query(`
      INSERT INTO ui_sections (section_id, type, content, translations, "order", visible)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [menuKey, type, JSON.stringify(menuContent), JSON.stringify(translations), maxOrder + 1, true]);
    
    const menu = menuResult.rows[0];

    // 언어팩에도 추가
    await query(`
      INSERT INTO language_packs (namespace, key, "languageCode", value, description)
      VALUES 
        ($1, $2, 'ko', $3, $4),
        ($1, $2, 'en', $5, $4),
        ($1, $2, 'ja', $6, $4)
    `, [type, menuKey.replace(`${type}.`, ''), name, `${type === 'header' ? '헤더' : '푸터'} 메뉴`, translations.en?.name || name, translations.jp?.name || name]);

    return NextResponse.json({ menu }, { status: 201 });
  } catch (error) {
    console.error('Failed to create menu:', error);
    return NextResponse.json(
      { error: 'Failed to create menu' },
      { status: 500 }
    );
  }
}

// PUT: 메뉴 수정
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
    const { id, name, href, icon, visible, order, autoTranslate = false } = body;

    const menuResult = await query(`
      SELECT * FROM ui_sections WHERE id = $1
    `, [id]);
    
    const menu = menuResult.rows[0];

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    // 컨텐츠 업데이트
    const updatedContent = (menu.content as Record<string, any>) || {};
    if (name !== undefined) updatedContent.name = name;
    if (href !== undefined) updatedContent.href = href;
    if (icon !== undefined) updatedContent.icon = icon;
    if (visible !== undefined) updatedContent.visible = visible;

    // 번역 업데이트
    let updatedTranslations = (menu.translations as Record<string, any>) || {};
    if (autoTranslate && name) {
      const [enTranslation, jpTranslation] = await Promise.all([
        translateText(name, 'ko', 'en'),
        translateText(name, 'ko', 'ja')
      ]);

      updatedTranslations = {
        ...updatedTranslations,
        en: { ...updatedTranslations.en, name: enTranslation },
        jp: { ...updatedTranslations.jp, name: jpTranslation }
      };

      // 언어팩도 업데이트
      const menuKey = (menu.content as any)?.label || menu.section_id;
      await query(`
        UPDATE language_packs 
        SET value = CASE "languageCode"
          WHEN 'ko' THEN $2
          WHEN 'en' THEN $3
          WHEN 'ja' THEN $4
          ELSE value
        END
        WHERE key = $1
      `, [menuKey.replace(`${menu.type}.`, ''), name, enTranslation, jpTranslation]);
    }

    // DB 업데이트
    const updatedMenuResult = await query(`
      UPDATE ui_sections 
      SET content = $2, translations = $3, "order" = $4, visible = $5
      WHERE id = $1
      RETURNING *
    `, [id, JSON.stringify(updatedContent), JSON.stringify(updatedTranslations), 
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
      SELECT * FROM ui_sections WHERE id = $1
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
      DELETE FROM ui_sections WHERE id = $1
    `, [id]);

    // 언어팩에서도 삭제 (커스텀 메뉴인 경우)
    const menuKey = (menu.content as Record<string, any>)?.label || menu.section_id;
    if (menuKey.includes('custom_')) {
      await query(`
        DELETE FROM language_packs WHERE key = $1
      `, [menuKey.replace(`${menu.type}.`, '')]);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete menu:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu' },
      { status: 500 }
    );
  }
}