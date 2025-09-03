/**
 * UI 설정 자동 동기화 서비스
 * Admin 패널에서의 변경사항을 모든 언어 파일에 자동 동기화
 */

import { jsonLanguageService, JsonLanguageData, LanguageCode, SyncResult } from './json-language.service';
import { logger } from '@/lib/logger';

export interface UIConfigChangeEvent {
  type: 'section-order' | 'section-update' | 'section-visibility' | 'section-add' | 'section-delete';
  sectionId?: string;
  data?: any;
  userId?: string;
  timestamp?: string;
}

export interface SectionUpdateData {
  ko?: any;
  en?: any;
  jp?: any;
}

export interface SyncStatus {
  isActive: boolean;
  lastSync?: string;
  pendingChanges: number;
  errors: string[];
}

export class UIConfigSyncService {
  private static instance: UIConfigSyncService;
  private syncQueue: UIConfigChangeEvent[] = [];
  private isProcessing = false;
  private syncStatus: SyncStatus = {
    isActive: true,
    pendingChanges: 0,
    errors: []
  };

  private constructor() {}

  static getInstance(): UIConfigSyncService {
    if (!UIConfigSyncService.instance) {
      UIConfigSyncService.instance = new UIConfigSyncService();
    }
    return UIConfigSyncService.instance;
  }

