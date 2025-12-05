import { prisma } from "./prisma"
import { Prisma } from "@prisma/client"
import { isAlgoliaEnabled } from "./algolia"
import { algoliasearch } from "algoliasearch"

export type SearchFilters = {
  query?: string
  page?: number
  limit?: number
  location?: string
  remote?: boolean
  employmentType?: string
  experienceLevel?: string
  salaryMin?: number
  salaryMax?: number
}

const DEFAULT_LIMIT = 20

type FacetCounts = Record<string, number>

type SearchResult = {
  jobs: any[]
  source: "algolia" | "postgres"
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  facets: Record<string, FacetCounts>
}

export async function searchJobs(filters: SearchFilters): Promise<SearchResult> {
  if (isAlgoliaEnabled()) {
    return searchJobsAlgolia(filters)
  }
  return searchJobsPostgres(filters)
}

function buildFacets(jobs: any[]) {
  const facets: Record<string, FacetCounts> = {
    location: {},
    employmentType: {},
    experienceLevel: {},
    remote: {},
  }

  jobs.forEach((job) => {
    if (job.location) {
      facets.location[job.location] = (facets.location[job.location] || 0) + 1
    }
    if (job.employmentType) {
      facets.employmentType[job.employmentType] = (facets.employmentType[job.employmentType] || 0) + 1
    }
    if (job.experienceLevel) {
      facets.experienceLevel[job.experienceLevel] = (facets.experienceLevel[job.experienceLevel] || 0) + 1
    }
    facets.remote[job.remote ? "Remote" : "Onsite"] = (facets.remote[job.remote ? "Remote" : "Onsite"] || 0) + 1
  })

  return facets
}

async function searchJobsAlgolia(filters: SearchFilters) {
  const client = algoliasearch(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_API_KEY!)
  const indexName = process.env.ALGOLIA_INDEX_NAME!

  const facetFilters: string[][] = []
  if (filters.location) facetFilters.push([`facets.location:${filters.location}`])
  if (typeof filters.remote === "boolean") facetFilters.push([`facets.remote:${filters.remote}`])
  if (filters.employmentType) facetFilters.push([`facets.employmentType:${filters.employmentType}`])
  if (filters.experienceLevel) facetFilters.push([`facets.experienceLevel:${filters.experienceLevel}`])

  const page = Math.max(0, (filters.page || 1) - 1)
  const hitsPerPage = Math.min(filters.limit || DEFAULT_LIMIT, 50)

  const response = await client.searchSingleIndex({
    indexName,
    searchParams: {
      query: filters.query || "",
      page,
      hitsPerPage,
      facetFilters: facetFilters.length ? facetFilters : undefined,
      attributesToHighlight: ["title", "description"],
      typoTolerance: "min",
    },
  })

  const hits = response.hits || []
  const jobs = await prisma.job.findMany({
    where: { id: { in: hits.map((hit: any) => hit.objectID || hit.id) } },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logo: true,
          slug: true,
        },
      },
    },
  })

  const jobsById = Object.fromEntries(jobs.map((job) => [job.id, job]))
  const ordered = hits.map((hit: any) => jobsById[hit.objectID || hit.id]).filter(Boolean)

  return {
    jobs: ordered,
    source: "algolia" as const,
    pagination: {
      page: (response.page || 0) + 1,
      limit: hitsPerPage,
      total: response.nbHits || 0,
      totalPages: response.nbPages || 0,
    },
    facets: buildFacets(ordered),
  }
}

async function searchJobsPostgres(filters: SearchFilters) {
  const where: Prisma.JobWhereInput = {
    status: "PUBLISHED",
  }

  if (filters.location) {
    where.location = { contains: filters.location, mode: "insensitive" }
  }

  if (typeof filters.remote === "boolean") {
    where.remote = filters.remote
  }

  if (filters.employmentType) {
    where.employmentType = filters.employmentType as any
  }

  if (filters.experienceLevel) {
    where.experienceLevel = filters.experienceLevel as any
  }

  if (filters.salaryMin || filters.salaryMax) {
    where.OR = []
    if (filters.salaryMin) {
      where.OR.push({ salaryMax: { gte: filters.salaryMin } })
    }
    if (filters.salaryMax) {
      where.OR.push({ salaryMin: { lte: filters.salaryMax } })
    }
  }

  const page = Math.max(1, filters.page || 1)
  const limit = Math.min(filters.limit || DEFAULT_LIMIT, 50)
  const skip = (page - 1) * limit

  const searchQuery = filters.query?.trim()
  let jobs: any[] = []
  let total = 0

  if (searchQuery) {
    const tsQuery = searchQuery
      .split(/\s+/)
      .map((term) => `${term}:*`)
      .join(' & ')

    const rawJobs = await prisma.$queryRaw<any[]>`
      SELECT "Job".*
      FROM "Job"
      WHERE "Job"."status" = 'PUBLISHED'
        AND to_tsvector('english', coalesce("Job"."title",'') || ' ' || coalesce("Job"."description",'') || ' ' || coalesce("Job"."requirements",''))
          @@ to_tsquery('english', ${tsQuery})
      ORDER BY ts_rank(
        to_tsvector('english', coalesce("Job"."title",'') || ' ' || coalesce("Job"."description",'') || ' ' || coalesce("Job"."requirements",'')),
        to_tsquery('english', ${tsQuery})
      ) DESC
      LIMIT ${limit}
      OFFSET ${skip}
    `

    const rawCount = await prisma.$queryRaw<{ total: number }[]>`
      SELECT count(*)::int as total
      FROM "Job"
      WHERE "Job"."status" = 'PUBLISHED'
        AND to_tsvector('english', coalesce("Job"."title",'') || ' ' || coalesce("Job"."description",'') || ' ' || coalesce("Job"."requirements",''))
          @@ to_tsquery('english', ${tsQuery})
    `

    const jobIds = rawJobs.map((job) => job.id)
    const jobsWithRelations = await prisma.job.findMany({
      where: { id: { in: jobIds } },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            slug: true,
          },
        },
      },
    })

    const jobMap = Object.fromEntries(jobsWithRelations.map((job) => [job.id, job]))
    jobs = jobIds.map((id) => jobMap[id]).filter(Boolean)
    total = rawCount[0]?.total || 0
  } else {
    const [list, count] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ])

    jobs = list
    total = count
  }

  return {
    jobs,
    source: "postgres" as const,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    facets: buildFacets(jobs),
  }
}
