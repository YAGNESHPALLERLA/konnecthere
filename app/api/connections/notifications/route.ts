import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { asyncHandler } from "@/lib/errors"

export const runtime = "nodejs"

// GET - Get all pending connection requests for the logged-in user
export const GET = asyncHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as any)?.id
  if (!userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 })
  }

  // Get all pending requests where current user is the receiver
  const pendingRequests = await prisma.connection.findMany({
    where: {
      receiverId: userId,
      status: "PENDING",
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
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ 
    requests: pendingRequests,
    count: pendingRequests.length,
  })
})

