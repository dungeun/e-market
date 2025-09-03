import { NextRequest, NextResponse } from 'next/server'
import { ProductTranslationService } from '@/lib/services/product-translation.service'
import { logger } from '@/lib/logger'

// GET: 특정 상품의 모든 번역 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const productId = id
    const { searchParams } = new URL(request.url)
    const languageCode = searchParams.get('language')

    if (languageCode) {
      // 특정 언어의 번역만 조회
      const translation = await ProductTranslationService.getProductTranslation(productId, languageCode)
      
      if (!translation) {
        return NextResponse.json(
          { error: `Translation not found for language ${languageCode}` },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        translation
      })
    } else {
      // 모든 언어의 번역 조회
      const translations = await ProductTranslationService.getProductTranslations(productId)
      
      return NextResponse.json({
        success: true,
        translations
      })
    }
  } catch (error) {
    logger.error('Failed to get product translations:', error)
    return NextResponse.json(
      { error: 'Failed to get translations' },
      { status: 500 }
    )
  }
}

// PUT: 특정 언어의 번역 수정 (수동 편집)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const productId = id
    const body = await request.json()
    const { languageCode, ...translationData } = body

    if (!languageCode) {
      return NextResponse.json(
        { error: '언어 코드가 필요합니다.' },
        { status: 400 }
      )
    }

    // 번역 업데이트
    await ProductTranslationService.updateProductTranslation(
      productId,
      languageCode,
      translationData
    )

    // 업데이트된 번역 조회
    const updatedTranslation = await ProductTranslationService.getProductTranslation(
      productId,
      languageCode
    )

    logger.info('Product translation updated', {
      productId,
      languageCode,
      fields: Object.keys(translationData)
    })

    return NextResponse.json({
      success: true,
      message: `${languageCode} 번역이 업데이트되었습니다.`,
      translation: updatedTranslation
    })
  } catch (error) {
    logger.error('Failed to update product translation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update translation' },
      { status: 500 }
    )
  }
}

// POST: 특정 상품 재번역
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const productId = id
    const body = await request.json()
    const { sourceLanguage = 'ko', targetLanguages } = body

    // 상품 정보 조회
    const { query } = require('@/lib/db')
    const productResult = await query('SELECT * FROM products WHERE id = $1', [productId])
    
    if (productResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const product = productResult.rows[0]
    const productData = {
      id: product.id,
      name: product.name,
      description: product.description,
      features: JSON.parse(product.features || '[]'),
      specifications: JSON.parse(product.specifications || '{}'),
      seoTitle: product.seo_title,
      seoDescription: product.seo_description
    }

    // 번역 실행
    const translations = await ProductTranslationService.translateProduct(productData, sourceLanguage)
    
    // 특정 언어만 선택 (지정된 경우)
    const filteredTranslations = targetLanguages
      ? translations.filter(t => targetLanguages.includes(t.languageCode))
      : translations

    // DB에 저장
    await ProductTranslationService.saveProductTranslations(productId, filteredTranslations)

    logger.info('Product retranslated', {
      productId,
      languageCount: filteredTranslations.length
    })

    return NextResponse.json({
      success: true,
      message: `${filteredTranslations.length}개 언어로 재번역되었습니다.`,
      translations: filteredTranslations
    })
  } catch (error) {
    logger.error('Failed to retranslate product:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retranslate' },
      { status: 500 }
    )
  }
}