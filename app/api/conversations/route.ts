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

  const conversations = await prisma.conversation.findMany({
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

  // Calculate unread counts
  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
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

  const body = await req.json()
  const { userId } = createConversationSchema.parse(body)

  if (userId === session.user.id) {
    return NextResponse.json(
      { error: "Cannot create conversation with yourself" },
      { status: 400 }
    )
  }

  // Check if conversation already exists
  const existing = await prisma.conversation.findFirst({
    where: {
      participants: {
        every: {
          userId: {
            in: [session.user.id, userId],
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
      participantIds.includes(session.user.id) &&
      participantIds.includes(userId)
    ) {
      return NextResponse.json({ conversation: existing })
    }
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: session.user.id },
          { userId },
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

