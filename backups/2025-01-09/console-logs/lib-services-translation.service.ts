// Google Translate API Service
// 설치 필요: npm install @google-cloud/translate

interface TranslationOptions {
  from?: string;
  to: string;
}

interface TranslatedContent {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

interface MultilingualContent {
  ko: string;
  en: string;
  jp: string;
}

export class TranslationService {
  private apiKey: string;
  private apiUrl = 'https://translation.googleapis.com/language/translate/v2';
  private isEnabled: boolean = false;

  constructor() {
    this.apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Google Translate API key is not configured');
    }
  }

  /**
   * 데이터베이스에서 API 설정 로드
   */
  private async loadApiSettings(): Promise<{ apiKey: string; enabled: boolean }> {
    try {
      const { query } = await import('@/lib/db');
      const result = await query(
        `SELECT key, value FROM system_settings 
         WHERE key IN ('google_translate_api_key', 'google_translate_enabled')`
      );

      let dbApiKey = '';
      let dbEnabled = false;

      result.rows.forEach(row => {
        if (row.key === 'google_translate_api_key') {
          dbApiKey = row.value || '';
        } else if (row.key === 'google_translate_enabled') {
          dbEnabled = row.value === 'true';
        }
      });

      // DB 설정이 있으면 우선 사용, 없으면 환경변수 사용
      const finalApiKey = dbApiKey || this.apiKey;
      const finalEnabled = dbApiKey ? dbEnabled : !!this.apiKey;

      return { apiKey: finalApiKey, enabled: finalEnabled };
    } catch (error) {
      console.warn('Failed to load API settings from database, using environment variables:', error);
      return { apiKey: this.apiKey, enabled: !!this.apiKey };
    }
  }

