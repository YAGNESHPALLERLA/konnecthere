import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { parseResumeFromService } from "@/lib/resumeParser"

export const runtime = "nodejs"

// Configure for large file uploads (10MB max)
export const maxDuration = 60 // 60 seconds timeout

// Allowed MIME types for resumes
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Initialize S3 client
function getS3Client() {
  const region = process.env.AWS_REGION || "us-east-1"
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS S3 credentials are not configured")
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

/**
 * Server-side resume upload route
 * 
 * Accepts multipart/form-data with a file field named "file"
 * 
 * Flow:
 * 1. Authenticate user
 * 2. Parse form data and extract file
 * 3. Validate file (type, size)
 * 4. Upload to S3
 * 5. Save metadata to database
 * 6. Optionally parse resume if parser service is configured
 * 
 * Returns: Resume object with id, fileName, fileUrl, etc.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const nodeEnv = process.env.NODE_ENV || "development"
  
  console.log(`[RESUME_UPLOAD] ${new Date().toISOString()} - Upload request received (env: ${nodeEnv})`)

  try {
    // Step 1: Authenticate user
    const session = await auth()
    if (!session?.user) {
      console.error("[RESUME_UPLOAD] Unauthorized request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    console.log(`[RESUME_UPLOAD] Authenticated user: ${userId}`)

    // Step 2: Check AWS configuration
    const bucketName = process.env.AWS_S3_BUCKET_NAME || "konnecthere"
    const region = process.env.AWS_REGION || "us-east-1"
    
    console.log(`[RESUME_UPLOAD] S3 Config - Bucket: ${bucketName}, Region: ${region}`)

    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("[RESUME_UPLOAD] AWS credentials not configured")
      return NextResponse.json(
        { 
          error: "AWS S3 is not configured. Please configure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.",
          code: "AWS_NOT_CONFIGURED"
        },
        { status: 503 }
      )
    }

    // Step 3: Parse form data
    let formData: FormData
    try {
      formData = await req.formData()
    } catch (error: any) {
      console.error("[RESUME_UPLOAD] Error parsing form data:", error)
      return NextResponse.json(
        { error: "Invalid request format. Expected multipart/form-data." },
        { status: 400 }
      )
    }

    const file = formData.get("file") as File | null
    if (!file) {
      console.error("[RESUME_UPLOAD] No file provided")
      return NextResponse.json(
        { error: "No file provided. Please include a file in the 'file' field." },
        { status: 400 }
      )
    }

    console.log(`[RESUME_UPLOAD] File received: ${file.name}, size: ${file.size} bytes, type: ${file.type}`)

    // Step 4: Validate file
    if (file.size === 0) {
      return NextResponse.json(
        { error: "File is empty" },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      console.error(`[RESUME_UPLOAD] File too large: ${file.size} bytes (max: ${MAX_FILE_SIZE})`)
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      )
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.error(`[RESUME_UPLOAD] Invalid file type: ${file.type}`)
      return NextResponse.json(
        { 
          error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
          receivedType: file.type
        },
        { status: 400 }
      )
    }

    // Step 5: Generate S3 key
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const s3Key = `resumes/${userId}/${timestamp}-${sanitizedFileName}`
    
    console.log(`[RESUME_UPLOAD] S3 Key: ${s3Key}`)

    // Step 6: Read file buffer
    let fileBuffer: Buffer
    try {
      const arrayBuffer = await file.arrayBuffer()
      fileBuffer = Buffer.from(arrayBuffer)
      console.log(`[RESUME_UPLOAD] File buffer created: ${fileBuffer.length} bytes`)
    } catch (error: any) {
      console.error("[RESUME_UPLOAD] Error reading file:", error)
      return NextResponse.json(
        { error: "Failed to read file" },
        { status: 500 }
      )
    }

    // Step 7: Upload to S3
    let s3Client: S3Client
    let fileUrl: string
    try {
      s3Client = getS3Client()
      
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: file.type,
        ServerSideEncryption: "AES256",
        Metadata: {
          userId,
          uploadedAt: new Date().toISOString(),
          originalFileName: file.name,
        },
      })

      console.log(`[RESUME_UPLOAD] Uploading to S3: ${bucketName}/${s3Key}`)
      await s3Client.send(command)
      console.log(`[RESUME_UPLOAD] S3 upload successful`)

      // Generate file URL
      fileUrl = process.env.AWS_S3_CDN_URL
        ? `${process.env.AWS_S3_CDN_URL}/${s3Key}`
        : `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`
    } catch (s3Error: any) {
      console.error("[RESUME_UPLOAD] S3 upload error:", {
        name: s3Error.name,
        message: s3Error.message,
        code: s3Error.Code,
      })
      
      if (s3Error.name === "InvalidAccessKeyId" || s3Error.name === "SignatureDoesNotMatch") {
        return NextResponse.json(
          { 
            error: "Invalid AWS credentials. Please check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.",
            code: "AWS_CREDENTIALS_ERROR"
          },
          { status: 503 }
        )
      }
      
      if (s3Error.name === "NoSuchBucket") {
        return NextResponse.json(
          { 
            error: `S3 bucket "${bucketName}" does not exist. Please create it or update AWS_S3_BUCKET_NAME.`,
            code: "BUCKET_NOT_FOUND"
          },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { 
          error: `Failed to upload to S3: ${s3Error.message || "Unknown error"}`,
          code: "S3_UPLOAD_ERROR"
        },
        { status: 500 }
      )
    }

    // Step 8: Save to database
    let resume
    try {
      resume = await prisma.resume.create({
        data: {
          fileName: file.name,
          fileUrl,
          fileSize: file.size,
          mimeType: file.type,
          userId,
        },
      })
      console.log(`[RESUME_UPLOAD] Resume saved to database: ${resume.id}`)
    } catch (dbError: any) {
      console.error("[RESUME_UPLOAD] Database error:", dbError)
      // Note: File is already in S3, but we failed to save metadata
      // In production, you might want to delete the S3 object here
      return NextResponse.json(
        { error: "Failed to save resume metadata to database" },
        { status: 500 }
      )
    }

    // Step 9: Optionally parse resume (async, don't wait)
    if (process.env.RESUME_PARSER_URL && resume) {
      parseResumeFromService(resume.fileUrl)
        .then(async (parsed) => {
          if (parsed) {
            await prisma.resume.update({
              where: { id: resume.id },
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
            console.log(`[RESUME_UPLOAD] Resume parsed successfully: ${resume.id}`)
          }
        })
        .catch((parserError) => {
          console.error("[RESUME_UPLOAD] Resume parsing failed (non-blocking):", parserError)
        })
    }

    const duration = Date.now() - startTime
    console.log(`[RESUME_UPLOAD] Upload completed successfully in ${duration}ms`)

    return NextResponse.json(resume, { status: 201 })
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`[RESUME_UPLOAD] Unexpected error after ${duration}ms:`, {
      message: error.message,
      stack: nodeEnv === "development" ? error.stack : undefined,
    })
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        code: "INTERNAL_ERROR"
      },
      { status: 500 }
    )
  }
}

