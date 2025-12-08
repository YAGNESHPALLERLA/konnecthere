/**
 * Script to apply database migration for production
 * Run this with: DATABASE_URL="your-production-url" npx tsx scripts/apply-migration-production.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking database connection...')

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set.')
    process.exit(1)
  }

  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')

    // Check if columns already exist
    const result = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('phone', 'bio', 'location', 'currentTitle', 'website', 'linkedin', 'github', 'twitter', 'education', 'experience', 'skills', 'availability', 'salaryExpectation', 'preferredLocation')
    `

    const existingColumns = result.map(r => r.column_name)
    const requiredColumns = ['phone', 'bio', 'location', 'currentTitle', 'website', 'linkedin', 'github', 'twitter', 'education', 'experience', 'skills', 'availability', 'salaryExpectation', 'preferredLocation']
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))

    if (missingColumns.length === 0) {
      console.log('✅ All profile columns already exist. Migration not needed.')
    } else {
      console.log(`\n📊 Missing columns: ${missingColumns.join(', ')}`)
      console.log('🔧 Applying migration...')

      // Apply migration
      await prisma.$executeRaw`
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
        ADD COLUMN IF NOT EXISTS "preferredLocation" TEXT
      `

      console.log('✅ Migration applied successfully!')
    }

    // Check for test users
    console.log('\n📊 Checking for test users...')
    const testUsers = [
      { email: 'admin@konnecthere.com', password: 'admin123', role: 'ADMIN' },
      { email: 'hr@konnecthere.com', password: 'hr123', role: 'HR' },
      { email: 'user@konnecthere.com', password: 'user123', role: 'USER' },
    ]

    for (const testUser of testUsers) {
      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
        select: { id: true, email: true, role: true, status: true, password: true },
      })

      if (user) {
        console.log(`   ✅ ${testUser.role} user exists: ${user.email}`)
        if (!user.password) {
          console.log(`   ⚠️  WARNING: ${testUser.role} user has no password set!`)
        }
      } else {
        console.log(`   ❌ ${testUser.role} user NOT FOUND: ${testUser.email}`)
      }
    }

    console.log('\n✅ Migration check complete!')
  } catch (error: any) {
    console.error('\n❌ Migration failed!')
    console.error(`Error: ${error.message}`)
    if (error.code) {
      console.error(`Error code: ${error.code}`)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

