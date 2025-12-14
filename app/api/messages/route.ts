import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { asyncHandler } from "@/lib/errors"

export const runtime = "nodejs"

const createMessageSchema = z.object({
  conversationId: z.string().min(1),
  body: z.string().min(1).max(10000),
})

export const POST = asyncHandler(async (req) => {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { conversationId, body: messageBody } = createMessageSchema.parse(body)

  const userId = (session.user as any).id

  // Verify user is a participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: true,
    },
  })

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    )
  }

  const isParticipant = conversation.participants.some(
    (p) => p.userId === userId
  )

  if (!isParticipant && (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Get the other participant
  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== userId
  )

  if (!otherParticipant) {
    return NextResponse.json(
      { error: "Invalid conversation" },
      { status: 400 }
    )
  }

  // Check if users are connected (accepted connection)
  const connection = await prisma.connection.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: userId, receiverId: otherParticipant.userId },
        { requesterId: otherParticipant.userId, receiverId: userId },
      ],
    },
  })

  if (!connection && (session.user as any).role !== "ADMIN") {
    return NextResponse.json(
      { error: "You must be connected to message this user" },
      { status: 403 }
    )
  }

  // Create message
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: session.user.id,
      body: messageBody,
    },
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
  })

  // Update conversation updatedAt
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })

  return NextResponse.json({ message }, { status: 201 })
})

