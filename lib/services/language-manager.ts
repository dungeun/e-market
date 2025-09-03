import { query } from '@/lib/db'

export interface Language {
  code: string
  name: string
  native_name?: string
  google_code: string
  direction: string
  flag_emoji?: string
  enabled: boolean
  is_default: boolean
  created_at: Date
  updated_at: Date
}

export interface Translation {
  id: number
  key: string
  language_code: string
  value?: string
  status: 'pending' | 'auto' | 'manual' | 'verified'
  translated_by?: string
  translated_at?: Date
  verified_by?: string
  verified_at?: Date
  created_at: Date
  updated_at: Date
}

/**
 * 언어 관리 서비스
 * 동적 언어 설정을 지원하는 유틸리티 함수들
 * 최대 3개 언어만 활성화 가능
 */
export class LanguageManager {
  private static _instance: LanguageManager
  private _languages: Language[] | null = null
  private _cacheExpiry: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5분 캐시
  private readonly MAX_ACTIVE_LANGUAGES = 3 // 최대 활성 언어 수

  static getInstance(): LanguageManager {
    if (!LanguageManager._instance) {
      LanguageManager._instance = new LanguageManager()
    }
    return LanguageManager._instance
  }

  /**
   * 활성화된 언어 목록 조회 (캐시됨)
   */
  async getEnabledLanguages(): Promise<Language[]> {
    if (this._languages && Date.now() < this._cacheExpiry) {
      return this._languages
    }

    // 현재 활성 언어 설정 조회
    const settingsResult = await query(
      'SELECT selected_languages, default_language FROM language_settings LIMIT 1'
    )
    
    if (settingsResult.rows.length === 0) {
      return []
    }

    const { selected_languages, default_language } = settingsResult.rows[0]
    const selectedCodes: string[] = Array.isArray(selected_languages) ? selected_languages : JSON.parse(selected_languages)

    // 언어 메타데이터 조회
    const metadataResult = await query(
      `SELECT * FROM language_metadata WHERE code = ANY($1) ORDER BY 
       CASE WHEN code = $2 THEN 0 ELSE 1 END, name ASC`,
      [selectedCodes, default_language]
    )

    const languages: Language[] = metadataResult.rows.map(row => ({
      code: row.code,
      name: row.name,
      native_name: row.native_name,
      google_code: row.google_code,
      direction: row.direction,
      flag_emoji: row.flag_emoji,
      enabled: true,
      is_default: row.code === default_language,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }))

    this._languages = languages
    this._cacheExpiry = Date.now() + this.CACHE_DURATION

    return languages
  }

  /**
   * 모든 언어 목록 조회 (사용 가능한 모든 언어 메타데이터)
   */
  async getAllLanguages(): Promise<Language[]> {
    // 현재 설정 조회
    const settingsResult = await query(
      'SELECT selected_languages, default_language FROM language_settings LIMIT 1'
    )
    
    const selectedCodes: string[] = settingsResult.rows.length > 0 
      ? (Array.isArray(settingsResult.rows[0].selected_languages) 
          ? settingsResult.rows[0].selected_languages 
          : JSON.parse(settingsResult.rows[0].selected_languages))
      : []
    const defaultLanguage = settingsResult.rows.length > 0 ? settingsResult.rows[0].default_language : 'ko'

    // 모든 언어 메타데이터 조회
    const result = await query(
      'SELECT * FROM language_metadata ORDER BY name ASC'
    )

    return result.rows.map(row => ({
      code: row.code,
      name: row.name,
      native_name: row.native_name,
      google_code: row.google_code,
      direction: row.direction,
      flag_emoji: row.flag_emoji,
      enabled: selectedCodes.includes(row.code),
      is_default: row.code === defaultLanguage,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }))
  }

  /**
   * 기본 언어 조회
   */
  async getDefaultLanguage(): Promise<Language | null> {
    const settingsResult = await query(
      'SELECT default_language FROM language_settings LIMIT 1'
    )

    if (settingsResult.rows.length === 0) {
      return null
    }

    const defaultCode = settingsResult.rows[0].default_language
    const metadataResult = await query(
      'SELECT * FROM language_metadata WHERE code = $1',
      [defaultCode]
    )

    if (metadataResult.rows.length === 0) {
      return null
    }

    const row = metadataResult.rows[0]
    return {
      code: row.code,
      name: row.name,
      native_name: row.native_name,
      google_code: row.google_code,
      direction: row.direction,
      flag_emoji: row.flag_emoji,
      enabled: true,
      is_default: true,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }
  }

