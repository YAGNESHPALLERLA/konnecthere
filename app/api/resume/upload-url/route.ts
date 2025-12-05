import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { generateUploadUrl } from "@/lib/s3"
import { z } from "zod"

export const runtime = "nodejs"

const uploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.string().regex(/^application\/pdf$/),
  fileSize: z.number().max(10 * 1024 * 1024), // 10MB max
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { fileName, fileType, fileSize } = uploadSchema.parse(body)

    const { uploadUrl, fileUrl } = await generateUploadUrl({
      fileName,
      fileType,
      userId: (session.user as any).id,
    })

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      key: fileUrl.split("/").slice(-3).join("/"), // Extract key from URL
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.issues }, { status: 400 })
    }
    console.error("Error generating upload URL:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


