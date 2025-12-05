import { requireRole } from "@/lib/auth/roles"
import { prisma } from "@/lib/prisma"
import { PageShell } from "@/components/layouts/PageShell"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { SimpleTable as Table } from "@/components/ui/SimpleTable"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function HRDashboard() {
  // This will redirect to /auth/signin if not authenticated
  // Or redirect to user's own dashboard if wrong role
  const user = await requireRole("HR")

  // Get companies managed by this HR user
  const companies = await prisma.company.findMany({
    where: {
      hrId: user.id,
    },
    include: {
      _count: {
        select: {
          jobs: true,
        },
      },
    },
  })

  // Get jobs for these companies
  const jobs = await prisma.job.findMany({
    where: {
      companyId: {
        in: companies.map((c) => c.id),
      },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      company: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  })

  // Get recent applications for these jobs
  const applications = await prisma.application.findMany({
    where: {
      jobId: {
        in: jobs.map((j) => j.id),
      },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          slug: true,
          company: {
            select: {
              name: true,
            },
          },
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  return (
    <PageShell
      title="HR Dashboard"
      description="Manage your company's jobs and applicants"
    >
      <div className="space-y-8">
        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Companies</p>
            <p className="text-2xl font-bold">{companies.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Active Jobs</p>
            <p className="text-2xl font-bold">{jobs.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Applications</p>
            <p className="text-2xl font-bold">{applications.length}</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Link href="/hr/jobs/new">
            <Button>Post New Job</Button>
          </Link>
          <Link href="/hr/applications">
            <Button variant="outline">View All Applications</Button>
          </Link>
          <Link href="/messages">
            <Button variant="outline">Messages</Button>
          </Link>
        </div>

        {/* Jobs */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">My Jobs</h2>
            <Link href="/hr/jobs">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {jobs.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Title</Table.Header>
                  <Table.Header>Company</Table.Header>
                  <Table.Header>Applications</Table.Header>
                  <Table.Header>Status</Table.Header>
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
                    <Table.Cell>{job._count.applications}</Table.Cell>
                    <Table.Cell>
                      <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                        {job.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Link href={`/hr/jobs/${job.id}`}>
                          <Button variant="ghost" size="sm">
                            Manage
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
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No jobs posted yet.</p>
              <Link href="/hr/jobs/new">
                <Button>Post Your First Job</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Applications */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Applications</h2>
            <Link href="/hr/applications">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          {applications.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row>
                  <Table.Header>Job</Table.Header>
                  <Table.Header>Applicant</Table.Header>
                  <Table.Header>Status</Table.Header>
                  <Table.Header>Applied</Table.Header>
                  <Table.Header>Actions</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {applications.map((app) => (
                  <Table.Row key={app.id}>
                    <Table.Cell>
                      <Link
                        href={`/jobs/${app.job.slug}`}
                        className="font-medium hover:underline"
                      >
                        {app.job.title}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      {app.user.name || app.user.email}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                        {app.status}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Link href={`/hr/applications/${app.id}`}>
                          <Button variant="ghost" size="sm">
                            Review
                          </Button>
                        </Link>
                        <Link
                          href={`/messages?applicationId=${app.id}`}
                        >
                          <Button variant="ghost" size="sm">
                            Message
                          </Button>
                        </Link>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p className="text-gray-600">No applications yet.</p>
          )}
        </Card>
      </div>
    </PageShell>
  )
}

