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
      // Pattern: Find }) followed by export default
      // This pattern catches React.memo functions that end with }) instead of });
      const pattern = /\)\s*\}\)\s*\nexport default/g;
      if (pattern.test(content)) {
        // Replace }) with });
        content = content.replace(/\)\s*\}\)\s*\n(export default)/g, '  )\n});\n\n$1');
        console.log(`✅ Fixed React.memo in: ${file}`);
        fixedCount++;
      }
      
      // Another pattern: just } then }) then export
      const pattern2 = /\}\s*\)\s*\}\)\s*(export default)/g;
      if (pattern2.test(content)) {
        content = content.replace(/\}\s*\)\s*\}\)\s*(export default)/g, '}\n  )\n});\n\n$1');
        console.log(`✅ Fixed React.memo in: ${file}`);
        fixedCount++;
      }
      
      // Pattern for: ) then }) then export (missing semicolon)
      const pattern3 = /\)\n\}\)\n(export default)/g;
      if (pattern3.test(content)) {
        content = content.replace(/\)\n\}\)\n(export default)/g, ')\n});\n\n$1');
        console.log(`✅ Fixed React.memo in: ${file}`);
        fixedCount++;
      }
      
      // More generic pattern: Look for }) not followed by ; before export
      const lines = content.split('\n');
      for (let i = 0; i < lines.length - 1; i++) {
        if (lines[i].trim() === '})' && lines[i + 1].trim().startsWith('export default')) {
          lines[i] = '});';
          console.log(`✅ Fixed React.memo in: ${file}`);
          fixedCount++;
          break;
        }
      }
      content = lines.join('\n');
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