  /**
   * 언어 코드로 언어 조회
   */
  async getLanguageByCode(code: string): Promise<Language | null> {
    // 현재 설정에서 해당 언어가 활성화되어 있는지 확인
    const settingsResult = await query(
      'SELECT selected_languages, default_language FROM language_settings LIMIT 1'
    )
    
    const selectedCodes: string[] = settingsResult.rows.length > 0 
      ? (Array.isArray(settingsResult.rows[0].selected_languages) 
          ? settingsResult.rows[0].selected_languages 
          : JSON.parse(settingsResult.rows[0].selected_languages))
      : []
    const defaultLanguage = settingsResult.rows.length > 0 ? settingsResult.rows[0].default_language : 'ko'

    // 언어 메타데이터 조회
    const metadataResult = await query(
      'SELECT * FROM language_metadata WHERE code = $1',
      [code]
    )

    if (metadataResult.rows.length === 0) {
      return null
    }

    const row = metadataResult.rows[0]
    return {
      code: row.code,
      name: row.name,
      native_name: row.native_name,
      google_code: row.google_code,
      direction: row.direction,
      flag_emoji: row.flag_emoji,
      enabled: selectedCodes.includes(row.code),
      is_default: row.code === defaultLanguage,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }
  }

  /**
   * 언어 코드 목록 조회
   */
  async getLanguageCodes(): Promise<string[]> {
    const languages = await this.getEnabledLanguages()
    return languages.map(lang => lang.code)
  }

  /**
   * Google Translate API 코드로 시스템 코드 매핑
   */
  async getSystemCodeByGoogleCode(googleCode: string): Promise<string | null> {
    const result = await query(
      'SELECT code FROM language_settings WHERE google_code = $1 AND enabled = true',
      [googleCode]
    )

    return result.rows.length > 0 ? result.rows[0].code : null
  }

  /**
   * 시스템 코드로 Google Translate API 코드 매핑
   */
  async getGoogleCodeBySystemCode(systemCode: string): Promise<string | null> {
    const result = await query(
      'SELECT google_code FROM language_settings WHERE code = $1 AND enabled = true',
      [systemCode]
    )

    return result.rows.length > 0 ? result.rows[0].google_code : null
  }

  /**
   * 키에 대한 모든 번역 조회
   */
  async getTranslationsByKey(key: string): Promise<Record<string, Translation>> {
    const result = await query(`
      SELECT t.*, l.name as language_name 
      FROM language_pack_translations t
      LEFT JOIN language_settings l ON t.language_code = l.code
      WHERE t.key = $1 AND l.enabled = true
      ORDER BY l.is_default DESC, l.name ASC
    `, [key])

    const translations: Record<string, Translation> = {}
    
    result.rows.forEach(row => {
      translations[row.language_code] = {
        ...row,
        translated_at: row.translated_at ? new Date(row.translated_at) : undefined,
        verified_at: row.verified_at ? new Date(row.verified_at) : undefined,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at)
      }
    })

