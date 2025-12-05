import { NextResponse } from "next/server"
import { requireRole } from "@/lib/auth/roles"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { asyncHandler } from "@/lib/errors"

export const runtime = "nodejs"

const updateUserSchema = z.object({
  role: z.enum(["USER", "HR", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
})

export const PATCH = asyncHandler(async (req, { params }) => {
  await requireRole("ADMIN")
  const { id } = await params

  const body = await req.json()
  const data = updateUserSchema.parse(body)

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ user })
})

export const GET = asyncHandler(async (req, { params }) => {
  await requireRole("ADMIN")
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      companies: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      applications: {
        take: 5,
        include: {
          job: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({ user })
})

