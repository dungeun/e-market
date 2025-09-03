// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { query, transaction } from '@/lib/db'

// GET: 언어 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const enabled = searchParams.get('enabled')
    
    let sql = `
      SELECT 
        id, code, name, native_name, enabled, is_default, 
        google_code, direction, flag_emoji, created_at, updated_at
      FROM language_settings
    `
    const params: any[] = []
    
    if (enabled === 'true') {
      sql += ' WHERE enabled = true'
    } else if (enabled === 'false') {
      sql += ' WHERE enabled = false'
    }
    
    sql += ' ORDER BY is_default DESC, name ASC'
    
    const result = await query(sql, params)
    
    return NextResponse.json({
      languages: result.rows,
      total: result.rows.length
    })
  } catch (error) {

    return NextResponse.json(
      { error: '언어 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 언어 추가
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // 필수 필드 검증
    if (!data.code || !data.name) {
      return NextResponse.json(
        { error: '언어 코드와 이름은 필수입니다.' },
        { status: 400 }
      )
    }
    
    // 중복 검사
    const existing = await query(
      'SELECT id FROM language_settings WHERE code = $1',
      [data.code]
    )
    
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: '이미 존재하는 언어 코드입니다.' },
        { status: 400 }
      )
    }
    
    // 새 언어 추가
    const result = await query(`
      INSERT INTO language_settings (
        code, name, native_name, enabled, is_default, 
        google_code, direction, flag_emoji
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      data.code,
      data.name,
      data.native_name || null,
      data.enabled ?? false,
      false, // 새 언어는 기본값이 아님
      data.google_code || data.code,
      data.direction || 'ltr',
      data.flag_emoji || null
    ])
    
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {

    return NextResponse.json(
      { error: '언어 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PUT: 언어 설정 업데이트
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.code) {
      return NextResponse.json(
        { error: '언어 코드가 필요합니다.' },
        { status: 400 }
      )
    }
    
    // 기본 언어 변경 시 기존 기본 언어 해제
    if (data.is_default) {
      await transaction(async (client) => {
        // 모든 언어의 is_default를 false로
        await client.query(
          'UPDATE language_settings SET is_default = false'
        )
        
        // 새 기본 언어 설정
        const result = await client.query(`
          UPDATE language_settings 
          SET is_default = true, enabled = true, updated_at = NOW()
          WHERE code = $1
          RETURNING *
        `, [data.code])
        
        return result.rows[0]
      })
    } else {
      // 일반 업데이트
      const updateFields = []
      const params = []
      let paramIndex = 1
      
      if (data.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`)
        params.push(data.name)
      }
      
      if (data.native_name !== undefined) {
        updateFields.push(`native_name = $${paramIndex++}`)
        params.push(data.native_name)
      }
      
      if (data.enabled !== undefined) {
        updateFields.push(`enabled = $${paramIndex++}`)
        params.push(data.enabled)
      }
      
      if (data.google_code !== undefined) {
        updateFields.push(`google_code = $${paramIndex++}`)
        params.push(data.google_code)
      }
      
      if (data.direction !== undefined) {
        updateFields.push(`direction = $${paramIndex++}`)
        params.push(data.direction)
      }
      
      if (data.flag_emoji !== undefined) {
        updateFields.push(`flag_emoji = $${paramIndex++}`)
        params.push(data.flag_emoji)
      }
      
      if (updateFields.length === 0) {
        return NextResponse.json(
          { error: '업데이트할 필드가 없습니다.' },
          { status: 400 }
        )
      }
      
      updateFields.push('updated_at = NOW()')
      params.push(data.code)
      
      const result = await query(`
        UPDATE language_settings 
        SET ${updateFields.join(', ')}
        WHERE code = $${paramIndex}
        RETURNING *
      `, params)
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: '언어를 찾을 수 없습니다.' },
          { status: 404 }
        )
      }
      
      return NextResponse.json(result.rows[0])
    }
  } catch (error) {

    return NextResponse.json(
      { error: '언어 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE: 언어 삭제 (비활성화만 가능)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.json(
        { error: '언어 코드가 필요합니다.' },
        { status: 400 }
      )
    }
    
    // 기본 언어는 삭제 불가
    const language = await query(
      'SELECT is_default FROM language_settings WHERE code = $1',
      [code]
    )
    
    if (language.rows.length === 0) {
      return NextResponse.json(
        { error: '언어를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    
    if (language.rows[0].is_default) {
      return NextResponse.json(
        { error: '기본 언어는 삭제할 수 없습니다.' },
        { status: 400 }
      )
    }
    
    // 언어 비활성화
    await query(
      'UPDATE language_settings SET enabled = false, updated_at = NOW() WHERE code = $1',
      [code]
    )
    
    return NextResponse.json({ message: '언어가 비활성화되었습니다.' })
  } catch (error) {

    return NextResponse.json(
      { error: '언어 비활성화 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}