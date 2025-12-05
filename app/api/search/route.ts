import { NextRequest, NextResponse } from "next/server"
import { searchJobs } from "@/lib/search"
import { asyncHandler } from "@/lib/errors"
import { rateLimitSearch } from "@/lib/rateLimit"

export const runtime = "nodejs"

export const GET = asyncHandler(async (req: NextRequest) => {
  // Rate limiting
  const rateLimitResponse = rateLimitSearch(req)
  if (rateLimitResponse) return rateLimitResponse

  const { searchParams } = new URL(req.url)

  const response = await searchJobs({
    query: searchParams.get("q") || undefined,
    page: Number(searchParams.get("page") || "1"),
    limit: Number(searchParams.get("limit") || "20"),
    location: searchParams.get("location") || undefined,
    remote:
      searchParams.get("remote") !== null
        ? searchParams.get("remote") === "true"
        : undefined,
    employmentType: searchParams.get("employmentType") || undefined,
    experienceLevel: searchParams.get("experienceLevel") || undefined,
    salaryMin: searchParams.get("salaryMin") ? Number(searchParams.get("salaryMin")) : undefined,
    salaryMax: searchParams.get("salaryMax") ? Number(searchParams.get("salaryMax")) : undefined,
  })

  return NextResponse.json(response)
})
