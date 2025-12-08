import { requireRole } from "@/lib/auth/roles"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function HRJobsPage() {
  const user = await requireRole("HR")

  // Get companies managed by this HR user
  const companies = await prisma.company.findMany({
    where: { hrId: user.id },
    select: { id: true },
  })

  const companyIds = companies.map((c) => c.id)

  // Get all jobs for these companies
  const jobs = companyIds.length > 0
    ? await prisma.job.findMany({
        where: {
          companyId: { in: companyIds },
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-800"
      case "CLOSED":
        return "bg-red-100 text-red-800"
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <PageShell
      title="My Jobs"
      description="Manage all job postings for your companies"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Jobs</h1>
            <p className="text-gray-600 mt-1">
              {jobs.length} job{jobs.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <Link href="/hr/jobs/new">
            <Button>Post New Job</Button>
          </Link>
        </div>

        {/* Jobs Table */}
        {jobs.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-gray-600 mb-4">No jobs posted yet.</p>
            <p className="text-sm text-gray-500 mb-6">
              Start by creating your first job posting.
            </p>
            <Link href="/hr/jobs/new">
              <Button>Post Your First Job</Button>
            </Link>
          </Card>
        ) : (
          <Card className="p-6">
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Title</Table.Header>
                  <Table.Header>Company</Table.Header>
                  <Table.Header>Location</Table.Header>
                  <Table.Header>Type</Table.Header>
                  <Table.Header>Applications</Table.Header>
                  <Table.Header>Status</Table.Header>
                  <Table.Header>Created</Table.Header>
                  <Table.Header>Actions</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {jobs.map((job) => (
                  <Table.Row key={job.id}>
                    <Table.Cell>
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="font-medium hover:underline"
                      >
                        {job.title}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>{job.company.name}</Table.Cell>
                    <Table.Cell>
                      {job.remote ? (
                        <span className="text-gray-600">Remote</span>
                      ) : (
                        <span>{job.location || "Not specified"}</span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-600">
                        {job.employmentType.replace("_", "-")}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Link
                        href={`/hr/jobs/${job.id}/applicants`}
                        className="font-medium hover:underline"
                      >
                        {job._count.applications}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {job.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-600">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Link href={`/hr/jobs/${job.id}/applicants`}>
                          <Button variant="ghost" size="sm">
                            View Applicants
                          </Button>
                        </Link>
                        <Link href={`/jobs/${job.slug}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Card>
        )}
      </div>
    </PageShell>
  )
}

