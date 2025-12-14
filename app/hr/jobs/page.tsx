import { requireRole } from "@/lib/auth/roles"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { HRJobsClient } from "./HRJobsClient"

export const dynamic = "force-dynamic"

export default async function HRJobsPage() {
  const user = await requireRole("HR")

  // Get companies managed by this HR user
  const companies = await prisma.company.findMany({
    where: { hrId: user.id },
    select: { id: true },
  })

  const companyIds = companies.map((c) => c.id)

  // Get all jobs for these companies (initial load)
  const jobs = companyIds.length > 0
    ? await prisma.job.findMany({
        where: {
          companyId: { in: companyIds },
          deletedAt: null, // Filter out deleted jobs
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : []

  return (
    <PageShell
      title="My Jobs"
      description="Manage all job postings for your companies"
    >
      <HRJobsClient initialJobs={jobs as any} />
    </PageShell>
  )
}

