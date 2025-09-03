import { NextRequest, NextResponse } from 'next/server'
import { query, transaction } from '@/lib/db'
import { translationService } from '@/lib/services/translation.service'

// GET: 번역 목록 조회 (키별, 언어별 필터링 가능)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')
    const language_code = searchParams.get('language_code')
    const status = searchParams.get('status') // pending, auto, manual, verified
    const category = searchParams.get('category') // section, product, ui 등
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const offset = (page - 1) * limit
    
    let sql = `
      SELECT 
        t.id, t.key, t.language_code, t.value, t.status, 
        t.translated_by, t.translated_at, t.verified_by, t.verified_at,
        t.created_at, t.updated_at,
        l.name as language_name, l.native_name
      FROM language_pack_translations t
      LEFT JOIN language_settings l ON t.language_code = l.code
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1
    
    if (key) {
      sql += ` AND t.key ILIKE $${paramIndex}`
      params.push(`%${key}%`)
      paramIndex++
    }
    
    if (language_code) {
      sql += ` AND t.language_code = $${paramIndex}`
      params.push(language_code)
      paramIndex++
    }
    
    if (status) {
      sql += ` AND t.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }
    
    if (category) {
      sql += ` AND t.key LIKE $${paramIndex}`
      params.push(`${category}.%`)
      paramIndex++
    }
    
    sql += ` ORDER BY t.key, t.language_code LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)
    
    // 총 개수 쿼리
    let countSql = `
      SELECT COUNT(*) as total
      FROM language_pack_translations t
      WHERE 1=1
    `
    const countParams = [...params.slice(0, paramIndex - 2)] // limit, offset 제외
    
    if (key) countSql += ` AND t.key ILIKE $1`
    if (language_code) countSql += ` AND t.language_code = $${key ? 2 : 1}`
    if (status) countSql += ` AND t.status = $${(key ? 1 : 0) + (language_code ? 1 : 0) + 1}`
    if (category) countSql += ` AND t.key LIKE $${(key ? 1 : 0) + (language_code ? 1 : 0) + (status ? 1 : 0) + 1}`
    
    const [result, countResult] = await Promise.all([
      query(sql, params),
      query(countSql, countParams)
    ])
    
    const total = parseInt(countResult.rows[0]?.total || '0')
    
    return NextResponse.json({
      translations: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching translations:', error)
    return NextResponse.json(
      { error: '번역 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 번역 추가 또는 자동 번역 생성
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // 단일 번역 추가
    if (data.key && data.language_code) {
      return await createSingleTranslation(data)
    }
    
    // 자동 번역 생성 (키에 대해 모든 활성 언어로)
    if (data.auto_translate && data.key && data.source_text && data.source_language) {
      return await createAutoTranslations(data)
    }
    
    // 배치 번역 추가
    if (data.translations && Array.isArray(data.translations)) {
      return await createBatchTranslations(data.translations)
    }
    
    return NextResponse.json(
      { error: '잘못된 요청 형식입니다.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error creating translation:', error)
    return NextResponse.json(
      { error: '번역 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 번역 수정
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.id && !(data.key && data.language_code)) {
      return NextResponse.json(
        { error: '번역 ID 또는 키와 언어 코드가 필요합니다.' },
        { status: 400 }
      )
    }
    
    const updateFields = []
    const params = []
    let paramIndex = 1
    
    if (data.value !== undefined) {
      updateFields.push(`value = $${paramIndex++}`)
      params.push(data.value)
      updateFields.push(`status = $${paramIndex++}`)
      params.push('manual') // 수동 수정 시 상태를 manual로
      updateFields.push(`translated_by = $${paramIndex++}`)
      params.push(data.translated_by || 'admin')
      updateFields.push(`translated_at = NOW()`)
    }
    
    if (data.verified_by) {
      updateFields.push(`verified_by = $${paramIndex++}`)
      params.push(data.verified_by)
      updateFields.push(`verified_at = NOW()`)
      updateFields.push(`status = $${paramIndex++}`)
      params.push('verified')
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: '업데이트할 내용이 없습니다.' },
        { status: 400 }
      )
    }
    
    updateFields.push('updated_at = NOW()')
    
    let sql = `UPDATE language_pack_translations SET ${updateFields.join(', ')}`
    let whereClause = ''
    
    if (data.id) {
      whereClause = ` WHERE id = $${paramIndex++}`
      params.push(data.id)
    } else {
      whereClause = ` WHERE key = $${paramIndex++} AND language_code = $${paramIndex++}`
      params.push(data.key, data.language_code)
    }
    
    sql += whereClause + ' RETURNING *'
    
    const result = await query(sql, params)
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '번역을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating translation:', error)
    return NextResponse.json(
      { error: '번역 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 번역 삭제
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const key = searchParams.get('key')
    const language_code = searchParams.get('language_code')
    
    if (!id && !(key && language_code)) {
      return NextResponse.json(
        { error: '번역 ID 또는 키와 언어 코드가 필요합니다.' },
        { status: 400 }
      )
    }
    
    let sql = 'DELETE FROM language_pack_translations'
    const params = []
    
    if (id) {
      sql += ' WHERE id = $1'
      params.push(id)
    } else {
      sql += ' WHERE key = $1 AND language_code = $2'
      params.push(key, language_code)
    }
    
    const result = await query(sql, params)
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: '번역을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: '번역이 삭제되었습니다.' })
  } catch (error) {
    console.error('Error deleting translation:', error)
    return NextResponse.json(
      { error: '번역 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 헬퍼 함수들
async function createSingleTranslation(data: any) {
  const result = await query(`
    INSERT INTO language_pack_translations (
      key, language_code, value, status, translated_by, translated_at
    ) VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (key, language_code) 
    DO UPDATE SET 
      value = EXCLUDED.value,
      status = EXCLUDED.status,
      translated_by = EXCLUDED.translated_by,
      translated_at = EXCLUDED.translated_at,
      updated_at = NOW()
    RETURNING *
  `, [
    data.key,
    data.language_code,
    data.value,
    data.status || 'manual',
    data.translated_by || 'admin'
  ])
  
  return NextResponse.json(result.rows[0], { status: 201 })
}

async function createAutoTranslations(data: any) {
  try {
    // 활성화된 언어 목록 가져오기
    const languagesResult = await query(
      'SELECT code, google_code FROM language_settings WHERE enabled = true AND code != $1',
      [data.source_language]
    )
    
    const targetLanguages = languagesResult.rows
    const translations = []
    
    // 각 언어로 번역
    for (const lang of targetLanguages) {
      try {
        const translatedResult = await translationService.translateText(
          data.source_text,
          { from: data.source_language, to: lang.google_code }
        )
        
        translations.push({
          key: data.key,
          language_code: lang.code,
          value: translatedResult.translatedText,
          status: 'auto',
          translated_by: 'google_translate'
        })
      } catch (error) {
        console.error(`Translation failed for ${lang.code}:`, error)
        // 번역 실패 시 원본 텍스트 사용
        translations.push({
          key: data.key,
          language_code: lang.code,
          value: data.source_text,
          status: 'pending',
          translated_by: 'fallback'
        })
      }
    }
    
    // 원본 언어도 추가
    translations.push({
      key: data.key,
      language_code: data.source_language,
      value: data.source_text,
      status: 'manual',
      translated_by: 'original'
    })
    
    // 배치로 저장
    return await createBatchTranslations(translations)
  } catch (error) {
    console.error('Auto translation error:', error)
    throw error
  }
}

async function createBatchTranslations(translations: any[]) {
  return await transaction(async (client) => {
    const results = []
    
    for (const translation of translations) {
      const result = await client.query(`
        INSERT INTO language_pack_translations (
          key, language_code, value, status, translated_by, translated_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (key, language_code) 
        DO UPDATE SET 
          value = EXCLUDED.value,
          status = EXCLUDED.status,
          translated_by = EXCLUDED.translated_by,
          translated_at = EXCLUDED.translated_at,
          updated_at = NOW()
        RETURNING *
      `, [
        translation.key,
        translation.language_code,
        translation.value,
        translation.status || 'manual',
        translation.translated_by || 'admin'
      ])
      
      results.push(result.rows[0])
    }
    
    return NextResponse.json({ 
      message: `${results.length}개의 번역이 처리되었습니다.`,
      translations: results 
    }, { status: 201 })
  })
}