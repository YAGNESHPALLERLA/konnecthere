#!/bin/bash
# Script to apply migration to Railway production database

echo "=========================================="
echo "Applying Migration to Railway Database"
echo "=========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set."
    echo ""
    echo "To get your Railway database URL:"
    echo "1. Go to Railway dashboard: https://railway.app"
    echo "2. Select your project"
    echo "3. Go to your PostgreSQL service"
    echo "4. Click on 'Variables' tab"
    echo "5. Copy the DATABASE_URL value"
    echo ""
    echo "Then run:"
    echo "  export DATABASE_URL='your-railway-database-url'"
    echo "  ./apply_migration_to_production.sh"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Check if it's a Railway URL
if [[ "$DATABASE_URL" == *"railway"* ]] || [[ "$DATABASE_URL" == *"railway.app"* ]]; then
    echo "✅ Detected Railway database URL"
else
    echo "⚠️  Warning: DATABASE_URL doesn't appear to be a Railway URL"
    echo "   Current URL starts with: ${DATABASE_URL:0:30}..."
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "Applying migration..."
echo ""

# Execute the migration using Prisma
npx prisma db execute --file prisma/migrations/apply_admin_fields.sql --schema prisma/schema.prisma

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Regenerate Prisma Client: npx prisma generate"
    echo "2. Test your admin portal at https://konnecthere.com/admin"
    echo ""
else
    echo ""
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi

