#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Prisma import를 SQL ORM import로 변경하는 함수
function migratePrismaImports(content) {
  // Prisma import 패턴들
  const patterns = [
    // @/lib/db, @/lib/prisma import 변경
    { 
      from: /import\s*{\s*prisma\s*}\s*from\s*['"]@\/lib\/(?:db\/)?prisma['"]/g,
      to: "import { prisma } from '@/lib/db'"
    },
    // lib/db/prisma, lib/prisma import 변경
    {
      from: /import\s*{\s*prisma\s*}\s*from\s*['"](?:\.\.\/)*lib\/(?:db\/)?prisma['"]/g,
      to: "import { prisma } from '@/lib/db'"
    },
    // @prisma/client import 제거 또는 변경
    {
      from: /import\s*{\s*PrismaClient\s*}\s*from\s*['"]@prisma\/client['"]/g,
      to: "import { PrismaClient } from '@/lib/db'"
    },
    // Prisma 타입 import 변경
    {
      from: /import\s*(?:type\s*)?{\s*Prisma\s*}\s*from\s*['"]@prisma\/client['"]/g,
      to: "// Prisma types removed - using SQL types"
    }
  ];

  let modifiedContent = content;
  patterns.forEach(pattern => {
    modifiedContent = modifiedContent.replace(pattern.from, pattern.to);
  });

  return modifiedContent;
}

// 파일 처리 함수
async function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Prisma import가 있는지 확인
    if (content.includes('prisma') || content.includes('Prisma')) {
      const modifiedContent = migratePrismaImports(content);
      
      if (content !== modifiedContent) {
        fs.writeFileSync(filePath, modifiedContent, 'utf-8');
        console.log(`✅ 변환 완료: ${filePath}`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`❌ 오류 발생: ${filePath}`, error.message);
    return false;
  }
}

// 메인 실행 함수
async function main() {
  console.log('🚀 Prisma → SQL 마이그레이션 시작...\n');

  // 변환할 파일 패턴들
  const patterns = [
    'app/api/**/*.ts',
    'app/api/**/*.tsx',
    'lib/services/**/*.ts',
    'lib/auth/**/*.ts',
    'lib/utils/**/*.ts',
    'lib/*.ts',
    'components/**/*.ts',
    'components/**/*.tsx',
    'app/**/page.tsx',
    'app/**/layout.tsx'
  ];

  let totalFiles = 0;
  let modifiedFiles = 0;

  for (const pattern of patterns) {
    const files = glob.sync(pattern, {
      cwd: path.join(__dirname, '..'),
      absolute: true,
      ignore: ['**/node_modules/**', '**/backup/**', '**/.next/**']
    });

    for (const file of files) {
      totalFiles++;
      if (await processFile(file)) {
        modifiedFiles++;
      }
    }
  }

  console.log(`\n📊 결과:`);
  console.log(`  총 검사 파일: ${totalFiles}`);
  console.log(`  변환된 파일: ${modifiedFiles}`);
  console.log('\n✨ 마이그레이션 완료!');
}

// 실행
main().catch(console.error);