  /**
   * 섹션 순서 변경 동기화
   */
  async syncSectionOrder(newOrder: string[], userId?: string): Promise<SyncResult> {
    logger.info(`Syncing section order: ${newOrder.join(', ')}`);
    
    try {
      const result = await jsonLanguageService.updateSectionOrder(newOrder);
      
      if (result.success) {
        logger.info('Section order synchronized successfully');
        this.updateSyncStatus(true, result.timestamp);
      } else {
        logger.error('Section order sync failed:', result.errors);
        this.updateSyncStatus(false, result.timestamp, result.errors.map(e => e.error));
      }

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Section order sync error:', error);
      
      this.updateSyncStatus(false, new Date().toISOString(), [errorMsg]);
      
      return {
        success: false,
        updatedLanguages: [],
        errors: [{ language: 'ko' as LanguageCode, error: errorMsg }],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 섹션 데이터 업데이트 동기화
   */
  async syncSectionUpdate(
    sectionId: string, 
    sectionData: SectionUpdateData, 
    userId?: string
  ): Promise<SyncResult> {
    logger.info(`Syncing section update: ${sectionId}`);
    
    try {
      // 필수 언어 데이터 검증
      const languages: LanguageCode[] = ['ko', 'en', 'jp'];
      const validatedData: Record<LanguageCode, any> = {} as any;

      for (const lang of languages) {
        if (!sectionData[lang]) {
          // 기본 언어(한국어)가 있다면 복사, 없으면 오류
          if (sectionData.ko && lang !== 'ko') {
            validatedData[lang] = sectionData.ko;
            logger.warn(`Missing ${lang} data for section ${sectionId}, using Korean data as fallback`);
          } else {
            throw new Error(`Missing required language data: ${lang}`);
          }
        } else {
          validatedData[lang] = sectionData[lang];
        }
      }

      const result = await jsonLanguageService.updateSection(sectionId, validatedData);
      
      if (result.success) {
        logger.info(`Section ${sectionId} synchronized successfully`);
        this.updateSyncStatus(true, result.timestamp);
      } else {
        logger.error(`Section ${sectionId} sync failed:`, result.errors);
        this.updateSyncStatus(false, result.timestamp, result.errors.map(e => e.error));
      }

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Section ${sectionId} sync error:`, error);
      
      this.updateSyncStatus(false, new Date().toISOString(), [errorMsg]);
      
      return {
        success: false,
        updatedLanguages: [],
        errors: [{ language: 'ko' as LanguageCode, error: errorMsg }],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 섹션 가시성 토글 동기화
   */
  async syncSectionVisibility(
    sectionId: string, 
    visible: boolean, 
    userId?: string
  ): Promise<SyncResult> {
    logger.info(`Syncing section visibility: ${sectionId} = ${visible}`);
    
    try {
      const result = await jsonLanguageService.toggleSectionVisibility(sectionId, visible);
      
      if (result.success) {
        logger.info(`Section ${sectionId} visibility synchronized successfully`);
        this.updateSyncStatus(true, result.timestamp);
      } else {
        logger.error(`Section ${sectionId} visibility sync failed:`, result.errors);
        this.updateSyncStatus(false, result.timestamp, result.errors.map(e => e.error));
      }

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Section ${sectionId} visibility sync error:`, error);
      
      this.updateSyncStatus(false, new Date().toISOString(), [errorMsg]);
      
      return {
        success: false,
        updatedLanguages: [],
        errors: [{ language: 'ko' as LanguageCode, error: errorMsg }],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 새 섹션 추가 동기화
   */
  async syncSectionAdd(
    sectionId: string,
    sectionType: string,
    sectionData: SectionUpdateData,
    insertAfter?: string,
    userId?: string
  ): Promise<SyncResult> {
    logger.info(`Syncing new section add: ${sectionId} of type ${sectionType}`);
    
    try {
      // 먼저 모든 언어의 현재 데이터 로드
      const allLanguageData = await jsonLanguageService.loadAllLanguages();
      const timestamp = new Date().toISOString();
      const version = this.generateVersion();
      const updatedLanguages: LanguageCode[] = [];
      const errors: { language: LanguageCode; error: string }[] = [];

      const languages: LanguageCode[] = ['ko', 'en', 'jp'];

      for (const language of languages) {
        try {
          const currentData = allLanguageData[language];
          if (!currentData) {
            errors.push({ language, error: 'Failed to load existing data' });
            continue;
          }

          // 새 섹션 추가
          const newSection = {
            type: sectionType,
            visible: true,
            data: sectionData[language] || sectionData.ko || {}
          };

          // 섹션 순서 업데이트
          let newSectionOrder = [...currentData.sectionOrder];
          if (insertAfter) {
            const insertIndex = newSectionOrder.indexOf(insertAfter);
            if (insertIndex >= 0) {
              newSectionOrder.splice(insertIndex + 1, 0, sectionId);
            } else {
              newSectionOrder.push(sectionId);
            }
          } else {
            newSectionOrder.push(sectionId);
          }

          // 업데이트된 데이터 구성
          const updatedData: JsonLanguageData = {
            ...currentData,
            version,
            lastUpdated: timestamp,
            sectionOrder: newSectionOrder,
            sections: {
              ...currentData.sections,
              [sectionId]: newSection
            }
          };

          await this.saveLanguageData(language, updatedData);
          updatedLanguages.push(language);

          logger.info(`Added section ${sectionId} for ${language}`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors.push({ language, error: errorMsg });
          logger.error(`Failed to add section ${sectionId} for ${language}:`, error);
        }
      }

      // 캐시 무효화
      jsonLanguageService.invalidateAllCache();

      const result: SyncResult = {
        success: errors.length === 0,
        updatedLanguages,
        errors,
        timestamp
      };

      if (result.success) {
        this.updateSyncStatus(true, result.timestamp);
      } else {
        this.updateSyncStatus(false, result.timestamp, result.errors.map(e => e.error));
      }

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Section ${sectionId} add sync error:`, error);
      
      this.updateSyncStatus(false, new Date().toISOString(), [errorMsg]);
      
      return {
        success: false,
        updatedLanguages: [],
        errors: [{ language: 'ko' as LanguageCode, error: errorMsg }],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 섹션 삭제 동기화
   */
  async syncSectionDelete(sectionId: string, userId?: string): Promise<SyncResult> {
    logger.info(`Syncing section delete: ${sectionId}`);
    
    try {
      const allLanguageData = await jsonLanguageService.loadAllLanguages();
      const timestamp = new Date().toISOString();
      const version = this.generateVersion();
      const updatedLanguages: LanguageCode[] = [];
      const errors: { language: LanguageCode; error: string }[] = [];

      const languages: LanguageCode[] = ['ko', 'en', 'jp'];

      for (const language of languages) {
        try {
          const currentData = allLanguageData[language];
          if (!currentData) {
            errors.push({ language, error: 'Failed to load existing data' });
            continue;
          }

          // 섹션 삭제
          const { [sectionId]: deletedSection, ...remainingSections } = currentData.sections;
          
          // 섹션 순서에서도 제거
          const newSectionOrder = currentData.sectionOrder.filter(id => id !== sectionId);

          // 업데이트된 데이터 구성
          const updatedData: JsonLanguageData = {
            ...currentData,
            version,
            lastUpdated: timestamp,
            sectionOrder: newSectionOrder,
            sections: remainingSections
          };

          await this.saveLanguageData(language, updatedData);
          updatedLanguages.push(language);

          logger.info(`Deleted section ${sectionId} for ${language}`);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors.push({ language, error: errorMsg });
          logger.error(`Failed to delete section ${sectionId} for ${language}:`, error);
        }
      }

      // 캐시 무효화
      jsonLanguageService.invalidateAllCache();

      const result: SyncResult = {
        success: errors.length === 0,
        updatedLanguages,
        errors,
        timestamp
      };

      if (result.success) {
        this.updateSyncStatus(true, result.timestamp);
      } else {
        this.updateSyncStatus(false, result.timestamp, result.errors.map(e => e.error));
      }

      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Section ${sectionId} delete sync error:`, error);
      
      this.updateSyncStatus(false, new Date().toISOString(), [errorMsg]);
      
      return {
        success: false,
        updatedLanguages: [],
        errors: [{ language: 'ko' as LanguageCode, error: errorMsg }],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 동기화 상태 조회
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * 수동 전체 동기화 (관리자용)
   */
  async forceFullSync(): Promise<{
    success: boolean;
    syncResults: SyncResult[];
    errors: string[];
  }> {
    logger.info('Starting forced full synchronization');
    
    try {
      // 파일 시스템 상태 확인
      const validation = await jsonLanguageService.validateFileSystem();
      if (!validation.valid) {
        logger.error('File system validation failed:', validation);
        return {
          success: false,
          syncResults: [],
          errors: [
            ...validation.missingFiles.map(f => `Missing file: ${f}`),
            ...validation.corruptedFiles.map(f => `Corrupted file: ${f}`)
          ]
        };
      }

      // 모든 캐시 무효화
      jsonLanguageService.invalidateAllCache();
      
      // 모든 언어 데이터 재로드
      const allData = await jsonLanguageService.loadAllLanguages();
      const koData = allData.ko;
      
      if (!koData) {
        throw new Error('Korean language data not found');
      }

      // 한국어 데이터를 기준으로 다른 언어들과 동기화
      const syncResults: SyncResult[] = [];
      
      // 섹션 순서 동기화
      const orderSync = await this.syncSectionOrder(koData.sectionOrder);
      syncResults.push(orderSync);

      logger.info('Forced full synchronization completed');
      
      this.updateSyncStatus(true, new Date().toISOString());
      
      return {
        success: syncResults.every(r => r.success),
        syncResults,
        errors: syncResults.flatMap(r => r.errors.map(e => e.error))
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Forced full sync error:', error);
      
      this.updateSyncStatus(false, new Date().toISOString(), [errorMsg]);
      
      return {
        success: false,
        syncResults: [],
        errors: [errorMsg]
      };
    }
  }

  /**
   * 동기화 상태 업데이트
   */
  private updateSyncStatus(
    success: boolean, 
    timestamp: string, 
    errors: string[] = []
  ): void {
    this.syncStatus = {
      isActive: this.syncStatus.isActive,
      lastSync: timestamp,
      pendingChanges: success ? 0 : this.syncStatus.pendingChanges + 1,
      errors: success ? [] : [...this.syncStatus.errors, ...errors]
    };
  }

  /**
   * 언어별 데이터 저장 (private 헬퍼)
   */
  private async saveLanguageData(language: LanguageCode, data: JsonLanguageData): Promise<void> {
    // JsonLanguageService의 private 메서드를 호출할 수 없으므로 직접 구현
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const filePath = path.join(process.cwd(), 'public/i18n', language, 'sections.json');
    
    // 디렉토리 확인 및 생성
    const dirPath = path.dirname(filePath);
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }

    // 파일 저장
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * 버전 생성 (private 헬퍼)
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
   * 동기화 서비스 활성화/비활성화
   */
  setActive(active: boolean): void {
    this.syncStatus.isActive = active;
    logger.info(`UI Config Sync Service ${active ? 'activated' : 'deactivated'}`);
  }
}

// 싱글톤 인스턴스 내보내기
export const uiConfigSyncService = UIConfigSyncService.getInstance();