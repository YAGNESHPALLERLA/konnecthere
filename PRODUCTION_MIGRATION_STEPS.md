# Production Database Migration Steps

## Issue
The production database needs the new profile fields migration applied. This is causing login failures because Prisma Client expects these columns to exist.

## Solution

### Option 1: Apply Migration via Vercel (Recommended)

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Ensure `DATABASE_URL` is set** with your production database connection string
3. **Go to Deployments** → Click on the latest deployment → View Function Logs
4. **Or use Vercel CLI** to run the migration:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run migration in production
vercel env pull .env.production
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-)
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy
```

### Option 2: Apply Migration Directly to Database

1. **Connect to your production database** (Railway, Neon, Supabase, etc.)
2. **Run the migration SQL**:

```sql
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "bio" TEXT,
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "currentTitle" TEXT,
ADD COLUMN IF NOT EXISTS "website" TEXT,
ADD COLUMN IF NOT EXISTS "linkedin" TEXT,
ADD COLUMN IF NOT EXISTS "github" TEXT,
ADD COLUMN IF NOT EXISTS "twitter" TEXT,
ADD COLUMN IF NOT EXISTS "education" JSONB,
ADD COLUMN IF NOT EXISTS "experience" JSONB,
ADD COLUMN IF NOT EXISTS "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "availability" TEXT,
ADD COLUMN IF NOT EXISTS "salaryExpectation" TEXT,
ADD COLUMN IF NOT EXISTS "preferredLocation" TEXT;
```

### Option 3: Use the Migration Script

```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run the migration script
npx tsx scripts/apply-migration-production.ts
```

### Verify Migration Applied

After applying the migration, verify it worked:

1. **Check Vercel Function Logs** for any database errors
2. **Test login** with:
   - `admin@konnecthere.com` / `admin123`
   - `hr@konnecthere.com` / `hr123`
   - `user@konnecthere.com` / `user123`

### If Users Don't Exist in Production

If the test users don't exist, seed the production database:

```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run seed script
npm run db:seed
```

**Note:** Make sure your production `DATABASE_URL` is correct and has the necessary permissions.

## Quick Fix for Immediate Testing

If you need to test immediately, you can temporarily disable the new fields in the Prisma schema by commenting them out, but this is **NOT recommended** for production. The proper solution is to apply the migration.

