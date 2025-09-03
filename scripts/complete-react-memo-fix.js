#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all React component files
const files = glob.sync('{components,app}/**/*.{tsx,jsx}', {
  cwd: path.join(__dirname, '..'),
  ignore: [
    'node_modules/**',
    '.next/**',
    'dist/**',
    'build/**',
    'backups/**'
  ]
});

console.log(`Fixing React.memo in ${files.length} files...`);

let fixedCount = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Check if file has React.memo
    if (content.includes('React.memo')) {
      // Pattern 1: React.memo(function ComponentName
      const pattern1 = /const\s+(\w+)\s*=\s*React\.memo\s*\(function\s+\w+[^]*?\n\}\s*\n/g;
      content = content.replace(pattern1, (match, componentName) => {
        if (!match.endsWith('});\n')) {
          // Fix it by adding );
          return match.trimEnd() + ');\n';
        }
        return match;
      });
      
      // Pattern 2: Find components that end with just } before export
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('React.memo(function')) {
          // Found React.memo start, now find its end
          let braceCount = 0;
          let functionStarted = false;
          
          for (let j = i; j < lines.length; j++) {
            const line = lines[j];
            
            // Count braces
            for (let char of line) {
              if (char === '{') {
                braceCount++;
                functionStarted = true;
              } else if (char === '}') {
                braceCount--;
              }
            }
            
            // If we've closed all braces and the next line is export
            if (functionStarted && braceCount === 0) {
              // Check if this line ends with } but not });
              if (lines[j].trim() === '}' && j + 1 < lines.length) {
                // Check if next non-empty line is export
                let nextNonEmpty = j + 1;
                while (nextNonEmpty < lines.length && lines[nextNonEmpty].trim() === '') {
                  nextNonEmpty++;
                }
                
                if (nextNonEmpty < lines.length && lines[nextNonEmpty].includes('export default')) {
                  // This } should be });
                  lines[j] = '});';
                  console.log(`✅ Fixed React.memo closing in: ${file}`);
                  fixedCount++;
                  break;
                }
              } else if (lines[j].trim().endsWith('}') && !lines[j].trim().endsWith('});')) {
                // Check if this is the end of the React.memo function
                let nextNonEmpty = j + 1;
                while (nextNonEmpty < lines.length && lines[nextNonEmpty].trim() === '') {
                  nextNonEmpty++;
                }
                
                if (nextNonEmpty < lines.length && lines[nextNonEmpty].includes('export default')) {
                  // Replace } with });
                  lines[j] = lines[j].replace(/\}$/, '});');
                  console.log(`✅ Fixed React.memo closing in: ${file}`);
                  fixedCount++;
                  break;
                }
              }
              
              // Stop searching after closing all braces
              if (functionStarted && braceCount === 0) {
                break;
              }
            }
          }
        }
      }
      
      // Reconstruct content from lines
      const newContent = lines.join('\n');
      if (newContent !== originalContent) {
        content = newContent;
      }
      
      // Pattern 3: Fix components where React.memo is not properly closed at all
      // Look for pattern: React.memo(function ... }) without the closing )
      if (content.includes('React.memo(')) {
        const memoRegex = /(React\.memo\s*\(function[^]*?)(\}\s*)(export\s+default)/g;
        content = content.replace(memoRegex, (match, memoPart, closingBrace, exportPart) => {
          if (!closingBrace.includes(');')) {
            return memoPart + '});\n\n' + exportPart;
          }
          return match;
        });
      }
    }
    
    // Save the fixed file if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n📊 Summary: Fixed ${fixedCount} files with React.memo issues`);