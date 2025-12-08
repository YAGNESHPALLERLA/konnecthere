import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure DATABASE_URL has SSL parameter for Supabase/cloud databases
function ensureSSLConnectionString(url: string): string {
  if (!url) return url
  
  // Skip localhost
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return url
  }
  
  // Check if it's a cloud database that needs SSL
  const needsSSL = url.includes('supabase') || 
                   url.includes('amazonaws') || 
                   url.includes('railway') ||
                   url.includes('neon.tech') ||
                   url.includes('planetscale')
  
  if (!needsSSL) {
    return url
  }
  
  // Check if SSL is already configured
  const hasSSL = url.includes('sslmode=') || 
                 url.includes('?ssl=') || 
                 url.includes('&ssl=')
  
  if (hasSSL) {
    return url
  }
  
  // Add SSL parameter
  const separator = url.includes('?') ? '&' : '?'
  const sslParam = 'sslmode=require'
  const finalUrl = `${url}${separator}${sslParam}`
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[PRISMA] Auto-added SSL parameter to DATABASE_URL for cloud database')
  }
  
  return finalUrl
}

// Get and process DATABASE_URL
const rawDatabaseUrl = process.env.DATABASE_URL || ''
const finalDatabaseUrl = ensureSSLConnectionString(rawDatabaseUrl)

// Override DATABASE_URL in environment for Prisma
if (finalDatabaseUrl !== rawDatabaseUrl) {
  process.env.DATABASE_URL = finalDatabaseUrl
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


