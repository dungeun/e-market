// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requireAdminAuth } from '@/lib/admin-auth'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET: 번역 상태 및 통계 조회
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('keyId')
    const languageCode = searchParams.get('languageCode')
    const stats = searchParams.get('stats') === 'true'

    if (stats) {
      // 번역 통계 반환
      const statsQuery = `
        SELECT 
          ls.code as language_code,
          ls.name as language_name,
          COUNT(lpt.id) as translated_count,
          COUNT(lpt.id) FILTER (WHERE lpt.is_auto_translated = true) as auto_translated_count,
          COUNT(lpt.id) FILTER (WHERE lpt.is_auto_translated = false) as manual_translated_count,
          (SELECT COUNT(*) FROM language_pack_keys WHERE is_active = true) as total_keys
        FROM language_settings ls
        LEFT JOIN language_pack_translations lpt ON ls.code = lpt.language_code
        WHERE ls.enabled = true
        GROUP BY ls.code, ls.name, ls.display_order
        ORDER BY ls.display_order
      `
      const statsResult = await query(statsQuery)

      return NextResponse.json({
        success: true,
        data: statsResult.rows
      })
    }

    if (keyId) {
      // 특정 키의 모든 번역 조회
      const translationsQuery = `
        SELECT 
          lpt.language_code,
          lpt.translation,
          lpt.is_auto_translated,
          lpt.translator_notes,
          lpt.created_at,
          lpt.updated_at,
          ls.name as language_name,
          ls.native_name
        FROM language_pack_translations lpt
        JOIN language_settings ls ON lpt.language_code = ls.code
        WHERE lpt.key_id = $1
        ORDER BY ls.display_order
      `
      const result = await query(translationsQuery, [keyId])

      return NextResponse.json({
        success: true,
        translations: result.rows
      })
    }

    // 전체 번역 상태 조회 (페이징)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const translationsQuery = `
      SELECT 
        lpk.id as key_id,
        lpk.key_name,
        lpk.component_type,
        lpk.component_id,
        COUNT(lpt.id) as translation_count,
        COUNT(lpt.id) FILTER (WHERE lpt.is_auto_translated = true) as auto_count,
        COUNT(lpt.id) FILTER (WHERE lpt.is_auto_translated = false) as manual_count,
        (SELECT COUNT(*) FROM language_settings WHERE enabled = true) as total_languages
      FROM language_pack_keys lpk
      LEFT JOIN language_pack_translations lpt ON lpk.id = lpt.key_id
      WHERE lpk.is_active = true
      GROUP BY lpk.id, lpk.key_name, lpk.component_type, lpk.component_id
      ORDER BY lpk.component_type, lpk.key_name
      LIMIT $1 OFFSET $2
    `

    const countQuery = `
      SELECT COUNT(*) as total
      FROM language_pack_keys
      WHERE is_active = true
    `

    const [result, countResult] = await Promise.all([
      query(translationsQuery, [limit, offset]),
      query(countQuery)
    ])

    const total = parseInt(countResult.rows[0]?.total || '0')

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    logger.error('Failed to get translations:', error)
    return NextResponse.json(
      { error: 'Failed to get translations' },
      { status: 500 }
    )
  }
}

// POST: 자동 번역 생성
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const body = await request.json()
    const { keyId, sourceLanguage = 'ko', targetLanguages, sourceText, forceRetranslate = false } = body

    if (!keyId) {
      return NextResponse.json(
        { error: '키 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 키 정보 조회
    const keyResult = await query(
      'SELECT key_name, component_type FROM language_pack_keys WHERE id = $1',
      [keyId]
    )

    if (keyResult.rows.length === 0) {
      return NextResponse.json(
        { error: '해당 키를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const keyInfo = keyResult.rows[0]

    // 소스 텍스트 결정
    let actualSourceText = sourceText
    if (!actualSourceText) {
      const sourceResult = await query(
        'SELECT translation FROM language_pack_translations WHERE key_id = $1 AND language_code = $2',
        [keyId, sourceLanguage]
      )
      
      if (sourceResult.rows.length === 0) {
        return NextResponse.json(
          { error: `${sourceLanguage} 언어의 원본 텍스트를 찾을 수 없습니다.` },
          { status: 404 }
        )
      }
      
      actualSourceText = sourceResult.rows[0].translation
    }

    // 대상 언어 결정
    let actualTargetLanguages = targetLanguages
    if (!actualTargetLanguages) {
      const languagesResult = await query(
        'SELECT code FROM language_settings WHERE enabled = true AND code != $1',
        [sourceLanguage]
      )
      actualTargetLanguages = languagesResult.rows.map(row => row.code)
    }

    // Google Translate API를 사용한 번역 (실제 구현 시 Google Translate API 호출)
    const translationResults = []

    for (const targetLang of actualTargetLanguages) {
      try {
        // 기존 번역이 있는지 확인
        const existingTranslation = await query(
          'SELECT id, translation FROM language_pack_translations WHERE key_id = $1 AND language_code = $2',
          [keyId, targetLang]
        )

        if (existingTranslation.rows.length > 0 && !forceRetranslate) {
          translationResults.push({
            language: targetLang,
            status: 'skipped',
            message: '이미 번역이 존재합니다.'
          })
          continue
        }

        // 실제 번역 로직 (여기서는 시뮬레이션)
        // TODO: Google Translate API 통합
        const translatedText = await simulateTranslation(actualSourceText, sourceLanguage, targetLang)

        if (existingTranslation.rows.length > 0) {
          // 기존 번역 업데이트
          await query(
            `UPDATE language_pack_translations 
             SET translation = $1, is_auto_translated = true, updated_at = CURRENT_TIMESTAMP
             WHERE key_id = $2 AND language_code = $3`,
            [translatedText, keyId, targetLang]
          )
        } else {
          // 새 번역 생성
          await query(
            `INSERT INTO language_pack_translations (key_id, language_code, translation, is_auto_translated)
             VALUES ($1, $2, $3, true)`,
            [keyId, targetLang, translatedText]
          )
        }

        translationResults.push({
          language: targetLang,
          status: 'success',
          translation: translatedText
        })

        logger.info('Auto translation created', { keyId, keyName: keyInfo.key_name, targetLang })

      } catch (error) {
        logger.error('Translation failed', { keyId, targetLang, error })
        translationResults.push({
          language: targetLang,
          status: 'error',
          message: error instanceof Error ? error.message : 'Translation failed'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${actualTargetLanguages.length}개 언어에 대한 번역을 처리했습니다.`,
      results: translationResults
    })
  } catch (error) {
    logger.error('Failed to create auto translations:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create translations' },
      { status: 500 }
    )
  }
}

