#!/bin/bash

files=(
  "app/api/admin/content/[id]/route.ts"
  "app/api/admin/content/route.ts"
  "app/api/admin/payments/[id]/route.ts"
  "app/api/admin/payments/route.ts"
  "app/api/content/[id]/media/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing token type in $file"
    sed -i '' 's/let token = null/let token: string | null | undefined = null/g' "$file"
  fi
done

echo "Done fixing token types"