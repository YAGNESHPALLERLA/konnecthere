import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

/**
 * Get candidate profile (only accessible by HR who has applications from this candidate)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    const userId = (session.user as any).id
    const { candidateId } = await params

    if (userRole !== "HR" && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Verify HR has access to this candidate (they must have an application from this candidate)
    if (userRole !== "ADMIN") {
      const hasAccess = await prisma.application.findFirst({
        where: {
          userId: candidateId,
          job: {
            company: {
              hrId: userId,
            },
          },
        },
      })

      if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    // Get candidate profile
    const candidate = await prisma.user.findUnique({
      where: { id: candidateId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        location: true,
        currentTitle: true,
        website: true,
        linkedin: true,
        github: true,
        skills: true,
        education: true,
        experience: true,
        resumes: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    }

    return NextResponse.json(candidate)
  } catch (error) {
    console.error("Error fetching candidate profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

