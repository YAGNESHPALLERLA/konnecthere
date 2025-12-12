import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await req.json()

    const { imageUrl, key } = body

    if (!imageUrl && !key) {
      return NextResponse.json(
        { error: "imageUrl or key is required" },
        { status: 400 }
      )
    }

    // If key is provided, construct URL
    let finalImageUrl = imageUrl
    if (key && !imageUrl) {
      const region = process.env.AWS_REGION || "us-east-1"
      const bucket = process.env.AWS_S3_BUCKET_NAME || "konnecthere"
      finalImageUrl = process.env.AWS_S3_CDN_URL
        ? `${process.env.AWS_S3_CDN_URL}/${key}`
        : `https://${bucket}.s3.${region}.amazonaws.com/${key}`
    }

    // Update user's image in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image: finalImageUrl },
      select: {
        id: true,
        image: true,
        name: true,
        email: true,
      },
    })

    console.log("[PROFILE] Profile picture URL updated in database:", {
      userId,
      imageUrl: finalImageUrl,
    })

    return NextResponse.json({
      success: true,
      imageUrl: finalImageUrl,
      user: {
        id: updatedUser.id,
        image: updatedUser.image,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    })
  } catch (error: any) {
    console.error("[PROFILE] Error updating profile picture:", error)
    return NextResponse.json(
      {
        error: "Failed to update profile picture",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

