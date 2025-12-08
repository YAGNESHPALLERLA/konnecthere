import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

export const runtime = "nodejs"

/**
 * Test endpoint to check if AWS S3 is configured correctly
 * This helps debug upload issues
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check environment variables
    const hasRegion = !!process.env.AWS_REGION
    const hasAccessKey = !!process.env.AWS_ACCESS_KEY_ID
    const hasSecretKey = !!process.env.AWS_SECRET_ACCESS_KEY
    const hasBucket = !!process.env.AWS_S3_BUCKET_NAME

    const config = {
      hasRegion,
      hasAccessKey,
      hasSecretKey,
      hasBucket,
      region: process.env.AWS_REGION || "not set",
      bucketName: process.env.AWS_S3_BUCKET_NAME || "not set",
      accessKeyId: hasAccessKey ? `${process.env.AWS_ACCESS_KEY_ID?.substring(0, 8)}...` : "not set",
    }

    // Try to import and initialize S3 client
    let s3Test = null
    try {
      const { S3Client } = await import("@aws-sdk/client-s3")
      const s3Client = new S3Client({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        },
      })
      s3Test = "S3 client initialized successfully"
    } catch (error: any) {
      s3Test = `S3 client error: ${error.message}`
    }

    // Check if generateUploadUrl function works
    let uploadUrlTest = null
    try {
      const { generateUploadUrl } = await import("@/lib/s3")
      // Don't actually call it, just check if it can be imported
      uploadUrlTest = "generateUploadUrl function available"
    } catch (error: any) {
      uploadUrlTest = `Import error: ${error.message}`
    }

    return NextResponse.json({
      success: true,
      config,
      s3Test,
      uploadUrlTest,
      message: hasRegion && hasAccessKey && hasSecretKey && hasBucket
        ? "AWS S3 appears to be configured correctly"
        : "AWS S3 is not fully configured. Check environment variables.",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

