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
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const skip = (page - 1) * limit

    const [savedJobs, total] = await Promise.all([
      prisma.savedJob.findMany({
        where: { 
          userId,
          job: {
            deletedAt: null, // Only show non-deleted jobs
          },
        },
        include: {
          job: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  logo: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.savedJob.count({
        where: { 
          userId,
          job: {
            deletedAt: null, // Only count non-deleted jobs
          },
        },
      }),
    ])

    // Filter out any saved jobs where the job itself is deleted (extra safety check)
    const validSavedJobs = savedJobs.filter((sj) => sj.job && !sj.job.deletedAt)

    return NextResponse.json({
      savedJobs: validSavedJobs.map((sj) => ({
        id: sj.id,
        createdAt: sj.createdAt,
        job: sj.job,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching saved jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch saved jobs" },
      { status: 500 }
    )
  }
}


