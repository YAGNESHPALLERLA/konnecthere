import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, logAdminAction } from "@/lib/auth/admin-rbac"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const runtime = "nodejs"

const updateCompanySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]).optional(),
  verified: z.boolean().optional(),
  // Map status to verified for backward compatibility
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const data = updateCompanySchema.parse(body)

    const existingCompany = await prisma.company.findUnique({
      where: { id },
    })

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Map status to verified field until migration
    const updateData: any = {}
    if (data.verified !== undefined) {
      updateData.verified = data.verified
    } else if (data.status !== undefined) {
      // Map status enum to verified boolean
      updateData.verified = data.status === "APPROVED"
    }

    const updatedCompany = await prisma.company.update({
      where: { id },
      data: updateData,
    })

    // Log admin action
    await logAdminAction({
      adminId: admin.id,
      actionType: "COMPANY_UPDATE",
      entityType: "Company",
      entityId: id,
      metadata: {
        changes: data,
        previousVerified: existingCompany.verified,
        companyName: existingCompany.name,
      },
    })

    return NextResponse.json(updatedCompany)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error updating company:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

