import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { slugify } from "@/lib/utils"
import { syncJobToAlgolia } from "@/lib/algolia"

export const runtime = "nodejs"

const createJobSchema = z.object({
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
  companyId: z.string().cuid(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const location = searchParams.get("location")
    const remote = searchParams.get("remote") === "true"
    const employmentType = searchParams.get("employmentType")
    const experienceLevel = searchParams.get("experienceLevel")

    const where: any = {
      status: "PUBLISHED",
      deletedAt: null, // Only show non-deleted jobs
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" }
    }

    if (remote) {
      where.remote = true
    }

    if (employmentType) {
      where.employmentType = employmentType
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ])

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "HR" && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const data = createJobSchema.parse(body)

    const company = await prisma.company.findFirst({
      where: {
        id: data.companyId,
        ownerId: (session.user as any).id,
      },
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found or access denied" }, { status: 404 })
    }

    const slug = `${slugify(data.title)}-${Date.now()}`

    const job = await prisma.job.create({
      data: {
        ...data,
        slug,
        companyId: company.id,
        status: "DRAFT",
      },
      include: {
        company: true,
      },
    })

    syncJobToAlgolia(job.id).catch((err) =>
      console.error("Failed to sync job to search index:", err)
    )

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.issues }, { status: 400 })
    }
    console.error("Error creating job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

