import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { asyncHandler } from "@/lib/errors"

export const runtime = "nodejs"

// GET - Get connection status between current user and another user
export const GET = asyncHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) => {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const currentUserId = (session.user as any)?.id
  if (!currentUserId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 })
  }

  const resolvedParams = await params
  const otherUserId = resolvedParams?.userId

  if (!otherUserId) {
    return NextResponse.json({ error: "User ID parameter is required" }, { status: 400 })
  }

  // Validate userId format (should be a cuid)
  if (typeof otherUserId !== "string" || otherUserId.length < 1) {
    return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
  }

  if (currentUserId === otherUserId) {
    return NextResponse.json({
      status: "SELF",
      connection: null,
    })
  }

  try {
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: currentUserId, receiverId: otherUserId },
          { requesterId: otherUserId, receiverId: currentUserId },
        ],
      },
    })

    if (!connection) {
      return NextResponse.json({
        status: "NONE",
        connection: null,
      })
    }

    // Return the actual connection status and let frontend determine UI state
    return NextResponse.json({
      status: connection.status, // PENDING, ACCEPTED, or REJECTED
      connection: {
        id: connection.id,
        status: connection.status,
        requesterId: connection.requesterId,
        receiverId: connection.receiverId,
      },
    })
  } catch (dbError) {
    console.error("Database error fetching connection status:", dbError)
    // Return NONE status on database errors to prevent UI crashes
    return NextResponse.json({
      status: "NONE",
      connection: null,
    })
  }
})

