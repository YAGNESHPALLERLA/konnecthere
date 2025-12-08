import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const runtime = "nodejs"

const updateSchema = z.object({
  status: z.enum(["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED", "HIRED"]).optional(),
  notes: z.string().max(2000).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = updateSchema.parse(body)

    if (!data.status && !data.notes) {
      return NextResponse.json({ error: "No changes supplied" }, { status: 400 })
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            company: {
              select: { ownerId: true, hrId: true },
            },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const ownerId = application.job.company.ownerId
    const hrId = application.job.company.hrId
    const userId = (session.user as any).id
    const userRole = (session.user as any).role
    const isAdmin = userRole === "ADMIN"
    const isOwner = ownerId === userId
    const isHR = userRole === "HR" && hrId === userId

    if (!isOwner && !isAdmin && !isHR) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await prisma.application.update({
      where: { id },
      data,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        resume: {
          select: { id: true, fileName: true },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.issues }, { status: 400 })
    }
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
