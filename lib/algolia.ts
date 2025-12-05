import { algoliasearch, type SearchClient } from "algoliasearch"
import { prisma } from "./prisma"

type SearchableJob = {
  objectID: string
  id: string
  title: string
  description: string
  requirements: string | null
  location: string | null
  remote: boolean
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string | null
  employmentType: string
  experienceLevel: string
  companyName: string
  companyId: string
  createdAt: string
  updatedAt: string
  status: string
  facets: {
    location: string | null
    remote: boolean
    employmentType: string
    experienceLevel: string
    salaryRange: string | null
    companyName: string
  }
}

let algoliaClient: SearchClient | null = null

export function isAlgoliaEnabled() {
  return Boolean(process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_API_KEY && process.env.ALGOLIA_INDEX_NAME)
}

function getAlgoliaClient() {
  if (!isAlgoliaEnabled()) return null
  if (algoliaClient) return algoliaClient
  algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_API_KEY!)
  return algoliaClient
}

function salaryRangeFacet(min?: number | null, max?: number | null) {
  if (!min && !max) return null
  if (min && max) {
    const bucketMin = Math.floor(min / 10000) * 10000
    const bucketMax = Math.ceil(max / 10000) * 10000
    return `${bucketMin}-${bucketMax}`
  }
  if (min) {
    const bucketMin = Math.floor(min / 10000) * 10000
    return `${bucketMin}+`
  }
  const bucketMax = Math.ceil((max || 0) / 10000) * 10000
  return `0-${bucketMax}`
}

function mapJobToAlgolia(job: any): SearchableJob {
  return {
    objectID: job.id,
    id: job.id,
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    location: job.location,
    remote: job.remote,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    companyName: job.company.name,
    companyId: job.company.id,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    status: job.status,
    facets: {
      location: job.location,
      remote: job.remote,
      employmentType: job.employmentType,
      experienceLevel: job.experienceLevel,
      salaryRange: salaryRangeFacet(job.salaryMin, job.salaryMax),
      companyName: job.company.name,
    },
  }
}

type JobWithCompany = Awaited<ReturnType<typeof getJobWithCompany>>

async function getJobWithCompany(jobId: string) {
  return prisma.job.findUnique({
    where: { id: jobId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
}

async function upsertSearchIndex(job: JobWithCompany) {
  if (!job) return
  await prisma.searchIndex.upsert({
    where: { jobId: job.id },
    create: {
      jobId: job.id,
      searchableText: [
        job.title,
        job.description,
        job.requirements,
        job.company.name,
        job.location,
        job.employmentType,
        job.experienceLevel,
      ]
        .filter(Boolean)
        .join(' ') // keep ASCII
        .slice(0, 10000),
      indexedAt: new Date(),
      lastSyncedAt: new Date(),
    },
    update: {
      searchableText: [
        job.title,
        job.description,
        job.requirements,
        job.company.name,
        job.location,
        job.employmentType,
        job.experienceLevel,
      ]
        .filter(Boolean)
        .join(' ')
        .slice(0, 10000),
      indexedAt: new Date(),
      lastSyncedAt: new Date(),
    },
  })
}

export async function syncJobToAlgolia(jobId: string) {
  const job = await getJobWithCompany(jobId)
  if (!job) return null

  await upsertSearchIndex(job)

  if (!isAlgoliaEnabled()) return null
  const client = getAlgoliaClient()
  if (!client) return null

  const indexName = process.env.ALGOLIA_INDEX_NAME!

  if (job.status !== 'PUBLISHED') {
    await client.deleteObject({ indexName, objectID: jobId })
    return null
  }

  const record = mapJobToAlgolia(job)
  await client.saveObject({ indexName, body: record })

  await prisma.searchIndex.update({
    where: { jobId },
    data: {
      algoliaObjectId: jobId,
      lastSyncedAt: new Date(),
    },
  })

  return record
}

export async function removeJobFromAlgolia(jobId: string) {
  if (isAlgoliaEnabled()) {
    const client = getAlgoliaClient()
    if (client) {
      await client.deleteObject({ indexName: process.env.ALGOLIA_INDEX_NAME!, objectID: jobId })
    }
  }

  await prisma.searchIndex.deleteMany({ where: { jobId } })
}

export async function syncAllJobsToAlgolia() {
  const jobs = await prisma.job.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  await prisma.searchIndex.deleteMany({})
  await prisma.$transaction(
    jobs.map((job) =>
      prisma.searchIndex.create({
        data: {
          jobId: job.id,
          searchableText: [
            job.title,
            job.description,
            job.requirements,
            job.company.name,
            job.location,
          ]
            .filter(Boolean)
            .join(' ')
            .slice(0, 10000),
          indexedAt: new Date(),
          lastSyncedAt: new Date(),
        },
      })
    )
  )

  if (!isAlgoliaEnabled()) {
    return { synced: 0 }
  }

  const client = getAlgoliaClient()
  if (!client) return { synced: 0 }

  const indexName = process.env.ALGOLIA_INDEX_NAME!
  const records = jobs.map(mapJobToAlgolia)
  if (records.length === 0) return { synced: 0 }

  await client.saveObjects({ indexName, objects: records })

  await prisma.searchIndex.updateMany({
    data: { lastSyncedAt: new Date() },
  })

  return { synced: records.length }
}
