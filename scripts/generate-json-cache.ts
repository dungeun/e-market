#!/usr/bin/env tsx

/**
 * JSON 캐시 생성 스크립트
 * 실행: npx tsx scripts/generate-json-cache.ts
 */

import { JsonCacheService } from '../lib/services/json-cache.service';
import { prisma } from '../lib/db/orm';
import fs from 'fs/promises';
import path from 'path';

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

async function generateJsonCache() {
  console.log(`${colors.blue}${colors.bright}=====================================${colors.reset}`);
  console.log(`${colors.cyan}🚀 JSON Cache Generation Script${colors.reset}`);
  console.log(`${colors.blue}${colors.bright}=====================================${colors.reset}\n`);

  try {
    // 1. 데이터베이스 연결 확인
    console.log(`${colors.yellow}📊 Checking database connection...${colors.reset}`);
    const productCount = await query();
    console.log(`${colors.green}✅ Database connected. Found ${productCount} products.${colors.reset}\n`);

    // 2. 기존 캐시 백업
    const cacheDir = path.join(process.cwd(), 'public/cache/products');
    const backupDir = path.join(process.cwd(), 'public/cache/backups', new Date().toISOString().replace(/[:.]/g, '-'));
    
    try {
      await fs.access(cacheDir);
      console.log(`${colors.yellow}💾 Backing up existing cache...${colors.reset}`);
      await fs.mkdir(path.dirname(backupDir), { recursive: true });
      await fs.cp(cacheDir, backupDir, { recursive: true });
      console.log(`${colors.green}✅ Backup created at: ${backupDir}${colors.reset}\n`);
    } catch {
      console.log(`${colors.cyan}ℹ️  No existing cache found. Skipping backup.${colors.reset}\n`);
    }

    // 3. JSON 캐시 생성
    console.log(`${colors.yellow}🔄 Generating JSON cache files...${colors.reset}`);
    const jsonCacheService = new JsonCacheService();
    await jsonCacheService.generateProductCache();

    // 4. 생성된 파일 확인
    console.log(`\n${colors.yellow}📂 Verifying generated files...${colors.reset}`);
    const generatedFiles = await fs.readdir(cacheDir);
    const jsonFiles = generatedFiles.filter(f => f.endsWith('.json'));
    
    console.log(`${colors.green}✅ Generated ${jsonFiles.length} JSON files:${colors.reset}`);
    for (const file of jsonFiles.slice(0, 10)) {
      const filePath = path.join(cacheDir, file);
      const stats = await fs.stat(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   📄 ${file} (${sizeKB} KB)`);
    }
    if (jsonFiles.length > 10) {
      console.log(`   ... and ${jsonFiles.length - 10} more files`);
    }

    // 5. 인덱스 파일 확인
    const indexPath = path.join(cacheDir, 'index.json');
    try {
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      const index = JSON.parse(indexContent);
      console.log(`\n${colors.cyan}📋 Index file summary:${colors.reset}`);
      console.log(`   - Version: ${index.version}`);
      console.log(`   - Languages: ${index.languages.join(', ')}`);
      console.log(`   - Page Size: ${index.pageSize} products per page`);
      console.log(`   - TTL: ${index.ttl} seconds`);
      console.log(`   - Generated: ${new Date(index.generated).toLocaleString()}`);
    } catch (error) {
      console.log(`${colors.red}⚠️  Warning: Could not read index file${colors.reset}`);
    }

    // 6. 성공 메시지
    console.log(`\n${colors.green}${colors.bright}=====================================${colors.reset}`);
    console.log(`${colors.green}✨ JSON cache generation completed successfully!${colors.reset}`);
    console.log(`${colors.green}${colors.bright}=====================================${colors.reset}`);
    
    console.log(`\n${colors.cyan}📌 Next steps:${colors.reset}`);
    console.log(`   1. Test the cache by visiting: http://localhost:3000`);
    console.log(`   2. Set up cron job for periodic regeneration`);
    console.log(`   3. Configure CDN for production deployment`);
    
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}❌ Error generating JSON cache:${colors.reset}`);
    console.error(`${colors.red}${error instanceof Error ? error.message : 'Unknown error'}${colors.reset}`);
    
    if (error instanceof Error && error.stack) {
      console.error(`\n${colors.yellow}Stack trace:${colors.reset}`);
      console.error(error.stack);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log(`\n${colors.cyan}👋 Script execution finished.${colors.reset}`);
  }
}

// 스크립트 실행
generateJsonCache().catch(console.error);