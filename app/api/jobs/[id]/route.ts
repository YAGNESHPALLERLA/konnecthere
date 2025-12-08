import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { syncJobToAlgolia, removeJobFromAlgolia } from "@/lib/algolia"

export const runtime = "nodejs"

const updateJobSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  requirements: z.string().optional(),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  salaryCurrency: z.string().optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY"]).optional(),
  experienceLevel: z.enum(["ENTRY", "MID_LEVEL", "SENIOR", "EXECUTIVE"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"]).optional(),
})

async function canManageJob(companyId: string, session: any) {
  const userRole = (session.user as any).role
  const userId = (session.user as any).id

  if (userRole === "ADMIN") return true

  // Check if user is the owner
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { ownerId: true, hrId: true },
  })

  if (!company) return false

  // Owner or HR manager can manage
  return company.ownerId === userId || company.hrId === userId
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, name: true, slug: true, logo: true, ownerId: true },
        },
        applications: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
            resume: {
              select: {
                id: true,
                fileName: true,
                fileUrl: true,
                parsedSkills: true,
                parsedTitle: true,
                parsedExperience: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check access for GET (HR can view jobs for companies they manage)
    const hasAccess = await canManageJob(job.companyId, session)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { ownerId, ...company } = job.company as any
    return NextResponse.json({
      ...job,
      company,
    })
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const data = updateJobSchema.parse(body)

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: { ownerId: true },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const hasAccess = await canManageJob(job.companyId, session)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await prisma.job.update({
      where: { id },
      data,
      include: {
        company: true,
      },
    })

    syncJobToAlgolia(updated.id).catch((err) =>
      console.error("Failed to sync job to search index:", err)
    )

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.issues }, { status: 400 })
    }
    console.error("Error updating job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: { ownerId: true },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const hasAccess = await canManageJob(job.companyId, session)
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.job.delete({ where: { id } })
    removeJobFromAlgolia(id).catch((err) =>
      console.error("Failed to remove job from search index:", err)
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