// PUT: 번역 수정 (수동 번역)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const body = await request.json()
    const { keyId, languageCode, translation, translatorNotes } = body

    if (!keyId || !languageCode || !translation) {
      return NextResponse.json(
        { error: '키 ID, 언어 코드, 번역 텍스트가 필요합니다.' },
        { status: 400 }
      )
    }

    // 기존 번역 확인
    const existingTranslation = await query(
      'SELECT id FROM language_pack_translations WHERE key_id = $1 AND language_code = $2',
      [keyId, languageCode]
    )

    if (existingTranslation.rows.length > 0) {
      // 기존 번역 업데이트
      await query(
        `UPDATE language_pack_translations 
         SET translation = $1, is_auto_translated = false, translator_notes = $2, updated_at = CURRENT_TIMESTAMP
         WHERE key_id = $3 AND language_code = $4`,
        [translation, translatorNotes || null, keyId, languageCode]
      )
    } else {
      // 새 번역 생성
      await query(
        `INSERT INTO language_pack_translations (key_id, language_code, translation, is_auto_translated, translator_notes)
         VALUES ($1, $2, $3, false, $4)`,
        [keyId, languageCode, translation, translatorNotes || null]
      )
    }

    logger.info('Manual translation updated', { keyId, languageCode })

    return NextResponse.json({
      success: true,
      message: '번역이 업데이트되었습니다.'
    })
  } catch (error) {
    logger.error('Failed to update translation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update translation' },
      { status: 500 }
    )
  }
}

// DELETE: 번역 삭제
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get('keyId')
    const languageCode = searchParams.get('languageCode')

    if (!keyId || !languageCode) {
      return NextResponse.json(
        { error: '키 ID와 언어 코드가 필요합니다.' },
        { status: 400 }
      )
    }

    const result = await query(
      'DELETE FROM language_pack_translations WHERE key_id = $1 AND language_code = $2',
      [keyId, languageCode]
    )

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: '해당 번역을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    logger.info('Translation deleted', { keyId, languageCode })

    return NextResponse.json({
      success: true,
      message: '번역이 삭제되었습니다.'
    })
  } catch (error) {
    logger.error('Failed to delete translation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete translation' },
      { status: 500 }
    )
  }
}

// 번역 시뮬레이션 함수 (실제 구현에서는 Google Translate API 사용)
async function simulateTranslation(text: string, from: string, to: string): Promise<string> {
  // 실제 구현에서는 Google Translate API를 호출
  // 여기서는 간단한 시뮬레이션
  const translations = {
    'ko-en': {
      '특별한 쇼핑 경험': 'Special Shopping Experience',
      '최고의 상품을 최저가로 만나보세요': 'Meet the best products at the lowest prices',
      '쇼핑 시작하기': 'Start Shopping',
      '더 알아보기': 'Learn More',
      '카테고리': 'Categories',
      '전체 보기': 'View All'
    },
    'ko-ja': {
      '특별한 쇼핑 경험': '特別なショッピング体験',
      '최고의 상품을 최저가로 만나보세요': '最高の商品を最低価格でお会いください',
      '쇼핑 시작하기': 'ショッピングを始める',
      '더 알아보기': '詳細を見る',
      '카테고리': 'カテゴリー',
      '전체 보기': '全て見る'
    }
  }

  const translationKey = `${from}-${to}`
  const translationMap = translations[translationKey as keyof typeof translations]

  if (translationMap && translationMap[text as keyof typeof translationMap]) {
    return translationMap[text as keyof typeof translationMap]
  }

  // 기본 번역 (실제로는 Google Translate API 결과)
  return `[${to.toUpperCase()}] ${text}`
}