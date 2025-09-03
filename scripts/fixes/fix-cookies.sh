#!/bin/bash

# Fix all cookies() calls to await them (Next.js 15 requirement)
files=$(grep -r "const cookieStore = cookies()" app/api --include="*.ts" -l)

for file in $files; do
  echo "Fixing $file..."
  sed -i '' 's/const cookieStore = cookies()/const cookieStore = await cookies()/g' "$file"
done

echo "All cookies() calls fixed!"