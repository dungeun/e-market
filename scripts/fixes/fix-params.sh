#!/bin/bash

# Fix all route files with params type issue for Next.js 15

files=(
  "app/api/admin/campaigns/[id]/reject/route.ts"
  "app/api/admin/campaigns/[id]/payment-status/route.ts"
  "app/api/admin/campaigns/[id]/status/route.ts"
  "app/api/admin/campaigns/[id]/route.ts"
)

for file in "${files[@]}"; do
  echo "Fixing $file..."
  
  # Replace params type and add await
  sed -i '' 's/{ params: { id: string } }/{ params: Promise<{ id: string }> }/g' "$file"
  
  # Add await params after the function declaration
  sed -i '' '/{ params: Promise<{ id: string }> }/ {
    n
    s/) {/) {\
  const { id } = await params/
  }' "$file"
  
  # Replace params.id with id
  sed -i '' 's/params\.id/id/g' "$file"
done

echo "All files fixed!"