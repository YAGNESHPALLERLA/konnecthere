import { NextRequest, NextResponse } from "next/server"

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = "AppError"
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: any) {
    super(message, 400, "VALIDATION_ERROR")
    this.name = "ValidationError"
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND")
    this.name = "NotFoundError"
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED")
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN")
    this.name = "ForbiddenError"
  }
}

export function handleError(error: unknown): NextResponse {
  console.error("Error:", error)

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error instanceof ValidationError && { details: error.details }),
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    // Log full error details for debugging
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      // Include Prisma error code if available
      ...(error as any).code && { code: (error as any).code },
    })
    
    // Handle Prisma errors specifically
    const errorMessage = error.message || "An unexpected error occurred"
    const prismaCode = (error as any).code
    let userMessage = errorMessage
    let statusCode = 500
    
    if (process.env.NODE_ENV === "production") {
      // Handle Prisma error codes
      if (prismaCode === "P2002") {
        // Unique constraint violation
        userMessage = "This action cannot be completed. The connection may already exist."
        statusCode = 409
      } else if (prismaCode === "P2025") {
        // Record not found
        userMessage = "The item was not found. It may have been deleted."
        statusCode = 404
      } else if (errorMessage.includes("Prisma") || errorMessage.includes("database") || errorMessage.includes("P")) {
        userMessage = "Database error. Please try again."
      } else if (errorMessage.includes("validation") || errorMessage.includes("Invalid")) {
        userMessage = errorMessage // Keep validation errors as-is
        statusCode = 400
      } else if (errorMessage.includes("Unique constraint")) {
        userMessage = "This action cannot be completed. The item may already exist."
        statusCode = 409
      } else {
        userMessage = "An unexpected error occurred. Please try again."
      }
    }
    
    return NextResponse.json(
      {
        error: userMessage,
        code: "INTERNAL_ERROR",
      },
      { status: statusCode }
    )
  }

  return NextResponse.json(
    {
      error: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
    },
    { status: 500 }
  )
}

export function asyncHandler(
  fn: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      return await fn(req, ...args)
    } catch (error) {
      return handleError(error)
    }
  }
}


