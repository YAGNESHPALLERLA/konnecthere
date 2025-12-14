import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { asyncHandler } from "@/lib/errors"

export const runtime = "nodejs"

/**
 * Get applicants for a specific job (only accessible by HR who manages the company)
 */
export const GET = asyncHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) => {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userRole = (session.user as any).role
  const userId = (session.user as any).id
  
  if (!userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 })
  }

  if (userRole !== "HR" && userRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const resolvedParams = await params
  const jobId = resolvedParams?.jobId

  if (!jobId) {
    return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
  }

  // Get the job and verify HR has access
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      company: {
        select: {
          id: true,
          hrId: true,
        },
      },
    },
  })

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  // Check if user has access (HR must manage the company, or ADMIN)
  if (userRole !== "ADMIN" && job.company.hrId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Get filter parameters
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const experienceLevel = searchParams.get("experienceLevel")
  const location = searchParams.get("location")
  const skills = searchParams.get("skills")?.split(",").filter(Boolean)

  // Build where clause for applications
  const where: any = { 
    jobId,
    deletedAt: null, // Filter out deleted applications
  }

  if (status) {
    where.status = status
  }

  // Build where clause for user filters
  const userWhere: any = {}
  if (experienceLevel) {
    userWhere.experienceLevel = experienceLevel
  }
  if (location) {
    userWhere.location = { contains: location, mode: "insensitive" }
  }
  if (skills && skills.length > 0) {
    userWhere.skills = { hasSome: skills }
  }

  // Get all applications for this job with filters
  const applications = await prisma.application.findMany({
    where: {
      ...where,
      ...(Object.keys(userWhere).length > 0 && {
        user: userWhere,
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          location: true,
          skills: true,
          experienceLevel: true,
          yearsOfExperience: true,
        },
      },
      resume: {
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ applications })
})

