#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript and JavaScript files
const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
  cwd: path.join(__dirname, '..'),
  ignore: [
    'node_modules/**',
    '.next/**',
    'dist/**',
    'build/**',
    'scripts/**',
    'backups/**',
    '.env*',
    'lib/config/env.ts'
  ]
});

console.log(`Found ${files.length} files to process`);

let stats = {
  totalFiles: files.length,
  updatedFiles: 0,
  totalReplacements: 0
};

// Patterns to replace
const replacements = [
  // URLs
  { pattern: /['"]http:\/\/localhost:3000['"]/g, replacement: "env.appUrl" },
  { pattern: /['"]http:\/\/localhost:3001['"]/g, replacement: "env.appUrl" },
  { pattern: /['"]http:\/\/localhost:3002['"]/g, replacement: "env.appUrl" },
  { pattern: /['"]http:\/\/localhost:3004['"]/g, replacement: "env.appUrl" },
  { pattern: /['"]localhost:3000['"]/g, replacement: "env.appUrl.replace('http://', '')" },
  { pattern: /['"]localhost:3004['"]/g, replacement: "env.appUrl.replace('http://', '')" },
  
  // Database
  { pattern: /['"]localhost:5432['"]/g, replacement: "`${env.database.host}:${env.database.port}`" },
  { pattern: /port:\s*5432/g, replacement: "port: env.database.port" },
  { pattern: /DB_PORT\s*\|\|\s*['"]5432['"]/g, replacement: "DB_PORT || '5432'" }, // Keep defaults in db.ts
  
  // Redis
  { pattern: /['"]localhost:6379['"]/g, replacement: "`${env.redis.host}:${env.redis.port}`" },
  { pattern: /port:\s*6379/g, replacement: "port: env.redis.port" },
  { pattern: /REDIS_PORT\s*\|\|\s*['"]6379['"]/g, replacement: "REDIS_PORT || '6379'" }, // Keep defaults
  
  // JWT Secret
  { pattern: /['"]your-secret-key['"]/g, replacement: "env.jwt.secret" },
  { pattern: /['"]change-this-in-production['"]/g, replacement: "env.jwt.secret" },
];

function replaceHardcodedValues(content, filePath) {
  let updated = content;
  let replacementCount = 0;
  
  // Skip if already imports env
  const hasEnvImport = content.includes("from '@/lib/config/env'") || 
                      content.includes('from "@/lib/config/env"');
  
  // Check if file needs replacement
  let needsReplacement = false;
  for (const { pattern } of replacements) {
    if (pattern.test(content)) {
      needsReplacement = true;
      break;
    }
  }
  
  if (!needsReplacement) {
    return { updated, replacementCount: 0 };
  }
  
  // Add import if needed
  if (!hasEnvImport && !filePath.includes('.env') && !filePath.includes('config/')) {
    const hasImports = content.includes('import ');
    if (hasImports) {
      // Add after first import
      updated = updated.replace(/^(import\s+.*?;?\n)/m, "$1import { env } from '@/lib/config/env';\n");
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      // Add at top of file
      updated = "import { env } from '@/lib/config/env';\n\n" + updated;
    }
  }
  
  // Apply replacements
  replacements.forEach(({ pattern, replacement }) => {
    const matches = updated.match(pattern);
    if (matches) {
      replacementCount += matches.length;
      updated = updated.replace(pattern, replacement);
    }
  });
  
  return { updated, replacementCount };
}

// Process each file
files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const backupPath = path.join(__dirname, '..', 'backups', '2025-01-09', 'hardcoded', file.replace(/\//g, '-'));
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { updated, replacementCount } = replaceHardcodedValues(content, file);
    
    if (replacementCount > 0) {
      // Create backup
      const backupDir = path.dirname(backupPath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      fs.writeFileSync(backupPath, content);
      
      // Write updated content
      fs.writeFileSync(filePath, updated);
      
      console.log(`✅ Replaced ${replacementCount} hardcoded values in: ${file}`);
      stats.updatedFiles++;
      stats.totalReplacements += replacementCount;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n📊 Hardcoded Values Replacement Summary:');
console.log(`Total files processed: ${stats.totalFiles}`);
console.log(`Files updated: ${stats.updatedFiles}`);
console.log(`Total replacements: ${stats.totalReplacements}`);

console.log('\n✅ All files backed up to backups/2025-01-09/hardcoded/');
console.log('📝 Remember to update .env file with actual values');