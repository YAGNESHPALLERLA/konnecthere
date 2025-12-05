import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { asyncHandler } from "@/lib/errors"

export const runtime = "nodejs"

export const GET = asyncHandler(async (req, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  // Verify user is a participant
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
      },
    },
  })

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
  }

  const isParticipant = conversation.participants.some(
    (p) => p.userId === session.user.id
  )

  if (!isParticipant && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Get messages
  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  // Mark messages as read
  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderId: {
        not: session.user.id,
      },
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  })

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      participants: conversation.participants.map((p) => ({
        id: p.user.id,
        name: p.user.name,
        email: p.user.email,
        image: p.user.image,
        role: p.user.role,
      })),
    },
    messages,
  })
})

