import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, logAdminAction } from "@/lib/auth/admin-rbac"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const runtime = "nodejs"

const createIndustrySchema = z.object({
  name: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    const data = createIndustrySchema.parse(body)

    const industry = await prisma.industry.create({
      data: {
        name: data.name,
      },
    })

    await logAdminAction({
      adminId: admin.id,
      actionType: "INDUSTRY_CREATE",
      entityType: "Industry",
      entityId: industry.id,
      metadata: { name: industry.name },
    })

    return NextResponse.json(industry)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error creating industry:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

