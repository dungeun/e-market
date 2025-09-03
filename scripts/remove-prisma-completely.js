#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files to update
const filesToUpdate = glob.sync('**/*.{ts,tsx,js,jsx}', {
  cwd: path.join(__dirname, '..'),
  ignore: [
    'node_modules/**',
    '.next/**',
    'dist/**',
    'build/**',
    'scripts/remove-prisma-completely.js'
  ]
});

let totalUpdated = 0;

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  // Skip if it's a directory
  if (fs.lstatSync(filePath).isDirectory()) {
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Remove all Prisma/db-legacy imports and replace with raw SQL
  const patterns = [
    // Replace db-legacy imports with raw SQL db
    [/@\/lib\/db-legacy\/orm/g, '@/lib/db'],
    [/@\/lib\/db-legacy\/prisma/g, '@/lib/db'],
    [/@\/lib\/db-legacy/g, '@/lib/db'],
    [/from ['"]@\/lib\/prisma['"]/g, 'from "@/lib/db"'],
    
    // Remove prisma client imports
    [/import\s+{\s*PrismaClient\s*}\s+from\s+['"]@prisma\/client['"];?\n?/g, ''],
    [/import\s+{\s*Prisma\s*}\s+from\s+['"]@prisma\/client['"];?\n?/g, ''],
    [/const\s+prisma\s*=\s*new\s+PrismaClient\(\);?\n?/g, ''],
    
    // Replace prisma references with query
    [/prisma\.\w+\.findMany/g, 'query'],
    [/prisma\.\w+\.findFirst/g, 'query'],
    [/prisma\.\w+\.findUnique/g, 'query'],
    [/prisma\.\w+\.create/g, 'query'],
    [/prisma\.\w+\.update/g, 'query'],
    [/prisma\.\w+\.delete/g, 'query'],
    [/prisma\.\w+\.upsert/g, 'query'],
    [/prisma\.\w+\.count/g, 'query'],
    
    // Clean up empty import statements
    [/import\s*{\s*}\s*from\s+['"][^'"]+['"];?\n?/g, ''],
  ];

  patterns.forEach(([pattern, replacement]) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${file}`);
    totalUpdated++;
  }
});

console.log(`\n📊 Total files updated: ${totalUpdated}`);

// Delete Prisma-related files and folders
const prismaFilesToDelete = [
  'prisma',
  'lib/db-legacy',
  'lib/prisma.ts',
  'lib/db/prisma.ts',
  'lib/db/index.ts'
];

prismaFilesToDelete.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
      console.log(`🗑️  Deleted directory: ${file}`);
    } else {
      fs.unlinkSync(filePath);
      console.log(`🗑️  Deleted file: ${file}`);
    }
  }
});

console.log('\n✨ Prisma removal complete!');