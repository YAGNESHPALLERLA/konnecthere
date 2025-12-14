import { prisma } from "./prisma"

export type RecommendationResult = {
  job: {
    id: string
    title: string
    slug: string
    location: string | null
    remote: boolean
    employmentType: string
    experienceLevel: string
    company: {
      id: string
      name: string
      slug: string
      logo: string | null
    }
  }
  score: number
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "a",
  "an",
  "of",
  "to",
  "in",
  "for",
  "with",
  "on",
  "at",
  "by",
  "from",
  "is",
  "are",
  "be",
  "this",
  "that",
  "your",
  "you",
  "we",
  "our",
  "their",
  "as",
  "it",
  "will",
  "can",
  "if",
  "but",
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
}

function termFrequency(tokens: string[]): Map<string, number> {
  const counts = new Map<string, number>()
  tokens.forEach((token) => {
    counts.set(token, (counts.get(token) ?? 0) + 1)
  })
  const total = tokens.length || 1
  counts.forEach((value, key) => {
    counts.set(key, value / total)
  })
  return counts
}

function buildVector(
  tf: Map<string, number>,
  docFrequencies: Map<string, number>,
  docCount: number
): Map<string, number> {
  const vector = new Map<string, number>()
  tf.forEach((tfValue, token) => {
    const df = docFrequencies.get(token) ?? 0
    const idf = Math.log((docCount + 1) / (df + 1)) + 1
    vector.set(token, tfValue * idf)
  })
  return vector
}

function dotProduct(a: Map<string, number>, b: Map<string, number>): number {
  let total = 0
  a.forEach((value, key) => {
    const other = b.get(key)
    if (other) {
      total += value * other
    }
  })
  return total
}

function magnitude(vec: Map<string, number>): number {
  let sumSquares = 0
  vec.forEach((value) => {
    sumSquares += value * value
  })
  return Math.sqrt(sumSquares) || 1
}

function buildCandidateDocument(resumes: Array<{
  fileName: string
  parsedName: string | null
  parsedEmail: string | null
  parsedPhone: string | null
  parsedTitle: string | null
  parsedSkills: string[]
  parsedExperience: number | null
  parsedRaw: unknown | null
}>): string {
  const parts: string[] = []
  for (const resume of resumes) {
    if (resume.parsedName) parts.push(resume.parsedName)
    if (resume.parsedTitle) parts.push(resume.parsedTitle)
    if (resume.parsedSkills?.length) {
      parts.push(resume.parsedSkills.join(" "))
    }
    if (typeof resume.parsedRaw === "string") {
      parts.push(resume.parsedRaw)
    } else if (resume.parsedRaw) {
      try {
        parts.push(JSON.stringify(resume.parsedRaw))
      } catch {
        // ignore
      }
    }
    parts.push(resume.fileName)
  }
  return parts.join(" \n ").trim()
}

export async function getJobRecommendationsForUser(
  userId: string,
  limit = 10
): Promise<RecommendationResult[]> {
  const [resumes, jobs] = await Promise.all([
    prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.job.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null, // Only recommend non-deleted jobs
        applications: {
          none: { userId },
        },
        company: {
          ownerId: { not: userId },
        },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ])

  const candidateDoc = buildCandidateDocument(resumes)
  const candidateTokens = tokenize(candidateDoc)
  if (!candidateTokens.length) {
    return []
  }

  const jobDocs = jobs
    .map((job) => ({
      job,
      tokens: tokenize(`${job.title} ${job.description} ${job.requirements ?? ""}`),
    }))
    .filter((item) => item.tokens.length)

  if (!jobDocs.length) {
    return []
  }

  const docFrequencies = new Map<string, number>()
  jobDocs.forEach(({ tokens }) => {
    const unique = new Set(tokens)
    unique.forEach((token) => {
      docFrequencies.set(token, (docFrequencies.get(token) ?? 0) + 1)
    })
  })

  const docCount = jobDocs.length
  const candidateTf = termFrequency(candidateTokens)
  const candidateVector = buildVector(candidateTf, docFrequencies, docCount)
  const candidateMagnitude = magnitude(candidateVector)

  const scored = jobDocs.map(({ job, tokens }) => {
    const tf = termFrequency(tokens)
    const jobVector = buildVector(tf, docFrequencies, docCount)
    const jobMagnitude = magnitude(jobVector)
    const score = dotProduct(candidateVector, jobVector) / (candidateMagnitude * jobMagnitude)
    return { job, score: Number.isFinite(score) ? score : 0 }
  })

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => ({
      job: {
        id: item.job.id,
        title: item.job.title,
        slug: item.job.slug,
        location: item.job.location,
        remote: item.job.remote,
        employmentType: item.job.employmentType,
        experienceLevel: item.job.experienceLevel,
        company: item.job.company,
      },
      score: Number(item.score.toFixed(4)),
    }))
}
