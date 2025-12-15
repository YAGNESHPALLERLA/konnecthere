import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { asyncHandler } from "@/lib/errors"

export const runtime = "nodejs"

const updateRoleSchema = z.object({
  role: z.enum(["USER", "HR", "ADMIN"]),
})

// PATCH - Update user role (Admin only)
export const PATCH = asyncHandler(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const adminId = (session.user as any)?.id
  const adminRole = (session.user as any)?.role

  // Only ADMIN can update roles
  if (adminRole !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Only administrators can update user roles" },
      { status: 403 }
    )
  }

  const userId = params.id
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  let body
  try {
    body = await req.json()
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }

  let parsed
  try {
    parsed = updateRoleSchema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid role", details: error.issues },
        { status: 400 }
      )
    }
    throw error
  }

  const { role } = parsed

  // Verify target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  })

  if (!targetUser) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    )
  }

  // Prevent admin from demoting themselves
  if (userId === adminId && role !== "ADMIN") {
    return NextResponse.json(
      { error: "Cannot demote your own admin role" },
      { status: 400 }
    )
  }

  // Update user role
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: role as any },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      updatedAt: true,
    },
  })

  // Log the role change
  try {
    await prisma.adminActionLog.create({
      data: {
        adminId,
        actionType: "ROLE_UPDATE",
        entityType: "User",
        entityId: userId,
        metadata: {
          oldRole: targetUser.role,
          newRole: role,
          targetUserEmail: targetUser.email,
        },
      },
    })
  } catch (logError) {
    // Log error but don't fail the request
    console.error("[ADMIN_ROLE_UPDATE] Failed to log action:", logError)
  }

  return NextResponse.json({
    user: updatedUser,
    message: `User role updated to ${role}`,
  })
})