    return translations
  }

  /**
   * 번역 값 조회 (언어 코드와 키로)
   */
  async getTranslation(key: string, languageCode: string, fallbackToDefault: boolean = true): Promise<string | null> {
    let result = await query(
      'SELECT value FROM language_pack_translations WHERE key = $1 AND language_code = $2',
      [key, languageCode]
    )

    if (result.rows.length > 0 && result.rows[0].value) {
      return result.rows[0].value
    }

    // 기본 언어로 폴백
    if (fallbackToDefault && languageCode !== 'ko') {
      const defaultLang = await this.getDefaultLanguage()
      if (defaultLang && defaultLang.code !== languageCode) {
        result = await query(
          'SELECT value FROM language_pack_translations WHERE key = $1 AND language_code = $2',
          [key, defaultLang.code]
        )

        if (result.rows.length > 0 && result.rows[0].value) {
          return result.rows[0].value
        }
      }
    }

    return null
  }

  /**
   * 여러 키에 대한 번역 조회 (언어별)
   */
  async getTranslations(keys: string[], languageCode: string): Promise<Record<string, string>> {
    if (keys.length === 0) return {}

    const placeholders = keys.map((_, index) => `$${index + 2}`).join(',')
    const result = await query(
      `SELECT key, value FROM language_pack_translations 
       WHERE language_code = $1 AND key IN (${placeholders})`,
      [languageCode, ...keys]
    )

    const translations: Record<string, string> = {}
    result.rows.forEach(row => {
      if (row.value) {
        translations[row.key] = row.value
      }
    })

    return translations
  }

  /**
   * 언어 추가 (새로운 JSONB 방식)
   */
  async addLanguage(code: string): Promise<Language> {
    if (!code) {
      throw new Error('언어 코드는 필수입니다.')
    }

    // 언어 메타데이터 확인
    const metadataResult = await query(
      'SELECT * FROM language_metadata WHERE code = $1',
      [code]
    )

    if (metadataResult.rows.length === 0) {
      throw new Error(`지원되지 않는 언어 코드입니다: ${code}`)
    }

    // 현재 설정 조회
    const settingsResult = await query(
      'SELECT selected_languages FROM language_settings LIMIT 1'
    )

    let selectedLanguages: string[] = []
    if (settingsResult.rows.length > 0) {
      selectedLanguages = Array.isArray(settingsResult.rows[0].selected_languages) 
        ? settingsResult.rows[0].selected_languages 
        : JSON.parse(settingsResult.rows[0].selected_languages)
    }

    // 이미 추가된 언어인지 확인
    if (selectedLanguages.includes(code)) {
      throw new Error('이미 추가된 언어입니다.')
    }

    // 3개 제한 체크
    if (selectedLanguages.length >= this.MAX_ACTIVE_LANGUAGES) {
      throw new Error(`최대 ${this.MAX_ACTIVE_LANGUAGES}개의 언어만 활성화할 수 있습니다. 먼저 다른 언어를 비활성화하세요.`)
    }

    // 언어 추가
    selectedLanguages.push(code)
    
    await query(`
      UPDATE language_settings 
      SET selected_languages = $1, updated_at = CURRENT_TIMESTAMP
    `, [JSON.stringify(selectedLanguages)])

    // 캐시 무효화
    this._languages = null
    this._cacheExpiry = 0

    const row = metadataResult.rows[0]
    return {
      code: row.code,
      name: row.name,
      native_name: row.native_name,
      google_code: row.google_code,
      direction: row.direction,
      flag_emoji: row.flag_emoji,
      enabled: true,
      is_default: false,
      created_at: new Date(row.created_at),
      updated_at: new Date()
    }
  }

  /**
   * 언어 제거
   */
  async removeLanguage(code: string): Promise<boolean> {
    if (!code) {
      throw new Error('언어 코드는 필수입니다.')
    }

    // 기본 언어는 제거 불가
    const settingsResult = await query(
      'SELECT selected_languages, default_language FROM language_settings LIMIT 1'
    )

    if (settingsResult.rows.length === 0) {
      throw new Error('언어 설정을 찾을 수 없습니다.')
    }

    const { default_language } = settingsResult.rows[0]
    if (code === default_language) {
      throw new Error('기본 언어는 제거할 수 없습니다.')
    }

    let selectedLanguages: string[] = Array.isArray(settingsResult.rows[0].selected_languages) 
      ? settingsResult.rows[0].selected_languages 
      : JSON.parse(settingsResult.rows[0].selected_languages)

    // 해당 언어 제거
    const initialLength = selectedLanguages.length
    selectedLanguages = selectedLanguages.filter(lang => lang !== code)

    if (selectedLanguages.length === initialLength) {
      throw new Error('선택된 언어에 해당 코드가 없습니다.')
    }

    // 업데이트
    await query(`
      UPDATE language_settings 
      SET selected_languages = $1, updated_at = CURRENT_TIMESTAMP
    `, [JSON.stringify(selectedLanguages)])

    // 캐시 무효화
    this._languages = null
    this._cacheExpiry = 0

    return true
  }

  /**
   * 언어 교체 (3개 제한 유지)
   * 하나의 언어를 비활성화하고 다른 언어를 활성화
   */
  async switchLanguage(removeCode: string, addCode: string): Promise<{ removed: boolean, added: Language }> {
    await query('BEGIN')
    
    try {
      // 1. 기존 언어 제거
      await this.removeLanguage(removeCode)
      
      // 2. 새 언어 추가
      const addedLanguage = await this.addLanguage(addCode)
      
      await query('COMMIT')
      
      return {
        removed: true,
        added: addedLanguage
      }
    } catch (error) {
      await query('ROLLBACK')
      throw error
    }
  }

  /**
   * 활성 언어 개수 확인
   */
  async getActiveLanguageCount(): Promise<number> {
    const result = await query('SELECT selected_languages FROM language_settings LIMIT 1')
    if (result.rows.length === 0) {
      return 0
    }
    
    const selectedLanguages = Array.isArray(result.rows[0].selected_languages) 
      ? result.rows[0].selected_languages 
      : JSON.parse(result.rows[0].selected_languages)
    
    return selectedLanguages.length
  }

  /**
   * 언어 활성화 가능 여부 확인
   */
  async canActivateLanguage(code: string): Promise<boolean> {
    const result = await query('SELECT selected_languages FROM language_settings LIMIT 1')
    if (result.rows.length === 0) {
      return true
    }
    
    const selectedLanguages = Array.isArray(result.rows[0].selected_languages) 
      ? result.rows[0].selected_languages 
      : JSON.parse(result.rows[0].selected_languages)
    
    const isAlreadyActive = selectedLanguages.includes(code)
    
    if (isAlreadyActive) {
      return true // 이미 활성화된 언어
    }
    
    return selectedLanguages.length < this.MAX_ACTIVE_LANGUAGES
  }

  /**
   * 언어 추가 또는 업데이트 (upsert)
   */
  async upsertLanguage(languageData: {
    code: string
    name?: string
    native_name?: string
    google_code?: string
    direction?: 'ltr' | 'rtl'
    flag_emoji?: string
    enabled?: boolean
    is_default?: boolean
  }): Promise<Language> {
    const { code, enabled = false, ...otherData } = languageData
    
    if (!code) {
      throw new Error('언어 코드는 필수입니다.')
    }

    // 언어 메타데이터 확인 또는 생성
    let metadataResult = await query(
      'SELECT * FROM language_metadata WHERE code = $1',
      [code]
    )

    if (metadataResult.rows.length === 0) {
      // 새 언어 메타데이터 생성
      await query(`
        INSERT INTO language_metadata (code, name, native_name, google_code, direction, flag_emoji, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        code,
        otherData.name || code.toUpperCase(),
        otherData.native_name || otherData.name || code.toUpperCase(),
        otherData.google_code || code,
        otherData.direction || 'ltr',
        otherData.flag_emoji || '🌐'
      ])
      
      metadataResult = await query(
        'SELECT * FROM language_metadata WHERE code = $1',
        [code]
      )
    } else if (Object.keys(otherData).length > 0) {
      // 기존 메타데이터 업데이트
      const updateFields = []
      const updateValues = []
      let paramCount = 1

      if (otherData.name !== undefined) {
        updateFields.push(`name = $${paramCount}`)
        updateValues.push(otherData.name)
        paramCount++
      }
      if (otherData.native_name !== undefined) {
        updateFields.push(`native_name = $${paramCount}`)
        updateValues.push(otherData.native_name)
        paramCount++
      }
      if (otherData.google_code !== undefined) {
        updateFields.push(`google_code = $${paramCount}`)
        updateValues.push(otherData.google_code)
        paramCount++
      }
      if (otherData.direction !== undefined) {
        updateFields.push(`direction = $${paramCount}`)
        updateValues.push(otherData.direction)
        paramCount++
      }
      if (otherData.flag_emoji !== undefined) {
        updateFields.push(`flag_emoji = $${paramCount}`)
        updateValues.push(otherData.flag_emoji)
        paramCount++
      }

      if (updateFields.length > 0) {
        updateFields.push(`updated_at = $${paramCount}`)
        updateValues.push(new Date())
        paramCount++
        
        updateValues.push(code)
        
        await query(
          `UPDATE language_metadata 
           SET ${updateFields.join(', ')} 
           WHERE code = $${paramCount}`,
          updateValues
        )
        
        metadataResult = await query(
          'SELECT * FROM language_metadata WHERE code = $1',
          [code]
        )
      }
    }

    // 현재 설정 조회
    const settingsResult = await query(
      'SELECT selected_languages, default_language FROM language_settings LIMIT 1'
    )

    if (settingsResult.rows.length === 0) {
      // 설정이 없으면 생성
      await query(`
        INSERT INTO language_settings (selected_languages, default_language, created_at, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        JSON.stringify(enabled ? [code] : []),
        otherData.is_default ? code : 'ko'
      ])
    } else {
      let selectedLanguages: string[] = Array.isArray(settingsResult.rows[0].selected_languages) 
        ? settingsResult.rows[0].selected_languages 
        : JSON.parse(settingsResult.rows[0].selected_languages)
      const defaultLanguage = settingsResult.rows[0].default_language

      // 활성화/비활성화 처리
      if (enabled && !selectedLanguages.includes(code)) {
        if (selectedLanguages.length >= this.MAX_ACTIVE_LANGUAGES) {
          throw new Error(`최대 ${this.MAX_ACTIVE_LANGUAGES}개의 언어만 활성화할 수 있습니다.`)
        }
        selectedLanguages.push(code)
      } else if (!enabled && selectedLanguages.includes(code)) {
        if (code === defaultLanguage) {
          throw new Error('기본 언어는 비활성화할 수 없습니다.')
        }
        selectedLanguages = selectedLanguages.filter(lang => lang !== code)
      }

      // 기본 언어 설정
      const newDefaultLanguage = otherData.is_default ? code : defaultLanguage

      await query(`
        UPDATE language_settings 
        SET selected_languages = $1, default_language = $2, updated_at = CURRENT_TIMESTAMP
        WHERE true
      `, [JSON.stringify(selectedLanguages), newDefaultLanguage])
    }

    // 캐시 무효화
    this._languages = null
    this._cacheExpiry = 0

    // 최신 설정으로 Language 객체 반환
    const finalSettingsResult = await query(
      'SELECT selected_languages, default_language FROM language_settings LIMIT 1'
    )
    const finalSelectedLanguages: string[] = Array.isArray(finalSettingsResult.rows[0].selected_languages) 
      ? finalSettingsResult.rows[0].selected_languages 
      : JSON.parse(finalSettingsResult.rows[0].selected_languages)
    const finalDefaultLanguage = finalSettingsResult.rows[0].default_language

    const row = metadataResult.rows[0]
    return {
      code: row.code,
      name: row.name,
      native_name: row.native_name,
      google_code: row.google_code,
      direction: row.direction,
      flag_emoji: row.flag_emoji,
      enabled: finalSelectedLanguages.includes(code),
      is_default: code === finalDefaultLanguage,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }
  }

  /**
   * 캐시 무효화
   */
  clearCache(): void {
    this._languages = null
    this._cacheExpiry = 0
  }

  /**
   * 언어팩 환경변수 형태로 조회 (하위 호환성)
   */
  async getLanguageCodesForEnv(): Promise<string> {
    const languages = await this.getEnabledLanguages()
    return languages.map(lang => lang.code).join(',')
  }

  /**
   * 기본 언어 코드 조회 (하위 호환성)
   */
  async getDefaultLanguageCode(): Promise<string> {
    const defaultLang = await this.getDefaultLanguage()
    return defaultLang?.code || 'ko'
  }
}

