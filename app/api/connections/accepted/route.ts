import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { asyncHandler } from "@/lib/errors"

export const runtime = "nodejs"

// GET - Get all accepted connections for the logged-in user
export const GET = asyncHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as any)?.id
  if (!userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 })
  }

  // Get all accepted connections where user is requester or receiver
  const acceptedConnections = await prisma.connection.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: userId },
        { receiverId: userId },
      ],
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          currentTitle: true,
          location: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          currentTitle: true,
          location: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  // Map to return the other user (not the current user)
  const connections = acceptedConnections.map((conn) => {
    const otherUser = conn.requesterId === userId ? conn.receiver : conn.requester
    return {
      id: conn.id,
      user: otherUser,
      createdAt: conn.createdAt,
      updatedAt: conn.updatedAt,
    }
  })

  return NextResponse.json({ connections })
})

