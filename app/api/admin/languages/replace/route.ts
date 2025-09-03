import type { AppError } from '@/lib/types/common';
// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { logger } from '@/lib/logger'
import { translateText } from '@/lib/services/translation.service'
import { languageManager } from '@/lib/services/language-manager'

// POST: 언어 전체 교체 (한 언어를 다른 언어로 완전 교체)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      fromLanguage, 
      toLanguage, 
      translateContent = true,  // 콘텐츠 자동 번역 여부
      includeProducts = true,   // 상품 번역 포함 여부
      includeUITexts = true     // UI 텍스트 번역 포함 여부
    } = body

    if (!fromLanguage || !toLanguage) {
      return NextResponse.json(
        { error: '교체할 언어와 대상 언어가 필요합니다.' },
        { status: 400 }
      )
    }

    if (fromLanguage === toLanguage) {
      return NextResponse.json(
        { error: '같은 언어로 교체할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 언어 정보 확인
    const fromLang = await languageManager.getLanguageByCode(fromLanguage)
    const toLang = await languageManager.getLanguageByCode(toLanguage)

    if (!fromLang || !toLang) {
      return NextResponse.json(
        { error: '유효하지 않은 언어 코드입니다.' },
        { status: 400 }
      )
    }

    // 트랜잭션 시작
    await query('BEGIN')

    try {
      let translatedCount = {
        languagePacks: 0,
        products: 0,
        uiSections: 0
      }

      // 1. 언어팩 교체
      if (includeUITexts) {
        if (translateContent) {
          // 자동 번역으로 교체
          const packs = await query(`
            SELECT key, ${fromLanguage} as text 
            FROM language_packs 
            WHERE ${fromLanguage} IS NOT NULL
          `)

          for (const pack of packs.rows) {
            if (pack.text) {
              const translated = await translateText(pack.text, fromLang.google_code, toLang.google_code)
              await query(`
                UPDATE language_packs 
                SET ${toLanguage} = $1, "updatedAt" = NOW()
                WHERE key = $2
              `, [translated, pack.key])
              translatedCount.languagePacks++
            }
          }
        } else {
          // 단순 복사 (번역 없이)
          await query(`
            UPDATE language_packs 
            SET ${toLanguage} = ${fromLanguage}, "updatedAt" = NOW()
            WHERE ${fromLanguage} IS NOT NULL
          `)
          const result = await query(`SELECT COUNT(*) FROM language_packs WHERE ${fromLanguage} IS NOT NULL`)
          translatedCount.languagePacks = parseInt(result.rows[0].count)
        }
      }

      // 2. 상품 번역 교체
      if (includeProducts) {
        if (translateContent) {
          // 자동 번역으로 교체
          const products = await query(`
            SELECT * FROM product_translations 
            WHERE language_code = $1
          `, [fromLanguage])

          for (const product of products.rows) {
            const translatedName = await translateText(product.name, fromLang.google_code, toLang.google_code)
            const translatedDesc = product.description 
              ? await translateText(product.description, fromLang.google_code, toLang.google_code)
              : null

            // 기존 번역 삭제
            await query(`
              DELETE FROM product_translations 
              WHERE product_id = $1 AND language_code = $2
            `, [product.product_id, toLanguage])

            // 새 번역 추가
            await query(`
              INSERT INTO product_translations (
                product_id, language_code, name, description,
                features, specifications, seo_title, seo_description
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
              product.product_id,
              toLanguage,
              translatedName,
              translatedDesc,
              product.features,
              product.specifications,
              product.seo_title ? await translateText(product.seo_title, fromLang.google_code, toLang.google_code) : null,
              product.seo_description ? await translateText(product.seo_description, fromLang.google_code, toLang.google_code) : null
            ])
            translatedCount.products++
          }
        } else {
          // 단순 복사
          // 기존 toLanguage 번역 삭제
          await query(`
            DELETE FROM product_translations WHERE language_code = $1
          `, [toLanguage])

          // fromLanguage를 toLanguage로 복사
          await query(`
            INSERT INTO product_translations (
              product_id, language_code, name, description,
              features, specifications, seo_title, seo_description
            )
            SELECT 
              product_id, $1, name, description,
              features, specifications, seo_title, seo_description
            FROM product_translations
            WHERE language_code = $2
          `, [toLanguage, fromLanguage])

          const result = await query(`SELECT COUNT(*) FROM product_translations WHERE language_code = $1`, [toLanguage])
          translatedCount.products = parseInt(result.rows[0].count)
        }
      }

      // 3. UI 섹션 번역 교체
      const uiSections = await query('SELECT * FROM ui_sections')
      for (const section of uiSections.rows) {
        let translations = typeof section.translations === 'string' 
          ? JSON.parse(section.translations || '{}')
          : section.translations || {}

        if (translations[fromLanguage]) {
          if (translateContent) {
            // 자동 번역
            translations[toLanguage] = await translateUIContent(
              translations[fromLanguage], 
              fromLang.google_code, 
              toLang.google_code
            )
          } else {
            // 단순 복사
            translations[toLanguage] = translations[fromLanguage]
          }

          await query(`
            UPDATE ui_sections 
            SET translations = $1, "updatedAt" = NOW()
            WHERE id = $2
          `, [JSON.stringify(translations), section.id])
          translatedCount.uiSections++
        }
      }

      // 4. 언어 설정 교체 (활성/비활성)
      await languageManager.switchLanguage(fromLanguage, toLanguage)

      await query('COMMIT')

      logger.info('Language replacement completed', {
        from: fromLanguage,
        to: toLanguage,
        translated: translatedCount
      })

      return NextResponse.json({
        success: true,
        message: `${fromLanguage}가 ${toLanguage}로 교체되었습니다.`,
        statistics: translatedCount,
        translateContent
      })
    } catch (error) {
      await query('ROLLBACK')
      throw error
    }
  } catch (error) {
    logger.error('Failed to replace language:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to replace language' },
      { status: 500 }
    )
  }
}

// UI 콘텐츠 번역 헬퍼 함수
async function translateUIContent(content: unknown, fromLang: string, toLang: string): Promise<unknown> {
  if (typeof content === 'string') {
    return await translateText(content, fromLang, toLang)
  }
  
  if (Array.isArray(content)) {
    return await Promise.all(
      content.map(item => translateUIContent(item, fromLang, toLang))
    )
  }
  
  if (typeof content === 'object' && content !== null) {
    const translated: unknown = {}
    for (const [key, value] of Object.entries(content)) {
      // 특정 키는 번역하지 않음 (URL, ID 등)
      if (['url', 'href', 'link', 'id', 'icon', 'image'].includes(key)) {
        translated[key] = value
      } else {
        translated[key] = await translateUIContent(value, fromLang, toLang)
      }
    }
    return translated
  }
  
  return content
}