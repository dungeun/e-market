import { translateText } from './translation.service'
import { languageManager } from './language-manager'
import { query } from '@/lib/db'
import { logger } from '@/lib/logger'

export interface ProductTranslation {
  languageCode: string
  name: string
  description?: string
  features?: string[]
  specifications?: Record<string, any>
  seoTitle?: string
  seoDescription?: string
}

export interface ProductData {
  id?: string
  name: string
  description?: string
  features?: string[]
  specifications?: Record<string, any>
  seoTitle?: string
  seoDescription?: string
  price?: number
  category?: string
  images?: string[]
}

/**
 * 상품 번역 서비스
 * 상품 등록 시 활성 언어로 자동 번역
 */
export class ProductTranslationService {
  /**
   * 상품 데이터를 모든 활성 언어로 번역
   */
  static async translateProduct(productData: ProductData, sourceLanguage: string = 'ko'): Promise<ProductTranslation[]> {
    const translations: ProductTranslation[] = []
    
    try {
      // 활성 언어 가져오기
      const activeLanguages = await languageManager.getEnabledLanguages()
      
      for (const lang of activeLanguages) {
        // 소스 언어는 번역하지 않음
        if (lang.code === sourceLanguage) {
          translations.push({
            languageCode: lang.code,
            name: productData.name,
            description: productData.description,
            features: productData.features,
            specifications: productData.specifications,
            seoTitle: productData.seoTitle,
            seoDescription: productData.seoDescription
          })
          continue
        }

        // 번역 실행
        const translation: ProductTranslation = {
          languageCode: lang.code,
          name: await translateText(productData.name, sourceLanguage, lang.google_code),
        }

        // 설명 번역
        if (productData.description) {
          translation.description = await translateText(productData.description, sourceLanguage, lang.google_code)
        }

        // 특징 번역
        if (productData.features && productData.features.length > 0) {
          translation.features = await Promise.all(
            productData.features.map(feature => 
              translateText(feature, sourceLanguage, lang.google_code)
            )
          )
        }

        // 사양 번역 (문자열 값만)
        if (productData.specifications) {
          translation.specifications = {}
          for (const [key, value] of Object.entries(productData.specifications)) {
            if (typeof value === 'string') {
              translation.specifications[key] = await translateText(value, sourceLanguage, lang.google_code)
            } else {
              translation.specifications[key] = value
            }
          }
        }

        // SEO 정보 번역
        if (productData.seoTitle) {
          translation.seoTitle = await translateText(productData.seoTitle, sourceLanguage, lang.google_code)
        }
        if (productData.seoDescription) {
          translation.seoDescription = await translateText(productData.seoDescription, sourceLanguage, lang.google_code)
        }

        translations.push(translation)
      }

      return translations
    } catch (error) {
      logger.error('Failed to translate product:', error)
      throw error
    }
  }

