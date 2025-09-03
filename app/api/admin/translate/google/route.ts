import { NextRequest, NextResponse } from 'next/server'
import { googleTranslateService } from '@/lib/services/google-translate.service'

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage = 'ko' } = await request.json()

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: '텍스트와 대상 언어가 필요합니다.' },
        { status: 400 }
      )
    }

    // 같은 언어인 경우 번역하지 않음
    if (sourceLanguage === targetLanguage) {
      return NextResponse.json({
        translatedText: text,
        sourceLanguage,
        targetLanguage
      })
    }

    const result = await googleTranslateService.translateText(
      text,
      targetLanguage,
      sourceLanguage
    )

    if (!result) {
      return NextResponse.json(
        { error: '번역 결과를 받을 수 없습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      translatedText: result.text,
      sourceLanguage: result.source,
      targetLanguage: result.target,
      confidence: result.confidence
    })

  } catch (error) {
    console.error('Google Translate API 오류:', error)
    
    let errorMessage = '번역 중 오류가 발생했습니다.'
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Google Translate API 키가 설정되지 않았거나 유효하지 않습니다.'
      } else if (error.message.includes('403')) {
        errorMessage = 'Google Translate API 사용 권한이 없습니다.'
      } else if (error.message.includes('429')) {
        errorMessage = 'API 사용량 한도를 초과했습니다.'
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // API 키 유효성 검사
    const isValid = await googleTranslateService.validateApiKey()
    
    if (!isValid) {
      return NextResponse.json({
        status: 'invalid',
        message: 'Google Translate API 키가 유효하지 않습니다.'
      }, { status: 400 })
    }

    // 지원 언어 목록 반환
    const supportedLanguages = googleTranslateService.getSupportedLanguages()

    return NextResponse.json({
      status: 'valid',
      message: 'Google Translate API가 정상적으로 설정되었습니다.',
      supportedLanguages
    })

  } catch (error) {
    console.error('Google Translate API 상태 확인 오류:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'API 상태를 확인할 수 없습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
  }
}