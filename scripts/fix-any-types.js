#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript files
const files = glob.sync('**/*.{ts,tsx}', {
  cwd: path.join(__dirname, '..'),
  ignore: [
    'node_modules/**',
    '.next/**',
    'dist/**',
    'build/**',
    'scripts/**',
    'backups/**',
    '**/*.d.ts'
  ]
});

console.log(`Found ${files.length} TypeScript files to process`);

let stats = {
  totalFiles: files.length,
  updatedFiles: 0,
  totalAnyTypes: 0,
  fixedAnyTypes: 0
};

// Common type replacements
const typeReplacements = {
  // Function parameters
  '(error: any)': '(error: Error | unknown)',
  '(e: any)': '(e: Error | unknown)',
  '(err: any)': '(err: Error | unknown)',
  '(data: any)': '(data: unknown)',
  '(value: any)': '(value: unknown)',
  '(item: any)': '(item: unknown)',
  '(result: any)': '(result: unknown)',
  '(response: any)': '(response: unknown)',
  '(req: any)': '(req: NextRequest)',
  '(res: any)': '(res: NextResponse)',
  
  // Type declarations
  ': any[]': ': unknown[]',
  ': any;': ': unknown;',
  ': any)': ': unknown)',
  ': any,': ': unknown,',
  ': any =': ': unknown =',
  ': any |': ': unknown |',
  
  // Specific patterns
  'as any': 'as unknown',
  '<any>': '<unknown>',
  'Promise<any>': 'Promise<unknown>',
  'useState<any>': 'useState<unknown>',
  'useRef<any>': 'useRef<unknown>',
  
  // Common object types
  'Record<string, any>': 'Record<string, unknown>',
  'Record<string,any>': 'Record<string, unknown>',
  '{[key: string]: any}': 'Record<string, unknown>',
  '{ [key: string]: any }': 'Record<string, unknown>'
};

function fixAnyTypes(content, filePath) {
  let updated = content;
  let fixedCount = 0;
  
  // Count existing any types
  const anyMatches = content.match(/: any|as any|<any>|any\[\]/g);
  const originalCount = anyMatches ? anyMatches.length : 0;
  
  // Add import for common types if needed
  if (originalCount > 0 && !content.includes('@/lib/types/common')) {
    const hasNextImport = content.includes('next/');
    if (hasNextImport && content.includes('error:')) {
      updated = `import type { AppError } from '@/lib/types/common';\n` + updated;
    }
    if (content.includes('user:') || content.includes('userId:')) {
      updated = `import type { User, RequestContext } from '@/lib/types/common';\n` + updated;
    }
  }
  
  // Apply replacements
  Object.entries(typeReplacements).forEach(([pattern, replacement]) => {
    const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const before = updated.length;
    updated = updated.replace(regex, replacement);
    if (updated.length !== before) {
      fixedCount++;
    }
  });
  
  // Fix specific patterns based on context
  if (filePath.includes('/api/')) {
    // API route specific fixes
    updated = updated.replace(/export async function (GET|POST|PUT|DELETE)\((.*?): any\)/g, 
                              'export async function $1($2: NextRequest)');
    updated = updated.replace(/params: any/g, 'params: Record<string, string>');
  }
  
  if (filePath.includes('components/')) {
    // Component specific fixes
    updated = updated.replace(/props: any/g, 'props: Record<string, unknown>');
    updated = updated.replace(/children: any/g, 'children: React.ReactNode');
  }
  
  // Fix error handling patterns
  updated = updated.replace(/catch \((.*?): any\)/g, 'catch ($1: unknown)');
  updated = updated.replace(/error: any/g, 'error: Error | unknown');
  
  // Fix state and ref types
  updated = updated.replace(/useState<any>\(/g, 'useState<unknown>(');
  updated = updated.replace(/useRef<any>\(/g, 'useRef<unknown>(');
  
  // Count remaining any types
  const remainingMatches = updated.match(/: any|as any|<any>|any\[\]/g);
  const remainingCount = remainingMatches ? remainingMatches.length : 0;
  
  fixedCount = originalCount - remainingCount;
  
  return { updated, fixedCount, originalCount };
}

// Process each file
files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const backupPath = path.join(__dirname, '..', 'backups', '2025-01-09', 'any-types', file.replace(/\//g, '-'));
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { updated, fixedCount, originalCount } = fixAnyTypes(content, file);
    
    stats.totalAnyTypes += originalCount;
    
    if (fixedCount > 0) {
      // Create backup
      const backupDir = path.dirname(backupPath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      fs.writeFileSync(backupPath, content);
      
      // Write updated content
      fs.writeFileSync(filePath, updated);
      
      console.log(`✅ Fixed ${fixedCount} any types in: ${file}`);
      stats.updatedFiles++;
      stats.fixedAnyTypes += fixedCount;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n📊 TypeScript Any Type Fix Summary:');
console.log(`Total files processed: ${stats.totalFiles}`);
console.log(`Files updated: ${stats.updatedFiles}`);
console.log(`Total any types found: ${stats.totalAnyTypes}`);
console.log(`Any types fixed: ${stats.fixedAnyTypes}`);
console.log(`Remaining any types: ${stats.totalAnyTypes - stats.fixedAnyTypes}`);

console.log('\n✅ All files backed up to backups/2025-01-09/any-types/');
console.log('📝 Remaining any types may need manual review');