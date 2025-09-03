#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of files to fix
const filesToFix = [
  'components/orvio/TestimonialSection.tsx',
  'components/orvio/CategoriesSection.tsx',
  'components/orvio/BestSellersSection.tsx',
  'components/HomePage.old.tsx',
  'app/admin/ui-config/sections/quicklinks/page-improved.tsx'
];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Extract component name from React.memo
    const memoMatch = content.match(/const\s+(\w+)\s*=\s*React\.memo\s*\(/);
    
    if (memoMatch) {
      const componentName = memoMatch[1];
      
      // Check if file already has export default
      if (!content.includes(`export default ${componentName}`)) {
        // Add export default at the end
        // First, ensure React.memo is properly closed
        if (content.includes('})') && !content.includes('});')) {
          // Find the last }) and replace with });
          const lastIndex = content.lastIndexOf('})');
          if (lastIndex !== -1) {
            content = content.substring(0, lastIndex) + '});' + content.substring(lastIndex + 2);
          }
        }
        
        // Add export statement
        if (!content.trim().endsWith(`export default ${componentName};`)) {
          content = content.trim() + `\n\nexport default ${componentName};`;
          console.log(`✅ Added export to: ${file}`);
        }
      } else {
        // Just fix the React.memo closing if needed
        const exportIndex = content.indexOf(`export default ${componentName}`);
        if (exportIndex !== -1) {
          // Check what comes before export
          const beforeExport = content.substring(0, exportIndex).trim();
          if (beforeExport.endsWith('})') && !beforeExport.endsWith('});')) {
            // Replace last }) with });
            const lastBraceIndex = beforeExport.lastIndexOf('})');
            if (lastBraceIndex !== -1) {
              content = content.substring(0, lastBraceIndex) + '});' + content.substring(lastBraceIndex + 2);
              console.log(`✅ Fixed React.memo closing in: ${file}`);
            }
          }
        }
      }
    }
    
    // Save if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n✅ Finished fixing orvio components and special files');