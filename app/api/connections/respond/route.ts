import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { asyncHandler } from "@/lib/errors"

export const runtime = "nodejs"

const respondConnectionSchema = z.object({
  connectionId: z.string().cuid(),
  action: z.enum(["accept", "reject"]),
})

// POST - Accept or reject a connection request
export const POST = asyncHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as any)?.id
  if (!userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 })
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
    parsed = respondConnectionSchema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      )
    }
    throw error
  }

  const { connectionId, action } = parsed

  // Find the connection
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  })

  if (!connection) {
    return NextResponse.json(
      { error: "Connection request not found" },
      { status: 404 }
    )
  }

  // Only the receiver can accept/reject
  if (connection.receiverId !== userId) {
    return NextResponse.json(
      { error: "Only the receiver can respond to connection requests" },
      { status: 403 }
    )
  }

  // Can only accept/reject pending requests
  if (connection.status !== "PENDING") {
    return NextResponse.json(
      { error: `Connection request is already ${connection.status.toLowerCase()}` },
      { status: 400 }
    )
  }

  // Update connection status
  const status = action === "accept" ? "ACCEPTED" : "REJECTED"
  const updated = await prisma.connection.update({
    where: { id: connectionId },
    data: { status },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  // If accepted, create a conversation between the two users
  if (action === "accept") {
    try {
      // Check if conversation already exists
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          participants: {
            every: {
              userId: {
                in: [connection.requesterId, connection.receiverId],
              },
            },
          },
        },
        include: {
          participants: true,
        },
      })

      // Only create if it doesn't exist
      if (!existingConversation) {
        await prisma.conversation.create({
          data: {
            participants: {
              create: [
                { userId: connection.requesterId },
                { userId: connection.receiverId },
              ],
            },
          },
        })
      }
    } catch (error) {
      // Log error but don't fail the request
      console.error("[CONNECTION_RESPOND] Error creating conversation:", error)
    }
  }

  return NextResponse.json({ 
    connection: updated,
    message: action === "accept" ? "Connection accepted" : "Connection rejected",
  })
})

