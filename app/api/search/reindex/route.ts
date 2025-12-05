import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { syncAllJobsToAlgolia } from "@/lib/algolia"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await syncAllJobsToAlgolia()
  return NextResponse.json({ success: true, ...result })
}
