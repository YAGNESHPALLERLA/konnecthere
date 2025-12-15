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
  // Role is NOT accepted from client - all new users default to USER
})

export const runtime = "nodejs"

export const POST = asyncHandler(async (req: NextRequest) => {
  // Rate limiting
  const rateLimitResponse = rateLimitAuth(req)
  if (rateLimitResponse) return rateLimitResponse

  const body = await req.json()
  const { name, email, password } = signupSchema.parse(body)
  
  // Ignore any role sent from client - all new users default to USER
  // Only ADMIN can change roles via admin API

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    throw new ValidationError("An account with this email already exists")
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // All new users are created with USER role by default
  // Only ADMIN can promote users to HR or ADMIN via admin API
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "USER", // Always USER for new signups
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

