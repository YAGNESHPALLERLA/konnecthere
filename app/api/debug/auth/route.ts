import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

/**
 * Debug endpoint to check authentication configuration and database connectivity
 * 
 * SECURITY: Only enabled in development or if explicitly enabled
 * Returns environment info and auth status without exposing sensitive data
 */
export async function GET() {
  // Only allow in development or if explicitly enabled
  const allowDebug = process.env.NODE_ENV === "development" || process.env.ALLOW_DEBUG === "true"
  
  if (!allowDebug) {
    return NextResponse.json(
      { error: "Debug endpoint disabled in production" },
      { status: 403 }
    )
  }

  try {
    // Get current session
    const session = await auth()
    
    // Test database connection
    let dbConnected = false
    let dbError = null
    try {
      await prisma.$queryRaw`SELECT 1`
      dbConnected = true
    } catch (error: any) {
      dbError = error.message
    }

    // Check environment variables (without exposing values)
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      hasDATABASE_URL: !!process.env.DATABASE_URL,
      hasAUTH_SECRET: !!process.env.AUTH_SECRET,
      hasNEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      hasAUTH_URL: !!process.env.AUTH_URL,
      hasNEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      // Safe to show URLs (not secrets)
      AUTH_URL: process.env.AUTH_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    }

    // Get user count (if DB is connected)
    let userCount = null
    if (dbConnected) {
      try {
        userCount = await prisma.user.count()
      } catch (error) {
        // Ignore count errors
      }
    }

    return NextResponse.json({
      success: true,
      environment: envCheck,
      database: {
        connected: dbConnected,
        error: dbError,
        userCount: userCount,
      },
      session: session ? {
        authenticated: true,
        userId: session.user?.id,
        email: session.user?.email,
        role: (session.user as any)?.role,
      } : {
        authenticated: false,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

