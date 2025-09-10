import { query } from '@/lib/db'

export interface Language {
  code: string
  name: string
  native_name?: string
  google_code?: string
  direction?: string
  flag_emoji?: string
  enabled: boolean
  is_default: boolean
  display_order?: number
  created_at?: Date
  updated_at?: Date
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
 * language_settings 테이블 기반 동적 언어 설정 관리
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

  clearCache(): void {
    console.log('🧹 Clearing language cache...')
    this._languages = null
    this._cacheExpiry = 0
  }

  /**
   * 활성화된 언어 목록 조회 (캐시됨)
   */
  async getEnabledLanguages(): Promise<Language[]> {
    if (this._languages && Date.now() < this._cacheExpiry) {
      return this._languages
    }

    const result = await query(
      `SELECT * FROM language_settings 
       WHERE enabled = true 
       ORDER BY is_default DESC, display_order ASC, name ASC`
    )

    const languages: Language[] = result.rows.map(row => ({
      code: row.code,
      name: row.name,
      native_name: row.native_name || row.name,
      google_code: row.google_code || row.code,
      direction: row.direction || 'ltr',
      flag_emoji: row.flag_emoji || '🌐',
      enabled: true,
      is_default: row.is_default || false,
      display_order: row.display_order,
      created_at: row.created_at ? new Date(row.created_at) : undefined,
      updated_at: row.updated_at ? new Date(row.updated_at) : undefined
    }))

    this._languages = languages
    this._cacheExpiry = Date.now() + this.CACHE_DURATION

    return languages
  }

  /**
   * 모든 언어 목록 조회 (활성/비활성 모두 포함)
   */
  async getAllLanguages(): Promise<Language[]> {
    const result = await query(
      `SELECT * FROM language_settings 
       ORDER BY display_order ASC, name ASC`
    )

    return result.rows.map(row => ({
      code: row.code,
      name: row.name,
      native_name: row.native_name || row.name,
      google_code: row.google_code || row.code,
      direction: row.direction || 'ltr',
      flag_emoji: row.flag_emoji || '🌐',
      enabled: row.enabled || false,
      is_default: row.is_default || false,
      display_order: row.display_order,
      created_at: row.created_at ? new Date(row.created_at) : undefined,
      updated_at: row.updated_at ? new Date(row.updated_at) : undefined
    }))
  }

