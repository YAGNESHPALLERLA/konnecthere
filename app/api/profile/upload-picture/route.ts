import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

export const runtime = "nodejs"
export const maxDuration = 30

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "konnecthere-resumes"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type - only allow common image formats
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File must be an image (JPEG, PNG, WebP, or GIF)" },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const extension = file.name.split(".").pop() || "jpg"
    const key = `profile-pictures/${userId}/${timestamp}-${sanitizedFileName}`

    // Upload to S3
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ACL: "public-read", // Make profile pictures publicly accessible
        ServerSideEncryption: "AES256",
        Metadata: {
          userId,
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
        },
      })

      await s3Client.send(command)

      // Construct the public URL (use CDN URL if available, otherwise S3 URL)
      const region = process.env.AWS_REGION || "us-east-1"
      const fileUrl = process.env.AWS_S3_CDN_URL
        ? `${process.env.AWS_S3_CDN_URL}/${key}`
        : `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`

      // Update user's image in database
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { image: fileUrl },
        select: {
          id: true,
          image: true,
          name: true,
          email: true,
        },
      })

      console.log("[PROFILE] Profile picture updated successfully:", {
        userId,
        imageUrl: fileUrl,
      })

      return NextResponse.json({
        success: true,
        imageUrl: fileUrl,
        user: {
          id: updatedUser.id,
          image: updatedUser.image,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      })
    } catch (s3Error: any) {
      console.error("[S3] Error uploading profile picture:", s3Error)
      return NextResponse.json(
        {
          error: "Failed to upload image to storage",
          details: s3Error.message,
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Error uploading profile picture:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

