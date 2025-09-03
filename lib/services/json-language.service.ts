/**
 * JSON 언어 파일 통합 관리 서비스
 * 다국어 JSON 파일의 로딩, 동기화, 캐싱을 담당
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '@/lib/logger';

export type LanguageCode = 'ko' | 'en' | 'jp';

export interface JsonLanguageData {
  version: string;
  lastUpdated: string;
  language: LanguageCode;
  sectionOrder: string[];
  sections: Record<string, unknown>;
}

export interface SyncResult {
  success: boolean;
  updatedLanguages: LanguageCode[];
  errors: { language: LanguageCode; error: string }[];
  timestamp: string;
}

export class JsonLanguageService {
  private static instance: JsonLanguageService;
  private cache: Map<LanguageCode, JsonLanguageData> = new Map();
  private cacheExpiry: Map<LanguageCode, number> = new Map();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5분 캐시
  private readonly baseDir = path.join(process.cwd(), 'public/i18n');

  private constructor() {}

  static getInstance(): JsonLanguageService {
    if (!JsonLanguageService.instance) {
      JsonLanguageService.instance = new JsonLanguageService();
    }
    return JsonLanguageService.instance;
  }

  /**
   * 특정 언어의 섹션 데이터 로드
   */
  async loadLanguageData(language: LanguageCode): Promise<JsonLanguageData | null> {
    try {
      // 캐시 확인
      const cached = this.cache.get(language);
      const cacheTime = this.cacheExpiry.get(language);
      
      if (cached && cacheTime && Date.now() < cacheTime) {
        logger.info(`Using cached data for language: ${language}`);
        return cached;
      }

      // 파일에서 로드
      const filePath = path.join(this.baseDir, language, 'sections.json');
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data: JsonLanguageData = JSON.parse(fileContent);

      // 캐시 업데이트
      this.cache.set(language, data);
      this.cacheExpiry.set(language, Date.now() + this.cacheTimeout);

      logger.info(`Loaded language data: ${language}`);
      return data;
    } catch (error) {
      logger.error(`Failed to load language data for ${language}:`, error);
      return null;
    }
  }

  /**
   * 모든 언어 데이터 로드 (병렬 처리)
   */
  async loadAllLanguages(): Promise<Record<LanguageCode, JsonLanguageData | null>> {
    const languages: LanguageCode[] = ['ko', 'en', 'jp'];
    const results = await Promise.allSettled(
      languages.map(lang => this.loadLanguageData(lang))
    );

    const data: Record<LanguageCode, JsonLanguageData | null> = {} as unknown;
    languages.forEach((lang, index) => {
      const result = results[index];
      data[lang] = result.status === 'fulfilled' ? result.value : null;
    });

    return data;
  }

  /**
   * 섹션 순서 업데이트 (모든 언어 동기화)
   */
  async updateSectionOrder(newOrder: string[]): Promise<SyncResult> {
    const timestamp = new Date().toISOString();
    const version = this.generateVersion();
    const updatedLanguages: LanguageCode[] = [];
    const errors: { language: LanguageCode; error: string }[] = [];

    const languages: LanguageCode[] = ['ko', 'en', 'jp'];

    for (const language of languages) {
      try {
        const data = await this.loadLanguageData(language);
        if (!data) {
          errors.push({ language, error: 'Failed to load existing data' });
          continue;
        }

        // 섹션 순서 및 버전 업데이트
        const updatedData: JsonLanguageData = {
          ...data,
          version,
          lastUpdated: timestamp,
          sectionOrder: newOrder
        };

        await this.saveLanguageData(language, updatedData);
        updatedLanguages.push(language);

        logger.info(`Updated section order for ${language}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push({ language, error: errorMsg });
        logger.error(`Failed to update section order for ${language}:`, error);
      }
    }

    // 캐시 무효화
    this.invalidateAllCache();

    return {
      success: errors.length === 0,
      updatedLanguages,
      errors,
      timestamp
    };
  }

  /**
   * 특정 섹션 업데이트 (모든 언어 동기화)
   */
  async updateSection(
    sectionId: string, 
    sectionData: Record<LanguageCode, any>
  ): Promise<SyncResult> {
    const timestamp = new Date().toISOString();
    const version = this.generateVersion();
    const updatedLanguages: LanguageCode[] = [];
    const errors: { language: LanguageCode; error: string }[] = [];

    const languages: LanguageCode[] = ['ko', 'en', 'jp'];

    for (const language of languages) {
      try {
        const data = await this.loadLanguageData(language);
        if (!data) {
          errors.push({ language, error: 'Failed to load existing data' });
          continue;
        }

        // 해당 언어의 섹션 데이터가 있는지 확인
        if (!sectionData[language]) {
          errors.push({ language, error: `No section data provided for ${language}` });
          continue;
        }

        // 섹션 데이터 업데이트
        const updatedData: JsonLanguageData = {
          ...data,
          version,
          lastUpdated: timestamp,
          sections: {
            ...data.sections,
            [sectionId]: {
              ...data.sections[sectionId],
              data: sectionData[language]
            }
          }
        };

        await this.saveLanguageData(language, updatedData);
        updatedLanguages.push(language);

        logger.info(`Updated section ${sectionId} for ${language}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push({ language, error: errorMsg });
        logger.error(`Failed to update section ${sectionId} for ${language}:`, error);
      }
    }

    // 캐시 무효화
    this.invalidateAllCache();

    return {
      success: errors.length === 0,
      updatedLanguages,
      errors,
      timestamp
    };
  }

  /**
   * 섹션 가시성 토글 (모든 언어 동기화)
   */
  async toggleSectionVisibility(
    sectionId: string, 
    visible: boolean
  ): Promise<SyncResult> {
    const timestamp = new Date().toISOString();
    const version = this.generateVersion();
    const updatedLanguages: LanguageCode[] = [];
    const errors: { language: LanguageCode; error: string }[] = [];

    const languages: LanguageCode[] = ['ko', 'en', 'jp'];

    for (const language of languages) {
      try {
        const data = await this.loadLanguageData(language);
        if (!data) {
          errors.push({ language, error: 'Failed to load existing data' });
          continue;
        }

        // 가시성 업데이트
        const updatedData: JsonLanguageData = {
          ...data,
          version,
          lastUpdated: timestamp,
          sections: {
            ...data.sections,
            [sectionId]: {
              ...data.sections[sectionId],
              visible
            }
          }
        };

        await this.saveLanguageData(language, updatedData);
        updatedLanguages.push(language);

        logger.info(`Updated section ${sectionId} visibility to ${visible} for ${language}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push({ language, error: errorMsg });
        logger.error(`Failed to update section ${sectionId} visibility for ${language}:`, error);
      }
    }

    // 캐시 무효화
    this.invalidateAllCache();

    return {
      success: errors.length === 0,
      updatedLanguages,
      errors,
      timestamp
    };
  }

  /**
   * 언어별 섹션 데이터 저장
   */
  private async saveLanguageData(language: LanguageCode, data: JsonLanguageData): Promise<void> {
    const filePath = path.join(this.baseDir, language, 'sections.json');
    
    // 디렉토리 확인 및 생성
    const dirPath = path.dirname(filePath);
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }

    // 파일 저장
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    
    // 캐시 업데이트
    this.cache.set(language, data);
    this.cacheExpiry.set(language, Date.now() + this.cacheTimeout);
  }

  /**
   * 버전 문자열 생성
   */
  private generateVersion(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
    
    return `${year}.${month}.${day}.${hour}${minute}`;
  }

  /**
   * 전체 캐시 무효화
   */
  invalidateAllCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
    logger.info('All language cache invalidated');
  }

  /**
   * 특정 언어 캐시 무효화
   */
  invalidateLanguageCache(language: LanguageCode): void {
    this.cache.delete(language);
    this.cacheExpiry.delete(language);
    logger.info(`Cache invalidated for language: ${language}`);
  }

  /**
   * 캐시 상태 조회
   */
  getCacheStatus(): Record<LanguageCode, { cached: boolean; expiry?: number }> {
    const languages: LanguageCode[] = ['ko', 'en', 'jp'];
    const status: Record<LanguageCode, { cached: boolean; expiry?: number }> = {} as unknown;

    languages.forEach(lang => {
      const cached = this.cache.has(lang);
      const expiry = this.cacheExpiry.get(lang);
      status[lang] = {
        cached,
        expiry: cached && expiry ? expiry : undefined
      };
    });

    return status;
  }

  /**
   * 파일 시스템 동기화 상태 확인
   */
  async validateFileSystem(): Promise<{
    valid: boolean;
    missingFiles: string[];
    corruptedFiles: string[];
  }> {
    const languages: LanguageCode[] = ['ko', 'en', 'jp'];
    const missingFiles: string[] = [];
    const corruptedFiles: string[] = [];

    for (const language of languages) {
      const filePath = path.join(this.baseDir, language, 'sections.json');
      
      try {
        await fs.access(filePath);
        
        // 파일 내용 검증
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content) as JsonLanguageData;
        
        // 필수 필드 검증
        if (!data.version || !data.language || !data.sections) {
          corruptedFiles.push(filePath);
        }
      } catch (error) {
        if ((error as unknown)?.code === 'ENOENT') {
          missingFiles.push(filePath);
        } else {
          corruptedFiles.push(filePath);
        }
      }
    }

    return {
      valid: missingFiles.length === 0 && corruptedFiles.length === 0,
      missingFiles,
      corruptedFiles
    };
  }
}

// 싱글톤 인스턴스 내보내기
export const jsonLanguageService = JsonLanguageService.getInstance();