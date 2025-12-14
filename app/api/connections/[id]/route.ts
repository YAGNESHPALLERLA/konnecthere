import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { asyncHandler } from "@/lib/errors"

export const runtime = "nodejs"

const updateConnectionSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"]),
})

// GET - Get connection status between current user and another user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { id: otherUserId } = await params

    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: userId, receiverId: otherUserId },
          { requesterId: otherUserId, receiverId: userId },
        ],
      },
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

    return NextResponse.json({ connection: connection || null })
  } catch (error) {
    console.error("Error fetching connection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Accept or reject a connection request
export const PATCH = asyncHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as any)?.id
  if (!userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 })
  }

  const resolvedParams = await params
  const connectionId = resolvedParams?.id

  if (!connectionId || typeof connectionId !== "string") {
    return NextResponse.json({ error: "Connection ID is required" }, { status: 400 })
  }

  const body = await req.json()
  const { status } = updateConnectionSchema.parse(body)

  // Find the connection
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  })

  if (!connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 })
  }

  // Only the receiver can accept/reject
  if (connection.receiverId !== userId) {
    return NextResponse.json(
      { error: "Only the receiver can accept or reject connection requests" },
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

  return NextResponse.json({ connection: updated })
})

