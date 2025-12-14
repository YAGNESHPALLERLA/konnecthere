import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { asyncHandler } from "@/lib/errors"

export const runtime = "nodejs"

// POST - Reject a connection request
export const POST = asyncHandler(async (
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

  if (!connectionId) {
    return NextResponse.json({ error: "Connection ID is required" }, { status: 400 })
  }

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

  // Only the receiver can reject
  if (connection.receiverId !== userId) {
    return NextResponse.json(
      { error: "Only the receiver can reject connection requests" },
      { status: 403 }
    )
  }

  // Can only reject pending requests
  if (connection.status !== "PENDING") {
    return NextResponse.json(
      { error: `Connection request is already ${connection.status.toLowerCase()}` },
      { status: 400 }
    )
  }

  // Update connection status to REJECTED
  const updated = await prisma.connection.update({
    where: { id: connectionId },
    data: { status: "REJECTED" },
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

  return NextResponse.json({ 
    connection: updated,
    message: "Connection rejected",
  })
})

