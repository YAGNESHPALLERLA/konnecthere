import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { extractS3Key, generateDownloadUrl } from "@/lib/s3"

export const runtime = "nodejs"

type SessionUser = { id: string; role?: string }

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        user: { select: { id: true } },
        applications: {
          include: {
            job: {
              select: {
                id: true,
                company: {
                  select: { ownerId: true },
                },
              },
            },
          },
        },
      },
    })

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    const viewer = session.user as SessionUser
    const isOwner = resume.user.id === viewer.id
    const isAdmin = viewer.role === "ADMIN"
    const isEmployer = resume.applications.some((application) => application.job.company.ownerId === viewer.id)

    if (!isOwner && !isEmployer && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const key = extractS3Key(resume.fileUrl)
    if (!key) {
      return NextResponse.json({ error: "Resume file path invalid" }, { status: 400 })
    }

    const downloadUrl = await generateDownloadUrl(key, 120)
    return NextResponse.json({ url: downloadUrl })
  } catch (error) {
    console.error("Error generating resume download URL:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
