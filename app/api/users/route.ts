import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { asyncHandler } from "@/lib/errors"

export const runtime = "nodejs"

/**
 * GET /api/users
 * Fetch all active users (for Konnect directory)
 * Only accessible to authenticated users
 */
export const GET = asyncHandler(async (req) => {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""
  const roleFilter = searchParams.get("role") || ""

  // Build where clause
  const where: any = {
    status: "ACTIVE", // Only show active users
    deletedAt: null, // Only show non-deleted users
    id: {
      not: session.user.id, // Exclude current user
    },
  }

  // Add search filter (name or email)
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ]
  }

  // Add role filter
  if (roleFilter && roleFilter !== "ALL") {
    where.role = roleFilter
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      currentTitle: true,
      location: true,
      bio: true,
      skills: true,
      yearsOfExperience: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100, // Limit to 100 users for performance
  })

  return NextResponse.json({ users })
})

