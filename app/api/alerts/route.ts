import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { auth } from "@/auth"

export const runtime = "nodejs"

const createAlertSchema = z.object({
  name: z.string().min(1).max(100),
  query: z.string().optional(),
  filters: z.record(z.string(), z.any()).optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "INSTANT"]).default("DAILY"),
})

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const alerts = await prisma.jobAlert.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as { id?: string })?.id
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await req.json()
    const data = createAlertSchema.parse(body)

    const alert = await prisma.jobAlert.create({
      data: {
        ...data,
        userId,
      },
    })

    return NextResponse.json({ alert }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error creating alert:", error)
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    )
  }
}