  /**
   * 번역된 상품 데이터를 DB에 저장
   */
  static async saveProductTranslations(productId: string, translations: ProductTranslation[]): Promise<void> {
    try {
      // 트랜잭션 시작
      await query('BEGIN')

      // 기존 번역 삭제
      await query('DELETE FROM product_translations WHERE product_id = $1', [productId])

      // 새 번역 저장
      for (const translation of translations) {
        await query(`
          INSERT INTO product_translations (
            product_id, language_code, name, description, 
            features, specifications, seo_title, seo_description
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          productId,
          translation.languageCode,
          translation.name,
          translation.description || null,
          JSON.stringify(translation.features || []),
          JSON.stringify(translation.specifications || {}),
          translation.seoTitle || null,
          translation.seoDescription || null
        ])
      }

      await query('COMMIT')
      logger.info(`Saved translations for product ${productId}`)
    } catch (error) {
      await query('ROLLBACK')
      logger.error('Failed to save product translations:', error)
      throw error
    }
  }

  /**
   * 특정 상품의 특정 언어 번역 가져오기
   */
  static async getProductTranslation(productId: string, languageCode: string): Promise<ProductTranslation | null> {
    try {
      const result = await query(`
        SELECT * FROM product_translations 
        WHERE product_id = $1 AND language_code = $2
      `, [productId, languageCode])

      if (result.rows.length === 0) {
        return null
      }

      const row = result.rows[0]
      return {
        languageCode: row.language_code,
        name: row.name,
        description: row.description,
        features: JSON.parse(row.features || '[]'),
        specifications: JSON.parse(row.specifications || '{}'),
        seoTitle: row.seo_title,
        seoDescription: row.seo_description
      }
    } catch (error) {
      logger.error('Failed to get product translation:', error)
      throw error
    }
  }

  /**
   * 특정 상품의 모든 언어 번역 가져오기
   */
  static async getProductTranslations(productId: string): Promise<ProductTranslation[]> {
    try {
      const result = await query(`
        SELECT * FROM product_translations 
        WHERE product_id = $1
        ORDER BY language_code
      `, [productId])

      return result.rows.map(row => ({
        languageCode: row.language_code,
        name: row.name,
        description: row.description,
        features: JSON.parse(row.features || '[]'),
        specifications: JSON.parse(row.specifications || '{}'),
        seoTitle: row.seo_title,
        seoDescription: row.seo_description
      }))
    } catch (error) {
      logger.error('Failed to get product translations:', error)
      throw error
    }
  }

  /**
   * 특정 언어의 번역 업데이트 (수동 편집용)
   */
  static async updateProductTranslation(
    productId: string, 
    languageCode: string, 
    translation: Partial<ProductTranslation>
  ): Promise<void> {
    try {
      const updates: string[] = []
      const values: any[] = []
      let paramIndex = 1

      if (translation.name !== undefined) {
        updates.push(`name = $${paramIndex++}`)
        values.push(translation.name)
      }
      if (translation.description !== undefined) {
        updates.push(`description = $${paramIndex++}`)
        values.push(translation.description)
      }
      if (translation.features !== undefined) {
        updates.push(`features = $${paramIndex++}`)
        values.push(JSON.stringify(translation.features))
      }
      if (translation.specifications !== undefined) {
        updates.push(`specifications = $${paramIndex++}`)
        values.push(JSON.stringify(translation.specifications))
      }
      if (translation.seoTitle !== undefined) {
        updates.push(`seo_title = $${paramIndex++}`)
        values.push(translation.seoTitle)
      }
      if (translation.seoDescription !== undefined) {
        updates.push(`seo_description = $${paramIndex++}`)
        values.push(translation.seoDescription)
      }

      if (updates.length === 0) {
        return // 업데이트할 내용이 없음
      }

      updates.push(`updated_at = NOW()`)
      values.push(productId, languageCode)

      await query(`
        UPDATE product_translations 
        SET ${updates.join(', ')}
        WHERE product_id = $${paramIndex} AND language_code = $${paramIndex + 1}
      `, values)

      logger.info(`Updated translation for product ${productId} in ${languageCode}`)
    } catch (error) {
      logger.error('Failed to update product translation:', error)
      throw error
    }
  }

  /**
   * 상품 일괄 번역 (여러 상품을 한 번에)
   */
  static async batchTranslateProducts(
    productIds: string[], 
    targetLanguages?: string[]
  ): Promise<Map<string, ProductTranslation[]>> {
    const results = new Map<string, ProductTranslation[]>()
    
    try {
      // 대상 언어 결정 (지정하지 않으면 활성 언어 모두)
      const languages = targetLanguages || 
        (await languageManager.getEnabledLanguages()).map(lang => lang.code)

      for (const productId of productIds) {
        // 상품 정보 가져오기
        const productResult = await query(`
          SELECT * FROM products WHERE id = $1
        `, [productId])

        if (productResult.rows.length === 0) {
          logger.warn(`Product ${productId} not found`)
          continue
        }

        const product = productResult.rows[0]
        const productData: ProductData = {
          id: product.id,
          name: product.name,
          description: product.description,
          features: JSON.parse(product.features || '[]'),
          specifications: JSON.parse(product.specifications || '{}'),
          seoTitle: product.seo_title,
          seoDescription: product.seo_description
        }

        // 번역 실행
        const translations = await this.translateProduct(productData, 'ko')
        
        // DB에 저장
        await this.saveProductTranslations(productId, translations)
        
        results.set(productId, translations)
      }

      return results
    } catch (error) {
      logger.error('Failed to batch translate products:', error)
      throw error
    }
  }
}