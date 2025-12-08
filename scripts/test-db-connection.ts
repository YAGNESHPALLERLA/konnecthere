#!/usr/bin/env tsx
/**
 * Test database connection script
 * 
 * Usage:
 *   DATABASE_URL="your-connection-string" npx tsx scripts/test-db-connection.ts
 */

import { PrismaClient } from '@prisma/client'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set')
  process.exit(1)
}

console.log('🔍 Testing database connection...')
console.log(`📍 Connection string: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`) // Hide password

const prisma = new PrismaClient({
  log: ['error'],
})

async function testConnection() {
  try {
    // Test 1: Basic connection
    console.log('\n📊 Test 1: Basic connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful!')

    // Test 2: Query database version
    console.log('\n📊 Test 2: Query database version...')
    const result = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`
    console.log(`✅ Database version: ${result[0]?.version.split(' ')[0]} ${result[0]?.version.split(' ')[1]}`)

    // Test 3: Check if User table exists
    console.log('\n📊 Test 3: Check User table...')
    const userCount = await prisma.user.count()
    console.log(`✅ User table exists. Total users: ${userCount}`)

    // Test 4: Check for test users
    console.log('\n📊 Test 4: Check for test users...')
    const testUsers = {
      admin: await prisma.user.findUnique({ where: { email: 'admin@konnecthere.com' } }),
      hr: await prisma.user.findUnique({ where: { email: 'hr@konnecthere.com' } }),
      user: await prisma.user.findUnique({ where: { email: 'user@konnecthere.com' } }),
    }

    console.log(`   Admin user: ${testUsers.admin ? '✅ Exists' : '❌ Missing'}`)
    console.log(`   HR user: ${testUsers.hr ? '✅ Exists' : '❌ Missing'}`)
    console.log(`   User: ${testUsers.user ? '✅ Exists' : '❌ Missing'}`)

    if (!testUsers.admin || !testUsers.hr || !testUsers.user) {
      console.log('\n⚠️  Some test users are missing. Run: npm run db:seed')
    }

    console.log('\n✅ All tests passed! Database is ready.')
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Database connection failed!')
    console.error(`Error: ${error.message}`)
    
    if (error.message.includes('Can\'t reach database server')) {
      console.error('\n💡 Possible fixes:')
      console.error('   1. Check if DATABASE_URL is correct')
      console.error('   2. For Supabase: Add ?sslmode=require to connection string')
      console.error('   3. Check if database server is running')
      console.error('   4. Check firewall/network settings')
    } else if (error.message.includes('authentication failed')) {
      console.error('\n💡 Possible fixes:')
      console.error('   1. Check database username and password')
      console.error('   2. Verify credentials in DATABASE_URL')
    } else if (error.message.includes('does not exist')) {
      console.error('\n💡 Possible fixes:')
      console.error('   1. Run migrations: npx prisma migrate deploy')
      console.error('   2. Check if database name is correct')
    }

    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

