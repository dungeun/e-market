#!/bin/bash

# Find all dynamic route files and fix params type
files=$(find app/api -name "*.ts" -path "*/\[*\]/*")

for file in $files; do
  echo "Checking $file..."
  
  # Check if file contains old params pattern
  if grep -q "{ params: { [a-z]*: string" "$file"; then
    echo "  Fixing $file..."
    
    # Extract parameter name (id, slug, type, etc.)
    param_name=$(grep -o "params: { [a-z]*:" "$file" | head -1 | sed 's/params: { //' | sed 's/://')
    
    # Replace params type
    sed -i '' "s/{ params: { ${param_name}: string } }/{ params: Promise<{ ${param_name}: string }> }/g" "$file"
    
    # Add await if not already present
    if ! grep -q "await params" "$file"; then
      # Add await after function declaration
      sed -i '' "/{ params: Promise<{ ${param_name}: string }> }/ {
        n
        /^) {/a\\
  const { ${param_name} } = await params
      }" "$file"
      
      # Replace direct params usage
      sed -i '' "s/params\.${param_name}/${param_name}/g" "$file"
    fi
  fi
done

echo "All files checked and fixed!"