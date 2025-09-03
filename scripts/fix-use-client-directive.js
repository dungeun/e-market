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

console.log(`Checking ${files.length} files for 'use client' directive issues...`);

let fixedCount = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file has 'use client' but not at the top
    if (content.includes("'use client'") || content.includes('"use client"')) {
      const lines = content.split('\n');
      const firstLine = lines[0].trim();
      
      // If 'use client' is not the first line
      if (firstLine !== "'use client';" && firstLine !== '"use client";' && 
          firstLine !== "'use client'" && firstLine !== '"use client"') {
        
        // Remove 'use client' from wherever it is
        content = content.replace(/['"]use client['"];?\n?/g, '');
        
        // Add 'use client' at the very top
        content = "'use client';\n\n" + content;
        
        // Save the fixed file
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed 'use client' directive in: ${file}`);
        fixedCount++;
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n📊 Summary: Fixed ${fixedCount} files with 'use client' directive issues`);