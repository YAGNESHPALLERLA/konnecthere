import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, logAdminAction } from "@/lib/auth/admin-rbac"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const runtime = "nodejs"

const createSkillSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    const data = createSkillSchema.parse(body)

    const skill = await prisma.skill.create({
      data: {
        name: data.name,
        category: data.category || null,
      },
    })

    await logAdminAction({
      adminId: admin.id,
      actionType: "SKILL_CREATE",
      entityType: "Skill",
      entityId: skill.id,
      metadata: { name: skill.name, category: skill.category },
    })

    return NextResponse.json(skill)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error creating skill:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

