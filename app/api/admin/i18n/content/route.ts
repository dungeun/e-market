// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET /api/admin/i18n/content - 언어팩 콘텐츠 조회
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const { searchParams } = new URL(request.url)
    const componentType = searchParams.get('componentType')
    const componentId = searchParams.get('componentId')
    const search = searchParams.get('search')
    const languageCode = searchParams.get('languageCode')

    // 언어팩 키와 번역들을 조합해서 조회
    let keyQuery = `
      SELECT 
        lpk.id as key_id,
        lpk.key_name,
        lpk.component_type,
        lpk.component_id,
        lpk.description,
        lpk.is_active,
        COALESCE(
          json_object_agg(
            lpt.language_code, 
            json_build_object(
              'translation', lpt.translation,
              'is_auto_translated', lpt.is_auto_translated,
              'translator_notes', lpt.translator_notes
            )
          ) FILTER (WHERE lpt.language_code IS NOT NULL),
          '{}'
        ) as translations
      FROM language_pack_keys lpk
      LEFT JOIN language_pack_translations lpt ON lpk.id = lpt.key_id
      WHERE lpk.is_active = true
    `
    const queryParams = []
    let paramIndex = 1

    if (componentType) {
      keyQuery += ` AND lpk.component_type = $${paramIndex}`
      queryParams.push(componentType)
      paramIndex++
    }

    if (componentId) {
      keyQuery += ` AND lpk.component_id = $${paramIndex}`
      queryParams.push(componentId)
      paramIndex++
    }

    if (search) {
      keyQuery += ` AND (lpk.key_name ILIKE $${paramIndex} OR lpk.description ILIKE $${paramIndex})`
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    keyQuery += `
      GROUP BY lpk.id, lpk.key_name, lpk.component_type, lpk.component_id, lpk.description, lpk.is_active
      ORDER BY lpk.component_type, lpk.component_id, lpk.key_name
    `

    const result = await query(keyQuery, queryParams)

    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    logger.error('Failed to get language pack content:', error)
    return NextResponse.json(
      { error: 'Failed to get language pack content' },
      { status: 500 }
    )
  }
}

// POST /api/admin/i18n/content - 새 언어팩 키 생성
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const body = await request.json()
    const { keyName, componentType, componentId, description, translations = {} } = body

    if (!keyName || !componentType) {
      return NextResponse.json(
        { error: '키 이름과 컴포넌트 타입은 필수입니다.' },
        { status: 400 }
      )
    }

    // 중복 키 검사
    const existingKey = await query(
      'SELECT id FROM language_pack_keys WHERE key_name = $1',
      [keyName]
    )

    if (existingKey.rows.length > 0) {
      return NextResponse.json(
        { error: '이미 존재하는 키입니다.' },
        { status: 409 }
      )
    }

    // 언어팩 키 생성
    const keyResult = await query(
      `INSERT INTO language_pack_keys (key_name, component_type, component_id, description)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [keyName, componentType, componentId, description]
    )

    const keyId = keyResult.rows[0].id

    // 번역 데이터 생성
    const translationPromises = Object.entries(translations).map(([langCode, translation]) => {
      if (translation) {
        return query(
          `INSERT INTO language_pack_translations (key_id, language_code, translation, is_auto_translated)
           VALUES ($1, $2, $3, false)`,
          [keyId, langCode, translation]
        )
      }
      return Promise.resolve()
    })

    await Promise.all(translationPromises)

    logger.info('Language pack content created', { keyName, componentType })

    return NextResponse.json({
      success: true,
      message: '언어팩 콘텐츠가 생성되었습니다.',
      keyId
    })
  } catch (error) {
    logger.error('Failed to create language pack content:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create content' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/i18n/content - 언어팩 콘텐츠 업데이트
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const body = await request.json()
    const { keyId, keyName, description, translations = {} } = body

    if (!keyId && !keyName) {
      return NextResponse.json(
        { error: '키 ID 또는 키 이름이 필요합니다.' },
        { status: 400 }
      )
    }

    let actualKeyId = keyId

    // keyName으로 keyId 찾기
    if (!keyId && keyName) {
      const keyResult = await query(
        'SELECT id FROM language_pack_keys WHERE key_name = $1',
        [keyName]
      )
      
      if (keyResult.rows.length === 0) {
        return NextResponse.json(
          { error: '해당 키를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }
      
      actualKeyId = keyResult.rows[0].id
    }

    // 키 정보 업데이트 (description)
    if (description !== undefined) {
      await query(
        'UPDATE language_pack_keys SET description = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [description, actualKeyId]
      )
    }

    // 번역 업데이트
    const translationPromises = Object.entries(translations).map(async ([langCode, translation]) => {
      const existingTranslation = await query(
        'SELECT id FROM language_pack_translations WHERE key_id = $1 AND language_code = $2',
        [actualKeyId, langCode]
      )

      if (existingTranslation.rows.length > 0) {
        // 기존 번역 업데이트
        await query(
          `UPDATE language_pack_translations 
           SET translation = $1, is_auto_translated = false, updated_at = CURRENT_TIMESTAMP
           WHERE key_id = $2 AND language_code = $3`,
          [translation, actualKeyId, langCode]
        )
      } else if (translation) {
        // 새 번역 생성
        await query(
          `INSERT INTO language_pack_translations (key_id, language_code, translation, is_auto_translated)
           VALUES ($1, $2, $3, false)`,
          [actualKeyId, langCode, translation]
        )
      }
    })

    await Promise.all(translationPromises)

    logger.info('Language pack content updated', { keyId: actualKeyId })

    return NextResponse.json({
      success: true,
      message: '언어팩 콘텐츠가 업데이트되었습니다.'
    })
  } catch (error) {
    logger.error('Failed to update language pack content:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update content' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/i18n/content - 언어팩 콘텐츠 삭제
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('keyId')
    const keyName = searchParams.get('keyName')

    if (!keyId && !keyName) {
      return NextResponse.json(
        { error: '키 ID 또는 키 이름이 필요합니다.' },
        { status: 400 }
      )
    }

    let deleteQuery = 'DELETE FROM language_pack_keys WHERE '
    let queryParams = []

    if (keyId) {
      deleteQuery += 'id = $1'
      queryParams = [keyId]
    } else {
      deleteQuery += 'key_name = $1'
      queryParams = [keyName]
    }

    // CASCADE로 인해 관련 번역들도 자동 삭제됨
    const result = await query(deleteQuery, queryParams)

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: '해당 키를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    logger.info('Language pack content deleted', { keyId, keyName })

    return NextResponse.json({
      success: true,
      message: '언어팩 콘텐츠가 삭제되었습니다.'
    })
  } catch (error) {
    logger.error('Failed to delete language pack content:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete content' },
      { status: 500 }
    )
  }
}