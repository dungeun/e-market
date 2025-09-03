const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript and JavaScript files
const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
  cwd: '/Users/admin/new_project/commerce-nextjs',
  absolute: true,
  ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**']
});

console.log(`Found ${files.length} files to check`);

let updatedCount = 0;

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let updated = false;
    
    // Replace @/lib/db with @/lib/db
    if (content.includes('@/lib/db')) {
      content = content.replace(/@\/lib\/db\/orm/g, '@/lib/db');
      updated = true;
    }
    
    // Replace @/lib/db/query-utils with @/lib/db/query-utils
    if (content.includes('@/lib/db/query-utils')) {
      content = content.replace(/@\/lib\/db\/query-utils/g, '@/lib/db/query-utils');
      updated = true;
    }
    
    // Replace @/lib/db/redis with @/lib/db/redis
    if (content.includes('@/lib/db/redis')) {
      content = content.replace(/@\/lib\/db\/redis/g, '@/lib/db/redis');
      updated = true;
    }
    
    // Replace @/lib/db/index with @/lib/db/index
    if (content.includes('@/lib/db/index')) {
      content = content.replace(/@\/lib\/db\/index/g, '@/lib/db/index');
      updated = true;
    }
    
    // Replace other @/lib/db/ imports that are not @/lib/db itself
    const dbPattern = /@\/lib\/db\/(?!['"])/g;
    if (dbPattern.test(content)) {
      content = content.replace(/@\/lib\/db\/(?!['"])/g, '@/lib/db/');
      updated = true;
    }
    
    if (updated) {
      fs.writeFileSync(file, content, 'utf8');
      updatedCount++;
      console.log(`✅ Updated: ${path.relative('/Users/admin/new_project/commerce-nextjs', file)}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✅ Updated ${updatedCount} files`);
console.log('🔄 Remember to restart your dev server!');