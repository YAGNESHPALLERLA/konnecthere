import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { handleError, ValidationError, asyncHandler } from "@/lib/errors"
import { rateLimitAuth } from "@/lib/rateLimit"

const signupSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["CANDIDATE", "EMPLOYER", "USER", "HR"]).default("CANDIDATE"),
})

export const runtime = "nodejs"

export const POST = asyncHandler(async (req: NextRequest) => {
  // Rate limiting
  const rateLimitResponse = rateLimitAuth(req)
  if (rateLimitResponse) return rateLimitResponse

  const body = await req.json()
  const { name, email, password, role } = signupSchema.parse(body)

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    throw new ValidationError("An account with this email already exists")
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Map legacy roles to new roles for consistency
  let finalRole = role
  if (role === "EMPLOYER") {
    finalRole = "HR"
  } else if (role === "CANDIDATE") {
    finalRole = "USER"
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: finalRole as any,
    },
  })

  return NextResponse.json(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    { status: 201 }
  )
})

