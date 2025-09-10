import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { query } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('logo') as File
    
    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      )
    }

    // 파일 타입 검증
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '이미지 파일만 업로드 가능합니다. (jpg, png, gif, webp, svg)' },
        { status: 400 }
      )
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기는 5MB 이하여야 합니다.' },
        { status: 400 }
      )
    }

    // 파일 저장
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now()
    const ext = path.extname(file.name)
    const filename = `logo-${timestamp}${ext}`
    
    // public/uploads 디렉토리 생성
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'logos')
    await mkdir(uploadDir, { recursive: true })
    
    // 파일 저장
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)
    
    // 웹 경로
    const webPath = `/uploads/logos/${filename}`
    
    // DB에 general 설정 저장
    const existingGeneralResult = await query(
      'SELECT id, value FROM site_settings WHERE key = $1',
      ['general']
    )
    
    if (existingGeneralResult.rows.length > 0) {
      // 기존 general 설정 가져오기
      const currentGeneral = existingGeneralResult.rows[0].value || {}
      const updatedGeneral = {
        ...currentGeneral,
        logo: webPath,
        useImageLogo: true // 로고를 업로드하면 자동으로 이미지 로고 사용 활성화
      }
      
      // 업데이트
      await query(
        'UPDATE site_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2',
        [JSON.stringify(updatedGeneral), 'general']
      )
    } else {
      // 새로 생성
      await query(
        'INSERT INTO site_settings (key, value) VALUES ($1, $2)',
        ['general', JSON.stringify({ logo: webPath, useImageLogo: true })]
      )
    }
    
    // website 설정에도 저장 (호환성을 위해)
    const existingWebsiteResult = await query(
      'SELECT id, value FROM site_settings WHERE key = $1',
      ['website']
    )
    
    if (existingWebsiteResult.rows.length > 0) {
      const currentWebsite = existingWebsiteResult.rows[0].value || {}
      const updatedWebsite = {
        ...currentWebsite,
        logo: webPath
      }
      
      await query(
        'UPDATE site_settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2',
        [JSON.stringify(updatedWebsite), 'website']
      )
    }
    
    return NextResponse.json({
      success: true,
      url: webPath,
      filename: filename
    })

  } catch (error) {
    console.error('Failed to upload logo:', error)
    return NextResponse.json(
      { error: '로고 업로드에 실패했습니다.' },
      { status: 500 }
    )
  }
}