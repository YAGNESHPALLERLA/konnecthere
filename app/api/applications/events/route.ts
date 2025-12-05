import { NextRequest, NextResponse } from "next/server"
import { notifyCompanyOfNewApplication } from "@/lib/notifications"

export const runtime = "nodejs"

const allowedIps = (process.env.INTERNAL_EVENT_IPS || "127.0.0.1").split(",").map((ip) => ip.trim())

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  if (ip && !allowedIps.includes(ip)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    if (body.type === "application.created" && body.applicationId) {
      await notifyCompanyOfNewApplication(body.applicationId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Unsupported event" }, { status: 400 })
  } catch (error) {
    console.error("Event handler error", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
