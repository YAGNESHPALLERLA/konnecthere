import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getJobRecommendationsForUser } from "@/lib/recommendations"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limitParam = parseInt(searchParams.get("limit") || "10", 10)
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 20) : 10

  const recommendations = await getJobRecommendationsForUser((session.user as any).id, limit)

  return NextResponse.json({ recommendations })
}
