import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { z } from "zod"

export const runtime = "nodejs"

const messageSchema = z.object({
  subject: z.string().min(3).max(120),
  message: z.string().min(10).max(5000),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = messageSchema.parse(body)

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        job: {
          select: {
            title: true,
            company: {
              select: { ownerId: true, name: true },
            },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const ownerId = application.job.company.ownerId
    const isAdmin = (session.user as any).role === "ADMIN"
    if (ownerId !== (session.user as any).id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!application.user.email) {
      return NextResponse.json({ error: "Candidate email unavailable" }, { status: 400 })
    }

    await sendEmail({
      to: application.user.email,
      subject: data.subject,
      html: `
        <p>Hi ${application.user.name || "there"},</p>
        <p>${data.message.replace(/\n/g, "<br />")}</p>
        <p>— ${application.job.company.name} | ${application.job.title}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.issues }, { status: 400 })
    }
    console.error("Error sending applicant message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
