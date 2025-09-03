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
    '**/*.test.{ts,tsx,js,jsx}',
    '**/*.spec.{ts,tsx,js,jsx}',
    '**/test-*.{ts,tsx,js,jsx}'
  ]
});

console.log(`Found ${files.length} files to process`);

let stats = {
  totalFiles: files.length,
  updatedFiles: 0,
  totalConsoleLogs: 0,
  removedLogs: 0
};

function removeConsoleLogs(content) {
  let removed = 0;
  
  // Count existing console statements
  const consoleMatches = content.match(/console\.(log|error|warn|info|debug|trace)/g);
  const originalCount = consoleMatches ? consoleMatches.length : 0;
  
  // Remove console.log, console.error, console.warn, etc.
  // But keep console statements in development blocks
  let updated = content;
  
  // Remove standalone console statements
  updated = updated.replace(/^\s*console\.(log|error|warn|info|debug|trace)\([^)]*\);?\s*$/gm, '');
  
  // Remove console statements that span multiple lines
  updated = updated.replace(/console\.(log|error|warn|info|debug|trace)\([^)]*\n[^)]*\);?/gm, '');
  
  // Remove console statements with complex content
  updated = updated.replace(/console\.(log|error|warn|info|debug|trace)\([\s\S]*?\);/gm, (match) => {
    // Keep if it's in a development check
    if (match.includes('NODE_ENV') || match.includes('development')) {
      return match;
    }
    removed++;
    return '';
  });
  
  // Clean up empty lines left behind
  updated = updated.replace(/^\s*\n\s*\n/gm, '\n');
  
  // Count remaining console statements
  const remainingMatches = updated.match(/console\.(log|error|warn|info|debug|trace)/g);
  const remainingCount = remainingMatches ? remainingMatches.length : 0;
  
  removed = originalCount - remainingCount;
  
  return { updated, removed, originalCount };
}

// Process each file
files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const backupPath = path.join(__dirname, '..', 'backups', '2025-01-09', 'console-logs', file.replace(/\//g, '-'));
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { updated, removed, originalCount } = removeConsoleLogs(content);
    
    stats.totalConsoleLogs += originalCount;
    
    if (removed > 0) {
      // Create backup
      const backupDir = path.dirname(backupPath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      fs.writeFileSync(backupPath, content);
      
      // Write updated content
      fs.writeFileSync(filePath, updated);
      
      console.log(`✅ Removed ${removed} console statements from: ${file}`);
      stats.updatedFiles++;
      stats.removedLogs += removed;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n📊 Console.log Removal Summary:');
console.log(`Total files processed: ${stats.totalFiles}`);
console.log(`Files updated: ${stats.updatedFiles}`);
console.log(`Total console statements found: ${stats.totalConsoleLogs}`);
console.log(`Console statements removed: ${stats.removedLogs}`);
console.log(`Remaining (in dev blocks): ${stats.totalConsoleLogs - stats.removedLogs}`);

console.log('\n✅ All files backed up to backups/2025-01-09/console-logs/');