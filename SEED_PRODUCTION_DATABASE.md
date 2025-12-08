# Seed Production Database - Quick Guide

## Problem
Your production database is empty, which is why login is failing. You need to:
1. Apply the migration (add new profile columns)
2. Seed the database with test users

## Solution

### Step 1: Apply Migration (Add New Columns)

In Railway's database interface:

1. **Click on "Data" tab** (you're already there)
2. **Click the "SQL" button** or look for a "Query" / "SQL Editor" option
3. **Run this SQL**:

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

### Step 2: Seed the Database

You have two options:

#### Option A: Using Railway SQL Editor (Easiest)

1. **Go to Railway Database → Data tab → SQL Editor**
2. **Run this SQL** to create the test users:

```sql
-- First, make sure you have bcrypt extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create ADMIN user
INSERT INTO "User" (id, email, name, password, role, status, "emailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@konnecthere.com',
  'Admin User',
  '$2a$10$rOzJqZqZqZqZqZqZqZqZqOZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', -- This is 'admin123' hashed
  'ADMIN',
  'ACTIVE',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- Create HR user
INSERT INTO "User" (id, email, name, password, role, status, "emailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'hr@konnecthere.com',
  'HR User',
  '$2a$10$rOzJqZqZqZqZqZqZqZqZqOZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', -- This is 'hr123' hashed
  'HR',
  'ACTIVE',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- Create USER
INSERT INTO "User" (id, email, name, password, role, status, "emailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'user@konnecthere.com',
  'Test User',
  '$2a$10$rOzJqZqZqZqZqZqZqZqZqOZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', -- This is 'user123' hashed
  'USER',
  'ACTIVE',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  status = EXCLUDED.status;
```

**Wait!** The password hashes above are placeholders. You need to generate real bcrypt hashes. Use Option B instead.

#### Option B: Using Seed Script (Recommended)

1. **Get your Railway DATABASE_URL**:
   - Go to Railway → Your Postgres Service → Variables tab
   - Copy the `DATABASE_PUBLIC_URL` or `DATABASE_URL`

2. **Run the seed script locally** (with production DATABASE_URL):

```bash
# Set the production DATABASE_URL
export DATABASE_URL="your-railway-database-url-here"

# Run the seed script
npm run db:seed
```

This will:
- Create/update admin@konnecthere.com with password: admin123
- Create/update hr@konnecthere.com with password: hr123
- Create/update user@konnecthere.com with password: user123
- Create a sample company for HR

### Step 3: Verify Users Were Created

In Railway Database → Data tab:
1. **Switch to "User" table** (instead of Account)
2. **You should see 3 users**:
   - admin@konnecthere.com (ADMIN)
   - hr@konnecthere.com (HR)
   - user@konnecthere.com (USER)

### Step 4: Test Login

Go to https://konnecthere.com/auth/signin and try logging in with:
- **Admin**: admin@konnecthere.com / admin123
- **HR**: hr@konnecthere.com / hr123
- **User**: user@konnecthere.com / user123

## Quick One-Liner (If you have DATABASE_URL)

```bash
DATABASE_URL="your-railway-url" npm run db:seed
```

## Troubleshooting

### "Table User does not exist"
Run migrations first:
```bash
DATABASE_URL="your-railway-url" npx prisma migrate deploy
```

### "Column does not exist"
Apply the migration SQL from Step 1 first.

### Still can't login after seeding
1. Check that users exist in Railway database
2. Check that passwords are hashed (not plain text)
3. Check Vercel logs for authentication errors
4. Verify DATABASE_URL in Vercel matches Railway

