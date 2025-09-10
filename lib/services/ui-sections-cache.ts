import fs from 'fs/promises';
import path from 'path';
import { query } from '@/lib/db';
import { logger } from '@/lib/logger';

interface UISection {
  id: string;
  key: string;
  title: string;
  type: string;
  order: number;
  isActive: boolean;
  visible: boolean;
  data: any;
  translations: any;
  createdAt?: string;
  updatedAt?: string;
}

interface CacheManifest {
  lastUpdated: string;
  languages: string[];
  sections: {
    [sectionKey: string]: {
      type: string;
      order: number;
      isActive: boolean;
      lastModified: string;
    }
  };
}

export class UISectionsCacheService {
  private static instance: UISectionsCacheService;
  private readonly cacheDir = path.join(process.cwd(), 'public', 'cache', 'ui-sections');
  private readonly manifestPath = path.join(this.cacheDir, 'manifest.json');

  public static getInstance(): UISectionsCacheService {
    if (!UISectionsCacheService.instance) {
      UISectionsCacheService.instance = new UISectionsCacheService();
    }
    return UISectionsCacheService.instance;
  }

  /**
   * Ensure cache directory exists
   */
  private async ensureCacheDir(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create cache directory:', error);
      throw error;
    }
  }

  /**
   * Get active languages from database
   */
  private async getActiveLanguages(): Promise<string[]> {
    try {
      const result = await query(`
        SELECT code FROM language_settings 
        WHERE enabled = true 
        ORDER BY is_default DESC, code ASC
      `);
      const languages = result.rows.map(row => row.code).filter(code => code && code.trim());
      
      // 빈 배열이면 기본값 사용
      if (languages.length === 0) {
        logger.warn('No enabled languages found, using defaults');
        return ['ko', 'en', 'fr'];
      }
      
      return languages;
    } catch (error) {
      logger.warn('Failed to get active languages, using defaults:', error);
      return ['ko', 'en', 'fr']; // 기본값
    }
  }

  /**
   * Fetch all UI sections from database
   */
  private async fetchAllSections(): Promise<UISection[]> {
    try {
      const result = await query(`
        SELECT * FROM ui_sections 
        WHERE "isActive" = true 
        ORDER BY "order" ASC
      `);

      return result.rows.map(section => ({
        id: section.id,
        key: section.key,
        title: section.title,
        type: section.type,
        order: section.order,
        isActive: section.isActive,
        visible: section.isActive,
        data: typeof section.data === 'string' ? JSON.parse(section.data) : section.data,
        translations: typeof section.translations === 'string' ? JSON.parse(section.translations || '{}') : section.translations,
        createdAt: section.createdAt?.toISOString(),
        updatedAt: section.updatedAt?.toISOString()
      }));
    } catch (error) {
      logger.error('Failed to fetch UI sections:', error);
      throw error;
    }
  }

  /**
   * Get language pack translations for UI sections
   */
  private async getLanguagePackTranslations(languageCode: string): Promise<Record<string, string>> {
    try {
      const result = await query(`
        SELECT lpk.key_name, lpt.translation
        FROM language_pack_keys lpk
        JOIN language_pack_translations lpt ON lpk.id = lpt.key_id
        WHERE lpt.language_code = $1
          AND lpk.component_type = 'section'
        ORDER BY lpk.key_name
      `, [languageCode]);

      const translations: Record<string, string> = {};
      result.rows.forEach(row => {
        translations[row.key_name] = row.translation;
      });
      return translations;
    } catch (error) {
      logger.warn(`Failed to get language pack translations for ${languageCode}:`, error);
      return {};
    }
  }

  /**
   * Process sections with language pack integration
   */
  private async processSectionsWithLanguagePack(sections: UISection[], languageCode: string) {
    const languagePackTranslations = await this.getLanguagePackTranslations(languageCode);

    return sections.map(section => {
      // section.title이나 section.data.title에서 언어팩 키 찾기
      const languagePackKey = section.data?.languagePackKey || 
                             `section.${section.key}.title` ||
                             `section.${section.type}.${section.key}`;

      // 언어팩 번역이 있으면 사용, 없으면 기본값
      const translatedTitle = languagePackTranslations[languagePackKey] || 
                             section.translations?.[languageCode]?.title ||
                             section.title;

      // 콘텐츠도 언어팩 적용
      const processedData = { ...section.data };
      if (section.data && typeof section.data === 'object') {
        Object.keys(section.data).forEach(key => {
          const dataKey = `section.${section.key}.${key}`;
          if (languagePackTranslations[dataKey]) {
            processedData[key] = languagePackTranslations[dataKey];
          }
        });
      }

      return {
        ...section,
        title: translatedTitle,
        data: processedData,
        languagePackKey,
        language: languageCode
      };
    });
  }

  /**
   * Generate cache manifest
   */
  private async generateManifest(sections: UISection[], languages: string[]): Promise<CacheManifest> {
    const manifest: CacheManifest = {
      lastUpdated: new Date().toISOString(),
      languages,
      sections: {}
    };

    sections.forEach(section => {
      manifest.sections[section.key] = {
        type: section.type,
        order: section.order,
        isActive: section.isActive,
        lastModified: section.updatedAt || new Date().toISOString()
      };
    });

    return manifest;
  }

  /**
   * Write cache files to disk
   */
  private async writeCacheFiles(languageCode: string, data: any): Promise<void> {
    const filePath = path.join(this.cacheDir, `sections-${languageCode}.json`);
    
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      logger.info(`Generated cache file: sections-${languageCode}.json`);
    } catch (error) {
      logger.error(`Failed to write cache file for ${languageCode}:`, error);
      throw error;
    }
  }

  /**
   * Write manifest file
   */
  private async writeManifest(manifest: CacheManifest): Promise<void> {
    try {
      await fs.writeFile(this.manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
      logger.info('Generated cache manifest.json');
    } catch (error) {
      logger.error('Failed to write manifest file:', error);
      throw error;
    }
  }

  /**
   * Generate all cache files
   */
  public async generateCache(): Promise<{ success: boolean; languages: string[]; sectionsCount: number; }> {
    try {
      logger.info('Starting UI sections cache generation...');
      
      await this.ensureCacheDir();
      
      const languages = await this.getActiveLanguages();
      const sections = await this.fetchAllSections();
      
      logger.info(`Found ${sections.length} sections, ${languages.length} languages`);

      // 각 언어별로 캐시 파일 생성
      for (const languageCode of languages) {
        const processedSections = await this.processSectionsWithLanguagePack(sections, languageCode);
        
        const cacheData = {
          language: languageCode,
          lastUpdated: new Date().toISOString(),
          sectionsCount: processedSections.length,
          sections: processedSections
        };
        
        await this.writeCacheFiles(languageCode, cacheData);
      }

      // 매니페스트 파일 생성
      const manifest = await this.generateManifest(sections, languages);
      await this.writeManifest(manifest);

      logger.info(`UI sections cache generation completed successfully for ${languages.join(', ')}`);
      
      return {
        success: true,
        languages,
        sectionsCount: sections.length
      };
    } catch (error) {
      logger.error('Failed to generate UI sections cache:', error);
      return {
        success: false,
        languages: [],
        sectionsCount: 0
      };
    }
  }

  /**
   * Read cache file for specific language
   */
  public async readCache(languageCode: string): Promise<any> {
    const filePath = path.join(this.cacheDir, `sections-${languageCode}.json`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      logger.warn(`Cache file not found for ${languageCode}, generating new cache...`);
      await this.generateCache();
      
      // 재시도
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
      } catch (retryError) {
        logger.error(`Failed to read cache file after generation for ${languageCode}:`, retryError);
        return null;
      }
    }
  }

  /**
   * Check if cache is valid and up-to-date
   */
  public async isCacheValid(): Promise<boolean> {
    try {
      // 매니페스트 파일 확인
      const manifestContent = await fs.readFile(this.manifestPath, 'utf-8');
      const manifest: CacheManifest = JSON.parse(manifestContent);
      
      // 1시간 이내 캐시는 유효한 것으로 간주
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const lastUpdated = new Date(manifest.lastUpdated);
      
      if (lastUpdated < oneHourAgo) {
        return false;
      }

      // 모든 언어 파일이 존재하는지 확인
      for (const language of manifest.languages) {
        const filePath = path.join(this.cacheDir, `sections-${language}.json`);
        try {
          await fs.access(filePath);
        } catch {
          return false; // 파일이 없으면 캐시 무효
        }
      }

      return true;
    } catch (error) {
      return false; // 매니페스트가 없거나 읽기 실패하면 캐시 무효
    }
  }

  /**
   * Clear all cache files
   */
  public async clearCache(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(this.cacheDir, file));
          logger.info(`Deleted cache file: ${file}`);
        }
      }
      
      logger.info('UI sections cache cleared successfully');
    } catch (error) {
      logger.error('Failed to clear cache:', error);
    }
  }
}

// Export singleton instance
export const uiSectionsCacheService = UISectionsCacheService.getInstance();