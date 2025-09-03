#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all React component files
const componentFiles = glob.sync('{components,app}/**/*.{tsx,jsx}', {
  cwd: path.join(__dirname, '..'),
  ignore: [
    '**/*.test.tsx',
    '**/*.spec.tsx',
    '**/layout.tsx',
    '**/page.tsx',
    '**/*.stories.tsx'
  ]
});

console.log(`Found ${componentFiles.length} component files`);

let stats = {
  totalFiles: componentFiles.length,
  updatedFiles: 0,
  alreadyMemoized: 0,
  skippedFiles: 0,
  errorFiles: 0
};

// Components that should definitely use React.memo
const priorityComponents = [
  'ProductCard',
  'RelatedProducts',
  'Header',
  'Footer',
  'CategorySection',
  'RankingSection',
  'HeroSection',
  'DynamicSectionRenderer',
  'HomePage',
  'AutoSlideBanner',
  'HomeSections',
  'RecommendedSection'
];

function shouldApplyMemo(content, fileName) {
  // Check if it's a component (has export default function or const)
  const isComponent = /export\s+(default\s+)?function\s+\w+/.test(content) ||
                     /export\s+(default\s+)?const\s+\w+\s*=\s*(\(|function)/.test(content);
  
  if (!isComponent) return false;

  // Check if it's already memoized
  if (content.includes('React.memo') || content.includes('memo(')) {
    return false;
  }

  // Check if it's in priority list
  const baseName = path.basename(fileName, path.extname(fileName));
  return priorityComponents.includes(baseName) || 
         content.includes('props') || 
         content.includes('({ ');
}

function applyReactMemo(content, fileName) {
  const baseName = path.basename(fileName, path.extname(fileName));
  
  // Add React import if not present
  if (!content.includes("import React") && !content.includes("import { memo")) {
    content = `import React from 'react';\n` + content;
  }

  // Pattern 1: export default function ComponentName
  content = content.replace(
    /export\s+default\s+function\s+(\w+)/g,
    (match, componentName) => {
      return `const ${componentName} = React.memo(function ${componentName}`;
    }
  );

  // Add export default at the end for pattern 1
  if (content.includes('const ' + baseName + ' = React.memo')) {
    if (!content.includes('export default ' + baseName)) {
      content += `\nexport default ${baseName};`;
    }
  }

  // Pattern 2: export default () => {} or export default function() {}
  content = content.replace(
    /export\s+default\s+(\(.*?\)\s*=>\s*{|function\s*\(.*?\)\s*{)/,
    (match, funcDef) => {
      return `export default React.memo(${funcDef}`;
    }
  );

  // Close React.memo properly
  if (content.includes('React.memo(function') || content.includes('React.memo((')) {
    // Find the last closing brace and add closing parenthesis
    const lastBraceIndex = content.lastIndexOf('}');
    if (lastBraceIndex !== -1 && !content.includes('});')) {
      content = content.slice(0, lastBraceIndex + 1) + ')' + content.slice(lastBraceIndex + 1);
    }
  }

  return content;
}

// Process each file
componentFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const backupPath = path.join(__dirname, '..', 'backups', '2025-01-09', file.replace(/\//g, '-'));
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (!shouldApplyMemo(content, file)) {
      if (content.includes('React.memo') || content.includes('memo(')) {
        console.log(`✓ Already memoized: ${file}`);
        stats.alreadyMemoized++;
      } else {
        stats.skippedFiles++;
      }
      return;
    }

    // Create backup
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    fs.writeFileSync(backupPath, content);

    // Apply React.memo
    const updatedContent = applyReactMemo(content, file);
    
    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Applied React.memo: ${file}`);
      stats.updatedFiles++;
    } else {
      stats.skippedFiles++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
    stats.errorFiles++;
  }
});

console.log('\n📊 React.memo Application Summary:');
console.log(`Total files: ${stats.totalFiles}`);
console.log(`Updated files: ${stats.updatedFiles}`);
console.log(`Already memoized: ${stats.alreadyMemoized}`);
console.log(`Skipped files: ${stats.skippedFiles}`);
console.log(`Errors: ${stats.errorFiles}`);

console.log('\n✅ All files backed up to backups/2025-01-09/');