import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { asyncHandler } from "@/lib/errors"

export const runtime = "nodejs"

const createConnectionSchema = z.object({
  receiverId: z.string().cuid(),
})

// GET - Get all connections for current user
export const GET = asyncHandler(async (req: NextRequest) => {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = (session.user as any)?.id
  if (!userId) {
    return NextResponse.json({ error: "User ID not found" }, { status: 401 })
  }

  // Get all connections where user is requester or receiver
  const connections = await prisma.connection.findMany({
    where: {
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
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json({ connections })
})

// POST - Create a connection request
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

  let receiverId
  try {
    const parsed = createConnectionSchema.parse(body)
    receiverId = parsed.receiverId
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid receiver ID format", details: error.issues },
        { status: 400 }
      )
    }
    throw error
  }

  if (!receiverId || typeof receiverId !== "string") {
    return NextResponse.json({ error: "Invalid receiver ID" }, { status: 400 })
  }

  if (receiverId === userId) {
    return NextResponse.json(
      { error: "Cannot connect with yourself" },
      { status: 400 }
    )
  }

  // Verify receiver user exists
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true },
  })

  if (!receiver) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    )
  }

  // Use a transaction to atomically check and create connection
  // This prevents race conditions and ensures data consistency
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check if connection already exists (any status) - check both directions
      const existing = await tx.connection.findFirst({
        where: {
          OR: [
            { requesterId: userId, receiverId },
            { requesterId: receiverId, receiverId: userId },
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

      if (existing) {
        // If already accepted, return error
        if (existing.status === "ACCEPTED") {
          throw new Error("ALREADY_CONNECTED")
        }
        // If pending, return the existing request
        if (existing.status === "PENDING") {
          throw new Error("ALREADY_PENDING")
        }
        // If rejected, allow creating a new request (delete old one first)
        await tx.connection.delete({
          where: { id: existing.id },
        })
      }

      // Create connection request
      const connection = await tx.connection.create({
        data: {
          requesterId: userId,
          receiverId,
          status: "PENDING",
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

      return connection
    })

    return NextResponse.json({ connection: result }, { status: 201 })
  } catch (error: any) {
    // Handle custom errors from transaction
    if (error.message === "ALREADY_CONNECTED") {
      // Fetch the existing connection to return it
      const existing = await prisma.connection.findFirst({
        where: {
          OR: [
            { requesterId: userId, receiverId },
            { requesterId: receiverId, receiverId: userId },
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
      return NextResponse.json(
        { error: "Already connected", connection: existing },
        { status: 409 }
      )
    }

    if (error.message === "ALREADY_PENDING") {
      // Fetch the existing connection to return it
      const existing = await prisma.connection.findFirst({
        where: {
          OR: [
            { requesterId: userId, receiverId },
            { requesterId: receiverId, receiverId: userId },
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
      return NextResponse.json(
        { error: "Connection request already pending", connection: existing },
        { status: 409 }
      )
    }

    // Handle Prisma unique constraint error (race condition fallback)
    if (error?.code === "P2002") {
      // Unique constraint violation - connection already exists
      const existing = await prisma.connection.findFirst({
        where: {
          OR: [
            { requesterId: userId, receiverId },
            { requesterId: receiverId, receiverId: userId },
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
      
      if (existing) {
        if (existing.status === "ACCEPTED") {
          return NextResponse.json(
            { error: "Already connected", connection: existing },
            { status: 409 }
          )
        }
        if (existing.status === "PENDING") {
          return NextResponse.json(
            { error: "Connection request already pending", connection: existing },
            { status: 409 }
          )
        }
      }
      
      return NextResponse.json(
        { error: "Connection request already exists" },
        { status: 409 }
      )
    }
    
    // Re-throw other errors to be handled by asyncHandler
    throw error
  }
})
