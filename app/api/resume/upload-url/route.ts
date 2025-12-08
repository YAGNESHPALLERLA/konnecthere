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

    try {
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
    } catch (s3Error: any) {
      // Handle S3-specific errors
      console.error("[S3] Error generating upload URL:", s3Error)
      const errorMessage = s3Error.message || "Failed to generate upload URL"
      
      // Check if it's an AWS credentials issue
      if (errorMessage.includes("credentials") || errorMessage.includes("not configured")) {
        return NextResponse.json(
          { 
            error: "AWS S3 is not configured. Please configure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.",
            code: "AWS_NOT_CONFIGURED"
          },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          code: "S3_ERROR"
        },
        { status: 500 }
      )
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid request", 
          details: error.issues,
          code: "VALIDATION_ERROR"
        },
        { status: 400 }
      )
    }
    console.error("[API] Error in upload-url route:", error)
    return NextResponse.json(
      { 
        error: "Internal server error",
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
}


