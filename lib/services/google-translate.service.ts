interface TranslationResult {
  text: string
  source: string
  target: string
  confidence: number
}

interface GoogleTranslateResponse {
  data: {
    translations: Array<{
      translatedText: string
      detectedSourceLanguage?: string
    }>
  }
}

const logger = {
  info: (...args: any[]) => console.log('[GoogleTranslate]', ...args),
  error: (...args: any[]) => console.error('[GoogleTranslate]', ...args),
  warn: (...args: any[]) => console.warn('[GoogleTranslate]', ...args)
}

export class GoogleTranslateService {
  private apiKey: string
  private baseUrl = 'https://translation.googleapis.com/language/translate/v2'

  constructor() {
    this.apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || ''
    if (!this.apiKey) {

    }
  }

  /**
   * 데이터베이스에서 API 키 로드
   */
  private async loadApiKeyFromDB(): Promise<string> {
    try {
      const { query } = await import('@/lib/db')
      const result = await query('SELECT value FROM system_settings WHERE key = $1', ['google_translate_api_key'])
      return result.rows[0]?.value || process.env.GOOGLE_TRANSLATE_API_KEY || ''
    } catch (error) {
      logger.warn('DB에서 API 키 로드 실패, 환경변수 사용:', error)
      return process.env.GOOGLE_TRANSLATE_API_KEY || ''
    }
  }

  /**
   * 현재 API 키 가져오기 (DB 우선, 환경변수 fallback)
   */
  private async getApiKey(): Promise<string> {
    // 개발 모드에서는 환경변수 직접 사용
    if (process.env.NODE_ENV === 'development' && process.env.GOOGLE_TRANSLATE_API_KEY) {
      const envKey = process.env.GOOGLE_TRANSLATE_API_KEY
      if (envKey && envKey !== 'YOUR_GOOGLE_TRANSLATE_API_KEY_HERE') {
        return envKey
      }
    }
    
    if (!this.apiKey) {
      this.apiKey = await this.loadApiKeyFromDB()
      logger.info('API 키 로드됨:', this.apiKey ? `${this.apiKey.substring(0, 8)}...` : '없음')
    }
    return this.apiKey
  }

  /**
   * 텍스트를 지정된 언어로 번역
   */
  async translateText(
    text: string, 
    targetLanguage: string, 
    sourceLanguage: string = 'ko'
  ): Promise<TranslationResult | null> {
    const apiKey = await this.getApiKey()
    if (!apiKey) {
      throw new Error('Google Translate API key not configured')
    }

    if (!text.trim()) {
      throw new Error('번역할 텍스트가 없습니다')
    }

    try {
      logger.info('Translating text:', {
        textPreview: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
        sourceLanguage,
        targetLanguage,
        hasApiKey: !!apiKey,
        apiKeyPrefix: apiKey ? `${apiKey.substring(0, 8)}...` : 'none'
      })

      const requestBody = {
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text'
      }

      const response = await fetch(`${this.baseUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()

        let errorMessage = `번역 요청 실패: ${response.status} ${response.statusText}`
        
        if (response.status === 400) {
          errorMessage = 'API 키가 유효하지 않거나 요청 형식이 잘못되었습니다.'
        } else if (response.status === 403) {
          errorMessage = 'API 키에 Translation API 사용 권한이 없습니다.'
        } else if (response.status === 429) {
          errorMessage = 'API 사용량 한도를 초과했습니다.'
        }
        
        throw new Error(errorMessage)
      }

      const result: GoogleTranslateResponse = await response.json()

      if (!result.data?.translations?.length) {

        throw new Error('번역 결과를 받을 수 없습니다')
      }

      const translation = result.data.translations[0]
      
      const translationResult = {
        text: translation.translatedText,
        source: translation.detectedSourceLanguage || sourceLanguage,
        target: targetLanguage,
        confidence: 0.9 // Google API는 신뢰도를 제공하지 않으므로 기본값
      }

      return translationResult
    } catch (error) {
      logger.error('Translation failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  }

  /**
   * 여러 텍스트를 일괄 번역
   */
  async translateBatch(
    texts: string[], 
    targetLanguage: string, 
    sourceLanguage: string = 'ko'
  ): Promise<TranslationResult[]> {
    const apiKey = await this.getApiKey()
    if (!apiKey) {
      throw new Error('Google Translate API key not configured')
    }

    if (!texts.length) {
      return []
    }

    // 빈 텍스트 필터링
    const nonEmptyTexts = texts.filter(text => text.trim())
    if (!nonEmptyTexts.length) {
      return []
    }

    try {
      const response = await fetch(`${this.baseUrl}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: nonEmptyTexts,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text'
        })
      })

      if (!response.ok) {
        const errorText = await response.text()

        throw new Error(`번역 요청 실패: ${response.status} ${response.statusText}`)
      }

      const result: GoogleTranslateResponse = await response.json()
      
      if (!result.data?.translations?.length) {
        throw new Error('번역 결과를 받을 수 없습니다')
      }

      return result.data.translations.map((translation, index) => ({
        text: translation.translatedText,
        source: translation.detectedSourceLanguage || sourceLanguage,
        target: targetLanguage,
        confidence: 0.9
      }))
    } catch (error) {

      throw error
    }
  }

  /**
   * 지원 언어 목록
   */
  getSupportedLanguages(): Array<{ code: string; name: string }> {
    return [
      { code: 'ko', name: '한국어' },
      { code: 'en', name: '영어' },
      { code: 'jp', name: '일본어' },
      { code: 'zh', name: '중국어' },
      { code: 'es', name: '스페인어' },
      { code: 'fr', name: '프랑스어' },
      { code: 'de', name: '독일어' },
      { code: 'it', name: '이탈리아어' },
      { code: 'pt', name: '포르투갈어' },
      { code: 'ru', name: '러시아어' },
      { code: 'ar', name: '아랍어' },
      { code: 'hi', name: '힌디어' },
      { code: 'th', name: '태국어' },
      { code: 'vi', name: '베트남어' }
    ]
  }

  /**
   * API 키 유효성 검사
   */
  async validateApiKey(): Promise<boolean> {
    const apiKey = await this.getApiKey()
    if (!apiKey) {
      return false
    }

    try {
      const result = await this.translateText('Hello', 'ko', 'en')
      return !!result
    } catch (error) {

      return false
    }
  }

  /**
   * 언어 감지
   */
  async detectLanguage(text: string): Promise<string | null> {
    const apiKey = await this.getApiKey()
    if (!apiKey) {
      throw new Error('Google Translate API key not configured')
    }

    if (!text.trim()) {
      return null
    }

    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2/detect?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text
        })
      })

      if (!response.ok) {
        throw new Error(`언어 감지 실패: ${response.status}`)
      }

      const result = await response.json()
      return result.data?.detections?.[0]?.[0]?.language || null
    } catch (error) {

      return null
    }
  }
}

// 싱글톤 인스턴스
export const googleTranslateService = new GoogleTranslateService()

// 편의 함수 export
export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  try {
    const result = await googleTranslateService.translateText(text, targetLanguage, sourceLanguage)
    return result?.text || text
  } catch (error) {

    // 번역 실패 시 원본 텍스트 반환
    return text
  }
}