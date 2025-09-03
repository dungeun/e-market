import { query, transaction } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface UISection {
  id: string;
  key: string;
  type: string;
  title?: string | null;
  subtitle?: string | null;
  data?: unknown;
  order: number;
  isActive: boolean;
  translations?: unknown;
  props?: unknown;
  style?: unknown;
}

export class UISectionService {
  // 모든 표시 가능한 섹션 가져오기
  static async getVisibleSections(language: string = 'ko'): Promise<any[]> {
    try {
      const result = await query(`
        SELECT * FROM ui_sections 
        WHERE "isActive" = true 
        ORDER BY "order" ASC
      `);

      const sections = result.rows;

      // 언어에 따른 번역 적용
      return sections.map(section => {
        // Parse data field
        let sectionData = {};
        if (section.data) {
          try {
            sectionData = typeof section.data === 'string' ? JSON.parse(section.data) : section.data;
          } catch (e) {
            logger.error('Failed to parse section data:', e);
            sectionData = {};
          }
        }

        // Extract translations from data if present
        const translations = sectionData.translations || {};
        
        // Apply translations based on language
        if (language !== 'ko' && translations[language]) {
          const langTranslations = translations[language];
          
          // Merge translated content with original data
          const mergedData = {
            ...sectionData,
            ...langTranslations
          };
          
          // Remove translations from final data to avoid duplication
          delete mergedData.translations;
          
          return {
            id: section.id,
            key: section.key,
            type: section.type,
            title: langTranslations.title || section.title,
            subtitle: langTranslations.subtitle || section.subtitle,
            data: mergedData,
            config: mergedData,
            order: section.order,
            isActive: section.isActive,
            visible: section.isActive
          };
        }
        
        // For Korean or when no translations available
        delete sectionData.translations;
        
        return {
          id: section.id,
          key: section.key,
          type: section.type,
          title: section.title,
          subtitle: section.subtitle,
          data: sectionData,
          config: sectionData,
          order: section.order,
          isActive: section.isActive,
          visible: section.isActive
        };
      });
    } catch (error) {
      logger.error('Error fetching visible sections:', error);
      return [];
    }
  }

  // 특정 섹션 가져오기
  static async getSection(sectionId: string, language: string = 'ko'): Promise<UISection | null> {
    try {
      const result = await query(`
        SELECT * FROM ui_sections 
        WHERE key = $1
      `, [sectionId]);

      const section = result.rows[0];
      if (!section) return null;

      // 언어에 따른 번역 적용
      if (language !== 'ko' && section.translations) {
        const translations = section.translations as unknown;
        const langTranslations = translations[language];
        
        if (langTranslations) {
          return {
            ...section,
            title: langTranslations.title || section.title,
            subtitle: langTranslations.subtitle || section.subtitle,
            data: {
              ...section.data,
              ...langTranslations
            }
          };
        }
      }

      return section;
    } catch (error) {
      logger.error(`Error fetching section ${sectionId}:`, error);
      return null;
    }
  }

  // 섹션 업데이트 (관리자용)
  static async updateSection(sectionKey: string, data: Partial<UISection>): Promise<UISection | null> {
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;
      
      if (data.title !== undefined) {
        updates.push(`title = $${paramCount}`);
        values.push(data.title);
        paramCount++;
      }
      if (data.type !== undefined) {
        updates.push(`type = $${paramCount}`);
        values.push(data.type);
        paramCount++;
      }
      if (data.isActive !== undefined) {
        updates.push(`"isActive" = $${paramCount}`);
        values.push(data.isActive);
        paramCount++;
      }
      if (data.order !== undefined) {
        updates.push(`"order" = $${paramCount}`);
        values.push(data.order);
        paramCount++;
      }
      if (data.data !== undefined) {
        updates.push(`data = $${paramCount}`);
        values.push(JSON.stringify(data.data));
        paramCount++;
      }
      if (data.translations !== undefined) {
        updates.push(`translations = $${paramCount}`);
        values.push(JSON.stringify(data.translations));
        paramCount++;
      }
      
      if (updates.length === 0) return null;
      
      updates.push(`"updatedAt" = NOW()`);
      values.push(sectionKey);
      
      const result = await query(`
        UPDATE ui_sections 
        SET ${updates.join(', ')}
        WHERE key = $${paramCount}
        RETURNING *
      `, values);
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error updating section ${sectionKey}:`, error);
      return null;
    }
  }

  // 섹션 순서 업데이트
  static async updateSectionOrder(orders: { sectionKey: string; order: number }[]): Promise<boolean> {
    try {
      await transaction(async (query) => {
        for (const { sectionKey, order } of orders) {
          await query(`
            UPDATE ui_sections 
            SET "order" = $1, "updatedAt" = NOW()
            WHERE key = $2
          `, [order, sectionKey]);
        }
      });
      
      return true;
    } catch (error) {
      logger.error('Error updating section orders:', error);
      return false;
    }
  }

  // 섹션 표시/숨김 토글
  static async toggleSectionVisibility(sectionKey: string): Promise<UISection | null> {
    try {
      const sectionResult = await query(`
        SELECT * FROM ui_sections WHERE key = $1
      `, [sectionKey]);
      
      const section = sectionResult.rows[0];
      if (!section) return null;

      const result = await query(`
        UPDATE ui_sections 
        SET "isActive" = $1, "updatedAt" = NOW()
        WHERE key = $2
        RETURNING *
      `, [!section.isActive, sectionKey]);
      
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error toggling section visibility ${sectionKey}:`, error);
      return null;
    }
  }
}