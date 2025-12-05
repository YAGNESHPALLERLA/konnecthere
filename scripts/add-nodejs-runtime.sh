#!/bin/bash

# Add export const runtime = "nodejs" to all API routes that use Prisma/bcrypt/nodemailer

find app/api -name "route.ts" -type f | while read file; do
  # Check if file uses Node.js modules
  if grep -qE "(from.*prisma|import.*prisma|@prisma|bcrypt|nodemailer)" "$file" 2>/dev/null; then
    # Check if runtime is already set
    if ! grep -q "export const runtime" "$file" 2>/dev/null; then
      # Find the first import line and add runtime export after it
      if grep -q "^import" "$file"; then
        # Get the last import line number
        last_import=$(grep -n "^import\|^export.*from" "$file" | tail -1 | cut -d: -f1)
        # Add runtime export after the last import
        sed -i "${last_import}a\\
export const runtime = \"nodejs\"\\
" "$file"
        echo "Added runtime export to $file"
      fi
    fi
  fi
done




