#!/bin/bash

# Production Database Setup Script
# This script applies migrations and seeds the production database

set -e  # Exit on error

echo "🚀 Setting up production database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set."
    echo ""
    echo "Please set it first:"
    echo "  export DATABASE_URL='your-railway-database-url'"
    echo ""
    echo "Or run:"
    echo "  DATABASE_URL='your-url' ./scripts/setup-production-db.sh"
    exit 1
fi

echo "📍 Using DATABASE_URL: ${DATABASE_URL%%@*}@****"  # Hide password in output

# Step 1: Apply migrations
echo ""
echo "📊 Step 1: Applying Prisma migrations..."
npx prisma migrate deploy

# Step 2: Seed database
echo ""
echo "🌱 Step 2: Seeding database with test users..."
npm run db:seed

# Step 3: Verify
echo ""
echo "🔍 Step 3: Verifying setup..."
npx prisma db execute --stdin <<EOF
SELECT email, name, role, status FROM "User" WHERE email IN ('admin@konnecthere.com', 'hr@konnecthere.com', 'user@konnecthere.com');
EOF

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📋 Test credentials:"
echo "   Admin: admin@konnecthere.com / admin123"
echo "   HR:    hr@konnecthere.com / hr123"
echo "   User:  user@konnecthere.com / user123"
echo ""
echo "🌐 Test login at: https://konnecthere.com/auth/signin"

