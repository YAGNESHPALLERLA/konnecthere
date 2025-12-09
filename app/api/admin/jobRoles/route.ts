import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, logAdminAction } from "@/lib/auth/admin-rbac"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const runtime = "nodejs"

const createJobRoleSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    const data = createJobRoleSchema.parse(body)

    const jobRole = await prisma.jobRole.create({
      data: {
        name: data.name,
        category: data.category || null,
      },
    })

    await logAdminAction({
      adminId: admin.id,
      actionType: "JOB_ROLE_CREATE",
      entityType: "JobRole",
      entityId: jobRole.id,
      metadata: { name: jobRole.name, category: jobRole.category },
    })

    return NextResponse.json(jobRole)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error creating job role:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

