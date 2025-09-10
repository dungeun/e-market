import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
// import { requireAdminAuth } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인 (임시로 주석처리)
    // const authResult = await requireAdminAuth(request)
    // if (authResult.error) {
    //   return authResult.error
    // }
    // const { user } = authResult

    // DB에서 설정 조회
    const settingKeys = [
      'general',
      'store',
      'website', 
      'footer',
      'payments',
      'shipping',
      'inventory',
      'email',
      'security',
      'backup',
      'seo',
      'notifications',
      'legal'
    ]

    const settings: Record<string, any> = {}
    
    // 각 설정 키에 대해 DB 조회
    for (const key of settingKeys) {
      try {
        const result = await query(
          'SELECT value FROM site_settings WHERE key = $1',
          [key]
        )
        
        if (result.rows.length > 0) {
          settings[key] = result.rows[0].value
        }
      } catch (e) {
        console.error(`Failed to fetch setting for key ${key}:`, e)
      }
    }

    // 설정이 없으면 기본값 사용
    const defaultSettings = {
      general: {
        siteName: 'Commerce Store',
        siteUrl: 'https://commerce.example.com',
        logo: '/logo.png',
        favicon: '/favicon.ico',
        description: '최고의 온라인 쇼핑 경험을 제공합니다.',
        keywords: '온라인쇼핑, 이커머스, 전자상거래',
        adminEmail: 'admin@example.com',
        timezone: 'Asia/Seoul',
        language: 'ko',
        currency: 'KRW',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        maintenanceMode: false,
        maintenanceMessage: '시스템 점검 중입니다. 잠시 후 다시 시도해주세요.'
      },
      store: {
        storeName: 'Commerce Store',
        storeEmail: 'store@example.com',
        storePhone: '02-1234-5678',
        storeAddress: '서울시 강남구 테헤란로 123',
        businessNumber: '123-45-67890',
        ceoName: '홍길동',
        onlineBusinessNumber: '2024-서울강남-1234',
        facebook: 'https://facebook.com/commercestore',
        instagram: 'https://instagram.com/commercestore',
        twitter: 'https://twitter.com/commercestore',
        youtube: 'https://youtube.com/commercestore'
      }
    }

    // DB 설정과 기본값 병합
    const mergedSettings = {
      ...defaultSettings,
      ...settings
    }
    
    return NextResponse.json({
      settings: mergedSettings
    })

  } catch (error) {

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 관리자 인증 확인 (임시로 주석처리)
    // const authResult = await requireAdminAuth(request)
    // if (authResult.error) {
    //   return authResult.error
    // }
    // const { user } = authResult

    const newSettings = await request.json()
    
    // 각 설정 항목을 DB에 저장 (UPSERT)
    for (const [key, value] of Object.entries(newSettings)) {
      const jsonValue = typeof value === 'string' ? value : JSON.stringify(value)
      
      // 먼저 존재하는지 확인
      const existingResult = await query(
        'SELECT id FROM site_settings WHERE key = $1',
        [key]
      )
      
      if (existingResult.rows.length > 0) {
        // 업데이트
        await query(
          'UPDATE site_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2',
          [jsonValue, key]
        )
      } else {
        // 새로 생성
        await query(
          'INSERT INTO site_settings (key, value) VALUES ($1, $2)',
          [key, jsonValue]
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: '설정이 성공적으로 저장되었습니다.'
    })

  } catch (error) {
    console.error('Failed to save settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}