import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { slugify } from "@/lib/utils"
import { syncJobToAlgolia } from "@/lib/algolia"

export const runtime = "nodejs"

const createJobSchema = z.object({
  companyId: z.string().cuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  requirements: z.string().optional(),
  location: z.string().optional(),
  remote: z.boolean().default(false),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().default("USD"),
  employmentType: z
    .enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY"])
    .default("FULL_TIME"),
  experienceLevel: z.enum(["ENTRY", "MID_LEVEL", "SENIOR", "EXECUTIVE"]).default("MID_LEVEL"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
})

/**
 * Create a new job (HR users can create jobs for companies they manage)
 */
export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const data = createJobSchema.parse(body)

    // Verify that the HR user manages this company (or is ADMIN)
    const company = await prisma.company.findFirst({
      where: {
        id: data.companyId,
        ...(userRole === "ADMIN" ? {} : { hrId: userId }),
      },
    })

    if (!company) {
      return NextResponse.json(
        { error: "Company not found or you don't have permission to create jobs for this company" },
        { status: 404 }
      )
    }

    const slug = `${slugify(data.title)}-${Date.now()}`

    const job = await prisma.job.create({
      data: {
        ...data,
        slug,
        companyId: company.id,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    // Sync to search index (async, don't wait)
    syncJobToAlgolia(job.id).catch((err) =>
      console.error("Failed to sync job to search index:", err)
    )

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error creating job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * Get jobs for companies managed by the current HR user
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

    // Get companies managed by this HR user
    const companies = await prisma.company.findMany({
      where: userRole === "ADMIN" ? {} : { hrId: userId },
      select: { id: true },
    })

    const companyIds = companies.map((c) => c.id)

    if (companyIds.length === 0) {
      return NextResponse.json({ jobs: [] })
    }

    const jobs = await prisma.job.findMany({
      where: {
        companyId: { in: companyIds },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Error fetching HR jobs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

