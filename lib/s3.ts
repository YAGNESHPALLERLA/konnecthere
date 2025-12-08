import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "konnecthere-resumes"

export interface UploadParams {
  fileName: string
  fileType: string
  userId: string
  folder?: string
}

/**
 * Generate a presigned URL for uploading a file to S3
 */
export async function generateUploadUrl({
  fileName,
  fileType,
  userId,
  folder = "resumes",
}: UploadParams): Promise<{ uploadUrl: string; fileUrl: string }> {
  // Check if AWS credentials are configured
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS S3 credentials are not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.")
  }

  if (!BUCKET_NAME || BUCKET_NAME === "konnecthere-resumes") {
    console.warn("[S3] Using default bucket name. Make sure AWS_S3_BUCKET_NAME is set in production.")
  }

  const timestamp = Date.now()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_")
  const key = `${folder}/${userId}/${timestamp}-${sanitizedFileName}`

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      // Server-side encryption
      ServerSideEncryption: "AES256",
      // Metadata
      Metadata: {
        userId,
        uploadedAt: new Date().toISOString(),
      },
    })

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    })

    const fileUrl = process.env.AWS_S3_CDN_URL
      ? `${process.env.AWS_S3_CDN_URL}/${key}`
      : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`

    return { uploadUrl, fileUrl }
  } catch (error: any) {
    console.error("[S3] Error generating upload URL:", error)
    if (error.name === "InvalidAccessKeyId" || error.name === "SignatureDoesNotMatch") {
      throw new Error("Invalid AWS credentials. Please check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.")
    }
    if (error.name === "NoSuchBucket") {
      throw new Error(`S3 bucket "${BUCKET_NAME}" does not exist. Please create it or update AWS_S3_BUCKET_NAME.`)
    }
    throw new Error(`Failed to generate upload URL: ${error.message || "Unknown error"}`)
  }
}

/**
 * Generate a presigned URL for downloading/viewing a file from S3
 */
export async function generateDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Extract S3 key from full URL
 */
export function extractS3Key(url: string): string | null {
  const cdnUrl = process.env.AWS_S3_CDN_URL
  if (cdnUrl && url.startsWith(cdnUrl)) {
    return url.replace(cdnUrl + "/", "")
  }

  const s3UrlPattern = /https:\/\/[^/]+\/(.+)$/
  const match = url.match(s3UrlPattern)
  return match ? match[1] : null
}