// 싱글톤 인스턴스 export
export const languageManager = LanguageManager.getInstance()

// 편의 함수들
export async function getEnabledLanguages(): Promise<Language[]> {
  return languageManager.getEnabledLanguages()
}

export async function getLanguageCodes(): Promise<string[]> {
  return languageManager.getLanguageCodes()
}

export async function getDefaultLanguage(): Promise<Language | null> {
  return languageManager.getDefaultLanguage()
}

export async function getTranslation(key: string, languageCode: string): Promise<string | null> {
  return languageManager.getTranslation(key, languageCode)
}

export async function getTranslations(keys: string[], languageCode: string): Promise<Record<string, string>> {
  return languageManager.getTranslations(keys, languageCode)
}

// 환경변수 방식과의 호환성을 위한 함수
export async function getSupportedLanguages(): Promise<string[]> {
  const envLanguages = process.env.DEFAULT_LANGUAGES?.split(',') || ['ko', 'en', 'jp']
  const dbLanguages = await getLanguageCodes()
  
  // DB에 설정된 언어가 있으면 그것을 사용, 없으면 환경변수 사용
  return dbLanguages.length > 0 ? dbLanguages : envLanguages
}

export async function getDefaultLanguageCode(): Promise<string> {
  const defaultLang = await getDefaultLanguage()
  return defaultLang?.code || process.env.DEFAULT_LANGUAGE || 'ko'
}