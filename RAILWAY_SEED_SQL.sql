-- Railway Database Seed Script
-- Run this in Railway's SQL Editor to create test users

-- Step 1: Apply migration (add new profile columns)
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

-- Step 2: Create ADMIN user (password: admin123)
INSERT INTO "User" (id, email, name, password, role, status, "emailVerified", "createdAt", "updatedAt", skills)
VALUES (
  gen_random_uuid()::text,
  'admin@konnecthere.com',
  'Admin User',
  '$2b$10$eJj5/s.7ZPQoxMhiDzibsOp8px3EU3E/iVFXhKfdCFCqrT0gTqfty', -- admin123
  'ADMIN',
  'ACTIVE',
  NOW(),
  NOW(),
  NOW(),
  ARRAY[]::TEXT[]
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  "updatedAt" = NOW();

-- Step 3: Create HR user (password: hr123)
INSERT INTO "User" (id, email, name, password, role, status, "emailVerified", "createdAt", "updatedAt", skills)
VALUES (
  gen_random_uuid()::text,
  'hr@konnecthere.com',
  'HR User',
  '$2b$10$D28Kae5NARdnRzd887A3lOfjWOqM6ij1Y1RVQmsCt49luSo1m0dGe', -- hr123
  'HR',
  'ACTIVE',
  NOW(),
  NOW(),
  NOW(),
  ARRAY[]::TEXT[]
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  "updatedAt" = NOW();

-- Step 4: Create USER (password: user123)
INSERT INTO "User" (id, email, name, password, role, status, "emailVerified", "createdAt", "updatedAt", skills)
VALUES (
  gen_random_uuid()::text,
  'user@konnecthere.com',
  'Test User',
  '$2b$10$wsZRq8ihZ9JRAgAWVDZiUe4jSDI9Fyro9oJ4CPNPsnUS0xvOpQcdi', -- user123
  'USER',
  'ACTIVE',
  NOW(),
  NOW(),
  NOW(),
  ARRAY[]::TEXT[]
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  "updatedAt" = NOW();

-- Step 5: Create a sample company for HR
INSERT INTO "Company" (id, name, slug, description, "ownerId", "hrId", verified, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  'Sample Company',
  'sample-company',
  'A sample company for HR testing',
  u.id,
  u.id,
  true,
  NOW(),
  NOW()
FROM "User" u
WHERE u.email = 'hr@konnecthere.com'
ON CONFLICT (slug) DO UPDATE SET
  "hrId" = (SELECT id FROM "User" WHERE email = 'hr@konnecthere.com'),
  "updatedAt" = NOW();

-- Verify users were created
SELECT email, name, role, status FROM "User" WHERE email IN ('admin@konnecthere.com', 'hr@konnecthere.com', 'user@konnecthere.com');

