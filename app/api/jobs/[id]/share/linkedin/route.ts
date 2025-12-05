import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getLinkedInAccess } from "@/lib/linkedin"

export const runtime = "nodejs"

function buildShareText(job: any, jobUrl: string) {
  const lines = [
    `We're hiring: ${job.title} at ${job.company.name}!`,
    job.location ? `Location: ${job.location}${job.remote ? " (Remote friendly)" : ""}` : job.remote ? "Remote role" : "",
    job.salaryMin || job.salaryMax
      ? `Compensation: ${job.salaryMin ? `$${job.salaryMin.toLocaleString()}` : ""}${job.salaryMax ? ` - $${job.salaryMax.toLocaleString()}` : ""}`
      : "",
    job.requirements ? `Key skills: ${job.requirements.split("\n")[0]}` : "",
    `Apply now: ${jobUrl}`,
  ].filter(Boolean)

  return lines.join("\n")
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, name: true, slug: true, ownerId: true },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const ownerId = job.company.ownerId
    const isAdmin = (session.user as any).role === "ADMIN"
    if (ownerId !== (session.user as any).id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const jobUrl = `${baseUrl}/jobs/${job.slug}`
    const shareText = buildShareText(job, jobUrl)

    const linkedInAccess = await getLinkedInAccess(ownerId)
    if (!linkedInAccess?.accessToken) {
      const callbackUrl = encodeURIComponent(`${baseUrl}/employer/jobs/${job.id}`)
      return NextResponse.json({
        mode: "connect",
        message: "Connect your LinkedIn account to share posts directly.",
        connectUrl: `${baseUrl}/api/auth/signin?provider=linkedin&callbackUrl=${callbackUrl}`,
        payload: {
          text: shareText,
          url: jobUrl,
        },
      })
    }

    const authorUrn = process.env.LINKEDIN_ORGANIZATION_ID
      ? `urn:li:organization:${process.env.LINKEDIN_ORGANIZATION_ID}`
      : linkedInAccess.authorUrn

    const sharePayload = {
      author: authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: shareText,
          },
          shareMediaCategory: "ARTICLE",
          media: [
            {
              status: "READY",
              originalUrl: jobUrl,
              title: {
                text: job.title,
              },
            },
          ],
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }

    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${linkedInAccess.accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(sharePayload),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("LinkedIn share failed", errorBody)
      return NextResponse.json({
        mode: "manual",
        message: "LinkedIn API call failed. Use the payload below to share manually.",
        payload: {
          text: shareText,
          url: jobUrl,
          linkedInError: errorBody,
        },
      })
    }

    const result = await response.json()
    return NextResponse.json({ mode: "api", result })
  } catch (error) {
    console.error("LinkedIn share error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
