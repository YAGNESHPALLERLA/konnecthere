import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

/**
 * Get companies managed by the current HR user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    const userId = (session.user as any).id

    if (userRole !== "HR" && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // For HR users, get companies where they are the HR manager
    // For ADMIN users, get all companies
    const where: any = userRole === "ADMIN" 
      ? {} 
      : { hrId: userId }

    const companies = await prisma.company.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ companies })
  } catch (error) {
    console.error("Error fetching HR companies:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

