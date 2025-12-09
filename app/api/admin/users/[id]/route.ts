import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, logAdminAction } from "@/lib/auth/admin-rbac"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const runtime = "nodejs"

const updateUserSchema = z.object({
  name: z.string().optional(),
  role: z.enum(["USER", "HR", "ADMIN", "SUPER_ADMIN", "MODERATOR"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                slug: true,
                company: { select: { name: true } },
              },
            },
          },
        },
        resumes: true,
        companies: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const data = updateUserSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent modifying SUPER_ADMIN users unless current user is SUPER_ADMIN
    if (existingUser.role === "SUPER_ADMIN" && admin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot modify SUPER_ADMIN user" },
        { status: 403 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.status !== undefined && { status: data.status }),
      },
    })

    // Log admin action
    await logAdminAction({
      adminId: admin.id,
      actionType: "USER_UPDATE",
      entityType: "User",
      entityId: id,
      metadata: {
        changes: data,
        previousRole: existingUser.role,
        previousStatus: existingUser.status,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params

    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent deleting SUPER_ADMIN users
    if (existingUser.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot delete SUPER_ADMIN user" },
        { status: 403 }
      )
    }

    // Soft delete - update status for now, deletedAt will work after migration
    await prisma.user.update({
      where: { id },
      data: {
        status: "SUSPENDED", // Use SUSPENDED until migration adds INACTIVE
      },
    })

    // Log admin action
    await logAdminAction({
      adminId: admin.id,
      actionType: "USER_DELETE",
      entityType: "User",
      entityId: id,
      metadata: {
        email: existingUser.email,
        role: existingUser.role,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
