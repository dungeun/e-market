import { NextRequest, NextResponse } from 'next/server'
import { languageManager } from '@/lib/services/language-manager'

// GET: 모든 언어 목록 조회 (활성/비활성 포함)
export async function GET() {
  try {
    const [allLanguages, enabledLanguages, defaultLanguage] = await Promise.all([
      languageManager.getAllLanguages(),
      languageManager.getEnabledLanguages(),
      languageManager.getDefaultLanguage()
    ])

    return NextResponse.json({
      success: true,
      data: {
        allLanguages,
        enabledLanguages,
        defaultLanguage,
        maxLanguages: 3,
        currentCount: enabledLanguages.length
      }
    })
  } catch (error) {
    console.error('언어 목록 조회 실패:', error)
    return NextResponse.json(
      { success: false, error: '언어 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 언어 추가
export async function POST(request: NextRequest) {
  try {
    const { languageCode } = await request.json()
    
    if (!languageCode) {
      return NextResponse.json(
        { success: false, error: '언어 코드가 필요합니다.' },
        { status: 400 }
      )
    }

    const addedLanguage = await languageManager.addLanguage(languageCode)
    
    return NextResponse.json({
      success: true,
      message: '언어가 성공적으로 추가되었습니다.',
      data: addedLanguage
    })
  } catch (error) {
    console.error('언어 추가 실패:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '언어 추가에 실패했습니다.' 
      },
      { status: 400 }
    )
  }
}

// DELETE: 언어 제거
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const languageCode = searchParams.get('code')
    
    if (!languageCode) {
      return NextResponse.json(
        { success: false, error: '언어 코드가 필요합니다.' },
        { status: 400 }
      )
    }

    await languageManager.removeLanguage(languageCode)
    
    return NextResponse.json({
      success: true,
      message: '언어가 성공적으로 제거되었습니다.'
    })
  } catch (error) {
    console.error('언어 제거 실패:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '언어 제거에 실패했습니다.' 
      },
      { status: 400 }
    )
  }
}

// PUT: 언어 교체
export async function PUT(request: NextRequest) {
  try {
    const { removeCode, addCode } = await request.json()
    
    if (!removeCode || !addCode) {
      return NextResponse.json(
        { success: false, error: '제거할 언어와 추가할 언어 코드가 모두 필요합니다.' },
        { status: 400 }
      )
    }

    const result = await languageManager.switchLanguage(removeCode, addCode)
    
    return NextResponse.json({
      success: true,
      message: '언어가 성공적으로 교체되었습니다.',
      data: result
    })
  } catch (error) {
    console.error('언어 교체 실패:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '언어 교체에 실패했습니다.' 
      },
      { status: 400 }
    )
  }
}