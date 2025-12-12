import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export const runtime = "nodejs"
export const maxDuration = 30

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "konnecthere"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()

    const { keyPrefix = "profile-pictures/", fileName, contentType } = body

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "fileName and contentType are required" },
        { status: 400 }
      )
    }

    // Validate content type
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    const allowedResumeTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]

    const isImage = allowedImageTypes.includes(contentType)
    const isResume = allowedResumeTypes.includes(contentType)

    if (!isImage && !isResume) {
      return NextResponse.json(
        { error: "Invalid content type. Must be an image or PDF/DOC file." },
        { status: 400 }
      )
    }

    // Generate unique key
    const timestamp = Date.now()
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_")
    const key = `${keyPrefix}${userId}/${timestamp}-${sanitizedFileName}`

    // Create presigned PUT URL (valid for 1 hour)
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ServerSideEncryption: "AES256",
      Metadata: {
        userId,
        uploadedAt: new Date().toISOString(),
        originalName: fileName,
      },
    })

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    })

    // Construct public URL (use CDN if available, otherwise S3 URL)
    const region = process.env.AWS_REGION || "us-east-1"
    const publicUrl = process.env.AWS_S3_CDN_URL
      ? `${process.env.AWS_S3_CDN_URL}/${key}`
      : `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`

    return NextResponse.json({
      success: true,
      presignedUrl,
      publicUrl,
      key,
      expiresIn: 3600,
    })
  } catch (error: any) {
    console.error("[PRESIGN] Error generating presigned URL:", error)
    return NextResponse.json(
      {
        error: "Failed to generate upload URL",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

