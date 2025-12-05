import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { parseResumeFromService } from "@/lib/resumeParser"
import { z } from "zod"

export const runtime = "nodejs"

const createResumeSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileUrl: z.string().url(),
  fileSize: z.number().positive(),
  mimeType: z.string().default("application/pdf"),
})

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ resumes })
  } catch (error) {
    console.error("Error fetching resumes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = createResumeSchema.parse(body)

    const created = await prisma.resume.create({
      data: {
        ...data,
        userId: (session.user as any).id,
      },
    })

    let responsePayload = created

    if (process.env.RESUME_PARSER_URL) {
      try {
        const parsed = await parseResumeFromService(created.fileUrl)
        if (parsed) {
          responsePayload = await prisma.resume.update({
            where: { id: created.id },
            data: {
              parsedName: parsed.name ?? undefined,
              parsedEmail: parsed.email ?? undefined,
              parsedPhone: parsed.phone ?? undefined,
              parsedTitle: parsed.title ?? undefined,
              parsedSkills: parsed.skills ?? [],
              parsedExperience: parsed.experienceYears ?? undefined,
              parsedRaw: parsed ?? undefined,
            },
          })
        }
      } catch (parserError) {
        console.error("Resume parsing failed", parserError)
      }
    }

    return NextResponse.json(responsePayload, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.issues }, { status: 400 })
    }
    console.error("Error creating resume:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

