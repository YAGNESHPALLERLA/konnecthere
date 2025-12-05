import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const job = await prisma.job.findUnique({
      where: { slug },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            website: true,
            logo: true,
            industry: true,
            size: true,
            location: true,
          },
        },
      },
    })

    if (!job || job.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Increment view count
    await prisma.job.update({
      where: { id: job.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json(job)
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


