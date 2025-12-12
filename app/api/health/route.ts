import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check critical environment variables
    const checks = {
      database: !!process.env.DATABASE_URL,
      authSecret: !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
      nextAuthUrl: !!process.env.NEXTAUTH_URL,
      s3: {
        region: !!process.env.AWS_REGION,
        accessKey: !!process.env.AWS_ACCESS_KEY_ID,
        secretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        bucket: !!process.env.AWS_S3_BUCKET_NAME,
      },
    }

    const allCritical = checks.database && checks.authSecret && checks.nextAuthUrl
    const s3Configured =
      checks.s3.region && checks.s3.accessKey && checks.s3.secretKey && checks.s3.bucket

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        checks,
        environment: process.env.NODE_ENV,
        nextAuthUrl: process.env.NEXTAUTH_URL || "not set",
        s3Bucket: process.env.AWS_S3_BUCKET_NAME || "not set",
        s3Region: process.env.AWS_REGION || "not set",
      },
      { status: allCritical ? 200 : 503 }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
      },
      { status: 500 }
    )
  }
}

