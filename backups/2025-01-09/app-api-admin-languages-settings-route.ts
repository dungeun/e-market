import { NextRequest, NextResponse } from 'next/server'
import { languageManager } from '@/lib/services/language-manager'
import { query } from '@/lib/db'
import { logger } from '@/lib/logger'

// GET: 언어 설정 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeDisabled = searchParams.get('includeDisabled') === 'true'

    const languages = includeDisabled
      ? await languageManager.getAllLanguages()
      : await languageManager.getEnabledLanguages()

    const activeCount = await languageManager.getActiveLanguageCount()
    const defaultLanguage = await languageManager.getDefaultLanguage()

    return NextResponse.json({
      success: true,
      languages,
      activeCount,
      maxActiveLanguages: 3,
      defaultLanguage,
      canActivateMore: activeCount < 3
    })
  } catch (error) {
    logger.error('Failed to get language settings:', error)
    return NextResponse.json(
      { error: 'Failed to get language settings' },
      { status: 500 }
    )
  }
}

// POST: 새 언어 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, nativeName, googleCode, direction = 'ltr', flagEmoji, enabled = false } = body

    if (!code || !name || !googleCode) {
      return NextResponse.json(
        { error: '언어 코드, 이름, Google 번역 코드는 필수입니다.' },
        { status: 400 }
      )
    }

    // 언어 추가/업데이트
    const language = await languageManager.upsertLanguage({
      code,
      name,
      native_name: nativeName,
      google_code: googleCode,
      direction,
      flag_emoji: flagEmoji,
      enabled
    })

    logger.info('Language added/updated', { code, enabled })

    return NextResponse.json({
      success: true,
      message: `언어 ${code}가 추가/업데이트되었습니다.`,
      language
    })
  } catch (error) {
    logger.error('Failed to add/update language:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add/update language' },
      { status: 500 }
    )
  }
}

// PUT: 언어 설정 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, updates } = body

    if (!code) {
      return NextResponse.json(
        { error: '언어 코드가 필요합니다.' },
        { status: 400 }
      )
    }

    // 활성화 상태 변경 시 3개 제한 체크
    if (updates.enabled !== undefined) {
      const canActivate = await languageManager.canActivateLanguage(code)
      if (!canActivate && updates.enabled) {
        return NextResponse.json(
          { error: '최대 3개의 언어만 활성화할 수 있습니다. 먼저 다른 언어를 비활성화하세요.' },
          { status: 400 }
        )
      }
    }

    // 언어 업데이트
    const language = await languageManager.upsertLanguage({
      code,
      ...updates
    })

    logger.info('Language settings updated', { code, updates })

    return NextResponse.json({
      success: true,
      message: `언어 ${code} 설정이 업데이트되었습니다.`,
      language
    })
  } catch (error) {
    logger.error('Failed to update language settings:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update language' },
      { status: 500 }
    )
  }
}

// DELETE: 언어 삭제 (비활성 언어만 가능)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: '언어 코드가 필요합니다.' },
        { status: 400 }
      )
    }

    // 활성 언어는 삭제 불가
    const language = await languageManager.getLanguageByCode(code)
    if (!language) {
      return NextResponse.json(
        { error: '언어를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (language.enabled) {
      return NextResponse.json(
        { error: '활성 언어는 삭제할 수 없습니다. 먼저 비활성화하세요.' },
        { status: 400 }
      )
    }

    if (language.is_default) {
      return NextResponse.json(
        { error: '기본 언어는 삭제할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 언어 삭제
    await query('DELETE FROM language_settings WHERE code = $1', [code])

    // 관련 번역 데이터도 삭제 (옵션)
    const deleteTranslations = searchParams.get('deleteTranslations') === 'true'
    if (deleteTranslations) {
      await query('DELETE FROM product_translations WHERE language_code = $1', [code])
      await query('DELETE FROM language_pack_translations WHERE language_code = $1', [code])
      logger.info('Language and translations deleted', { code })
    } else {
      logger.info('Language deleted', { code })
    }

    return NextResponse.json({
      success: true,
      message: `언어 ${code}가 삭제되었습니다.`,
      translationsDeleted: deleteTranslations
    })
  } catch (error) {
    logger.error('Failed to delete language:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete language' },
      { status: 500 }
    )
  }
}