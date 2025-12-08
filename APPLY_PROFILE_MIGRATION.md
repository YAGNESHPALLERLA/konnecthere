# Apply Profile Migration to Production

## New Profile Fields Added

The following fields have been added to the User profile:

1. **Experience Level** - "FRESHER" or "EXPERIENCED"
2. **Years of Experience** - Integer (0-50)
3. **Date of Birth** - DateTime
4. **Gender** - "MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"
5. **Languages** - Array of strings (e.g., ["English", "Spanish", "Hindi"])
6. **Certifications** - Array of strings (e.g., ["AWS Certified", "PMP"])
7. **Portfolio URL** - String (URL to portfolio)

## Apply Migration to Production

### Method 1: Using Prisma Migrate (Recommended)

```bash
# Set your Railway DATABASE_URL
export DATABASE_URL="your-railway-database-url-here"

# Apply the migration
npx prisma migrate deploy
```

### Method 2: Using SQL Directly in Railway

1. Go to Railway → Your Postgres Service → Database → Data tab
2. Look for a SQL editor or use a database client
3. Run this SQL:

```sql
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "experienceLevel" TEXT,
ADD COLUMN IF NOT EXISTS "yearsOfExperience" INTEGER,
ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "gender" TEXT,
ADD COLUMN IF NOT EXISTS "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "portfolioUrl" TEXT;
```

### Method 3: Using the Setup Script

```bash
DATABASE_URL="your-railway-database-url" ./scripts/setup-production-db.sh
```

## Verify Migration

After applying the migration, verify it worked:

```bash
DATABASE_URL="your-railway-database-url" npm run db:test
```

Or check in Railway:
1. Go to Database → Data tab
2. Click on "User" table
3. Verify the new columns exist

## What's New in the Profile Page

Users can now fill in:
- **Basic Tab**: Experience level, years of experience, date of birth, gender
- **Preferences Tab**: Languages spoken, professional certifications, portfolio URL

All fields are optional except experience level (required).

## Database Connection Stability

The database connection is stable. The migration uses `IF NOT EXISTS` clauses, so it's safe to run multiple times.

