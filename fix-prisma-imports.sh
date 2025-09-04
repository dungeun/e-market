#!/bin/bash

echo "Fixing prisma imports..."

# Find all files with prisma imports and comment them out
find . -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "import.*prisma.*from.*@/lib/db" "$file"; then
    echo "Fixing: $file"
    # Comment out prisma imports
    sed -i.bak "s/^import.*prisma.*from.*'@\/lib\/db'/\/\/ &/" "$file"
    sed -i.bak "s/^import.*prisma.*from.*\"@\/lib\/db\"/\/\/ &/" "$file"
  fi
done

# Remove backup files
find . -name "*.bak" -delete

echo "Done fixing prisma imports"