  /**
   * 단일 텍스트 번역
   */
  async translateText(text: string, options: TranslationOptions): Promise<TranslatedContent> {
    // DB에서 설정 로드
    const settings = await this.loadApiSettings();
    
    if (!settings.apiKey) {
      throw new Error('Google Translate API key is not configured');
    }

    if (!settings.enabled) {
      console.warn('Google Translate API is disabled');
      return {
        originalText: text,
        translatedText: text,
        sourceLang: options.from || 'auto',
        targetLang: options.to
      };
    }

    if (!text || !text.trim()) {
      return {
        originalText: text,
        translatedText: text,
        sourceLang: options.from || 'auto',
        targetLang: options.to
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}?key=${settings.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: options.from,
          target: options.to,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.statusText}`);
      }

      const data = await response.json();
      const translation = data.data.translations[0];

      return {
        originalText: text,
        translatedText: translation.translatedText,
        sourceLang: translation.detectedSourceLanguage || options.from || 'auto',
        targetLang: options.to
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  /**
   * 여러 텍스트 동시 번역
   */
  async translateBatch(texts: string[], options: TranslationOptions): Promise<TranslatedContent[]> {
    // DB에서 설정 로드
    const settings = await this.loadApiSettings();
    
    if (!settings.apiKey) {
      throw new Error('Google Translate API key is not configured');
    }

    if (!settings.enabled) {
      console.warn('Google Translate API is disabled');
      return texts.map(text => ({
        originalText: text,
        translatedText: text,
        sourceLang: options.from || 'auto',
        targetLang: options.to
      }));
    }

    const validTexts = texts.filter(text => text && text.trim());
    if (validTexts.length === 0) {
      return texts.map(text => ({
        originalText: text,
        translatedText: text,
        sourceLang: options.from || 'auto',
        targetLang: options.to
      }));
    }

    try {
      const response = await fetch(`${this.apiUrl}?key=${settings.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: validTexts,
          source: options.from,
          target: options.to,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.statusText}`);
      }

      const data = await response.json();
      const translations = data.data.translations;

      return validTexts.map((text, index) => ({
        originalText: text,
        translatedText: translations[index].translatedText,
        sourceLang: translations[index].detectedSourceLanguage || options.from || 'auto',
        targetLang: options.to
      }));
    } catch (error) {
      console.error('Batch translation error:', error);
      throw error;
    }
  }

  /**
   * 한국어 텍스트를 영어와 일본어로 번역 (하위 호환성)
   */
  async translateToMultiLanguages(koreanText: string): Promise<MultilingualContent> {
    if (!koreanText || !koreanText.trim()) {
      return {
        ko: koreanText,
        en: koreanText,
        jp: koreanText
      };
    }

    try {
      const [englishResult, japaneseResult] = await Promise.all([
        this.translateText(koreanText, { from: 'ko', to: 'en' }),
        this.translateText(koreanText, { from: 'ko', to: 'jp' })
      ]);

      return {
        ko: koreanText,
        en: englishResult.translatedText,
        jp: japaneseResult.translatedText
      };
    } catch (error) {
      console.error('Multi-language translation error:', error);
      // 에러 발생 시 원본 텍스트 반환
      return {
        ko: koreanText,
        en: koreanText,
        jp: koreanText
      };
    }
  }

  /**
   * 동적 언어 지원 - 모든 활성화된 언어로 번역
   */
  async translateToAllLanguages(sourceText: string, sourceLanguage: string = 'ko'): Promise<Record<string, string>> {
    if (!sourceText || !sourceText.trim()) {
      return {};
    }

    try {
      // 언어 매니저를 동적으로 import하여 순환 참조 방지
      const { languageManager } = await import('./language-manager');
      const languages = await languageManager.getEnabledLanguages();
      
      const translations: Record<string, string> = {};
      translations[sourceLanguage] = sourceText; // 원본 언어 추가
      
      // 원본 언어가 아닌 다른 언어들로 번역
      const targetLanguages = languages.filter(lang => lang.code !== sourceLanguage);
      
      const translationPromises = targetLanguages.map(async (lang) => {
        try {
          const result = await this.translateText(sourceText, {
            from: sourceLanguage,
            to: lang.google_code
          });
          return { code: lang.code, text: result.translatedText };
        } catch (error) {
          console.error(`Translation failed for ${lang.code}:`, error);
          return { code: lang.code, text: sourceText }; // 실패 시 원본 텍스트
        }
      });
      
      const results = await Promise.all(translationPromises);
      results.forEach(result => {
        translations[result.code] = result.text;
      });
      
      return translations;
    } catch (error) {
      console.error('Dynamic multi-language translation error:', error);
      // 에러 발생 시 원본만 반환
      return { [sourceLanguage]: sourceText };
    }
  }

  /**
   * 캠페인 데이터 번역
   */
  async translateCampaignData(campaignData: any): Promise<any> {
    const fieldsToTranslate = ['title', 'description', 'requirements'];
    const translatedData: any = {};

    for (const field of fieldsToTranslate) {
      if (campaignData[field]) {
        try {
          const multilingualContent = await this.translateToMultiLanguages(campaignData[field]);
          translatedData[`${field}_ko`] = multilingualContent.ko;
          translatedData[`${field}_en`] = multilingualContent.en;
          translatedData[`${field}_ja`] = multilingualContent.jp;
        } catch (error) {
          console.error(`Failed to translate ${field}:`, error);
          // 번역 실패 시 원본 텍스트 사용
          translatedData[`${field}_ko`] = campaignData[field];
          translatedData[`${field}_en`] = campaignData[field];
          translatedData[`${field}_ja`] = campaignData[field];
        }
      }
    }

    // 해시태그 번역
    if (campaignData.hashtags) {
      const hashtags = Array.isArray(campaignData.hashtags) 
        ? campaignData.hashtags 
        : campaignData.hashtags.split(',').map((tag: string) => tag.trim());
      
      try {
        const translatedHashtagsEn = await this.translateBatch(hashtags, { from: 'ko', to: 'en' });
        const translatedHashtagsJa = await this.translateBatch(hashtags, { from: 'ko', to: 'jp' });
        
        translatedData.hashtags_ko = hashtags;
        translatedData.hashtags_en = translatedHashtagsEn.map(t => t.translatedText);
        translatedData.hashtags_ja = translatedHashtagsJa.map(t => t.translatedText);
      } catch (error) {
        console.error('Failed to translate hashtags:', error);
        translatedData.hashtags_ko = hashtags;
        translatedData.hashtags_en = hashtags;
        translatedData.hashtags_ja = hashtags;
      }
    }

    return { ...campaignData, ...translatedData };
  }

  /**
   * 메뉴 아이템 번역
   */
  async translateMenuItem(menuItem: any, targetLang: string = 'en'): Promise<any> {
    if (!menuItem.label) {
      return menuItem;
    }

    try {
      const translatedLabel = await this.translateText(menuItem.label, { 
        from: 'ko', 
        to: targetLang 
      });

      return {
        ...menuItem,
        [`label_${targetLang}`]: translatedLabel.translatedText
      };
    } catch (error) {
      console.error('Failed to translate menu item:', error);
      return {
        ...menuItem,
        [`label_${targetLang}`]: menuItem.label
      };
    }
  }

  /**
   * 언어 감지
   */
  async detectLanguage(text: string): Promise<string> {
    // DB에서 설정 로드
    const settings = await this.loadApiSettings();
    
    if (!settings.apiKey) {
      throw new Error('Google Translate API key is not configured');
    }

    if (!settings.enabled) {
      throw new Error('Google Translate API is disabled');
    }

    try {
      const response = await fetch(`${this.apiUrl}/detect?key=${settings.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text
        })
      });

      if (!response.ok) {
        throw new Error(`Language detection API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.detections[0][0].language;
    } catch (error) {
      console.error('Language detection error:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
export const translationService = new TranslationService();

// 간단한 번역 함수 (UI에서 사용)
export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  try {
    // 빈 텍스트 체크
    if (!text || text.trim() === '') {
      return text;
    }

    // 같은 언어면 그대로 반환
    if (sourceLanguage === targetLanguage) {
      return text;
    }

    const service = new TranslationService();
    const result = await service.translateText(text, { 
      from: sourceLanguage, 
      to: targetLanguage 
    });
    
    return result.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    // 오류 시 원본 텍스트 반환
    return text;
  }
}