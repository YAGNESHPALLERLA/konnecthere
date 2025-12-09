import { requireAdmin } from "@/lib/auth/admin-rbac"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminJobsPage() {
  await requireAdmin()

  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
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
  })

  return (
    <PageShell
      title="All Jobs"
      description="Manage all jobs in the system"
    >
      <div className="space-y-6">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Jobs ({jobs.length})</h2>
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
          {jobs.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Title</Table.Header>
                  <Table.Header>Company</Table.Header>
                  <Table.Header>Status</Table.Header>
                  <Table.Header>Applications</Table.Header>
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
                      <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                        {job.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell>{job._count.applications}</Table.Cell>
                    <Table.Cell>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <Link href={`/admin/jobs/${job.id}`}>
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p className="text-gray-600">No jobs found.</p>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

