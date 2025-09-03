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

console.log(`Checking ${files.length} files for React.memo issues...`);

let fixedCount = 0;
let issues = [];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Check if file has React.memo
    if (content.includes('React.memo')) {
      // Look for the pattern where React.memo is used
      const memoMatch = content.match(/const\s+(\w+)\s*=\s*React\.memo\s*\(/);
      
      if (memoMatch) {
        const componentName = memoMatch[1];
        
        // Count opening and closing parentheses for React.memo
        let openCount = 0;
        let closeCount = 0;
        let inMemo = false;
        let memoStartIndex = content.indexOf('React.memo(');
        
        if (memoStartIndex !== -1) {
          // Start counting from React.memo(
          for (let i = memoStartIndex; i < content.length; i++) {
            if (content[i] === '(') {
              openCount++;
              inMemo = true;
            } else if (content[i] === ')' && inMemo) {
              closeCount++;
              
              // If we've closed all parentheses, check if it ends properly
              if (openCount === closeCount) {
                // Check what comes after the closing parenthesis
                const afterClose = content.substring(i + 1, i + 20).trim();
                
                // Should be followed by ; or });
                if (!afterClose.startsWith(';') && !afterClose.startsWith(');')) {
                  // Check if it's a function component that needs });
                  const needsClosingBrace = content.substring(memoStartIndex, i).includes('function');
                  
                  if (needsClosingBrace && !afterClose.startsWith('}')) {
                    console.log(`❌ Issue in ${file}: React.memo not properly closed (missing });)`);
                    issues.push({
                      file: filePath,
                      issue: 'React.memo not properly closed',
                      line: getLineNumber(content, i)
                    });
                  }
                }
                break;
              }
            }
          }
          
          // Check if parentheses are balanced
          if (openCount !== closeCount) {
            console.log(`❌ Issue in ${file}: Unbalanced parentheses in React.memo`);
            issues.push({
              file: filePath,
              issue: 'Unbalanced parentheses',
              openCount,
              closeCount
            });
          }
        }
        
        // Also check export statement
        if (!content.includes(`export default ${componentName}`)) {
          console.log(`⚠️ Warning in ${file}: Component ${componentName} may not be exported correctly`);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

console.log(`\n📊 Summary:`);
console.log(`- Files checked: ${files.length}`);
console.log(`- Issues found: ${issues.length}`);

if (issues.length > 0) {
  console.log('\n⚠️ Issues that need manual review:');
  issues.forEach(issue => {
    console.log(`  - ${issue.file}: ${issue.issue}`);
  });
}