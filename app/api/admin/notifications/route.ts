import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, logAdminAction } from "@/lib/auth/admin-rbac"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export const runtime = "nodejs"

const createNotificationSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  type: z.string().default("SYSTEM"),
  targetRole: z.string().nullable().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await req.json()
    const data = createNotificationSchema.parse(body)

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        title: data.title,
        body: data.body,
        type: data.type,
        targetRole: data.targetRole || null,
      },
    })

    // Find target users
    const where: any = { deletedAt: null }
    if (data.targetRole) {
      where.role = data.targetRole
    }

    const users = await prisma.user.findMany({
      where,
      select: { id: true },
    })

    // Create recipient records
    await prisma.notificationRecipient.createMany({
      data: users.map((user) => ({
        notificationId: notification.id,
        userId: user.id,
      })),
    })

    // Mark as sent
    await prisma.notification.update({
      where: { id: notification.id },
      data: { sentAt: new Date() },
    })

    await logAdminAction({
      adminId: admin.id,
      actionType: "NOTIFICATION_CREATE",
      entityType: "Notification",
      entityId: notification.id,
      metadata: {
        title: notification.title,
        targetRole: notification.targetRole,
        recipientCount: users.length,
      },
    })

    return NextResponse.json({
      ...notification,
      recipientCount: users.length,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error creating notification:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

