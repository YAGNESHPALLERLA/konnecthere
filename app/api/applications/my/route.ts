import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const applications = await prisma.application.findMany({
      where: { 
        userId,
        deletedAt: null, // Only show non-deleted applications
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
        resume: {
          select: {
            fileName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


