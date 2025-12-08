import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure DATABASE_URL has SSL parameter for Supabase/cloud databases
const databaseUrl = process.env.DATABASE_URL || ''
const needsSSL = databaseUrl.includes('supabase') || databaseUrl.includes('amazonaws') || databaseUrl.includes('railway')
const hasSSL = databaseUrl.includes('sslmode=') || databaseUrl.includes('?ssl=')

// Auto-add SSL parameter if needed and not present
let finalDatabaseUrl = databaseUrl
if (needsSSL && !hasSSL && databaseUrl && !databaseUrl.includes('localhost')) {
  const separator = databaseUrl.includes('?') ? '&' : '?'
  finalDatabaseUrl = `${databaseUrl}${separator}sslmode=require`
  if (process.env.NODE_ENV === 'development') {
    console.log('[PRISMA] Auto-added SSL parameter to DATABASE_URL for cloud database')
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: finalDatabaseUrl,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


