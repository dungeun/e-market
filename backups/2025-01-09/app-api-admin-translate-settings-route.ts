import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Google Translate API 설정 조회
export async function GET(request: NextRequest) {
  try {
    // 데이터베이스에서 설정 조회
    const result = await query(
      `SELECT key, value FROM system_settings 
       WHERE key IN ('google_translate_api_key', 'google_translate_enabled')
       ORDER BY key`
    )
    
    const settings: Record<string, any> = {}
    result.rows.forEach(row => {
      if (row.key === 'google_translate_enabled') {
        settings[row.key] = row.value === 'true'
      } else {
        settings[row.key] = row.value
      }
    })

    // API 키는 보안상 마스킹해서 반환
    if (settings.google_translate_api_key) {
      const apiKey = settings.google_translate_api_key
      settings.google_translate_api_key_masked = apiKey.length > 10 
        ? `${apiKey.substring(0, 10)}${'*'.repeat(apiKey.length - 10)}`
        : '*'.repeat(apiKey.length)
      settings.google_translate_api_key_configured = true
    } else {
      settings.google_translate_api_key_configured = false
    }

    // 실제 API 키는 클라이언트로 전송하지 않음
    delete settings.google_translate_api_key

    return NextResponse.json({
      settings,
      status: settings.google_translate_enabled ? 'active' : 'inactive'
    })
  } catch (error) {
    console.error('Error fetching translate settings:', error)
    return NextResponse.json(
      { error: '번역 설정 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// Google Translate API 설정 저장/업데이트
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { api_key, enabled } = data

    if (!api_key || api_key.trim().length === 0) {
      return NextResponse.json(
        { error: 'API 키는 필수입니다.' },
        { status: 400 }
      )
    }

    // 먼저 system_settings 테이블이 있는지 확인하고 없으면 생성
    await query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `)

    // API 키 저장/업데이트 (upsert)
    await query(`
      INSERT INTO system_settings (key, value, description)
      VALUES ('google_translate_api_key', $1, 'Google Translate API Key')
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = NOW()
    `, [api_key.trim()])

    // 활성화 상태 저장/업데이트 (upsert)
    await query(`
      INSERT INTO system_settings (key, value, description)
      VALUES ('google_translate_enabled', $1, 'Google Translate API 활성화 여부')
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = NOW()
    `, [enabled ? 'true' : 'false'])

    // API 키 테스트 (간단한 번역 요청으로)
    let testResult = null
    if (enabled && api_key) {
      try {
        const testResponse = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${api_key}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: 'test',
            source: 'en',
            target: 'ko',
            format: 'text'
          })
        })

        if (testResponse.ok) {
          testResult = { success: true, message: 'API 키가 정상적으로 작동합니다.' }
        } else {
          testResult = { success: false, message: 'API 키가 유효하지 않거나 권한이 없습니다.' }
        }
      } catch (error) {
        testResult = { success: false, message: 'API 연결 테스트 중 오류가 발생했습니다.' }
      }
    }

    return NextResponse.json({
      message: '번역 설정이 저장되었습니다.',
      test_result: testResult,
      status: enabled ? 'active' : 'inactive'
    })
  } catch (error) {
    console.error('Error saving translate settings:', error)
    return NextResponse.json(
      { error: '번역 설정 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// Google Translate API 키 테스트
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { test_key } = data

    if (!test_key) {
      return NextResponse.json(
        { error: '테스트할 API 키가 필요합니다.' },
        { status: 400 }
      )
    }

    // 테스트 번역 요청
    const testResponse = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${test_key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: 'Hello World',
        source: 'en',
        target: 'ko',
        format: 'text'
      })
    })

    if (testResponse.ok) {
      const testData = await testResponse.json()
      return NextResponse.json({
        success: true,
        message: 'API 키가 정상적으로 작동합니다.',
        sample_translation: testData.data.translations[0]?.translatedText || '안녕하세요'
      })
    } else {
      const errorData = await testResponse.json()
      return NextResponse.json({
        success: false,
        message: 'API 키가 유효하지 않거나 권한이 없습니다.',
        error_details: errorData.error?.message || 'Unknown error'
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error testing API key:', error)
    return NextResponse.json({
      success: false,
      message: 'API 키 테스트 중 오류가 발생했습니다.',
      error_details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 번역 설정 삭제 (비활성화)
export async function DELETE(request: NextRequest) {
  try {
    // API 키 삭제하지 않고 비활성화만
    await query(`
      INSERT INTO system_settings (key, value, description)
      VALUES ('google_translate_enabled', 'false', 'Google Translate API 활성화 여부')
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = 'false',
        updated_at = NOW()
    `)

    return NextResponse.json({
      message: 'Google Translate API가 비활성화되었습니다.',
      status: 'inactive'
    })
  } catch (error) {
    console.error('Error disabling translate settings:', error)
    return NextResponse.json(
      { error: '번역 설정 비활성화 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}