import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { asyncHandler } from "@/lib/errors"

export const runtime = "nodejs"

const createConversationSchema = z.object({
  userId: z.string().min(1),
})

export const GET = asyncHandler(async (req) => {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as any).id

  // Get all conversations for the user
  const allConversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId: session.user.id,
        },
      },
    },
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
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  // Filter conversations to only show those with ACCEPTED connections
  const conversationsWithConnections = await Promise.all(
    allConversations.map(async (conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p.userId !== session.user.id
      )
      
      if (!otherParticipant) return null

      // Check if there's an ACCEPTED connection
      const connection = await prisma.connection.findFirst({
        where: {
          OR: [
            { requesterId: session.user.id, receiverId: otherParticipant.userId, status: "ACCEPTED" },
            { requesterId: otherParticipant.userId, receiverId: session.user.id, status: "ACCEPTED" },
          ],
        },
      })

      return connection ? conv : null
    })
  )

  // Filter out nulls (conversations without accepted connections)
  const validConversations = conversationsWithConnections.filter((conv) => conv !== null) as typeof allConversations

  // Calculate unread counts - only for conversations with accepted connections
  const conversationsWithUnread = await Promise.all(
    validConversations.map(async (conv) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          readAt: null,
          senderId: {
            not: session.user.id,
          },
        },
      })

      const otherParticipant = conv.participants.find(
        (p) => p.userId !== session.user.id
      )

      return {
        id: conv.id,
        updatedAt: conv.updatedAt,
        lastMessage: conv.messages[0]
          ? {
              body: conv.messages[0].body,
              sender: conv.messages[0].sender,
              createdAt: conv.messages[0].createdAt,
            }
          : null,
        unreadCount,
        participant: otherParticipant
          ? {
              id: otherParticipant.user.id,
              name: otherParticipant.user.name,
              email: otherParticipant.user.email,
              image: otherParticipant.user.image,
              role: otherParticipant.user.role,
            }
          : null,
      }
    })
  )

  return NextResponse.json({ conversations: conversationsWithUnread })
})

export const POST = asyncHandler(async (req) => {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as any).id
  const body = await req.json()
  const { userId: targetUserId } = createConversationSchema.parse(body)

  if (targetUserId === userId) {
    return NextResponse.json(
      { error: "Cannot create conversation with yourself" },
      { status: 400 }
    )
  }

  // Verify target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true },
  })

  if (!targetUser) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    )
  }

  // Check if users have an ACCEPTED connection
  const connection = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId: userId, receiverId: targetUserId, status: "ACCEPTED" },
        { requesterId: targetUserId, receiverId: userId, status: "ACCEPTED" },
      ],
    },
  })

  if (!connection) {
    return NextResponse.json(
      { error: "You must be connected to message this user. Send a connection request first." },
      { status: 403 }
    )
  }

  // Check if conversation already exists
  const existing = await prisma.conversation.findFirst({
    where: {
      participants: {
        every: {
          userId: {
            in: [userId, targetUserId],
          },
        },
      },
    },
    include: {
      participants: true,
    },
  })

  if (existing) {
    // Verify it has exactly these two participants
    const participantIds = existing.participants.map((p) => p.userId)
    if (
      participantIds.length === 2 &&
      participantIds.includes(userId) &&
      participantIds.includes(targetUserId)
    ) {
      return NextResponse.json({ conversation: existing })
    }
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId },
          { userId: targetUserId },
        ],
      },
    },
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

  return NextResponse.json({ conversation }, { status: 201 })
})

