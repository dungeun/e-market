#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all API route files
const apiRoutes = glob.sync('app/api/**/*.ts', {
  cwd: path.join(__dirname, '..'),
  ignore: ['**/*.test.ts', '**/*.spec.ts']
});

console.log(`Found ${apiRoutes.length} API route files`);

// Statistics
let stats = {
  totalFiles: apiRoutes.length,
  updatedFiles: 0,
  skippedFiles: 0,
  errorFiles: 0
};

// Check if file already uses the new handler
function isAlreadyRefactored(content) {
  return content.includes('createApiHandler') || 
         content.includes('@/lib/api/handler');
}

// Simple refactoring for GET endpoints
function refactorSimpleGET(content) {
  if (!content.includes('export async function GET')) {
    return null;
  }

  // Check if it's a simple GET without auth
  const hasAuth = content.includes('authorization') || 
                  content.includes('Bearer') || 
                  content.includes('jwt');
  
  const isAdmin = content.includes('/api/admin/');

  let refactored = `import { createApiHandler, success, error } from '@/lib/api/handler';\n`;
  
  // Extract existing imports
  const imports = content.match(/import .* from ['"].*['"];?/g) || [];
  imports.forEach(imp => {
    if (!imp.includes('NextResponse') && !imp.includes('NextRequest')) {
      refactored += imp + '\n';
    }
  });

  refactored += '\n';
  refactored += `export const GET = createApiHandler({\n`;
  
  if (isAdmin || hasAuth) {
    refactored += `  adminOnly: true,\n`;
  }
  
  refactored += `  cache: { enabled: true, ttl: 60 },\n`;
  refactored += `  handler: async (request, context) => {\n`;
  refactored += `    // TODO: Implement handler logic\n`;
  refactored += `    return success({ data: 'refactored' });\n`;
  refactored += `  }\n`;
  refactored += `});\n`;

  return refactored;
}

// Process each file
apiRoutes.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const backupPath = path.join(__dirname, '..', 'backups', '2025-01-09', file.replace(/\//g, '-'));
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already refactored
    if (isAlreadyRefactored(content)) {
      console.log(`✓ Already refactored: ${file}`);
      stats.skippedFiles++;
      return;
    }

    // Create backup
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.writeFileSync(backupPath, content);

    // For now, just mark files that need manual refactoring
    // In a real scenario, we'd do more sophisticated AST-based refactoring
    if (content.includes('export async function GET') || 
        content.includes('export async function POST') ||
        content.includes('export async function PUT') ||
        content.includes('export async function DELETE')) {
      
      console.log(`⚠️  Needs refactoring: ${file}`);
      stats.updatedFiles++;
      
      // Add a TODO comment at the top
      const todoContent = `// TODO: Refactor to use createApiHandler from @/lib/api/handler\n` + content;
      fs.writeFileSync(filePath, todoContent);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
    stats.errorFiles++;
  }
});

console.log('\n📊 Refactoring Summary:');
console.log(`Total files: ${stats.totalFiles}`);
console.log(`Files needing update: ${stats.updatedFiles}`);
console.log(`Already refactored: ${stats.skippedFiles}`);
console.log(`Errors: ${stats.errorFiles}`);

console.log('\n✅ All files backed up to backups/2025-01-09/');
console.log('📝 Files marked with TODO comments for manual refactoring');