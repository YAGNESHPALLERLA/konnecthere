import { NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * Debug endpoint to check which environment variables are set
 * 
 * SECURITY: Only shows which vars are defined (true/false), not their values
 * This should be protected or removed in production after debugging
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

  return NextResponse.json({
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasDATABASE_URL: !!process.env.DATABASE_URL,
      hasNEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      hasAUTH_SECRET: !!process.env.AUTH_SECRET,
      hasNEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      hasAUTH_URL: !!process.env.AUTH_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL, // Safe to show URL
      AUTH_URL: process.env.AUTH_URL, // Safe to show URL
      // Don't expose secrets or connection strings
    },
    timestamp: new Date().toISOString(),
  })
}

