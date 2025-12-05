import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { handleError } from "@/lib/errors"

export const runtime = "nodejs"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Verify user has access to this message
    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Check if user is a participant
    const isParticipant = message.conversation.participants.some(
      (p) => p.userId === session.user.id
    )

    if (!isParticipant && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Only mark as read if the message is not from the current user
    if (message.senderId !== session.user.id && !message.readAt) {
      await prisma.message.update({
        where: { id },
        data: { readAt: new Date() },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}

