// TODO: Refactor to use createApiHandler from @/lib/api/handler
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { query } from '@/lib/db'
import sharp from 'sharp'
import { requireAdminAuth } from '@/lib/admin-auth'
import { logger } from '@/lib/utils/logger'

// POST /api/admin/upload - 파일 업로드
export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // logo, favicon, og-image, etc
    const section = formData.get('section') as string // For section-specific uploads
    const language = formData.get('language') as string // For language-specific uploads

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
    
    // Section과 language가 있으면 그것을 우선 사용
    const prefix = section && language ? `${section}_${language}` : (type || 'upload')
    const webpFileName = `${prefix}_${timestamp}_${nameWithoutExt}.webp`
    const originalFileName = `${prefix}_${timestamp}_${originalName}`

    // 업로드 디렉토리 경로
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'settings')
    
    // 디렉토리가 없으면 생성
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // 디렉토리가 이미 존재하는 경우 무시
    }

    // WebP로 변환 및 저장
    let finalFileName = webpFileName
    let finalUrl = `/uploads/settings/${webpFileName}`
    let finalSize = file.size
    let finalType = 'image/webp'
    
    try {
      // Sharp를 사용하여 WebP로 변환
      const webpBuffer = await sharp(buffer)
        .webp({ 
          quality: 85,  // WebP 품질 (0-100)
          effort: 4     // 압축 effort (0-6, 높을수록 느리지만 압축률 높음)
        })
        .toBuffer()
      
      const webpPath = join(uploadDir, webpFileName)
      await writeFile(webpPath, webpBuffer)
      
      finalSize = webpBuffer.length
      
      // 원본 파일도 저장 (백업용)
      const originalPath = join(uploadDir, originalFileName)
      await writeFile(originalPath, buffer)
      
      logger.info(`Image converted to WebP: ${originalFileName} -> ${webpFileName}, Size: ${file.size} -> ${finalSize}`);
    } catch (conversionError) {
      // WebP 변환 실패 시 원본 파일 저장
      logger.error('Failed to convert to WebP:', conversionError);
      
      const originalPath = join(uploadDir, originalFileName)
      await writeFile(originalPath, buffer)
      
      finalFileName = originalFileName
      finalUrl = `/uploads/settings/${originalFileName}`
      finalType = file.type
    }

    // 웹 접근 가능한 URL 생성
    const url = finalUrl

    // DB에 파일 정보 저장 (선택사항)
    if (type && authResult.user) {
      try {
        const sqlQuery = `
          INSERT INTO uploads (user_id, filename, original_name, mimetype, size, path, url, type, metadata, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          RETURNING *
        `
        
        await query(sqlQuery, [
          authResult.user.id,
          finalFileName,
          file.name,
          finalType,
          finalSize,
          join(uploadDir, finalFileName),
          url,
          type,
          JSON.stringify({
            uploadType: type || 'section',
            originalName: file.name,
            category: 'settings',
            originalSize: file.size,
            webpConverted: finalType === 'image/webp',
            section: section,
            language: language
          })
        ])
      } catch (dbError) {
        logger.error('Failed to save upload info to DB:', dbError);
        // DB 저장 실패해도 파일 업로드는 성공으로 처리
      }
    }

    return NextResponse.json({
      success: true,
      url: url,
      fileName: finalFileName,
      originalFileName: file.name,
      size: finalSize,
      originalSize: file.size,
      type: finalType,
      originalType: file.type,
      webpConverted: finalType === 'image/webp'
    })

  } catch (error) {
    logger.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/upload - 파일 삭제
export async function DELETE(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const authResult = await requireAdminAuth(request)
    if (authResult.error) {
      return authResult.error
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { error: 'No URL provided' },
        { status: 400 }
      )
    }

    // URL이 업로드 디렉토리 내의 파일인지 확인
    if (!url.startsWith('/uploads/settings/')) {
      return NextResponse.json(
        { error: 'Invalid file URL' },
        { status: 400 }
      )
    }

    // 파일 삭제는 보안상 DB 레코드만 삭제하고 실제 파일은 유지
    // (정기적인 클린업 작업으로 처리)
    try {
      const deleteQuery = `
        UPDATE uploads 
        SET deleted_at = NOW() 
        WHERE url = $1
      `
      await query(deleteQuery, [url])
    } catch (dbError) {
      logger.error('Failed to mark file as deleted:', dbError);
    }

    return NextResponse.json({
      success: true,
      message: 'File record deleted'
    })

  } catch (error) {
    logger.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}