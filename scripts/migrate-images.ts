#!/usr/bin/env tsx

// 환경변수 로드
import { config } from 'dotenv';
config({ path: '.env.local' });

import { put } from '@vercel/blob';
import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { query } from '../lib/db';
import { logger } from '../lib/utils/logger';

interface ImageMigrationResult {
  success: number;
  failed: number;
  errors: string[];
  migrations: Array<{
    originalPath: string;
    newUrl: string;
    size: number;
  }>;
}

/**
 * 기존 로컬 이미지들을 Vercel Blob Storage로 마이그레이션
 */
async function migrateImages(): Promise<ImageMigrationResult> {
  const result: ImageMigrationResult = {
    success: 0,
    failed: 0,
    errors: [],
    migrations: []
  };

  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  
  try {
    // 업로드 폴더 존재 확인
    try {
      await stat(uploadsDir);
    } catch (error) {
      console.log('업로드 폴더가 존재하지 않습니다. 마이그레이션이 필요 없습니다.');
      return result;
    }

    console.log('🚀 이미지 마이그레이션을 시작합니다...');
    console.log(`📁 대상 폴더: ${uploadsDir}`);

    // 업로드 폴더 내 모든 이미지 파일 찾기
    const imageFiles = await findImageFiles(uploadsDir);
    console.log(`📸 발견된 이미지 파일: ${imageFiles.length}개`);

    if (imageFiles.length === 0) {
      console.log('마이그레이션할 이미지가 없습니다.');
      return result;
    }

    // 각 이미지 파일을 Vercel Blob으로 업로드
    for (let i = 0; i < imageFiles.length; i++) {
      const imagePath = imageFiles[i];
      const relativePath = imagePath.replace(join(process.cwd(), 'public'), '');
      
      console.log(`⏳ [${i + 1}/${imageFiles.length}] 마이그레이션 중: ${relativePath}`);

      try {
        // 파일 읽기
        const fileBuffer = await readFile(imagePath);
        const fileName = imagePath.split('/').pop() || 'unknown';
        const fileExtension = fileName.split('.').pop()?.toLowerCase();
        
        // MIME 타입 결정
        const mimeType = getMimeType(fileExtension);
        
        // Vercel Blob에 업로드 (원본 폴더 구조 유지)
        const blobPath = relativePath.replace('/uploads/', '');
        const blob = await put(blobPath, fileBuffer, {
          access: 'public',
          contentType: mimeType,
        });

        result.success++;
        result.migrations.push({
          originalPath: relativePath,
          newUrl: blob.url,
          size: fileBuffer.length
        });

        console.log(`✅ 성공: ${relativePath} -> ${blob.url}`);

      } catch (error) {
        result.failed++;
        const errorMsg = `❌ 실패: ${relativePath} - ${error instanceof Error ? error.message : String(error)}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log('\n🎉 마이그레이션 완료!');
    console.log(`✅ 성공: ${result.success}개`);
    console.log(`❌ 실패: ${result.failed}개`);

    return result;

  } catch (error) {
    console.error('마이그레이션 중 치명적 오류 발생:', error);
    throw error;
  }
}

/**
 * 디렉토리에서 재귀적으로 이미지 파일들을 찾기
 */
async function findImageFiles(dir: string): Promise<string[]> {
  const imageFiles: string[] = [];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'];

  try {
    const items = await readdir(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        // 서브 디렉토리 재귀 탐색
        const subImages = await findImageFiles(fullPath);
        imageFiles.push(...subImages);
      } else {
        // 이미지 파일 확인
        const extension = item.toLowerCase().substring(item.lastIndexOf('.'));
        if (imageExtensions.includes(extension)) {
          imageFiles.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`디렉토리 읽기 실패: ${dir}`, error);
  }

  return imageFiles;
}

/**
 * 파일 확장자에 따른 MIME 타입 반환
 */
function getMimeType(extension?: string): string {
  switch (extension?.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    case 'bmp':
      return 'image/bmp';
    case 'tiff':
    case 'tif':
      return 'image/tiff';
    default:
      return 'application/octet-stream';
  }
}

/**
 * 데이터베이스의 이미지 URL들을 업데이트
 */
async function updateDatabaseUrls(migrations: ImageMigrationResult['migrations']): Promise<void> {
  if (migrations.length === 0) {
    console.log('업데이트할 URL이 없습니다.');
    return;
  }

  console.log('\n🔄 데이터베이스 URL 업데이트 시작...');

  // URL 매핑 생성
  const urlMapping = new Map<string, string>();
  migrations.forEach(migration => {
    urlMapping.set(migration.originalPath, migration.newUrl);
  });

  try {
    // 1. products 테이블의 이미지 URL 업데이트
    console.log('📦 상품 이미지 URL 업데이트 중...');
    const productsResult = await query(`
      SELECT id, image_url FROM products 
      WHERE image_url IS NOT NULL AND image_url LIKE '/uploads/%'
    `);

    for (const product of productsResult.rows) {
      const newUrl = urlMapping.get(product.image_url);
      if (newUrl) {
        await query(
          'UPDATE products SET image_url = $1 WHERE id = $2',
          [newUrl, product.id]
        );
        console.log(`✅ 상품 ${product.id}: ${product.image_url} -> ${newUrl}`);
      }
    }

    // 2. product_images 테이블 업데이트 (존재하는 경우)
    try {
      console.log('🖼️  상품 이미지 갤러리 URL 업데이트 중...');
      const imagesResult = await query(`
        SELECT id, url FROM product_images 
        WHERE url IS NOT NULL AND url LIKE '/uploads/%'
      `);

      for (const image of imagesResult.rows) {
        const newUrl = urlMapping.get(image.url);
        if (newUrl) {
          await query(
            'UPDATE product_images SET url = $1 WHERE id = $2',
            [newUrl, image.id]
          );
          console.log(`✅ 이미지 ${image.id}: ${image.url} -> ${newUrl}`);
        }
      }
    } catch (error) {
      console.log('product_images 테이블이 존재하지 않거나 접근할 수 없습니다.');
    }

    // 3. categories 테이블의 아이콘 이미지 업데이트 (존재하는 경우)
    try {
      console.log('📁 카테고리 아이콘 URL 업데이트 중...');
      const categoriesResult = await query(`
        SELECT id, icon FROM categories 
        WHERE icon IS NOT NULL AND icon LIKE '/uploads/%'
      `);

      for (const category of categoriesResult.rows) {
        const newUrl = urlMapping.get(category.icon);
        if (newUrl) {
          await query(
            'UPDATE categories SET icon = $1 WHERE id = $2',
            [newUrl, category.id]
          );
          console.log(`✅ 카테고리 ${category.id}: ${category.icon} -> ${newUrl}`);
        }
      }
    } catch (error) {
      console.log('categories 테이블의 icon 필드가 존재하지 않거나 접근할 수 없습니다.');
    }

    console.log('✅ 데이터베이스 URL 업데이트 완료!');

  } catch (error) {
    console.error('❌ 데이터베이스 업데이트 실패:', error);
    throw error;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    console.log('🎯 이미지 마이그레이션 시작');
    console.log('=' * 50);

    // 환경변수 확인
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN 환경변수가 설정되지 않았습니다.');
    }

    // 1단계: 이미지 파일들을 Vercel Blob으로 마이그레이션
    const result = await migrateImages();

    // 2단계: 데이터베이스 URL 업데이트
    if (result.success > 0) {
      await updateDatabaseUrls(result.migrations);
    }

    // 결과 요약
    console.log('\n' + '=' * 50);
    console.log('🎊 마이그레이션 완료 요약');
    console.log('=' * 50);
    console.log(`✅ 성공한 이미지: ${result.success}개`);
    console.log(`❌ 실패한 이미지: ${result.failed}개`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ 실패 목록:');
      result.errors.forEach(error => console.log(`  ${error}`));
    }

    // 마이그레이션 결과를 JSON 파일로 저장
    const fs = await import('fs/promises');
    await fs.writeFile(
      'migration-result.json', 
      JSON.stringify(result, null, 2),
      'utf-8'
    );
    console.log('\n📄 마이그레이션 결과가 migration-result.json에 저장되었습니다.');

    console.log('\n🎉 모든 마이그레이션 작업이 완료되었습니다!');
    
  } catch (error) {
    console.error('💥 마이그레이션 실패:', error);
    process.exit(1);
  }
}

// 스크립트 직접 실행 시에만 main 함수 호출
if (require.main === module) {
  main();
}

export { migrateImages, updateDatabaseUrls };