  /**
   * 기본 언어 조회
   */
  async getDefaultLanguage(): Promise<Language | null> {
    const result = await query(
      'SELECT * FROM language_settings WHERE is_default = true LIMIT 1'
    )

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      code: row.code,
      name: row.name,
      native_name: row.native_name || row.name,
      google_code: row.google_code || row.code,
      direction: row.direction || 'ltr',
      flag_emoji: row.flag_emoji || '🌐',
      enabled: true,
      is_default: true,
      display_order: row.display_order,
      created_at: row.created_at ? new Date(row.created_at) : undefined,
      updated_at: row.updated_at ? new Date(row.updated_at) : undefined
    }
  }

  /**
   * 언어 코드로 언어 조회
   */
  async getLanguageByCode(code: string): Promise<Language | null> {
    const result = await query(
      'SELECT * FROM language_settings WHERE code = $1',
      [code]
    )

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      code: row.code,
      name: row.name,
      native_name: row.native_name || row.name,
      google_code: row.google_code || row.code,
      direction: row.direction || 'ltr',
      flag_emoji: row.flag_emoji || '🌐',
      enabled: row.enabled || false,
      is_default: row.is_default || false,
      display_order: row.display_order,
      created_at: row.created_at ? new Date(row.created_at) : undefined,
      updated_at: row.updated_at ? new Date(row.updated_at) : undefined
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
      JOIN language_settings l ON t.language_code = l.code
      WHERE t.key = $1
    `, [key])

    const translations: Record<string, Translation> = {}
    
    result.rows.forEach(row => {
      translations[row.language_code] = {
        id: row.id,
        key: row.key,
        language_code: row.language_code,
        value: row.value,
        status: row.status,
        translated_by: row.translated_by,
        translated_at: row.translated_at ? new Date(row.translated_at) : undefined,
        verified_by: row.verified_by,
        verified_at: row.verified_at ? new Date(row.verified_at) : undefined,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at)
      }
    })

    return translations
  }

  /**
   * 특정 언어와 키에 대한 번역 조회
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
   * 활성 언어 개수 확인
   */
  async getActiveLanguageCount(): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) as count FROM language_settings WHERE enabled = true'
    )
    
    return parseInt(result.rows[0].count, 10)
  }

  /**
   * 언어 활성화 가능 여부 확인
   */
  async canActivateLanguage(code: string): Promise<boolean> {
    // 이미 활성화된 언어인지 확인
    const language = await this.getLanguageByCode(code)
    if (language && language.enabled) {
      return true
    }

    // 활성 언어 개수 확인
    const activeCount = await this.getActiveLanguageCount()
    return activeCount < this.MAX_ACTIVE_LANGUAGES
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
    display_order?: number
  }): Promise<Language> {
    const { code, ...otherData } = languageData
    
    if (!code) {
      throw new Error('언어 코드는 필수입니다.')
    }

    // 활성화 제한 체크
    if (otherData.enabled) {
      const canActivate = await this.canActivateLanguage(code)
      if (!canActivate) {
        throw new Error(`최대 ${this.MAX_ACTIVE_LANGUAGES}개의 언어만 활성화할 수 있습니다.`)
      }
    }

    // 기존 언어 정보 가져오기 (있는 경우)
    const existingLanguage = await this.getLanguageByCode(code)
    
    // 기본값 설정
    const name = otherData.name || existingLanguage?.name || code.toUpperCase()
    const native_name = otherData.native_name || existingLanguage?.native_name || name
    const google_code = otherData.google_code || existingLanguage?.google_code || code
    const direction = otherData.direction || existingLanguage?.direction || 'ltr'
    const flag_emoji = otherData.flag_emoji || existingLanguage?.flag_emoji || '🌐'
    const enabled = otherData.enabled !== undefined ? otherData.enabled : (existingLanguage?.enabled || false)
    const is_default = otherData.is_default !== undefined ? otherData.is_default : (existingLanguage?.is_default || false)
    const display_order = otherData.display_order || existingLanguage?.display_order || null

    // Upsert 실행
    const result = await query(`
      INSERT INTO language_settings (
        code, name, native_name, google_code, direction, flag_emoji, 
        enabled, is_default, display_order, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT (code) DO UPDATE SET
        name = $2,
        native_name = $3,
        google_code = $4,
        direction = $5,
        flag_emoji = $6,
        enabled = $7,
        is_default = $8,
        display_order = $9,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      code,
      name,
      native_name,
      google_code,
      direction,
      flag_emoji,
      enabled,
      is_default,
      display_order
    ])

    // 캐시 무효화
    this.clearCache()

    const row = result.rows[0]
    return {
      code: row.code,
      name: row.name,
      native_name: row.native_name || row.name,
      google_code: row.google_code || row.code,
      direction: row.direction || 'ltr',
      flag_emoji: row.flag_emoji || '🌐',
      enabled: row.enabled || false,
      is_default: row.is_default || false,
      display_order: row.display_order,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }
  }

  /**
   * 언어 활성화
   */
  async enableLanguage(code: string): Promise<boolean> {
    if (!await this.canActivateLanguage(code)) {
      throw new Error(`최대 ${this.MAX_ACTIVE_LANGUAGES}개의 언어만 활성화할 수 있습니다.`)
    }

    const result = await query(
      'UPDATE language_settings SET enabled = true, updated_at = CURRENT_TIMESTAMP WHERE code = $1',
      [code]
    )

    this.clearCache()
    return result.rowCount > 0
  }

  /**
   * 언어 비활성화
   */
  async disableLanguage(code: string): Promise<boolean> {
    // 기본 언어는 비활성화 불가
    const language = await this.getLanguageByCode(code)
    if (language && language.is_default) {
      throw new Error('기본 언어는 비활성화할 수 없습니다.')
    }

    const result = await query(
      'UPDATE language_settings SET enabled = false, updated_at = CURRENT_TIMESTAMP WHERE code = $1',
      [code]
    )

    this.clearCache()
    return result.rowCount > 0
  }

  /**
   * 기본 언어 설정
   */
  async setDefaultLanguage(code: string): Promise<boolean> {
    await query('BEGIN')
    
    try {
      // 기존 기본 언어 해제
      await query('UPDATE language_settings SET is_default = false')
      
      // 새 기본 언어 설정 및 활성화
      await query(
        'UPDATE language_settings SET is_default = true, enabled = true, updated_at = CURRENT_TIMESTAMP WHERE code = $1',
        [code]
      )
      
      await query('COMMIT')
      this.clearCache()
      return true
    } catch (error) {
      await query('ROLLBACK')
      throw error
    }
  }

  /**
   * 번역 저장 또는 업데이트
   */
  async saveTranslation(
    key: string, 
    languageCode: string, 
    value: string,
    status: 'auto' | 'manual' | 'verified' = 'manual',
    translatedBy: string = 'system'
  ): Promise<Translation> {
    const result = await query(`
      INSERT INTO language_pack_translations (
        key, language_code, value, status, translated_by, translated_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT (key, language_code) DO UPDATE SET
        value = $3,
        status = $4,
        translated_by = $5,
        translated_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [key, languageCode, value, status, translatedBy])

    const row = result.rows[0]
    return {
      id: row.id,
      key: row.key,
      language_code: row.language_code,
      value: row.value,
      status: row.status,
      translated_by: row.translated_by,
      translated_at: row.translated_at ? new Date(row.translated_at) : undefined,
      verified_by: row.verified_by,
      verified_at: row.verified_at ? new Date(row.verified_at) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    }
  }

  /**
   * 번역 삭제
   */
  async deleteTranslation(key: string, languageCode?: string): Promise<boolean> {
    let result
    
    if (languageCode) {
      result = await query(
        'DELETE FROM language_pack_translations WHERE key = $1 AND language_code = $2',
        [key, languageCode]
      )
    } else {
      result = await query(
        'DELETE FROM language_pack_translations WHERE key = $1',
        [key]
      )
    }

    return result.rowCount > 0
  }
}

// 싱글톤 인스턴스 생성 및 export
export const languageManager = LanguageManager.getInstance()