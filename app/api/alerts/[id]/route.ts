import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { auth } from "@/auth"

export const runtime = "nodejs"

const updateAlertSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  query: z.string().optional(),
  filters: z.record(z.string(), z.any()).optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "INSTANT"]).optional(),
  active: z.boolean().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id
    const { id: alertId } = await params
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const existing = await prisma.jobAlert.findFirst({
      where: {
        id: alertId,
        userId,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    const body = await req.json()
    const data = updateAlertSchema.parse(body)

    const alert = await prisma.jobAlert.update({
      where: { id: alertId },
      data,
    })

    return NextResponse.json({ alert })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error updating alert:", error)
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id
    const { id: alertId } = await params
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const existing = await prisma.jobAlert.findFirst({
      where: {
        id: alertId,
        userId,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    await prisma.jobAlert.delete({
      where: { id: alertId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting alert:", error)
    return NextResponse.json(
      { error: "Failed to delete alert" },
      { status: 500 }
    )
  }
}


