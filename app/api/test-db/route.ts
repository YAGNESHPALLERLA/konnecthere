import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

export async function GET() {
  try {
    // Test database connection
    const user = await prisma.user.findUnique({
      where: { email: "admin@konnecthere.com" }
    })
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found",
        databaseConnected: true
      }, { status: 404 })
    }
    
    // Test password
    const passwordValid = user.password ? await bcrypt.compare("admin123", user.password) : false
    
    return NextResponse.json({ 
      success: true,
      databaseConnected: true,
      user: {
        email: user.email,
        role: user.role,
        status: user.status,
        hasPassword: !!user.password,
        passwordValid
      },
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasAuthUrl: !!process.env.AUTH_URL,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      databaseConnected: false
    }, { status: 500 })
  }
}

