import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

/**
 * Debug endpoint to check if users exist in the database
 * 
 * SECURITY: This should be protected or removed in production after debugging
 * Only returns email, id, and role - no sensitive data
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
    // Get users with password check (without exposing passwords)
    const usersWithPasswordCheck = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        password: true, // We need to check if it exists
      },
      take: 50,
    })

    const usersWithFlags = usersWithPasswordCheck.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      hasPassword: !!user.password,
    }))

    // Check if test users exist
    const testUsers = {
      admin: usersWithPasswordCheck.find(u => u.email === "admin@konnecthere.com"),
      hr: usersWithPasswordCheck.find(u => u.email === "hr@konnecthere.com"),
      user: usersWithPasswordCheck.find(u => u.email === "user@konnecthere.com"),
    }

    return NextResponse.json({
      success: true,
      totalUsers: usersWithFlags.length,
      users: usersWithFlags,
      testUsers: {
        admin: testUsers.admin ? { 
          exists: true, 
          role: testUsers.admin.role, 
          status: testUsers.admin.status,
          hasPassword: !!testUsers.admin.password,
        } : { exists: false },
        hr: testUsers.hr ? { 
          exists: true, 
          role: testUsers.hr.role, 
          status: testUsers.hr.status,
          hasPassword: !!testUsers.hr.password,
        } : { exists: false },
        user: testUsers.user ? { 
          exists: true, 
          role: testUsers.user.role, 
          status: testUsers.user.status,
          hasPassword: !!testUsers.user.password,
        } : { exists: false },
      },
      databaseConnected: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      databaseConnected: false,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

