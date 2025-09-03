import { NextRequest, NextResponse } from 'next/server'
import { languageManager } from '@/lib/services/language-manager'
import { logger } from '@/lib/logger'

// POST: 언어 교체 (하나를 비활성화하고 다른 하나를 활성화)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { disableCode, enableCode } = body

    if (!disableCode || !enableCode) {
      return NextResponse.json(
        { error: '비활성화할 언어와 활성화할 언어 코드가 필요합니다.' },
        { status: 400 }
      )
    }

    if (disableCode === enableCode) {
      return NextResponse.json(
        { error: '같은 언어로 교체할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 언어 교체 실행
    const result = await languageManager.switchLanguage(disableCode, enableCode)

    logger.info('Language switched successfully', {
      disabled: disableCode,
      enabled: enableCode
    })

    return NextResponse.json({
      success: true,
      message: `${disableCode}를 비활성화하고 ${enableCode}를 활성화했습니다.`,
      result
    })
  } catch (error) {
    logger.error('Failed to switch languages:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to switch languages' },
      { status: 500 }
    )
  }
}

// GET: 현재 활성 언어 목록 조회
export async function GET() {
  try {
    const activeLanguages = await languageManager.getEnabledLanguages()
    const activeCount = await languageManager.getActiveLanguageCount()
    const allLanguages = await languageManager.getAllLanguages()

    return NextResponse.json({
      success: true,
      activeLanguages,
      activeCount,
      maxActiveLanguages: 3,
      allLanguages,
      canActivateMore: activeCount < 3
    })
  } catch (error) {
    logger.error('Failed to get language status:', error)
    return NextResponse.json(
      { error: 'Failed to get language status' },
      { status: 500 }
    )
  }
}