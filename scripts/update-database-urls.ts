#!/usr/bin/env tsx

// 환경변수 로드
import { config } from 'dotenv';
config({ path: '.env.local' });

import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { query } from '../lib/db';
import { logger } from '../lib/utils/logger';

interface UrlMapping {
  originalPath: string;
  newUrl: string;
}

/**
 * 기존 로컬 이미지 파일들과 Vercel Blob URL 매핑 생성
 */
async function generateUrlMappings(): Promise<UrlMapping[]> {
  const mappings: UrlMapping[] = [];
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  
  try {
    await stat(uploadsDir);
  } catch (error) {
    console.log('업로드 폴더가 존재하지 않습니다.');
    return mappings;
  }

  // 업로드 폴더 내 모든 이미지 파일 찾기
  const imageFiles = await findImageFiles(uploadsDir);
  console.log(`📸 발견된 이미지 파일: ${imageFiles.length}개`);

  for (const imagePath of imageFiles) {
    const relativePath = imagePath.replace(join(process.cwd(), 'public'), '');
    // Vercel Blob URL 구성 (올바른 도메인 사용)
    const blobPath = relativePath.replace('/uploads/', '');
    const blobUrl = `https://i3otdokfzvapv5df.public.blob.vercel-storage.com/${blobPath}`;
    
    mappings.push({
      originalPath: relativePath,
      newUrl: blobUrl
    });
  }

  return mappings;
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
 * 데이터베이스의 이미지 URL들을 업데이트
 */
async function updateDatabaseUrls(mappings: UrlMapping[]): Promise<void> {
  if (mappings.length === 0) {
    console.log('업데이트할 URL 매핑이 없습니다.');
    return;
  }

  console.log('\n🔄 데이터베이스 URL 업데이트 시작...');

  // URL 매핑 생성
  const urlMapping = new Map<string, string>();
  mappings.forEach(mapping => {
    urlMapping.set(mapping.originalPath, mapping.newUrl);
  });

  try {
    // 1. product_images 테이블 업데이트 (메인 이미지 테이블)
    console.log('🖼️  상품 이미지 URL 업데이트 중...');
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

    // 2. products 테이블의 image_url 컬럼 확인 및 업데이트 (존재하는 경우만)
    try {
      console.log('📦 상품 테이블 이미지 URL 확인 중...');
      const productsResult = await query(`
        SELECT id, image_url FROM products 
        WHERE image_url IS NOT NULL AND image_url LIKE '/uploads/%'
      `);

      if (productsResult.rows.length > 0) {
        console.log(`📦 상품 테이블에서 ${productsResult.rows.length}개 이미지 URL 발견`);
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
      } else {
        console.log('📦 상품 테이블에 마이그레이션할 이미지 URL이 없습니다.');
      }
    } catch (error) {
      console.log('📦 상품 테이블의 image_url 컬럼에 접근할 수 없습니다 (컬럼이 없거나 권한 부족).');
    }

    // 3. categories 테이블의 아이콘 이미지 업데이트 (존재하는 경우)
    try {
      console.log('📁 카테고리 아이콘 URL 업데이트 중...');
      const categoriesResult = await query(`
        SELECT id, icon FROM categories 
        WHERE icon IS NOT NULL AND icon LIKE '/uploads/%'
      `);

      if (categoriesResult.rows.length > 0) {
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
      } else {
        console.log('📁 카테고리 테이블에 마이그레이션할 아이콘이 없습니다.');
      }
    } catch (error) {
      console.log('📁 categories 테이블의 icon 필드가 존재하지 않거나 접근할 수 없습니다.');
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
    console.log('🎯 데이터베이스 URL 업데이트 시작');
    console.log('=' * 50);

    // URL 매핑 생성
    const mappings = await generateUrlMappings();
    console.log(`📝 생성된 URL 매핑: ${mappings.length}개`);

    if (mappings.length === 0) {
      console.log('업데이트할 이미지가 없습니다.');
      return;
    }

    // 데이터베이스 URL 업데이트
    await updateDatabaseUrls(mappings);

    console.log('\n' + '=' * 50);
    console.log('🎊 데이터베이스 URL 업데이트 완료!');
    console.log('=' * 50);

  } catch (error) {
    console.error('💥 데이터베이스 URL 업데이트 실패:', error);
    process.exit(1);
  }
}

// 스크립트 직접 실행 시에만 main 함수 호출
if (require.main === module) {
  main();
}

export { generateUrlMappings, updateDatabaseUrls };