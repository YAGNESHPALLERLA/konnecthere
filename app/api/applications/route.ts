import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { notifyCompanyOfNewApplication } from "@/lib/notifications"

export const runtime = "nodejs"

const createApplicationSchema = z.object({
  jobId: z.string().cuid(),
  coverLetter: z.string().optional(),
  resumeId: z.string().cuid().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()
    const data = createApplicationSchema.parse(body)

    // Verify job exists and is published
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
      include: {
        company: {
          include: {
            owner: true,
          },
        },
      },
    })

    if (!job || job.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Job not found or not available" }, { status: 404 })
    }

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        jobId_userId: {
          jobId: data.jobId,
          userId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Already applied to this job" }, { status: 400 })
    }

    // Verify resume belongs to user if provided
    if (data.resumeId) {
      const resume = await prisma.resume.findFirst({
        where: {
          id: data.resumeId,
          userId,
        },
      })

      if (!resume) {
        return NextResponse.json({ error: "Resume not found" }, { status: 404 })
      }
    }

    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          jobId: data.jobId,
          userId,
          coverLetter: data.coverLetter,
          resumeId: data.resumeId,
        },
        include: {
          job: {
            select: {
              title: true,
              company: {
                select: {
                  name: true,
                  owner: {
                    select: {
                      id: true,
                      email: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          resume: true,
        },
      })

      // Increment application count
      await tx.job.update({
        where: { id: data.jobId },
        data: { applicationsCount: { increment: 1 } },
      })

      return app
    })

    // Notify employer
    try {
      await notifyCompanyOfNewApplication(application.id)
    } catch (notifyError) {
      console.error("Failed to notify company of new application", notifyError)
    }

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.issues }, { status: 400 })
    }
    console.error("Error creating application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

