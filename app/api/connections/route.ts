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

  // Verify receiver user exists and is active
  const receiver = await prisma.user.findFirst({
    where: { 
      id: receiverId,
      deletedAt: null, // Only allow connecting to non-deleted users
    },
    select: { id: true, status: true },
  })

  if (!receiver) {
    console.error("[CONNECTION_CREATE] Receiver user not found or deleted:", {
      receiverId,
      userId,
    })
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    )
  }

  // Verify requester user exists and is active
  const requester = await prisma.user.findFirst({
    where: { 
      id: userId,
      deletedAt: null,
    },
    select: { id: true },
  })

  if (!requester) {
    console.error("[CONNECTION_CREATE] Requester user not found or deleted:", {
      userId,
      receiverId,
    })
    return NextResponse.json(
      { error: "Your account is not active. Please contact support." },
      { status: 403 }
    )
  }

  // Use a transaction to atomically check and create connection
  // This prevents race conditions and ensures data consistency
  try {
    // Verify Prisma client is available
    if (!prisma) {
      console.error("[CONNECTION_CREATE] Prisma client not available")
      return NextResponse.json(
        { error: "Database connection unavailable. Please try again." },
        { status: 503 }
      )
    }

    const result = await prisma.$transaction(
      async (tx) => {
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
        console.log("[CONNECTION_CREATE] Creating new connection in transaction:", {
          requesterId: userId,
          receiverId,
        })
        
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

        console.log("[CONNECTION_CREATE] Connection created successfully:", {
          connectionId: connection.id,
          status: connection.status,
        })

        return connection
      },
      {
        // Transaction timeout: 10 seconds
        timeout: 10000,
      }
    )

    console.log("[CONNECTION_CREATE] Transaction completed successfully:", {
      connectionId: result.id,
      status: result.status,
    })
    
    return NextResponse.json({ connection: result }, { status: 201 })
  } catch (error: any) {
    // Log the error immediately for debugging
    console.error("[CONNECTION_CREATE] Error caught in try-catch:", {
      errorType: error?.constructor?.name,
      errorMessage: error?.message,
      errorCode: error?.code,
      errorName: error?.name,
      stack: error?.stack,
      userId,
      receiverId,
      fullError: error,
    })
    
    // Check if error is already a NextResponse (shouldn't happen, but be safe)
    if (error instanceof NextResponse) {
      return error
    }
    
    // Handle custom errors from transaction
    if (error?.message === "ALREADY_CONNECTED") {
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

    if (error?.message === "ALREADY_PENDING") {
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
      // Return success with existing connection if already pending (idempotent)
      return NextResponse.json(
        { connection: existing, message: "Connection request already pending" },
        { status: 200 }
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
    
    // Handle database connection errors specifically
    if (error?.code === "P1001" || error?.code === "P1008" || error?.code === "P1017") {
      // Database connection errors
      console.error("[CONNECTION_CREATE] Database connection error:", {
        code: error.code,
        message: error.message,
        userId,
        receiverId,
      })
      return NextResponse.json(
        { error: "Database connection error. Please try again in a moment." },
        { status: 503 }
      )
    }

    // Handle transaction timeout
    if (error?.code === "P2024" || error?.message?.includes("timeout")) {
      console.error("[CONNECTION_CREATE] Transaction timeout:", {
        code: error.code,
        message: error.message,
        userId,
        receiverId,
      })
      return NextResponse.json(
        { error: "Request timed out. Please try again." },
        { status: 504 }
      )
    }

    // Handle other Prisma errors
    if (error?.code && typeof error.code === "string" && error.code.startsWith("P")) {
      console.error("[CONNECTION_CREATE] Prisma error:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
        userId,
        receiverId,
        meta: (error as any).meta,
      })
      
      // Provide more specific error messages based on Prisma error code
      let errorMessage = "Failed to create connection. Please try again."
      let statusCode = 500
      
      if (error.code === "P2003") {
        errorMessage = "Invalid user reference. Please refresh and try again."
        statusCode = 400
      } else if (error.code === "P2014") {
        errorMessage = "Invalid connection data. Please try again."
        statusCode = 400
      } else if (error.code === "P2025") {
        errorMessage = "Connection not found. Please refresh and try again."
        statusCode = 404
      } else if (error.code === "P2034") {
        errorMessage = "Transaction conflict. Please try again."
        statusCode = 409
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode }
      )
    }

    // Handle database query errors
    if (error?.message && (
      error.message.includes("database") || 
      error.message.includes("connection") ||
      error.message.includes("timeout") ||
      error.message.includes("Prisma")
    )) {
      console.error("[CONNECTION_CREATE] Database error:", {
        message: error.message,
        code: error?.code,
        userId,
        receiverId,
      })
      return NextResponse.json(
        { error: "Database error. Please try again in a moment." },
        { status: 503 }
      )
    }

    // Log unexpected errors for debugging with full details
    console.error("[CONNECTION_CREATE] Unexpected error:", {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      name: error?.name,
      userId,
      receiverId,
      error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    })
    
    // For unexpected errors, return a user-friendly message instead of re-throwing
    // This prevents generic 500 errors from asyncHandler
    return NextResponse.json(
      { 
        error: "An unexpected error occurred while creating the connection. Please try again.",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
})
