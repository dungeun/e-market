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

console.log(`Checking and fixing ${files.length} files for React.memo issues...`);

let fixedCount = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Check if file has React.memo
    if (content.includes('React.memo')) {
      // Look for the pattern where React.memo is used
      const memoMatch = content.match(/const\s+(\w+)\s*=\s*React\.memo\s*\(function\s+\w+/);
      
      if (memoMatch) {
        const componentName = memoMatch[1];
        
        // Check if the component ends with just } instead of });
        // Find the last closing brace of the component
        const exportIndex = content.indexOf(`export default ${componentName}`);
        
        if (exportIndex !== -1) {
          // Find the closing of the function before the export
          let braceCount = 0;
          let inComponent = false;
          let lastClosingBraceIndex = -1;
          
          // Start from React.memo and count braces
          const memoStart = content.indexOf('React.memo(');
          
          for (let i = memoStart; i < exportIndex; i++) {
            if (content[i] === '{') {
              braceCount++;
              inComponent = true;
            } else if (content[i] === '}') {
              braceCount--;
              if (braceCount === 0 && inComponent) {
                lastClosingBraceIndex = i;
              }
            }
          }
          
          if (lastClosingBraceIndex !== -1) {
            // Check what comes after the last closing brace
            const afterBrace = content.substring(lastClosingBraceIndex, lastClosingBraceIndex + 10);
            
            // If it's just } followed by whitespace/newline and then export, we need to add );
            if (afterBrace.match(/^}\s*$/m)) {
              // Find the exact position to insert );
              const beforeExport = content.substring(0, exportIndex).trimEnd();
              
              if (beforeExport.endsWith('}') && !beforeExport.endsWith('});')) {
                // Replace the last } with });
                content = content.substring(0, lastClosingBraceIndex) + '});' + content.substring(lastClosingBraceIndex + 1);
                console.log(`✅ Fixed React.memo in: ${file}`);
                fixedCount++;
              }
            }
          }
        }
        
        // Also handle cases where the function declaration is inline
        // Pattern: React.memo(function ComponentName(...) { ... })
        // Should be: React.memo(function ComponentName(...) { ... });
        const inlineMemoPattern = /React\.memo\s*\(function\s+\w+[^}]+}\s*\)/g;
        let match;
        while ((match = inlineMemoPattern.exec(content)) !== null) {
          const fullMatch = match[0];
          if (!fullMatch.endsWith(');')) {
            // Count parentheses to make sure we close properly
            let openParens = 0;
            let closeParens = 0;
            
            for (let char of fullMatch) {
              if (char === '(') openParens++;
              if (char === ')') closeParens++;
            }
            
            if (openParens > closeParens) {
              // Need to add closing parenthesis
              const newMatch = fullMatch + ')';
              content = content.replace(fullMatch, newMatch);
              console.log(`✅ Fixed inline React.memo in: ${file}`);
              fixedCount++;
            }
          }
        }
      }
      
      // Fix unbalanced parentheses in React.memo
      const memoStartIndex = content.indexOf('React.memo(');
      if (memoStartIndex !== -1) {
        let openCount = 0;
        let closeCount = 0;
        let componentEndIndex = -1;
        
        // Count parentheses from React.memo( onwards
        for (let i = memoStartIndex + 10; i < content.length; i++) {
          if (content[i] === '(') {
            openCount++;
          } else if (content[i] === ')') {
            closeCount++;
            
            // Check if this might be the end of React.memo
            if (content.substring(i, i + 2) === ');' || content.substring(i, i + 3) === ');\n') {
              componentEndIndex = i;
              break;
            }
          }
          
          // Stop if we hit export statement
          if (content.substring(i, i + 6) === 'export') {
            // We should have closed React.memo by now
            if (openCount > closeCount || componentEndIndex === -1) {
              // Insert }); before export
              const beforeExport = content.substring(0, i).trimEnd();
              if (beforeExport.endsWith('}') && !beforeExport.endsWith('});')) {
                content = content.substring(0, i - 1) + '});\n\n' + content.substring(i);
                console.log(`✅ Fixed unbalanced React.memo in: ${file}`);
                fixedCount++;
              }
            }
            break;
          }
        }
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